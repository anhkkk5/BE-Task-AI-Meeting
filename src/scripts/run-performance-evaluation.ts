import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { performance } from 'perf_hooks';

type ScenarioCategory = 'API' | 'AI';
type Scenario = {
  name: string;
  category: ScenarioCategory;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  requests: number;
  concurrency: number;
  warmup?: number;
};
type Config = { baseUrl: string; timeoutMs: number; scenarios: Scenario[] };
type Sample = {
  durationMs: number;
  status: number;
  ok: boolean;
  error?: string;
};

function percentile(sorted: number[], value: number) {
  if (!sorted.length) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.ceil((value / 100) * sorted.length) - 1,
  );
  return Math.round(sorted[Math.max(0, index)] * 100) / 100;
}

function interpolate(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key: string) => {
      const replacement = process.env[key];
      if (!replacement) throw new Error(`Thieu bien moi truong ${key}`);
      return replacement;
    });
  }
  if (Array.isArray(value)) return value.map(interpolate);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, interpolate(item)]),
    );
  }
  return value;
}

async function request(
  config: Config,
  scenario: Scenario,
  token: string,
): Promise<Sample> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const started = performance.now();
  try {
    const response = await fetch(
      `${config.baseUrl}${interpolate(scenario.path)}`,
      {
        method: scenario.method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          ...(scenario.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: scenario.body
          ? JSON.stringify(interpolate(scenario.body))
          : undefined,
        signal: controller.signal,
      },
    );
    await response.arrayBuffer();
    return {
      durationMs: performance.now() - started,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    return {
      durationMs: performance.now() - started,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runPool<T>(
  count: number,
  concurrency: number,
  work: () => Promise<T>,
) {
  const results: T[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < count) {
      cursor += 1;
      results.push(await work());
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(count, concurrency) }, worker),
  );
  return results;
}

async function getObservability(baseUrl: string, adminToken?: string) {
  if (!adminToken) return null;
  try {
    const response = await fetch(`${baseUrl}/admin/observability?hours=24`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response.ok ? await response.json() : { status: response.status };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function summarize(scenario: Scenario, samples: Sample[], elapsedMs: number) {
  const durations = samples
    .map((item) => item.durationMs)
    .sort((a, b) => a - b);
  const successes = samples.filter((item) => item.ok).length;
  const statusCounts = samples.reduce<Record<string, number>>(
    (result, item) => {
      const key = item.status ? String(item.status) : 'network_error';
      result[key] = (result[key] ?? 0) + 1;
      return result;
    },
    {},
  );
  return {
    ...scenario,
    requestsCompleted: samples.length,
    successes,
    failures: samples.length - successes,
    errorRatePercent:
      Math.round(((samples.length - successes) / samples.length) * 10_000) /
      100,
    latencyMs: {
      min: percentile(durations, 0),
      average:
        Math.round(
          (durations.reduce((sum, item) => sum + item, 0) / durations.length) *
            100,
        ) / 100,
      p50: percentile(durations, 50),
      p95: percentile(durations, 95),
      p99: percentile(durations, 99),
      max: percentile(durations, 100),
    },
    throughputRequestsPerSecond:
      Math.round((samples.length / (elapsedMs / 1000)) * 100) / 100,
    statusCounts,
  };
}

async function main() {
  const configArg = process.argv.find((item) => item.endsWith('.json'));
  const configPath = resolve(configArg ?? 'performance.config.json');
  const dryRun = process.argv.includes('--dry-run');
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as Config;
  const token = process.env.PERF_BEARER_TOKEN ?? '';
  const adminToken = process.env.PERF_ADMIN_TOKEN;
  const aiEnabled = process.env.PERF_INCLUDE_AI === 'true';

  if (!dryRun && !token) throw new Error('Thieu PERF_BEARER_TOKEN.');
  const scenarios = config.scenarios.filter((scenario) => {
    if (scenario.category !== 'AI') return true;
    if (!aiEnabled) return false;
    if (process.env.PERF_CONFIRM_AI_COST !== 'YES') {
      throw new Error(
        'Muon benchmark AI, dat PERF_CONFIRM_AI_COST=YES de xac nhan chi phi.',
      );
    }
    return true;
  });

  if (dryRun) {
    console.log(
      JSON.stringify(
        { configPath, config: { ...config, scenarios }, aiEnabled },
        null,
        2,
      ),
    );
    return;
  }

  const observabilityBefore = await getObservability(
    config.baseUrl,
    adminToken,
  );
  const results = [];
  for (const scenario of scenarios) {
    await runPool(scenario.warmup ?? 2, 1, () =>
      request(config, scenario, token),
    );
    const started = performance.now();
    const samples = await runPool(scenario.requests, scenario.concurrency, () =>
      request(config, scenario, token),
    );
    results.push(summarize(scenario, samples, performance.now() - started));
  }
  const observabilityAfter = await getObservability(config.baseUrl, adminToken);
  const report = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    configFile: basename(configPath),
    environment: {
      baseUrl: config.baseUrl,
      nodeVersion: process.version,
      aiIncluded: aiEnabled,
    },
    results,
    observability: { before: observabilityBefore, after: observabilityAfter },
  };
  const outputDirectory = resolve('datasets/performance/v1');
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    join(outputDirectory, 'latest-results.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const rows = results
    .map(
      (item) =>
        `| ${item.name} | ${item.category} | ${item.requestsCompleted} | ${item.concurrency} | ${item.latencyMs.average} | ${item.latencyMs.p50} | ${item.latencyMs.p95} | ${item.latencyMs.p99} | ${item.throughputRequestsPerSecond} | ${item.errorRatePercent}% |`,
    )
    .join('\n');
  const markdown = `# Ket qua danh gia hieu nang\n\nThoi diem: ${report.generatedAt}\n\n| Kich ban | Loai | Request | Dong thoi | TB (ms) | p50 | p95 | p99 | req/s | Loi |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|\n${rows}\n\n## Observability\n\nSnapshot day du truoc/sau nam trong \`latest-results.json\`. Neu bang null, hay cap \`PERF_ADMIN_TOKEN\`.\n`;
  writeFileSync(join(outputDirectory, 'LATEST_REPORT.md'), markdown);
  console.log(markdown);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

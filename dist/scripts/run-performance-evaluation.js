"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
function percentile(sorted, value) {
    if (!sorted.length)
        return 0;
    const index = Math.min(sorted.length - 1, Math.ceil((value / 100) * sorted.length) - 1);
    return Math.round(sorted[Math.max(0, index)] * 100) / 100;
}
function interpolate(value) {
    if (typeof value === 'string') {
        return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => {
            const replacement = process.env[key];
            if (!replacement)
                throw new Error(`Thieu bien moi truong ${key}`);
            return replacement;
        });
    }
    if (Array.isArray(value))
        return value.map(interpolate);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, interpolate(item)]));
    }
    return value;
}
async function request(config, scenario, token) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const started = perf_hooks_1.performance.now();
    try {
        const response = await fetch(`${config.baseUrl}${interpolate(scenario.path)}`, {
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
        });
        await response.arrayBuffer();
        return {
            durationMs: perf_hooks_1.performance.now() - started,
            status: response.status,
            ok: response.ok,
        };
    }
    catch (error) {
        return {
            durationMs: perf_hooks_1.performance.now() - started,
            status: 0,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
    finally {
        clearTimeout(timeout);
    }
}
async function runPool(count, concurrency, work) {
    const results = [];
    let cursor = 0;
    async function worker() {
        while (cursor < count) {
            cursor += 1;
            results.push(await work());
        }
    }
    await Promise.all(Array.from({ length: Math.min(count, concurrency) }, worker));
    return results;
}
async function getObservability(baseUrl, adminToken) {
    if (!adminToken)
        return null;
    try {
        const response = await fetch(`${baseUrl}/admin/observability?hours=24`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        return response.ok ? await response.json() : { status: response.status };
    }
    catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
    }
}
function summarize(scenario, samples, elapsedMs) {
    const durations = samples
        .map((item) => item.durationMs)
        .sort((a, b) => a - b);
    const successes = samples.filter((item) => item.ok).length;
    const statusCounts = samples.reduce((result, item) => {
        const key = item.status ? String(item.status) : 'network_error';
        result[key] = (result[key] ?? 0) + 1;
        return result;
    }, {});
    return {
        ...scenario,
        requestsCompleted: samples.length,
        successes,
        failures: samples.length - successes,
        errorRatePercent: Math.round(((samples.length - successes) / samples.length) * 10_000) /
            100,
        latencyMs: {
            min: percentile(durations, 0),
            average: Math.round((durations.reduce((sum, item) => sum + item, 0) / durations.length) *
                100) / 100,
            p50: percentile(durations, 50),
            p95: percentile(durations, 95),
            p99: percentile(durations, 99),
            max: percentile(durations, 100),
        },
        throughputRequestsPerSecond: Math.round((samples.length / (elapsedMs / 1000)) * 100) / 100,
        statusCounts,
    };
}
async function main() {
    const configArg = process.argv.find((item) => item.endsWith('.json'));
    const configPath = (0, path_1.resolve)(configArg ?? 'performance.config.json');
    const dryRun = process.argv.includes('--dry-run');
    const config = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8'));
    const token = process.env.PERF_BEARER_TOKEN ?? '';
    const adminToken = process.env.PERF_ADMIN_TOKEN;
    const aiEnabled = process.env.PERF_INCLUDE_AI === 'true';
    if (!dryRun && !token)
        throw new Error('Thieu PERF_BEARER_TOKEN.');
    const scenarios = config.scenarios.filter((scenario) => {
        if (scenario.category !== 'AI')
            return true;
        if (!aiEnabled)
            return false;
        if (process.env.PERF_CONFIRM_AI_COST !== 'YES') {
            throw new Error('Muon benchmark AI, dat PERF_CONFIRM_AI_COST=YES de xac nhan chi phi.');
        }
        return true;
    });
    if (dryRun) {
        console.log(JSON.stringify({ configPath, config: { ...config, scenarios }, aiEnabled }, null, 2));
        return;
    }
    const observabilityBefore = await getObservability(config.baseUrl, adminToken);
    const results = [];
    for (const scenario of scenarios) {
        await runPool(scenario.warmup ?? 2, 1, () => request(config, scenario, token));
        const started = perf_hooks_1.performance.now();
        const samples = await runPool(scenario.requests, scenario.concurrency, () => request(config, scenario, token));
        results.push(summarize(scenario, samples, perf_hooks_1.performance.now() - started));
    }
    const observabilityAfter = await getObservability(config.baseUrl, adminToken);
    const report = {
        schemaVersion: '1.0',
        generatedAt: new Date().toISOString(),
        configFile: (0, path_1.basename)(configPath),
        environment: {
            baseUrl: config.baseUrl,
            nodeVersion: process.version,
            aiIncluded: aiEnabled,
        },
        results,
        observability: { before: observabilityBefore, after: observabilityAfter },
    };
    const outputDirectory = (0, path_1.resolve)('datasets/performance/v1');
    (0, fs_1.mkdirSync)(outputDirectory, { recursive: true });
    (0, fs_1.writeFileSync)((0, path_1.join)(outputDirectory, 'latest-results.json'), `${JSON.stringify(report, null, 2)}\n`);
    const rows = results
        .map((item) => `| ${item.name} | ${item.category} | ${item.requestsCompleted} | ${item.concurrency} | ${item.latencyMs.average} | ${item.latencyMs.p50} | ${item.latencyMs.p95} | ${item.latencyMs.p99} | ${item.throughputRequestsPerSecond} | ${item.errorRatePercent}% |`)
        .join('\n');
    const markdown = `# Ket qua danh gia hieu nang\n\nThoi diem: ${report.generatedAt}\n\n| Kich ban | Loai | Request | Dong thoi | TB (ms) | p50 | p95 | p99 | req/s | Loi |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|\n${rows}\n\n## Observability\n\nSnapshot day du truoc/sau nam trong \`latest-results.json\`. Neu bang null, hay cap \`PERF_ADMIN_TOKEN\`.\n`;
    (0, fs_1.writeFileSync)((0, path_1.join)(outputDirectory, 'LATEST_REPORT.md'), markdown);
    console.log(markdown);
}
void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=run-performance-evaluation.js.map
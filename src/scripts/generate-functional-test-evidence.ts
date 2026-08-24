import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join, relative, resolve } from 'path';

type TestFileEvidence = {
  path: string;
  layer: 'unit' | 'integration/e2e';
  testCases: number;
  suites: number;
  rbac: boolean;
  multiTenancy: boolean;
};

const backendRoot = resolve(__dirname, '../..');
const outputDirectory = join(
  backendRoot,
  'datasets',
  'functional-testing',
  'v1',
);

function collectFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return /(?:\.spec|\.e2e-spec)\.ts$/.test(entry.name) ? [fullPath] : [];
  });
}

function countMatches(source: string, pattern: RegExp): number {
  return [...source.matchAll(pattern)].length;
}

function inspect(filePath: string): TestFileEvidence {
  const source = readFileSync(filePath, 'utf8');
  const normalizedPath = relative(backendRoot, filePath).replace(/\\/g, '/');
  const e2e = filePath.endsWith('.e2e-spec.ts');
  const rbacPattern =
    /WorkspaceRolesGuard|WorkspaceRole|ForbiddenException|\bRBAC\b|\b403\b/i;
  const tenantPattern =
    /multi[- ]?tenan|cross[- ]?workspace|another tenant|another workspace|other workspace|workspace boundaries|workspace-b|not found in this workspace|khong tron cache giua cac workspace/i;

  return {
    path: normalizedPath,
    layer: e2e ? 'integration/e2e' : 'unit',
    testCases: countMatches(source, /\b(?:it|test)\s*\(/g),
    suites: countMatches(source, /\bdescribe\s*\(/g),
    rbac: rbacPattern.test(source),
    multiTenancy: tenantPattern.test(source),
  };
}

const evidence = [
  ...collectFiles(join(backendRoot, 'src')),
  ...collectFiles(join(backendRoot, 'test')),
]
  .map(inspect)
  .sort((a, b) => a.path.localeCompare(b.path));

const totals = {
  generatedAt: new Date().toISOString(),
  methodology: {
    unit: 'File *.spec.ts trong src; dependency duoc mock/isolate.',
    integrationE2e:
      'File *.e2e-spec.ts trong test; khoi tao Nest TestingModule va kiem tra luong HTTP/module.',
    rbac: 'File co guard, WorkspaceRole, ForbiddenException/RBAC/HTTP 403.',
    multiTenancy:
      'File co assertion ve bien workspace/tenant; danh sach file duoc cong khai de kiem tra thu cong.',
  },
  files: evidence.length,
  suites: evidence.reduce((sum, item) => sum + item.suites, 0),
  testCases: evidence.reduce((sum, item) => sum + item.testCases, 0),
  unit: {
    files: evidence.filter((item) => item.layer === 'unit').length,
    testCases: evidence
      .filter((item) => item.layer === 'unit')
      .reduce((sum, item) => sum + item.testCases, 0),
  },
  integrationE2e: {
    files: evidence.filter((item) => item.layer === 'integration/e2e').length,
    testCases: evidence
      .filter((item) => item.layer === 'integration/e2e')
      .reduce((sum, item) => sum + item.testCases, 0),
  },
  rbac: {
    files: evidence.filter((item) => item.rbac).length,
    testCases: evidence
      .filter((item) => item.rbac)
      .reduce((sum, item) => sum + item.testCases, 0),
  },
  multiTenancy: {
    files: evidence.filter((item) => item.multiTenancy).length,
    testCases: evidence
      .filter((item) => item.multiTenancy)
      .reduce((sum, item) => sum + item.testCases, 0),
  },
};

if (
  totals.unit.files === 0 ||
  totals.integrationE2e.files === 0 ||
  totals.rbac.files === 0 ||
  totals.multiTenancy.files === 0
) {
  throw new Error(
    'Functional evidence is missing at least one required category.',
  );
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  join(outputDirectory, 'functional-test-evidence.json'),
  `${JSON.stringify({ summary: totals, files: evidence }, null, 2)}\n`,
  'utf8',
);

const securityRows = evidence
  .filter((item) => item.rbac || item.multiTenancy)
  .map(
    (item) =>
      `| \`${item.path}\` | ${item.testCases} | ${item.rbac ? 'Co' : '-'} | ${item.multiTenancy ? 'Co' : '-'} |`,
  )
  .join('\n');

const markdown = `# Bang chung kiem thu chuc nang - Chuong 4

Bao cao duoc sinh tu ma test luc: ${totals.generatedAt}.

## Quy mo tu dong

| Nhom | So file | So test case |
|---|---:|---:|
| Unit | ${totals.unit.files} | ${totals.unit.testCases} |
| Integration + E2E | ${totals.integrationE2e.files} | ${totals.integrationE2e.testCases} |
| Co bang chung RBAC | ${totals.rbac.files} | ${totals.rbac.testCases} |
| Co bang chung Multi-tenancy | ${totals.multiTenancy.files} | ${totals.multiTenancy.testCases} |
| Tong | ${totals.files} | ${totals.testCases} |

Luu y: cot RBAC/Multi-tenancy la tap con cua Unit va Integration/E2E, khong cong vao tong lan hai.

## Cach phan loai

- Unit: ${totals.methodology.unit}
- Integration/E2E: ${totals.methodology.integrationE2e}
- RBAC: ${totals.methodology.rbac}
- Multi-tenancy: ${totals.methodology.multiTenancy}

## Cac file bang chung bao mat va co lap tenant

| File | Test case | RBAC | Multi-tenancy |
|---|---:|:---:|:---:|
${securityRows}

## Cach tai tao ket qua

~~~bash
npm run evidence:functional:generate
npm test -- --runInBand
npm run test:e2e -- --runInBand
~~~

Khong chay E2E truc tiep tren database production. Can dung database test rieng va ghi lai ngay chay, commit, so passed/failed, thoi gian trong phieu thuc nghiem.
`;

writeFileSync(join(outputDirectory, 'README.md'), markdown, 'utf8');

console.log(JSON.stringify(totals, null, 2));

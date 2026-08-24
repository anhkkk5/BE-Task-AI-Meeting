"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const exceljs_1 = __importDefault(require("exceljs"));
function readJsonLines(path) {
    return (0, node_fs_1.readFileSync)(path, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
}
async function main() {
    const base = (0, node_path_1.join)('datasets', 'action-item-evaluation', 'v1');
    const sourcePath = (0, node_path_1.resolve)(process.env.EVAL_DATASET_PATH ?? (0, node_path_1.join)(base, 'transcripts.jsonl'));
    const adjudicationPath = (0, node_path_1.resolve)(process.env.ANNOTATION_ADJUDICATION_PATH ??
        (0, node_path_1.join)(base, 'annotation', 'adjudication.xlsx'));
    const outputPath = (0, node_path_1.resolve)(process.env.HUMAN_VERIFIED_DATASET_PATH ??
        (0, node_path_1.join)(base, 'human-verified-transcripts.jsonl'));
    const manifestPath = (0, node_path_1.resolve)(process.env.HUMAN_VERIFIED_MANIFEST_PATH ??
        (0, node_path_1.join)(base, 'human-verified-manifest.json'));
    if (!(0, node_fs_1.existsSync)(sourcePath))
        throw new Error(`Không tìm thấy dataset: ${sourcePath}`);
    if (!(0, node_fs_1.existsSync)(adjudicationPath)) {
        throw new Error(`Không tìm thấy workbook phân xử: ${adjudicationPath}`);
    }
    const workbook = new exceljs_1.default.Workbook();
    await workbook.xlsx.readFile(adjudicationPath);
    const sheet = workbook.getWorksheet('Phân xử');
    if (!sheet)
        throw new Error('Không tìm thấy sheet "Phân xử".');
    const finalById = new Map();
    const errors = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1)
            return;
        const id = String(row.getCell(1).value ?? '').trim();
        if (!id)
            return;
        const json = String(row.getCell(8).value ?? '').trim();
        const status = String(row.getCell(9).value ?? '').trim();
        if (status !== 'APPROVED')
            errors.push(`${id}: trạng thái phải là APPROVED`);
        if (!json) {
            errors.push(`${id}: thiếu finalActionItemsJson`);
            return;
        }
        try {
            const items = JSON.parse(json);
            if (!Array.isArray(items) ||
                items.some((item) => typeof item?.text !== 'string')) {
                throw new Error('phải là mảng Action Item có trường text');
            }
            finalById.set(id, items);
        }
        catch (error) {
            errors.push(`${id}: JSON không hợp lệ (${error instanceof Error ? error.message : error})`);
        }
    });
    if (errors.length) {
        throw new Error(`Chưa thể tạo HUMAN_VERIFIED:\n- ${errors.slice(0, 20).join('\n- ')}${errors.length > 20 ? `\n- ... và ${errors.length - 20} lỗi khác` : ''}`);
    }
    const records = readJsonLines(sourcePath);
    const testRecords = records.filter((record) => record.split === 'test');
    const missing = testRecords.filter((record) => !finalById.has(record.transcriptId));
    if (missing.length || finalById.size !== testRecords.length) {
        throw new Error(`Workbook phải chứa đúng ${testRecords.length} transcript test; hiện có ${finalById.size}.`);
    }
    let actionItemCount = 0;
    const verified = testRecords.map((record) => {
        const actionItems = finalById.get(record.transcriptId) ?? [];
        actionItemCount += actionItems.length;
        return {
            ...record,
            annotationStatus: 'HUMAN_VERIFIED',
            groundTruth: { ...record.groundTruth, actionItems },
        };
    });
    const manifest = {
        datasetVersion: 'v1-human-verified',
        annotationStatus: 'HUMAN_VERIFIED',
        finalizedAt: new Date().toISOString(),
        sourceDataset: sourcePath,
        adjudicationWorkbook: adjudicationPath,
        transcriptCount: verified.length,
        actionItemCount,
        split: 'test',
        warning: 'Chỉ hợp lệ khi workbook được hai người gán nhãn độc lập và người thứ ba phân xử.',
    };
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outputPath), { recursive: true });
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(manifestPath), { recursive: true });
    (0, node_fs_1.writeFileSync)(outputPath, `${verified.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
    (0, node_fs_1.writeFileSync)(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(manifest, null, 2));
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=finalize-human-verified-action-item-dataset.js.map
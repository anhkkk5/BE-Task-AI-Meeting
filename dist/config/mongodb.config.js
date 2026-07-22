"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConfig = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const envCache = new Map();
function readEnvFileValue(key) {
    if (envCache.size === 0) {
        const envPath = (0, path_1.join)(process.cwd(), '.env');
        if ((0, fs_1.existsSync)(envPath)) {
            const content = (0, fs_1.readFileSync)(envPath, 'utf8');
            for (const line of content.split(/\r?\n/)) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }
                const separatorIndex = trimmedLine.indexOf('=');
                if (separatorIndex === -1) {
                    continue;
                }
                const envKey = trimmedLine.slice(0, separatorIndex).trim();
                const envValue = trimmedLine.slice(separatorIndex + 1).trim();
                envCache.set(envKey, envValue.replace(/^["']|["']$/g, ''));
            }
        }
    }
    return envCache.get(key);
}
function getEnv(key) {
    return process.env[key] ?? readEnvFileValue(key);
}
const mongodbConfig = () => ({
    enabled: getEnv('MONGODB_ENABLED') === 'true',
    uri: getEnv('MONGODB_URI') ??
        'mongodb://root:root@localhost:27017/agile_ai?authSource=admin',
});
exports.mongodbConfig = mongodbConfig;
//# sourceMappingURL=mongodb.config.js.map
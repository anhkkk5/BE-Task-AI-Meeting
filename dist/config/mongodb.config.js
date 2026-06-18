"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConfig = void 0;
const mongodbConfig = () => ({
    enabled: process.env.MONGODB_ENABLED === 'true',
    uri: process.env.MONGODB_URI ??
        'mongodb://root:root@localhost:27017/agile_ai?authSource=admin',
});
exports.mongodbConfig = mongodbConfig;
//# sourceMappingURL=mongodb.config.js.map
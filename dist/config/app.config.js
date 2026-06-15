"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        port: Number(process.env.PORT ?? 3001),
        apiPrefix: process.env.API_PREFIX ?? 'api',
        apiVersion: process.env.API_VERSION ?? 'v1',
    },
});
//# sourceMappingURL=app.config.js.map
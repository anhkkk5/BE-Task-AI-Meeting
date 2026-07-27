"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysqlConfig = void 0;
const isMysqlSslEnabled = () => process.env.MYSQL_SSL === 'true';
const DEFAULT_MYSQL_CONNECTION_LIMIT = 2;
const getMysqlConnectionLimit = () => {
    const configuredLimit = Number(process.env.MYSQL_CONNECTION_LIMIT ?? DEFAULT_MYSQL_CONNECTION_LIMIT);
    return Number.isInteger(configuredLimit) && configuredLimit > 0
        ? configuredLimit
        : DEFAULT_MYSQL_CONNECTION_LIMIT;
};
const mysqlConfig = () => {
    const connectionLimit = getMysqlConnectionLimit();
    return {
        type: 'mysql',
        host: process.env.MYSQL_HOST ?? 'localhost',
        port: Number(process.env.MYSQL_PORT ?? 3306),
        username: process.env.MYSQL_USER ?? 'agile_ai',
        password: process.env.MYSQL_PASSWORD ?? 'agile_ai',
        database: process.env.MYSQL_DATABASE ?? 'agile_ai',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        synchronize: false,
        autoLoadEntities: true,
        poolSize: connectionLimit,
        extra: {
            connectionLimit,
            waitForConnections: true,
            queueLimit: 0,
            ssl: isMysqlSslEnabled()
                ? {
                    rejectUnauthorized: false,
                }
                : undefined,
        },
    };
};
exports.mysqlConfig = mysqlConfig;
//# sourceMappingURL=database.config.js.map
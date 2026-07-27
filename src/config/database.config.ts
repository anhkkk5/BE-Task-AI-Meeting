import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isMysqlSslEnabled = (): boolean => process.env.MYSQL_SSL === 'true';

/**
 * So ket noi MySQL toi da.
 *
 * PHAI giu o muc thap. Goi DB dang dung chi cho phep vai ket noi dong thoi, nen
 * dat cao hon se bi server tu choi ket noi va MOI request tra ve 500, thay vi
 * chi cham. Da thu nang len 10 va toan bo API do 500.
 *
 * Cach giam tai dung khong phai la mo them ket noi, ma la giam so query moi
 * request (xem cache tu cach thanh vien o WorkspaceAccessService).
 *
 * Muon nang, phai xac nhan gioi han that cua goi DB truoc, roi dat qua
 * MYSQL_CONNECTION_LIMIT.
 */
const DEFAULT_MYSQL_CONNECTION_LIMIT = 2;

const getMysqlConnectionLimit = (): number => {
  const configuredLimit = Number(
    process.env.MYSQL_CONNECTION_LIMIT ?? DEFAULT_MYSQL_CONNECTION_LIMIT,
  );

  return Number.isInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : DEFAULT_MYSQL_CONNECTION_LIMIT;
};

export const mysqlConfig = (): TypeOrmModuleOptions => {
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

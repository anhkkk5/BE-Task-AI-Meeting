import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isMysqlSslEnabled = (): boolean => process.env.MYSQL_SSL === 'true';

export const mysqlConfig = (): TypeOrmModuleOptions => ({
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
  extra: {
    ssl: isMysqlSslEnabled()
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  },
});

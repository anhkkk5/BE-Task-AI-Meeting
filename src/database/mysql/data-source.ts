import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { mysqlConfig } from '../../config/database.config';

export default new DataSource(mysqlConfig() as DataSourceOptions);

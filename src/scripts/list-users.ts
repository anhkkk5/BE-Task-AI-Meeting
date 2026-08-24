import * as dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';

dotenv.config();

async function main() {
  const conn = await createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl:
      process.env.MYSQL_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });

  const [rows] = await conn.execute(
    'SELECT id, email, full_name, is_system_admin FROM users LIMIT 20',
  );

  console.log('USERS LIST:', rows);
  await conn.end();
}

main().catch(console.error);

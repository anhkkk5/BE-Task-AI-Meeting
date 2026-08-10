import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { createConnection } from 'mysql2/promise';

dotenv.config();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.env.CREATE_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      'Usage: set CREATE_ADMIN_PASSWORD, then run: npx ts-node src/scripts/create-admin.ts <email>',
    );
    process.exitCode = 1;
    return;
  }

  const connection = await createConnection({
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

  try {
    const [existingRows] = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    if ((existingRows as object[]).length > 0) {
      throw new Error(`User already exists: ${email}`);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await connection.execute(
      `INSERT INTO users (
        id, email, full_name, password_hash, status, is_system_admin,
        email_verified_at, refresh_token_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', 1, NOW(6), NULL, NOW(), NOW())`,
      [randomUUID(), email, 'System Administrator', passwordHash],
    );

    console.log(`Created active system admin: ${email}`);
  } finally {
    await connection.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

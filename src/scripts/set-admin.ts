/**
 * Script tạm thời: Set isSystemAdmin = true cho user theo email
 * Chạy: npx ts-node src/scripts/set-admin.ts
 */
import * as dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';

dotenv.config();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: npx ts-node src/scripts/set-admin.ts <email>');
    process.exit(1);
  }

  const conn = await createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const [rows] = await conn.execute(
    'SELECT id, email, full_name, is_system_admin FROM users WHERE email = ?',
    [email],
  );

  const users = rows as { id: string; email: string; full_name: string; is_system_admin: number }[];

  if (users.length === 0) {
    console.error(`❌ Không tìm thấy user với email: ${email}`);
    await conn.end();
    process.exit(1);
  }

  const user = users[0];
  console.log(`\n✅ Đã tìm thấy user:`);
  console.log(`  - ID: ${user.id}`);
  console.log(`  - Email: ${user.email}`);
  console.log(`  - Tên: ${user.full_name}`);
  console.log(`  - Admin hiện tại: ${user.is_system_admin ? 'CÓ' : 'KHÔNG'}`);

  const newValue = user.is_system_admin ? 0 : 1;
  await conn.execute(
    'UPDATE users SET is_system_admin = ? WHERE email = ?',
    [newValue, email],
  );

  console.log(`\n🎉 Đã ${newValue ? 'CẤP' : 'THU HỒI'} quyền System Admin cho ${user.email}!`);
  await conn.end();
}

main().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
const node_crypto_1 = require("node:crypto");
const promise_1 = require("mysql2/promise");
dotenv.config();
async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    const password = process.env.CREATE_ADMIN_PASSWORD;
    if (!email || !password) {
        console.error('Usage: set CREATE_ADMIN_PASSWORD, then run: npx ts-node src/scripts/create-admin.ts <email>');
        process.exitCode = 1;
        return;
    }
    const connection = await (0, promise_1.createConnection)({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ssl: process.env.MYSQL_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
    });
    try {
        const [existingRows] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existingRows.length > 0) {
            throw new Error(`User already exists: ${email}`);
        }
        const passwordHash = await bcrypt.hash(password, 12);
        await connection.execute(`INSERT INTO users (
        id, email, full_name, password_hash, status, is_system_admin,
        email_verified_at, refresh_token_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', 1, NOW(6), NULL, NOW(), NOW())`, [(0, node_crypto_1.randomUUID)(), email, 'System Administrator', passwordHash]);
        console.log(`Created active system admin: ${email}`);
    }
    finally {
        await connection.end();
    }
}
void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=create-admin.js.map
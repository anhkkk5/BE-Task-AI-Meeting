import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const envCache = new Map<string, string>();

function readEnvFileValue(key: string) {
  if (envCache.size === 0) {
    const envPath = join(process.cwd(), '.env');

    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf8');

      for (const line of content.split(/\r?\n/)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#')) {
          continue;
        }

        const separatorIndex = trimmedLine.indexOf('=');

        if (separatorIndex === -1) {
          continue;
        }

        const envKey = trimmedLine.slice(0, separatorIndex).trim();
        const envValue = trimmedLine.slice(separatorIndex + 1).trim();
        envCache.set(envKey, envValue.replace(/^["']|["']$/g, ''));
      }
    }
  }

  return envCache.get(key);
}

function getEnv(key: string) {
  return process.env[key] ?? readEnvFileValue(key);
}

export const mongodbConfig = () => ({
  enabled: getEnv('MONGODB_ENABLED') === 'true',
  uri:
    getEnv('MONGODB_URI') ??
    'mongodb://root:root@localhost:27017/agile_ai?authSource=admin',
});

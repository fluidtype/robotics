import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

config();
config({ path: '.env.local', override: true });

interface CheckResult {
  key: string;
  ok: boolean;
  message: string;
}

const REQUIRED_ENV = [
  { key: 'DATABASE_URL', message: 'Needed for Prisma migrations and cron jobs.' },
  { key: 'XAI_API_KEY', message: 'Required to call Grok via xAI for enrichment.' },
  { key: 'COINGECKO_API_KEY', message: 'Required to snapshot robotics tokens.' },
  { key: 'CRON_SECRET', message: 'Protects the scheduled ETL endpoint.' },
];

function hasValue(key: string): boolean {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

function runChecks(): CheckResult[] {
  return REQUIRED_ENV.map((entry) => ({
    key: entry.key,
    ok: hasValue(entry.key),
    message: entry.message,
  }));
}

function describeEnvFile(): string {
  const localPath = path.resolve('.env.local');
  if (existsSync(localPath)) {
    return `.env.local found at ${localPath}`;
  }
  return '.env.local is missing (only base .env will be used).';
}

async function main() {
  console.log('Running ETL environment checks...');
  console.log(describeEnvFile());

  const results = runChecks();
  for (const result of results) {
    const status = result.ok ? '✅' : '❌';
    console.log(`${status} ${result.key} - ${result.message}`);
  }

  const missing = results.filter((result) => !result.ok);
  if (missing.length) {
    console.error(`\nMissing ${missing.length} required environment variables.`);
    process.exitCode = 1;
  } else {
    console.log('\nAll required environment variables are configured.');
  }
}

void main();

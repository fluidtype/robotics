#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('node:child_process');

const pattern = 'open' + 'ai';
const result = spawnSync('grep', ['-R', '--exclude-dir=.git', pattern, '-n', '.'], {
  stdio: 'inherit',
});

if (result.status === 0) {
  console.error('Forbidden references detected.');
  process.exit(1);
}

if (result.status && result.status > 1) {
  console.error('The lint:ai check failed to run.');
  process.exit(result.status);
}

console.log('OK: no forbidden references detected');

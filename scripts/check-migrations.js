#!/usr/bin/env node
/**
 * Script to check and run database migrations
 * Returns exit code 0 if successful, non-zero on error
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.join(__dirname, '..', 'backend');
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
const migrationScript = path.join(__dirname, '..', 'execution', 'run_migrations.py');

return new Promise((resolve, reject) => {
  console.log('🔍 Checking database migrations...');
  
  const migrateProcess = spawn(pythonCmd, [migrationScript, 'upgrade'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  migrateProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Migration failed with code ${code}`);
      reject(new Error(`Migration failed with code ${code}`));
    } else {
      console.log('✅ Migrations applied successfully');
      resolve();
    }
  });

  migrateProcess.on('error', (error) => {
    console.error(`❌ Failed to run migrations: ${error.message}`);
    reject(error);
  });
}).catch((error) => {
  process.exit(1);
});

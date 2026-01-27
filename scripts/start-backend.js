#!/usr/bin/env node
/**
 * Script to start the backend server with migration checks
 */
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.join(__dirname, '..', 'backend');
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

// Check if secrets directory exists and has required files
const secretsDir = path.join(backendPath, 'secrets');
const requiredSecrets = ['DATABASE_PASSWORD', 'SECRET_KEY'];

if (!fs.existsSync(secretsDir)) {
  console.error('❌ Error: secrets/ directory not found!');
  console.error('   Please create the secrets directory and configure your secrets.');
  console.error('   See backend/secrets/README.md for instructions.');
  process.exit(1);
}

// Check for required secret files
const missingSecrets = requiredSecrets.filter(secret => {
  const secretFile = path.join(secretsDir, secret);
  return !fs.existsSync(secretFile);
});

if (missingSecrets.length > 0) {
  console.error('❌ Error: Required secret files not found!');
  console.error(`   Missing: ${missingSecrets.join(', ')}`);
  console.error('   Please copy the .template files and configure them:');
  missingSecrets.forEach(secret => {
    console.error(`     cp secrets/${secret}.template secrets/${secret}`);
  });
  console.error('   See backend/secrets/README.md for instructions.');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(backendPath, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.error('   Please copy .env.example to .env and configure it.');
  process.exit(1);
}

console.log('🔍 Checking database migrations...');

// Run migrations check and upgrade
const migrateProcess = spawn(pythonCmd, [
  path.join(__dirname, '..', 'execution', 'run_migrations.py'),
  'upgrade'
], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

migrateProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Migration failed with code ${code}`);
    console.error('   Please check your database connection and migrations.');
    process.exit(1);
  }

  console.log('✅ Migrations applied successfully');
  console.log('🚀 Starting backend server...\n');

  // Start the backend server
  const serverProcess = spawn(pythonCmd, [
    path.join(__dirname, '..', 'execution', 'run_server.py')
  ], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping backend server...');
    serverProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    serverProcess.kill();
    process.exit(0);
  });
});

migrateProcess.on('error', (error) => {
  console.error('❌ Failed to run migrations:', error);
  console.error('   Make sure Python is installed and dependencies are installed.');
  process.exit(1);
});

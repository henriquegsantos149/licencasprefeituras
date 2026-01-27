#!/usr/bin/env node
/**
 * Script to fix PostgreSQL user configuration
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.join(__dirname, '..', 'backend');
const envPath = path.join(backendPath, '.env');

console.log('🔧 Fixing PostgreSQL user configuration...\n');

// Get current system user
const currentUser = execSync('whoami', { encoding: 'utf-8' }).trim();
console.log(`Current system user: ${currentUser}\n`);

// Check if .env exists
try {
  const envContent = readFileSync(envPath, 'utf-8');
  
  // Try to connect with current user
  console.log(`Testing connection with user: ${currentUser}`);
  try {
    execSync(`psql -U ${currentUser} -d postgres -c "SELECT 1;"`, {
      stdio: 'ignore',
      encoding: 'utf-8'
    });
    console.log(`✅ Success! Using user: ${currentUser}\n`);
    
    // Update .env file
    const updatedContent = envContent.replace(
      /^DATABASE_USER=.*/m,
      `DATABASE_USER=${currentUser}`
    );
    writeFileSync(envPath, updatedContent);
    console.log(`✅ Updated backend/.env with DATABASE_USER=${currentUser}\n`);
    console.log('Note: On macOS, PostgreSQL usually doesn\'t require a password for local connections.');
    console.log('You may need to update backend/secrets/DATABASE_PASSWORD to be empty.\n');
    process.exit(0);
  } catch (e) {
    // Try postgres user
    console.log('Testing connection with user: postgres');
    try {
      execSync('psql -U postgres -d postgres -c "SELECT 1;"', {
        stdio: 'ignore',
        encoding: 'utf-8'
      });
      console.log('✅ Success! Using user: postgres');
      console.log('Configuration is already correct.\n');
      process.exit(0);
    } catch (e2) {
      // Neither works
      console.log('❌ Could not connect to PostgreSQL\n');
      console.log('Options:');
      console.log('1. Create postgres user:');
      console.log('   createuser -s postgres\n');
      console.log('2. Or use Docker (recommended):');
      console.log('   docker-compose up -d postgres\n');
      console.log('3. Make sure PostgreSQL is running:');
      console.log('   pg_isready');
      console.log('   brew services start postgresql@14  # if using Homebrew\n');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Make sure backend/.env exists. Run: npm run setup');
  process.exit(1);
}

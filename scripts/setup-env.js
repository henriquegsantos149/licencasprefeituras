#!/usr/bin/env node
/**
 * Script to setup environment files (.env and secrets)
 */
import { copyFileSync, mkdirSync, writeFileSync, existsSync, chmodSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.join(__dirname, '..', 'backend');
const secretsDir = path.join(backendPath, 'secrets');

console.log('🔧 Setting up environment files...\n');

// Create .env from .env.example if it doesn't exist
const envPath = path.join(backendPath, '.env');
const envExamplePath = path.join(backendPath, '.env.example');

if (!existsSync(envPath)) {
  if (existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from .env.example...');
    copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created\n');
  } else {
    console.log('⚠️  .env.example not found, creating basic .env...');
    writeFileSync(envPath, `DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=licencas_prefeituras
DATABASE_USER=postgres

API_V1_PREFIX=/api/v1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
`);
    console.log('✅ .env file created\n');
  }
} else {
  console.log('ℹ️  .env file already exists\n');
}

// Check secrets directory
if (!existsSync(secretsDir)) {
  console.log('📁 Creating secrets directory...');
  mkdirSync(secretsDir, { mode: 0o700, recursive: true });
  console.log('✅ secrets directory created\n');
}

// Create DATABASE_PASSWORD if it doesn't exist
const dbPasswordPath = path.join(secretsDir, 'DATABASE_PASSWORD');
const dbPasswordTemplatePath = path.join(secretsDir, 'DATABASE_PASSWORD.template');

if (!existsSync(dbPasswordPath)) {
  console.log('📝 Creating DATABASE_PASSWORD...');
  if (existsSync(dbPasswordTemplatePath)) {
    copyFileSync(dbPasswordTemplatePath, dbPasswordPath);
    console.log('✅ DATABASE_PASSWORD created (using template value)');
  } else {
    writeFileSync(dbPasswordPath, 'postgres\n');
    console.log('✅ DATABASE_PASSWORD created with default value');
  }
  try {
    chmodSync(dbPasswordPath, 0o600);
  } catch (e) {
    // Ignore chmod errors on Windows
  }
  console.log('⚠️  Please edit secrets/DATABASE_PASSWORD with your actual database password\n');
} else {
  console.log('ℹ️  DATABASE_PASSWORD already exists\n');
}

// Create SECRET_KEY if it doesn't exist
const secretKeyPath = path.join(secretsDir, 'SECRET_KEY');
const secretKeyTemplatePath = path.join(secretsDir, 'SECRET_KEY.template');

if (!existsSync(secretKeyPath)) {
  console.log('📝 Creating SECRET_KEY...');
  if (existsSync(secretKeyTemplatePath)) {
    copyFileSync(secretKeyTemplatePath, secretKeyPath);
    console.log('⚠️  Using template SECRET_KEY - please generate a strong random key!');
  } else {
    // Try to generate a random key using Python
    try {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const key = execSync(`${pythonCmd} -c "import secrets; print(secrets.token_urlsafe(32))"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();
      if (key) {
        writeFileSync(secretKeyPath, key + '\n');
        console.log('✅ SECRET_KEY created with random value');
      } else {
        throw new Error('Failed to generate key');
      }
    } catch (error) {
      writeFileSync(secretKeyPath, `your-secret-key-change-in-production-${Date.now()}\n`);
      console.log('✅ SECRET_KEY created (please generate a stronger key for production)');
      console.log('   Run: python3 -c "import secrets; print(secrets.token_urlsafe(32))" > backend/secrets/SECRET_KEY');
    }
  }
  try {
    chmodSync(secretKeyPath, 0o600);
  } catch (e) {
    // Ignore chmod errors on Windows
  }
  console.log('⚠️  For production, generate a stronger key:');
  console.log('   python3 -c "import secrets; print(secrets.token_urlsafe(32))" > backend/secrets/SECRET_KEY\n');
} else {
  console.log('ℹ️  SECRET_KEY already exists\n');
}

console.log('✅ Environment setup completed!');
console.log('\nNext steps:');
console.log('1. Review and edit backend/.env if needed');
console.log('2. Review and edit backend/secrets/DATABASE_PASSWORD with your database password');
console.log('3. Review and edit backend/secrets/SECRET_KEY (generate a strong key for production)');
console.log('\nThen run: npm run dev');

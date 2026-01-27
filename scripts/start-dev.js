#!/usr/bin/env node
/**
 * Script to start both frontend and backend in development mode
 * Complete end-to-end process:
 * 1. Check prerequisites (secrets, .env)
 * 2. Check Python dependencies
 * 3. Setup database (connection, user, create DB)
 * 4. Create initial migration if needed
 * 5. Apply migrations
 * 6. Seed initial data
 * 7. Start backend server
 * 8. Start frontend dev server
 */
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.join(__dirname, '..', 'backend');
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Track if we need to stop
let backendProcess = null;
let frontendProcess = null;

// Cleanup function
const cleanup = () => {
  log('\n🛑 Stopping servers...', 'yellow');
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  setTimeout(() => process.exit(0), 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Step 1: Check prerequisites
log('\n═══════════════════════════════════════════════════════════', 'cyan');
log('🚀 Starting Complete Development Environment Setup', 'cyan');
log('═══════════════════════════════════════════════════════════\n', 'cyan');

log('📋 Step 1: Checking prerequisites...', 'cyan');

// Check if secrets directory exists and has required files
const secretsDir = path.join(backendPath, 'secrets');
const requiredSecrets = ['DATABASE_PASSWORD', 'SECRET_KEY'];

if (!fs.existsSync(secretsDir)) {
  log('❌ Error: secrets/ directory not found!', 'red');
  log('   Please run: npm run setup', 'yellow');
  process.exit(1);
}

// Check for required secret files
const missingSecrets = requiredSecrets.filter(secret => {
  const secretFile = path.join(secretsDir, secret);
  return !fs.existsSync(secretFile);
});

if (missingSecrets.length > 0) {
  log('❌ Error: Required secret files not found!', 'red');
  log(`   Missing: ${missingSecrets.join(', ')}`, 'yellow');
  log('   Please run: npm run setup', 'yellow');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(backendPath, '.env');
if (!fs.existsSync(envPath)) {
  log('❌ Error: .env file not found!', 'red');
  log('   Please run: npm run setup', 'yellow');
  process.exit(1);
}

log('✅ Prerequisites OK', 'green');

// Step 2: Check Python dependencies
log('\n📦 Step 2: Checking Python dependencies...', 'cyan');
const checkDepsProcess = spawn(pythonCmd, [
  path.join(__dirname, '..', 'execution', 'check-dependencies.py')
], {
  cwd: backendPath,
  stdio: 'pipe',
  shell: true
});

let depsOutput = '';
checkDepsProcess.stdout.on('data', (data) => {
  depsOutput += data.toString();
});

checkDepsProcess.stderr.on('data', (data) => {
  depsOutput += data.toString();
});

checkDepsProcess.on('close', (code) => {
  if (code !== 0) {
    log(depsOutput, 'red');
    log('\n❌ Python dependencies are missing!', 'red');
    log('   Please install dependencies:', 'yellow');
    log('     cd backend', 'blue');
    log('     python3 -m venv venv', 'blue');
    log('     source venv/bin/activate', 'blue');
    log('     pip install -r requirements.txt', 'blue');
    log('   See INSTALL_DEPENDENCIES.md for details.', 'yellow');
    process.exit(1);
  }
  log('✅ Python dependencies OK', 'green');
  
  // Continue with database setup
  setupDatabase();
});

checkDepsProcess.on('error', (error) => {
  log(`❌ Failed to check dependencies: ${error.message}`, 'red');
  log('   Make sure Python is installed.', 'yellow');
  process.exit(1);
});

// Step 3: Setup database (connection, user, create DB, migrations)
function setupDatabase() {
  log('\n🗄️  Step 3: Setting up database...', 'cyan');
  log('   (Checking connection, user, creating DB if needed)', 'blue');
  
  const setupDbProcess = spawn(pythonCmd, [
    path.join(__dirname, '..', 'execution', 'setup-database-complete.py')
  ], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  setupDbProcess.on('close', (code) => {
    if (code !== 0) {
      log('\n❌ Database setup failed', 'red');
      log('   Please check:', 'yellow');
      log('   1. PostgreSQL is running: pg_isready', 'blue');
      log('   2. Database configuration in backend/.env', 'blue');
      log('   3. Try: npm run fix-postgres', 'blue');
      log('   See FIX_POSTGRES.md for troubleshooting.', 'yellow');
      process.exit(1);
    }

    // Continue with migrations
    applyMigrations();
  });

  setupDbProcess.on('error', (error) => {
    log(`❌ Failed to setup database: ${error.message}`, 'red');
    log('   Make sure Python is installed and PostgreSQL is running.', 'yellow');
    process.exit(1);
  });
}

// Step 4: Apply migrations
function applyMigrations() {
  log('\n🔄 Step 4: Applying database migrations...', 'cyan');
  
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
      log('\n❌ Migration failed', 'red');
      log('   Please check your database connection and migrations.', 'yellow');
      log('   You can run manually: python execution/run_migrations.py upgrade', 'blue');
      process.exit(1);
    }

    log('✅ Migrations applied successfully', 'green');
    
    // Continue with seeding
    seedData();
  });

  migrateProcess.on('error', (error) => {
    log(`❌ Failed to run migrations: ${error.message}`, 'red');
    process.exit(1);
  });
}

// Step 5: Seed initial data
function seedData() {
  log('\n🌱 Step 5: Seeding initial data...', 'cyan');
  
  const seedProcess = spawn(pythonCmd, [
    path.join(__dirname, '..', 'execution', 'seed_data.py')
  ], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  seedProcess.on('close', (seedCode) => {
    if (seedCode !== 0 && seedCode !== null) {
      log('⚠️  Warning: Could not seed initial data', 'yellow');
      log('   Continuing anyway...', 'yellow');
    } else {
      log('✅ Initial data ready', 'green');
    }
    
    // All setup complete, start servers
    log('\n═══════════════════════════════════════════════════════════', 'green');
    log('✅ All setup steps completed successfully!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'green');
    
    startServers();
  });

  seedProcess.on('error', () => {
    log('⚠️  Warning: Could not seed data, continuing...', 'yellow');
    startServers();
  });
}

// Step 6 & 7: Start servers
function startServers() {
  log('🚀 Step 6: Starting backend server...', 'cyan');
  log('   Backend API: http://localhost:8000', 'blue');
  log('   API Docs: http://localhost:8000/docs\n', 'blue');
  
  backendProcess = spawn(pythonCmd, [
    path.join(__dirname, '..', 'execution', 'run_server.py')
  ], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  backendProcess.on('error', (error) => {
    log(`❌ Failed to start backend server: ${error.message}`, 'red');
    log('   Make sure Python dependencies are installed.', 'yellow');
    process.exit(1);
  });

  // Wait for backend to start, then start frontend
  setTimeout(() => {
    log('🚀 Step 7: Starting frontend dev server...', 'cyan');
    log('   Frontend: http://localhost:5173\n', 'blue');
    
    frontendProcess = spawn('npm', ['run', 'dev:frontend'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });

    frontendProcess.on('error', (error) => {
      log(`❌ Failed to start frontend: ${error.message}`, 'red');
      if (backendProcess) backendProcess.kill();
      process.exit(1);
    });

    log('\n═══════════════════════════════════════════════════════════', 'green');
    log('✅ Development environment is running!', 'green');
    log('═══════════════════════════════════════════════════════════', 'green');
    log('\n📝 Available at:', 'cyan');
    log('   Frontend: http://localhost:5173', 'blue');
    log('   Backend:  http://localhost:8000', 'blue');
    log('   API Docs: http://localhost:8000/docs', 'blue');
    log('\n💡 Press Ctrl+C to stop all servers\n', 'yellow');
  }, 3000); // Wait 3 seconds for backend to start
}

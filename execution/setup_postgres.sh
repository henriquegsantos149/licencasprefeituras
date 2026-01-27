#!/bin/bash
# Script to setup PostgreSQL database for the project

set -e

echo "🚀 Setting up PostgreSQL database for Licenciamento Digital..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql@14"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL doesn't seem to be running."
    echo "   Starting PostgreSQL..."
    
    # Try to start PostgreSQL (macOS with Homebrew)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@14 || brew services start postgresql || true
    fi
    
    # Wait a bit for PostgreSQL to start
    sleep 2
    
    if ! pg_isready &> /dev/null; then
        echo "❌ Could not start PostgreSQL. Please start it manually."
        exit 1
    fi
fi

echo "✓ PostgreSQL is running"

# Database configuration
DB_NAME="licencas_prefeituras"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-postgres}"

# Check if database already exists
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✓ Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo "✓ Database dropped"
    else
        echo "Keeping existing database"
        exit 0
    fi
fi

# Create database
echo "Creating database '$DB_NAME'..."
psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
echo "✓ Database created successfully"

echo ""
echo "✅ PostgreSQL setup completed!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file in the backend/ directory"
echo "2. Run: python execution/init_database.py"
echo "3. Start the server: python execution/run_server.py"

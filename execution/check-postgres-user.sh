#!/bin/bash
# Script to check PostgreSQL user and create database if needed

echo "🔍 Checking PostgreSQL configuration..."

# Try to connect with current user
CURRENT_USER=$(whoami)
echo "Current system user: $CURRENT_USER"

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running"
    echo "   Please start PostgreSQL first:"
    echo "   macOS: brew services start postgresql@14"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Try to connect with current user
echo ""
echo "Trying to connect with user: $CURRENT_USER"
if psql -U "$CURRENT_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "✅ Successfully connected with user: $CURRENT_USER"
    echo ""
    echo "Your PostgreSQL user is: $CURRENT_USER"
    echo ""
    echo "Update your backend/.env file:"
    echo "  DATABASE_USER=$CURRENT_USER"
    echo ""
    echo "And update backend/secrets/DATABASE_PASSWORD if needed"
    exit 0
fi

# Try postgres user
echo "Trying to connect with user: postgres"
if psql -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "✅ Successfully connected with user: postgres"
    echo ""
    echo "Your PostgreSQL user is: postgres"
    exit 0
fi

# If neither works, show instructions
echo "❌ Could not connect to PostgreSQL"
echo ""
echo "Please check:"
echo "1. PostgreSQL is running: pg_isready"
echo "2. Your PostgreSQL user (usually your system username)"
echo "3. Update backend/.env with correct DATABASE_USER"
echo ""
echo "To create postgres user (if needed):"
echo "  createuser -s postgres"

#!/bin/bash
# Script to fix PostgreSQL user configuration

set -e

CURRENT_USER=$(whoami)
BACKEND_DIR="$(dirname "$0")/../backend"

echo "🔧 Fixing PostgreSQL user configuration..."
echo "Current system user: $CURRENT_USER"
echo ""

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "❌ .env file not found. Run 'npm run setup' first."
    exit 1
fi

# Try to connect with current user (no password usually works on macOS)
echo "Testing connection with user: $CURRENT_USER"
if psql -U "$CURRENT_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "✅ Success! Using user: $CURRENT_USER"
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^DATABASE_USER=.*/DATABASE_USER=$CURRENT_USER/" "$BACKEND_DIR/.env"
    else
        # Linux
        sed -i "s/^DATABASE_USER=.*/DATABASE_USER=$CURRENT_USER/" "$BACKEND_DIR/.env"
    fi
    
    echo "✅ Updated backend/.env with DATABASE_USER=$CURRENT_USER"
    echo ""
    echo "Note: On macOS, PostgreSQL usually doesn't require a password for local connections."
    echo "You may need to update backend/secrets/DATABASE_PASSWORD to be empty or your actual password."
    exit 0
fi

# Try postgres user
echo "Testing connection with user: postgres"
if psql -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "✅ Success! Using user: postgres"
    echo "Configuration is already correct."
    exit 0
fi

# If neither works
echo "❌ Could not connect to PostgreSQL"
echo ""
echo "Options:"
echo "1. Create postgres user:"
echo "   createuser -s postgres"
echo ""
echo "2. Or update backend/.env to use your PostgreSQL username"
echo ""
echo "3. Make sure PostgreSQL is running:"
echo "   pg_isready"
echo "   brew services start postgresql@14  # if using Homebrew"
exit 1

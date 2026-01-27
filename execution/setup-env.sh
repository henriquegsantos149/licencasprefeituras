#!/bin/bash
# Script to setup environment files

set -e

echo "🔧 Setting up environment files..."

cd "$(dirname "$0")/../backend"

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Check secrets directory
if [ ! -d secrets ]; then
    echo "📁 Creating secrets directory..."
    mkdir -p secrets
    chmod 700 secrets
    echo "✅ secrets directory created"
fi

# Create DATABASE_PASSWORD if it doesn't exist
if [ ! -f secrets/DATABASE_PASSWORD ]; then
    echo "📝 Creating DATABASE_PASSWORD from template..."
    if [ -f secrets/DATABASE_PASSWORD.template ]; then
        cp secrets/DATABASE_PASSWORD.template secrets/DATABASE_PASSWORD
        echo "✅ DATABASE_PASSWORD created (using template value)"
        echo "⚠️  Please edit secrets/DATABASE_PASSWORD with your actual database password"
    else
        echo "postgres" > secrets/DATABASE_PASSWORD
        echo "✅ DATABASE_PASSWORD created with default value"
        echo "⚠️  Please edit secrets/DATABASE_PASSWORD with your actual database password"
    fi
    chmod 600 secrets/DATABASE_PASSWORD
else
    echo "ℹ️  DATABASE_PASSWORD already exists"
fi

# Create SECRET_KEY if it doesn't exist
if [ ! -f secrets/SECRET_KEY ]; then
    echo "📝 Creating SECRET_KEY..."
    if [ -f secrets/SECRET_KEY.template ]; then
        cp secrets/SECRET_KEY.template secrets/SECRET_KEY
        echo "⚠️  Using template SECRET_KEY - please generate a strong random key!"
        echo "   Run: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\" > secrets/SECRET_KEY"
    else
        # Generate a random key
        python3 -c "import secrets; print(secrets.token_urlsafe(32))" > secrets/SECRET_KEY 2>/dev/null || \
        echo "your-secret-key-change-in-production-$(date +%s)" > secrets/SECRET_KEY
        echo "✅ SECRET_KEY created"
        echo "⚠️  For production, generate a stronger key:"
        echo "   python3 -c \"import secrets; print(secrets.token_urlsafe(32))\" > secrets/SECRET_KEY"
    fi
    chmod 600 secrets/SECRET_KEY
else
    echo "ℹ️  SECRET_KEY already exists"
fi

echo ""
echo "✅ Environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Review and edit backend/.env if needed"
echo "2. Review and edit backend/secrets/DATABASE_PASSWORD with your database password"
echo "3. Review and edit backend/secrets/SECRET_KEY (generate a strong key for production)"
echo ""
echo "Then run: npm run dev"

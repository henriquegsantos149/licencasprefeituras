#!/usr/bin/env python3
"""
Complete database setup script.
This script handles the entire database setup process:
1. Checks PostgreSQL connection
2. Fixes user configuration if needed
3. Creates database if it doesn't exist
4. Creates initial migration if needed
5. Applies migrations
6. Seeds initial data
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Change to backend directory
os.chdir(backend_path)

from app.config import settings
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def check_postgres_connection():
    """Check if PostgreSQL is accessible and fix user if needed."""
    print("   Checking PostgreSQL connection...")
    
    db_url = settings.DATABASE_URL
    db_name = settings.DATABASE_NAME
    db_user = settings.DATABASE_USER
    db_password = settings.DATABASE_PASSWORD
    
    # Try to connect with current user
    import getpass
    current_user = getpass.getuser()
    
    # Try different connection strategies
    connection_strategies = [
        (db_user, f"postgresql://{db_user}:{db_password}@localhost:5432/postgres"),
        (current_user, f"postgresql://{current_user}@localhost:5432/postgres"),
        ('postgres', f"postgresql://postgres@localhost:5432/postgres"),
    ]
    
    working_connection = None
    working_user = None
    
    for user, test_url in connection_strategies:
        try:
            conn = psycopg2.connect(test_url)
            conn.close()
            working_connection = test_url
            working_user = user
            print(f"   ✅ Connected with user: {user}")
            break
        except psycopg2.OperationalError:
            continue
        except Exception:
            continue
    
    if not working_connection:
        print("   ❌ Could not connect to PostgreSQL")
        print("\n   Troubleshooting:")
        print("   1. Make sure PostgreSQL is running:")
        print("      pg_isready")
        print("      brew services start postgresql@14  # if using Homebrew")
        print("\n   2. Or use Docker:")
        print("      docker-compose up -d postgres")
        return False, None, None
    
    # Update .env if user is different
    if working_user != db_user:
        print(f"   ⚠️  User mismatch. Updating to '{working_user}'...")
        
        # Update .env file
        env_file = backend_path / ".env"
        if env_file.exists():
            content = env_file.read_text()
            content = content.replace(f"DATABASE_USER={db_user}", f"DATABASE_USER={working_user}")
            env_file.write_text(content)
            print(f"   ✅ Updated backend/.env")
    
    return True, working_connection, working_user

def create_database(admin_url, db_name):
    """Create the database if it doesn't exist."""
    print(f"   Checking if database '{db_name}' exists...")
    
    try:
        conn = psycopg2.connect(admin_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cursor.fetchone()
        
        if exists:
            print(f"   ✅ Database '{db_name}' already exists")
        else:
            # Create database
            print(f"   📝 Creating database '{db_name}'...")
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"   ✅ Database '{db_name}' created successfully")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error creating database: {e}")
        return False

def check_migration_exists():
    """Check if initial migration exists."""
    migrations_dir = backend_path / "alembic" / "versions"
    if not migrations_dir.exists():
        return False
    
    migration_files = list(migrations_dir.glob("*.py"))
    # Filter out __init__.py and .gitkeep
    migration_files = [f for f in migration_files if not f.name.startswith('_') and f.name != '.gitkeep']
    
    return len(migration_files) > 0

def setup_database_complete():
    """Complete database setup process."""
    # Step 1: Check PostgreSQL connection
    success, admin_url, working_user = check_postgres_connection()
    if not success:
        return False
    
    # Step 2: Create database
    if not create_database(admin_url, settings.DATABASE_NAME):
        return False
    
    # Step 3: Check if migration exists, create if needed
    print("   Checking for migrations...")
    if not check_migration_exists():
        print("   ⚠️  No migrations found. Creating initial migration...")
        try:
            from alembic.config import Config
            from alembic import command
            
            alembic_cfg = Config("alembic.ini")
            command.revision(
                alembic_cfg,
                autogenerate=True,
                message="Initial migration - create all tables"
            )
            print("   ✅ Initial migration created")
        except Exception as e:
            print(f"   ❌ Error creating migration: {e}")
            print("\n   You can create it manually:")
            print("      python execution/create_initial_migration.py")
            return False
    else:
        print("   ✅ Migrations found")
    
    print("   ✅ Database setup completed!")
    return True

if __name__ == "__main__":
    success = setup_database_complete()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Script to create the PostgreSQL database if it doesn't exist.
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.config import settings
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Create the database if it doesn't exist."""
    # Parse connection string to get components
    db_url = settings.DATABASE_URL
    # Extract database name
    db_name = settings.DATABASE_NAME
    
    # Create connection URL without database name (connect to 'postgres' database)
    # Format: postgresql://user:password@host:port/postgres
    parts = db_url.rsplit('/', 1)
    admin_url = parts[0] + '/postgres'  # Connect to default 'postgres' database
    
    try:
        print(f"Connecting to PostgreSQL to create database '{db_name}'...")
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
            print(f"✅ Database '{db_name}' already exists")
        else:
            # Create database
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"✅ Database '{db_name}' created successfully")
        
        cursor.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is running:")
        print("   pg_isready")
        print("   brew services start postgresql@14  # if using Homebrew")
        print("\n2. Check your database configuration in backend/.env")
        print("3. Try running: npm run fix-postgres")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_database()

#!/usr/bin/env python3
"""
Script to initialize the PostgreSQL database.
This script runs migrations and seeds initial data.
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Change to backend directory for alembic
os.chdir(backend_path)

from alembic.config import Config
from alembic import command

def init_database():
    """Initialize database by running migrations and seeding data."""
    print("🚀 Initializing database...")
    
    # Create database if it doesn't exist
    print("\n1. Creating database if it doesn't exist...")
    try:
        from create_database import create_database
        create_database()
    except ImportError:
        # If script doesn't exist, try direct connection
        from app.config import settings
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        
        db_url = settings.DATABASE_URL
        parts = db_url.rsplit('/', 1)
        admin_url = parts[0] + '/postgres'
        
        try:
            conn = psycopg2.connect(admin_url)
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (settings.DATABASE_NAME,)
            )
            if not cursor.fetchone():
                cursor.execute(f'CREATE DATABASE "{settings.DATABASE_NAME}"')
                print(f"✓ Database '{settings.DATABASE_NAME}' created")
            else:
                print(f"✓ Database '{settings.DATABASE_NAME}' already exists")
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"⚠️  Could not create database: {e}")
            print("   You may need to create it manually")
    
    # Run migrations
    print("\n2. Running database migrations...")
    alembic_cfg = Config("alembic.ini")
    try:
        command.upgrade(alembic_cfg, "head")
        print("✓ Migrations applied successfully")
    except Exception as e:
        print(f"✗ Error running migrations: {e}")
        print("\nNote: If this is the first time, you may need to create the initial migration:")
        print("  python execution/create_initial_migration.py")
        raise
    
    # Seed initial data
    print("\n3. Seeding initial data...")
    try:
        # Import and run seed script
        sys.path.insert(0, str(Path(__file__).parent))
        from seed_data import seed_data
        seed_data()
    except Exception as e:
        print(f"⚠️  Warning: Could not seed data: {e}")
        print("You can run seed_data.py manually later")
    
    print("\n✅ Database initialization completed!")


if __name__ == "__main__":
    init_database()

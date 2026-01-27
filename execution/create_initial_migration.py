#!/usr/bin/env python3
"""
Script to create the initial database migration.
This should be run after setting up Alembic for the first time.
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Change to backend directory
os.chdir(backend_path)

if __name__ == "__main__":
    # Import alembic command
    from alembic.config import Config
    from alembic import command
    
    alembic_cfg = Config("alembic.ini")
    
    print("Creating initial migration...")
    command.revision(
        alembic_cfg,
        autogenerate=True,
        message="Initial migration - create all tables"
    )
    print("✓ Initial migration created!")
    print("\nNext step: Review the migration file in alembic/versions/")
    print("Then run: alembic upgrade head")

#!/usr/bin/env python3
"""
Script to run database migrations.
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
    import argparse
    from alembic.config import Config
    from alembic import command
    
    parser = argparse.ArgumentParser(description="Run database migrations")
    parser.add_argument(
        "action",
        choices=["upgrade", "downgrade", "current", "history"],
        help="Migration action to perform"
    )
    parser.add_argument(
        "--revision",
        default="head",
        help="Revision to upgrade/downgrade to (default: head)"
    )
    
    args = parser.parse_args()
    
    alembic_cfg = Config("alembic.ini")
    
    if args.action == "upgrade":
        print(f"Upgrading database to revision: {args.revision}")
        command.upgrade(alembic_cfg, args.revision)
        print("✓ Migration completed!")
    elif args.action == "downgrade":
        print(f"Downgrading database to revision: {args.revision}")
        command.downgrade(alembic_cfg, args.revision)
        print("✓ Downgrade completed!")
    elif args.action == "current":
        print("Current database revision:")
        command.current(alembic_cfg)
    elif args.action == "history":
        print("Migration history:")
        command.history(alembic_cfg)

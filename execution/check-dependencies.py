#!/usr/bin/env python3
"""
Script to check if Python dependencies are installed.
"""
import sys

required_modules = [
    'fastapi',
    'uvicorn',
    'sqlalchemy',
    'psycopg2',
    'alembic',
    'pydantic',
    'python_dotenv',
    'jose',
    'passlib'
]

missing_modules = []

for module in required_modules:
    try:
        if module == 'python_dotenv':
            __import__('dotenv')
        elif module == 'jose':
            __import__('jose')
        elif module == 'psycopg2':
            __import__('psycopg2')
        else:
            __import__(module)
    except ImportError:
        missing_modules.append(module)

if missing_modules:
    print("❌ Missing Python dependencies:")
    for module in missing_modules:
        print(f"   - {module}")
    print("\nPlease install dependencies:")
    print("  cd backend")
    print("  python3 -m venv venv")
    print("  source venv/bin/activate")
    print("  pip install -r requirements.txt")
    sys.exit(1)
else:
    print("✅ All Python dependencies are installed")
    sys.exit(0)

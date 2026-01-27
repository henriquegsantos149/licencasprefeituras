#!/usr/bin/env python3
"""
Script to run the FastAPI development server.
"""
import sys
import os
from pathlib import Path
import uvicorn

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Change to backend directory
os.chdir(backend_path)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )

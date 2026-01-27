"""
Secrets management for the application.
Loads sensitive data from individual files in secrets/ directory.
Each secret is stored in its own file named after the secret key.
"""
import os
from pathlib import Path
from typing import Optional


class Secrets:
    """Manages application secrets loaded from individual files in secrets/ directory."""
    
    _secrets: dict = {}
    _loaded: bool = False
    _secrets_dir: Optional[Path] = None
    
    @classmethod
    def _get_secrets_dir(cls) -> Path:
        """Get the secrets directory path."""
        if cls._secrets_dir is None:
            cls._secrets_dir = Path(__file__).parent.parent / "secrets"
        return cls._secrets_dir
    
    @classmethod
    def _load_secrets(cls) -> None:
        """Load secrets from individual files in secrets/ directory."""
        if cls._loaded:
            return
        
        secrets_dir = cls._get_secrets_dir()
        
        if not secrets_dir.exists():
            # Try to create the directory
            try:
                secrets_dir.mkdir(mode=0o700, exist_ok=True)
            except Exception:
                pass
        
        if secrets_dir.exists() and secrets_dir.is_dir():
            # Read each file in the secrets directory
            for secret_file in secrets_dir.iterdir():
                if secret_file.is_file() and not secret_file.name.startswith('.'):
                    secret_key = secret_file.name
                    try:
                        with open(secret_file, 'r') as f:
                            secret_value = f.read().strip()
                            # Remove trailing newlines and whitespace
                            cls._secrets[secret_key] = secret_value
                    except Exception as e:
                        # Silently skip files that can't be read
                        continue
        
        cls._loaded = True
    
    @classmethod
    def get(cls, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get a secret value by key."""
        cls._load_secrets()
        return cls._secrets.get(key, default)
    
    @classmethod
    def get_required(cls, key: str) -> str:
        """Get a required secret value, raising error if not found."""
        cls._load_secrets()
        value = cls._secrets.get(key)
        if value is None:
            secrets_dir = cls._get_secrets_dir()
            raise ValueError(
                f"Required secret '{key}' not found in {secrets_dir}/ directory.\n"
                f"Create a file named '{key}' in {secrets_dir}/ with the secret value."
            )
        return value
    
    @classmethod
    def all(cls) -> dict:
        """Get all secrets as a dictionary."""
        cls._load_secrets()
        return cls._secrets.copy()
    
    @classmethod
    def list_available(cls) -> list:
        """List all available secret keys."""
        cls._load_secrets()
        return list(cls._secrets.keys())

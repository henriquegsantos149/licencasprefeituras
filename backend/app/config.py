"""
Configuration settings for the application.
Loads environment variables and secrets from secrets/ directory.
"""
from pydantic_settings import BaseSettings
from typing import List
from app.secrets import Secrets


class Settings(BaseSettings):
    """Application settings loaded from environment variables and secrets."""
    
    # Database (non-sensitive config from .env)
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "licencas_prefeituras"
    DATABASE_USER: str = "postgres"
    
    # API (non-sensitive config from .env)
    API_V1_PREFIX: str = "/api/v1"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def DATABASE_PASSWORD(self) -> str:
        """Get database password from secrets."""
        return Secrets.get_required("DATABASE_PASSWORD")
    
    @property
    def SECRET_KEY(self) -> str:
        """Get JWT secret key from secrets."""
        return Secrets.get_required("SECRET_KEY")
    
    @property
    def DATABASE_URL(self) -> str:
        """Build database URL from components."""
        password = self.DATABASE_PASSWORD
        return f"postgresql://{self.DATABASE_USER}:{password}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "PDF Bionic Reader"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://readfast.app",
        "https://www.readfast.app"
    ]
    
    # Server Settings
    HOST: str = "127.0.0.1"
    PORT: int = 3003
    
    # PDF Processing Settings
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    SUPPORTED_FORMATS: List[str] = [".pdf"]
    
    # Stripe Settings
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PRO_MONTHLY_PRICE_ID: str
    STRIPE_PRO_YEARLY_PRICE_ID: str
    STRIPE_ULTIMATE_MONTHLY_PRICE_ID: str
    STRIPE_ULTIMATE_YEARLY_PRICE_ID: str
    
    # Frontend URL for redirects
    FRONTEND_URL: str = "http://localhost:3000"

    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_BUCKET_NAME: str = "conversions"
    SUPABASE_FILE_EXPIRY: int = 300  # 5 minutes in seconds

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env"
    )

settings = Settings() 
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb+srv://localhost:27017"
    database_name: str = "ecotrack"

    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173"]

    # Service URLs
    activity_service_url: str = "http://localhost:8001"
    carbon_calculator_url: str = "http://localhost:8002"
    analytics_service_url: str = "http://localhost:8003"
    recommendation_service_url: str = "http://localhost:8004"

    class Config:
        env_file = ".env"


settings = Settings()
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agro-Meteorological Forecast Downscaling System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Path settings
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    MODEL_DIR: str = os.path.join(BASE_DIR, "models_store")
    
    # Database URL (optional Postgres or fallback SQLite)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")
    
    class Config:
        case_sensitive = True

settings = Settings()

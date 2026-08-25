import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "data")
    UPLOADS_DIR: str = os.path.join(os.path.dirname(__file__), "data", "uploads")
    VECTORSTORE_DIR: str = os.path.join(os.path.dirname(__file__), "data", "vectorstore")
    DB_PATH: str = os.path.join(os.path.dirname(__file__), "data", "multihub.db")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

# Ensure data directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.VECTORSTORE_DIR, exist_ok=True)

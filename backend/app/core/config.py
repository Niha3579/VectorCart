from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Base Config
    PROJECT_NAME: str
    API_V1_STR: str
    DEBUG: bool

    # MongoDB
    MONGO_DETAILS: str
    MONGODB_URI: str
    DATABASE_NAME: str

    # JWT Security
    SECRET_KEY: str
    ALGORITHM: str

    # AI & Vector DB
    OPENAI_API_KEY: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        # If the .env file is outside the app folder, 
        # you might need env_file = "../.env"
        case_sensitive = True

settings = Settings()
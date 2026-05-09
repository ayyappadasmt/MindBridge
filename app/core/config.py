from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_ID: str
    REGION: str = "us-central1"
    FIREBASE_SERVICE_ACCOUNT_KEY: str = "./serviceAccountKey.json"
    BIGQUERY_DATASET: str = "mindbridge_insights"
    BIGQUERY_TABLE: str = "distress_events"
    VERTEX_AI_MODEL: str = "gemini-1.5-flash-001"

    class Config:
        env_file = ".env"


settings = Settings()

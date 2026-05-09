"""
MindBridge — Production Configuration
Integrated: Member 1 (infra) + Member 4 (backend) + Member 2 (AI)

Secret Manager secrets are mounted as environment variables in Cloud Run.
No secret values are ever hardcoded here.
"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # ── GCP Core ──────────────────────────────────────────────────
    PROJECT_ID: str
    REGION: str = "us-central1"

    # ── Vertex AI ─────────────────────────────────────────────────
    # Member 2 used "gemini-1.5-flash" (no -001 suffix); align to versioned model
    VERTEX_AI_MODEL: str = "gemini-1.5-flash-001"

    # ── BigQuery ──────────────────────────────────────────────────
    BIGQUERY_DATASET: str = "mindbridge_insights"
    BIGQUERY_TABLE: str = "distress_events"

    # ── Firebase / Firestore ──────────────────────────────────────
    # Production: JSON string injected from Secret Manager as env var.
    # Local dev: file path to serviceAccountKey.json (NEVER commit this file).
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""   # JSON string (Cloud Run / prod)
    FIREBASE_SERVICE_ACCOUNT_KEY: str = ""    # File path (local dev only)

    # Firebase project ID for token verification
    FIREBASE_PROJECT_ID: str = ""

    # ── API Security ─────────────────────────────────────────────
    # Comma-separated list of allowed CORS origins.
    ALLOWED_ORIGINS: str = "https://mindbridge.app"

    # ── Environment ───────────────────────────────────────────────
    ENVIRONMENT: str = "production"  # "development" | "staging" | "production"

    @field_validator("PROJECT_ID")
    @classmethod
    def project_id_must_be_set(cls, v: str) -> str:
        if not v or v == "your-project-id":
            raise ValueError(
                "PROJECT_ID must be set. "
                "Set it as an environment variable or in .env (local dev only)."
            )
        return v

    @property
    def bigquery_table_ref(self) -> str:
        return f"{self.PROJECT_ID}.{self.BIGQUERY_DATASET}.{self.BIGQUERY_TABLE}"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — loaded once at startup."""
    return Settings()


# Module-level singleton for easy import: `from app.core.config import settings`
settings = get_settings()

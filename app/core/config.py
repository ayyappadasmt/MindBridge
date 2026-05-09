"""
MindBridge — Production Configuration
Member 1: Replaced hardcoded values with env vars + Secret Manager integration.

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
    VERTEX_AI_MODEL: str = "gemini-1.5-flash-001"

    # ── BigQuery ──────────────────────────────────────────────────
    BIGQUERY_DATASET: str = "mindbridge_insights"
    BIGQUERY_TABLE: str = "distress_events"

    # ── Firebase / Firestore ──────────────────────────────────────
    # In Cloud Run: mounted from Secret Manager as env var JSON string.
    # Locally: path to serviceAccountKey.json (NEVER commit this file).
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""  # JSON string (prod)
    FIREBASE_SERVICE_ACCOUNT_KEY: str = ""   # File path (local dev only)

    # ── API Security ─────────────────────────────────────────────
    # Comma-separated list of allowed CORS origins.
    # Example: "https://mindbridge.app,https://staging.mindbridge.app"
    ALLOWED_ORIGINS: str = "https://mindbridge.app"

    # Firebase project ID for token verification
    FIREBASE_PROJECT_ID: str = ""

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
        # Allow extra fields to be ignored safely
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — loaded once at startup."""
    return Settings()


# Module-level singleton for easy import: `from app.core.config import settings`
settings = get_settings()

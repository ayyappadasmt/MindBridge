# ============================================================
# MindBridge Backend — Production Dockerfile
# Source: Member 1 (multi-stage, non-root, Cloud Run optimized)
#
# Changes vs Member 4's single-stage Dockerfile:
#   - Multi-stage build: builder + runtime (smaller final image)
#   - Non-root appuser (security hardening)
#   - Build tools isolated to builder stage only
#   - uvloop for faster async I/O
#   - No shell wrapper on CMD (faster signal handling)
#   - PYTHONUNBUFFERED + PYTHONDONTWRITEBYTECODE set
# ============================================================

# ---- Stage 1: Dependency Builder ----------------------------------------
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build tools only in this stage — they won't appear in the runtime image
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Stage 2: Production Runtime ----------------------------------------
FROM python:3.11-slim AS runtime

# Security: run as non-root user
RUN groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Copy only installed packages from builder (no gcc, no build artifacts)
COPY --from=builder /install /usr/local

# Copy application source (app/ directory only — no infra, no .env, no keys)
COPY --chown=appuser:appgroup app/ ./app/

# Cloud Run injects PORT at runtime; default 8080
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8080

USER appuser

# Exec form (no shell wrapper) for fast signal handling and clean shutdown
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8080", \
     "--workers", "1", \
     "--loop", "uvloop", \
     "--log-level", "info", \
     "--no-access-log"]

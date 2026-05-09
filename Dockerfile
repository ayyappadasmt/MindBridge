# ============================================================
# MindBridge Backend — Production Dockerfile
# Member 1: Cloud Infrastructure & Security Architect
# ============================================================

# ---- Stage 1: Dependency Builder ----
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build tools only in builder stage (keeps final image lean)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Stage 2: Production Runtime ----
FROM python:3.11-slim AS runtime

# Security: run as non-root user
RUN groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Copy only installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY --chown=appuser:appgroup app/ ./app/

# Cloud Run injects PORT; default 8080
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8080

# Switch to non-root
USER appuser

# Use exec form (no shell wrapper) for faster signal handling
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8080", \
     "--workers", "1", \
     "--loop", "uvloop", \
     "--log-level", "info", \
     "--no-access-log"]

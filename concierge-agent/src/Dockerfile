FROM python:3.12.3-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV UV_PROJECT_ENVIRONMENT="/usr/local/"
ENV UV_COMPILE_BYTECODE=1

COPY pyproject.toml .
COPY uv.lock .
RUN pip install --no-cache-dir uv
RUN uv sync --frozen --no-install-project --no-dev

# Copy code
COPY . .

# Use the startup script instead of direct uvicorn command
CMD ["uv", "run", "workflow.py"]
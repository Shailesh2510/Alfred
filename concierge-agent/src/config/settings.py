import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    """Configuration settings for the project."""

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SLACK_BOT_TOKEN: str = os.getenv("SLACK_BOT_TOKEN", "")
    SLACK_APP_TOKEN: str = os.getenv("SLACK_APP_TOKEN", "")
    SLACK_SIGNING_SECRET: str = os.getenv("SLACK_SIGNING_SECRET", "")
    SLACK_CHANNEL_ID: str = os.getenv("SLACK_CHANNEL_ID", "")
    DB_TYPE: str = os.getenv("DB_TYPE", "postgres")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_USERNAME: str = os.getenv("DB_USERNAME", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")
    DB_DATABASE: str = os.getenv("DB_DATABASE", "postgres")
    API_TOKEN: str = os.getenv("API_TOKEN", "")
    API_BASE_URL: str = os.getenv("API_BASE_URL", "")
    BASE_URL: str = os.getenv("BASE_URL", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    SQS_QUEUE_URL: str = os.getenv("SQS_QUEUE_URL", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    LANGFUSE_PUBLIC_KEY: str = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    LANGFUSE_SECRET_KEY: str = os.getenv("LANGFUSE_SECRET_KEY", "")
    LANGFUSE_HOST: str = os.getenv("LANGFUSE_HOST", "")


settings = Settings()

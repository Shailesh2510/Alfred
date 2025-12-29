from enum import Enum


class AnthropicModel(Enum):
    HAIKU = "claude-3-5-haiku-20241022"
    SONNET = "claude-3-5-sonnet-20241022"
    OPUS = "claude-3-opus-20240229"

    @property
    def model_id(self) -> str:
        return f"anthropic/{self.value}"


class GeminiModel(Enum):
    FLASH_2 = "gemini-2.0-flash"
    FLASH_2_LITE = "gemini-2.0-flash-lite-preview-02-05"
    FLASH_1_5 = "gemini-1.5-flash"
    PRO_1_5 = "gemini-1.5-pro"

    @property
    def model_id(self) -> str:
        return f"gemini/{self.value}"


class GroqModel(Enum):
    MIXTRAL = "mixtral-8x7b-32768"
    LLAMA_3_1 = "llama-3.1-8b-instant"
    LLAMA_3_3 = "llama-3.3-70b-versatile"

    @property
    def model_id(self) -> str:
        return f"groq/{self.value}"


class OpenAIModel(Enum):
    GPT_4_O = "gpt-4o"
    GPT_4_O_mini = "gpt-4o-mini"

    @property
    def model_id(self) -> str:
        return f"openai/{self.value}"

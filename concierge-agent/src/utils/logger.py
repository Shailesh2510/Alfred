import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(filename)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("langgraph_debug.log"), logging.StreamHandler()],
)

logger = logging.getLogger()

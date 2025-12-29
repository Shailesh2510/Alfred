from langchain_core.messages import ToolMessage
from langgraph.types import Command
from langchain_core.tools.base import InjectedToolCallId
from langchain_community.tools.tavily_search import TavilySearchResults
from typing import Annotated
from langchain_core.tools import tool
from utils.logger import logger

@tool
def web_search(tool_call_id: Annotated[str, InjectedToolCallId], query: str):
    """Searches Tavily and returns results."""
    logger.info(f"🔍 Searching Tavily for: {query}")
    results = TavilySearchResults(max_results=2).invoke(query)
    logger.debug(f"🔍 Tavily search results: {results}")
    return Command(
        update={
            "search_results": results,
            "messages": [ToolMessage("Successfully searched the web for information", tool_call_id=tool_call_id)]
        }
    )
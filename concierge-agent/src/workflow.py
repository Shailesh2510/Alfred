import os
import argparse
from dotenv import load_dotenv

load_dotenv()

import asyncio
import json
import boto3
from models.states import UserState
from agents.alfred import alfred
from agents.pietro import pietro
from agents.supervisor import supervisor
from agents.ryder import ryder
from agents.dexter import dexter
from tools.hotel_tools import get_hotel_details
from tools.ride_tools import get_rides_quote
from tools.book_ride import book_ride
from tools.web_search_tool import web_search
from utils.logger import logger
from langfuse.callback import CallbackHandler
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row
from config.settings import settings

langfuse_handler = CallbackHandler()

DATABASE_URL = f"postgres://{settings.DB_USERNAME}:{settings.DB_PASSWORD}" \
               f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_DATABASE}"
               
# SQS Client
sqs = boto3.client("sqs", region_name=settings.AWS_REGION)
QUEUE_URL = settings.SQS_QUEUE_URL 

def human_feedback(state):
    print("----Human Feedback----")
    pass

def should_continue(state: UserState):
    if isinstance(state, list):
        ai_message = state[-1]
    elif messages := state.get("messages", []):
        ai_message = messages[-1]
    else:
        raise ValueError(f"No messages found in input state: {state}")
    if hasattr(ai_message, "tool_calls") and len(ai_message.tool_calls) > 0:
        return "tools"
    return "dexter"

builder = StateGraph(UserState, MessagesState)
builder.add_node("supervisor", supervisor)
builder.add_node("human_feedback", human_feedback)
builder.add_node("ryder", ryder)
builder.add_node("pietro", pietro)
builder.add_node("get_hotel_details", ToolNode(tools=[get_hotel_details]))
builder.add_node("get_rides_quote", ToolNode(tools=[get_hotel_details, get_rides_quote, book_ride]))
builder.add_node("web_search", ToolNode(tools=[web_search]))
builder.add_node("book_ride", ToolNode(tools=[book_ride]))
builder.add_node("dexter", dexter)
builder.add_node("alfred", alfred)

builder.add_edge(START, "supervisor")
builder.add_conditional_edges("supervisor", lambda x: x["agent_output"], {"airport transfer": "ryder", "food": "pietro", "general": "alfred"})
builder.add_conditional_edges("pietro", should_continue, {"tools": "get_hotel_details", "dexter": "dexter"})
builder.add_conditional_edges("ryder", should_continue, {"tools": "get_rides_quote", "dexter": "dexter"})
builder.add_conditional_edges("alfred", should_continue, {"tools": "web_search", "dexter": "dexter"})
builder.add_edge("get_hotel_details", "pietro")
builder.add_edge("get_rides_quote", "ryder")
builder.add_edge("book_ride", "ryder")
builder.add_edge("web_search", "alfred")
builder.add_edge("dexter", "human_feedback")
builder.add_edge("human_feedback", END)

async def handle_sms(session_id="test session", user_input="", guest_metadata={} , memory=None):
    if memory is None:
        raise ValueError("Memory (checkpointer) must be provided to handle_sms")
    logger.info(f"Processing session_id: {session_id}, input: {user_input}")
    new_messages = []
 
    if guest_metadata.get("lastMessage", ""):
        new_messages.append(AIMessage(content=guest_metadata["lastMessage"]))
 
    new_messages.append(HumanMessage(content=user_input))
    initial_input = {
        "user_input": user_input,
        "session_id": session_id,
        "messages":new_messages,
        "guest_metadata": guest_metadata,
        "contact_info": {
            "full_name": guest_metadata.get("name", ""),
            "email": guest_metadata.get("email", ""),
            "phone_with_country_code": guest_metadata.get("phoneNumber", "") or session_id,
        },
    }
    config = {"configurable": {"thread_id": session_id}, "recursion_limit": 25, "callbacks": [langfuse_handler]}
    graph = builder.compile(checkpointer=memory, interrupt_before=["human_feedback"])
    async for event in graph.astream(initial_input, config=config, stream_mode="values"):
        logger.debug(event["messages"][-1].content)

async def poll_sqs(memory):
    while True:
        try:
            response = sqs.receive_message(QueueUrl=QUEUE_URL, MaxNumberOfMessages=1, WaitTimeSeconds=20)
            if "Messages" in response:
                for message in response["Messages"]:
                    body = json.loads(message["Body"])
                    session_id = body.get("sessionId", "default_session")
                    user_input = body.get("message", "")
                    guest_metadata = body.get("guest", {})
                    logger.debug(f"Received message: {body}")
                    await handle_sms(session_id, user_input, guest_metadata, memory)
                    sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=message["ReceiptHandle"])
            else:
                logger.debug("No messages in queue, waiting...")
        except Exception as e:
            logger.error(f"Error polling SQS: {str(e)}")
        await asyncio.sleep(1)

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--local", action="store_true", help="Run locally without SQS")
    parser.add_argument("--session_id", type=str, default="test_session", help="Session ID for local execution")
    parser.add_argument("--user_input", type=str, default="", help="User input for local execution")
    parser.add_argument("--guest_metadata", type=str, default="{}", help="Guest metadata as JSON string")
    args = parser.parse_args()
    
    async with AsyncConnectionPool(
        conninfo=DATABASE_URL,
        max_size=20,
        kwargs={"autocommit": True, "prepare_threshold": 0, "row_factory": dict_row},
    ) as pool:
        async with pool.connection() as conn:
            memory = AsyncPostgresSaver(conn)
            await memory.setup()
            
            if args.local:
                guest_metadata = json.loads(args.guest_metadata)
                await handle_sms(args.session_id, args.user_input, guest_metadata, memory)
            else:
                await poll_sqs(memory)

if __name__ == "__main__":
    logger.info("Starting workflow")
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

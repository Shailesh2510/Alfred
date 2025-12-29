import redis
import json
from datetime import timedelta
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from utils.logger import logger
from langchain_core.messages import HumanMessage, AIMessage
import psycopg2

# Redis client setup
# Add error handling and connection pooling
try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True,
        socket_timeout=5,
        connection_pool=redis.ConnectionPool(
            max_connections=10,
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )
    )
except Exception as e:
    logger.error(f"Failed to initialize Redis client: {str(e)}")
    redis_client = None

# Postgres setup
Base = declarative_base()

class SessionState(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    session_id = Column(String, unique=True, index=True)  # Add index for faster queries
    state = Column(JSON)

# Use environment variables for Postgres connection
# Add error handling for database connection
try:
    db_type = "postgresql" if settings.DB_TYPE.lower() == "postgres" else settings.DB_TYPE
    
    db_connection_string = (
        f"{db_type}://{settings.DB_USERNAME}:{settings.DB_PASSWORD}@"
        f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_DATABASE}"
    )
    
    engine = create_engine(db_connection_string, pool_size=5, max_overflow=10)
    Session = sessionmaker(bind=engine)
    Base.metadata.create_all(engine)
except ImportError as e:
    logger.error(f"Missing database driver: {str(e)}")
    engine = None
    Session = None
except Exception as e:
    logger.error(f"Failed to initialize database connection: {str(e)}")
    engine = None
    Session = None

# JSON Encoder for LangChain Messages
class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for langchain_core.messages objects."""
    def default(self, obj):
        if isinstance(obj, (HumanMessage, AIMessage)):
            return {
                "type": obj.__class__.__name__,
                "content": obj.content,
                "name": getattr(obj, "name", None)
            }
        elif isinstance(obj, set):  # Convert sets to lists
            return list(obj)
        elif hasattr(obj, "__dict__"):  # Try to convert objects with __dict__
            return obj.__dict__
        return super().default(obj)

# JSON Decoder for LangChain Messages
def custom_json_decoder(dct):
    """Custom JSON decoder for langchain_core.messages objects."""
    if isinstance(dct, dict) and "type" in dct:
        if dct["type"] == "HumanMessage":
            return HumanMessage(content=dct["content"], name=dct.get("name"))
        elif dct["type"] == "AIMessage":
            return AIMessage(content=dct["content"], name=dct.get("name"))
    return dct

# Function to save state
def save_state(session_id: str, state: dict, expiration: timedelta = timedelta(days=60), use_postgres=False) -> bool:
    """Save state to Redis or Postgres with JSON serialization."""
    if not session_id or not isinstance(state, dict):
        logger.error(f"Invalid session_id or state for session {session_id}")
        return False
        
    try:
        key = f"session:{session_id}"
        state_copy = state.copy()
        
        serialized_state = json.dumps(state_copy, cls=CustomJSONEncoder)
        
        if use_postgres and Session is not None:
            with Session() as db_session:
                try:
                    existing = db_session.query(SessionState).filter_by(session_id=session_id).first()
                    if existing:
                        existing.state = serialized_state
                    else:
                        db_session.add(SessionState(session_id=session_id, state=serialized_state))
                    db_session.commit()
                    logger.debug(f"Session {session_id} - Saved to Postgres")
                    return True
                except Exception as e:
                    db_session.rollback()
                    logger.error(f"Database error saving session {session_id}: {str(e)}")
                    return False
        elif redis_client is not None:
            redis_client.setex(key, int(expiration.total_seconds()), serialized_state)
            logger.debug(f"Session {session_id} - Saved to Redis")
            return True
        else:
            logger.error(f"No storage backend available for session {session_id}")
            return False
    except Exception as e:
        logger.error(f"Failed to save state for session {session_id}: {str(e)}")
        return False

# Function to load state
def load_state(session_id: str, use_postgres=False) -> dict:
    """Load state from Redis or Postgres with JSON deserialization."""
    if not session_id:
        logger.error("Invalid session_id provided")
        return {}
        
    try:
        key = f"session:{session_id}"
        if use_postgres and Session is not None:
            with Session() as db_session:
                state_record = db_session.query(SessionState).filter_by(session_id=session_id).first()
                if state_record:
                    state_json = state_record.state
                    # Direct JSON string parsing
                    parsed_state = json.loads(state_json)
                    # Process the messages array separately
                    if "messages" in parsed_state and isinstance(parsed_state["messages"], list):
                        messages = []
                        for msg in parsed_state["messages"]:
                            if isinstance(msg, dict) and "type" in msg:
                                if msg["type"] == "HumanMessage":
                                    messages.append(HumanMessage(content=msg["content"], name=msg.get("name")))
                                elif msg["type"] == "AIMessage":
                                    messages.append(AIMessage(content=msg["content"], name=msg.get("name")))
                                else:
                                    messages.append(msg)
                            else:
                                messages.append(msg)
                        parsed_state["messages"] = messages
                    logger.debug(f"Session {session_id} - Loaded from Postgres")
                    return parsed_state
        elif redis_client is not None:
            state_str = redis_client.get(key)
            if state_str:
                parsed_state = json.loads(state_str)
                # Process the messages array separately
                if "messages" in parsed_state and isinstance(parsed_state["messages"], list):
                    messages = []
                    for msg in parsed_state["messages"]:
                        if isinstance(msg, dict) and "type" in msg:
                            if msg["type"] == "HumanMessage":
                                messages.append(HumanMessage(content=msg["content"], name=msg.get("name")))
                            elif msg["type"] == "AIMessage":
                                messages.append(AIMessage(content=msg["content"], name=msg.get("name")))
                            else:
                                messages.append(msg)
                        else:
                            messages.append(msg)
                    parsed_state["messages"] = messages
                logger.debug(f"Session {session_id} - Loaded from Redis")
                return parsed_state
        
        logger.debug(f"Session {session_id} - No state found")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error for session {session_id}: {str(e)}")
        return {}
    except Exception as e:
        logger.error(f"Failed to load state for session {session_id}: {str(e)}")
        return {}

# Function to clear state
def clear_state(session_id: str, use_postgres=False) -> bool:
    """Clear session from Redis or Postgres after request fulfillment."""
    if not session_id:
        logger.error("Invalid session_id provided")
        return False
        
    try:
        key = f"session:{session_id}"
        if use_postgres and Session is not None:
            with Session() as db_session:
                try:
                    session = db_session.query(SessionState).filter_by(session_id=session_id).first()
                    if session:
                        db_session.delete(session)
                        db_session.commit()
                        logger.info(f"Session {session_id} - Cleared from Postgres")
                    return True
                except Exception as e:
                    db_session.rollback()
                    logger.error(f"Database error clearing session {session_id}: {str(e)}")
                    return False
        elif redis_client is not None:
            result = redis_client.delete(key)
            logger.info(f"Session {session_id} - Cleared from Redis")
            return bool(result)
        else:
            logger.error(f"No storage backend available for session {session_id}")
            return False
    except Exception as e:
        logger.error(f"Error clearing session {session_id}: {str(e)}")
        return False

# Function to set expiry (only for Redis)
def set_expiry(session_id: str, seconds: int) -> bool:
    """Set expiration time for a session in Redis."""
    if not session_id or not isinstance(seconds, int) or seconds <= 0:
        logger.error(f"Invalid session_id or expiry time for session {session_id}")
        return False
        
    try:
        if redis_client is None:
            logger.error("Redis client not available")
            return False
            
        key = f"session:{session_id}"
        result = redis_client.expire(key, seconds)
        if result:
            logger.info(f"Session {session_id} - Expiration set to {seconds} seconds")
            return True
        else:
            logger.warning(f"Session {session_id} - Key not found when setting expiration")
            return False
    except Exception as e:
        logger.error(f"Session {session_id} - Error setting expiration: {str(e)}")
        return False

def publish_message(channel: str, message: str) -> bool:
    """Publish a message to a Redis channel for processing."""
    if not channel or not message:
        logger.error("Invalid channel or message")
        return False
        
    try:
        if redis_client is None:
            logger.error("Redis client not available")
            return False
            
        result = redis_client.publish(channel, message)
        logger.debug(f"Published message to channel {channel}: {message}")
        return result > 0
    except Exception as e:
        logger.error(f"Failed to publish to channel {channel}: {str(e)}")
        return False

def subscribe_to_queue(channel: str, callback) -> None:
    """Subscribe to a Redis channel and process messages."""
    if not channel or not callable(callback):
        logger.error("Invalid channel or callback")
        return
        
    try:
        if redis_client is None:
            logger.error("Redis client not available")
            return
            
        pubsub = redis_client.pubsub()
        pubsub.subscribe(channel)
        logger.info(f"Subscribed to channel {channel}")
        
        for message in pubsub.listen():
            try:
                if message["type"] == "message":
                    callback(message["data"])
            except Exception as e:
                logger.error(f"Error processing message from channel {channel}: {str(e)}")
    except Exception as e:
        logger.error(f"Error in subscription to channel {channel}: {str(e)}")
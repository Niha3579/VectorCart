from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGO_DETAILS)
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        
        # The Ping: This forces the client to actually talk to the server
        await db_instance.client.admin.command('ping')
        print(f"✅ Successfully connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# HARDCODE your strings here just for this 1-minute test
MONGO_DETAILS = "mongodb://127.0.0.1:27017" 
DB_NAME = "ecommerce_db"

async def seed_test():
    print(f"Connecting to {MONGO_DETAILS}...")
    client = AsyncIOMotorClient(MONGO_DETAILS)
    db = client[DB_NAME]
    
    test_product = {
        "name": "Test Product",
        "price": 99.99,
        "stock": 10,
        "created_at": datetime.utcnow()
    }
    
    try:
        # This is the line that actually creates the DB and Collection
        result = await db["products"].insert_one(test_product)
        print(f"✅ Success! Inserted ID: {result.inserted_id}")
        print(f"Now open MongoDB Compass and refresh. You should see '{DB_NAME}'")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_test())
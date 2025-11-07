from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    db.database = db.client[settings.database_name]
    print(f"Connected to MongoDB: {settings.database_name}")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")


async def get_database():
    return db.database
from datetime import datetime
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import UserCreate, UserUpdate, UserInDB, UserResponse
from .auth import get_password_hash


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    user_doc = await db.users.find_one({"email": email})
    if user_doc:
        return UserInDB(**user_doc)
    return None


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[UserInDB]:
    user_doc = await db.users.find_one({"_id": user_id})
    if user_doc:
        return UserInDB(**user_doc)
    return None


async def create_user(db: AsyncIOMotorDatabase, user: UserCreate) -> UserInDB:
    user_doc = {
        "email": user.email,
        "name": user.name,
        "country": user.country,
        "hashed_password": get_password_hash(user.password),
        "created_at": datetime.utcnow(),
        "profile": {
            "diet_type": None,
            "transport_mode": None,
            "household_size": None,
            "carbon_goal": None
        },
        "achievements": []
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return UserInDB(**user_doc)


async def update_user(db: AsyncIOMotorDatabase, user_id: str, user_update: UserUpdate) -> Optional[UserInDB]:
    update_data = {}

    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.country is not None:
        update_data["country"] = user_update.country

    profile_updates = {}
    if user_update.diet_type is not None:
        profile_updates["diet_type"] = user_update.diet_type
    if user_update.transport_mode is not None:
        profile_updates["transport_mode"] = user_update.transport_mode
    if user_update.household_size is not None:
        profile_updates["household_size"] = user_update.household_size
    if user_update.carbon_goal is not None:
        profile_updates["carbon_goal"] = user_update.carbon_goal

    if profile_updates:
        update_data["profile"] = profile_updates

    if update_data:
        await db.users.update_one({"_id": user_id}, {"$set": update_data})

    return await get_user_by_id(db, user_id)


def user_in_db_to_response(user: UserInDB) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        country=user.country,
        created_at=user.created_at,
        profile=user.profile,
        achievements=[str(achievement) for achievement in user.achievements]
    )
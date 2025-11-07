from datetime import datetime
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import ActivityCreate, ActivityUpdate, ActivityInDB, ActivityResponse
import httpx
from .config import settings


async def get_activities_by_user(db: AsyncIOMotorDatabase, user_id: str, limit: int = 50) -> List[ActivityInDB]:
    activities = []
    cursor = db.activities.find({"user_id": user_id}).sort("date", -1).limit(limit)
    async for activity_doc in cursor:
        activities.append(ActivityInDB(**activity_doc))
    return activities


async def get_activity_by_id(db: AsyncIOMotorDatabase, activity_id: str) -> Optional[ActivityInDB]:
    activity_doc = await db.activities.find_one({"_id": activity_id})
    if activity_doc:
        return ActivityInDB(**activity_doc)
    return None


async def create_activity(db: AsyncIOMotorDatabase, activity: ActivityCreate) -> ActivityInDB:
    # Calculate carbon emission using carbon calculator service
    carbon_emitted = await calculate_carbon_emission(activity)

    activity_doc = {
        "user_id": activity.user_id,
        "category": activity.category,
        "type": activity.type,
        "value": activity.value,
        "unit": activity.unit,
        "date": activity.date,
        "notes": activity.notes,
        "carbon_emitted": carbon_emitted
    }

    result = await db.activities.insert_one(activity_doc)
    activity_doc["_id"] = result.inserted_id
    return ActivityInDB(**activity_doc)


async def update_activity(db: AsyncIOMotorDatabase, activity_id: str, activity_update: ActivityUpdate) -> Optional[ActivityInDB]:
    update_data = {}

    if activity_update.category is not None:
        update_data["category"] = activity_update.category
    if activity_update.type is not None:
        update_data["type"] = activity_update.type
    if activity_update.value is not None:
        update_data["value"] = activity_update.value
    if activity_update.unit is not None:
        update_data["unit"] = activity_update.unit
    if activity_update.date is not None:
        update_data["date"] = activity_update.date
    if activity_update.notes is not None:
        update_data["notes"] = activity_update.notes

    if update_data:
        # Recalculate carbon emission if value, type, or category changed
        if any(key in update_data for key in ["value", "type", "category"]):
            activity = await get_activity_by_id(db, activity_id)
            if activity:
                # Create a temporary activity object for calculation
                temp_activity = ActivityCreate(
                    user_id=activity.user_id,
                    category=update_data.get("category", activity.category),
                    type=update_data.get("type", activity.type),
                    value=update_data.get("value", activity.value),
                    unit=update_data.get("unit", activity.unit),
                    date=update_data.get("date", activity.date),
                    notes=update_data.get("notes", activity.notes)
                )
                update_data["carbon_emitted"] = await calculate_carbon_emission(temp_activity)

        await db.activities.update_one({"_id": activity_id}, {"$set": update_data})

    return await get_activity_by_id(db, activity_id)


async def delete_activity(db: AsyncIOMotorDatabase, activity_id: str) -> bool:
    result = await db.activities.delete_one({"_id": activity_id})
    return result.deleted_count > 0


async def calculate_carbon_emission(activity: ActivityCreate) -> float:
    """Calculate carbon emission using the carbon calculator service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.carbon_calculator_url}/calculate",
                json={
                    "category": activity.category,
                    "type": activity.type,
                    "value": activity.value,
                    "unit": activity.unit
                }
            )
            if response.status_code == 200:
                result = response.json()
                return result.get("carbon_emitted", 0.0)
    except Exception as e:
        print(f"Error calculating carbon emission: {e}")
        # Fallback to basic calculation
        return activity.value * 0.1  # Basic fallback

    return 0.0


def activity_in_db_to_response(activity: ActivityInDB) -> ActivityResponse:
    return ActivityResponse(
        id=str(activity.id),
        user_id=activity.user_id,
        category=activity.category,
        type=activity.type,
        value=activity.value,
        unit=activity.unit,
        date=activity.date,
        notes=activity.notes,
        carbon_emitted=activity.carbon_emitted
    )
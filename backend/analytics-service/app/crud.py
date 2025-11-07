from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import (
    AnalyticsRequest, AnalyticsResponse, CarbonStats, CategoryBreakdown, TimeSeriesData,
    AchievementCreate, AchievementInDB, AchievementResponse,
    UserAchievement, UserAchievementInDB, UserAchievementResponse
)
import httpx
from .config import settings


async def get_user_analytics(
    db: AsyncIOMotorDatabase,
    request: AnalyticsRequest
) -> AnalyticsResponse:
    """Generate comprehensive analytics for a user"""

    # Build query for activities
    query = {"user_id": request.user_id}
    if request.start_date and request.end_date:
        query["date"] = {"$gte": request.start_date, "$lte": request.end_date}
    elif request.category:
        query["category"] = request.category

    # Get activities from activity service
    activities = await get_activities_from_service(request.user_id, query)

    # Calculate stats
    stats = await calculate_carbon_stats(activities)

    # Category breakdown
    category_breakdown = await calculate_category_breakdown(activities)

    # Time series data
    time_series = await calculate_time_series(activities)

    # Generate recommendations
    recommendations = await generate_recommendations(activities, stats)

    return AnalyticsResponse(
        user_id=request.user_id,
        period=f"{request.start_date.date() if request.start_date else 'all'}_to_{request.end_date.date() if request.end_date else 'now'}",
        stats=stats,
        category_breakdown=category_breakdown,
        time_series=time_series,
        recommendations=recommendations
    )


async def get_activities_from_service(user_id: str, query: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fetch activities from activity service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.activity_service_url}/activities",
                params={"user_id": user_id, "limit": 1000}
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Error fetching activities: {e}")

    return []


async def calculate_carbon_stats(activities: List[Dict[str, Any]]) -> CarbonStats:
    """Calculate carbon statistics"""
    if not activities:
        return CarbonStats(
            total_carbon=0, average_daily=0, average_weekly=0,
            average_monthly=0, trend_percentage=0
        )

    total_carbon = sum(activity.get("carbon_emitted", 0) for activity in activities)

    # Sort by date
    activities.sort(key=lambda x: x.get("date", ""), reverse=True)

    # Calculate averages (simplified)
    days_count = len(set(activity.get("date", "").split("T")[0] for activity in activities))
    weeks_count = max(1, days_count // 7)
    months_count = max(1, days_count // 30)

    return CarbonStats(
        total_carbon=round(total_carbon, 2),
        average_daily=round(total_carbon / days_count, 2) if days_count > 0 else 0,
        average_weekly=round(total_carbon / weeks_count, 2) if weeks_count > 0 else 0,
        average_monthly=round(total_carbon / months_count, 2) if months_count > 0 else 0,
        trend_percentage=0.0  # Would need historical data for trend
    )


async def calculate_category_breakdown(activities: List[Dict[str, Any]]) -> List[CategoryBreakdown]:
    """Calculate breakdown by category"""
    category_totals = {}
    category_counts = {}

    for activity in activities:
        category = activity.get("category", "unknown")
        carbon = activity.get("carbon_emitted", 0)

        category_totals[category] = category_totals.get(category, 0) + carbon
        category_counts[category] = category_counts.get(category, 0) + 1

    total_carbon = sum(category_totals.values())

    breakdown = []
    for category, carbon_total in category_totals.items():
        breakdown.append(CategoryBreakdown(
            category=category,
            total_carbon=round(carbon_total, 2),
            percentage=round((carbon_total / total_carbon * 100), 1) if total_carbon > 0 else 0,
            count=category_counts[category]
        ))

    return sorted(breakdown, key=lambda x: x.total_carbon, reverse=True)


async def calculate_time_series(activities: List[Dict[str, Any]]) -> List[TimeSeriesData]:
    """Calculate time series data"""
    daily_totals = {}

    for activity in activities:
        date_str = activity.get("date", "").split("T")[0]  # Get date part only
        carbon = activity.get("carbon_emitted", 0)

        if date_str not in daily_totals:
            daily_totals[date_str] = {"carbon": 0, "count": 0}
        daily_totals[date_str]["carbon"] += carbon
        daily_totals[date_str]["count"] += 1

    time_series = []
    for date, data in sorted(daily_totals.items()):
        time_series.append(TimeSeriesData(
            date=date,
            carbon_total=round(data["carbon"], 2),
            activities_count=data["count"]
        ))

    return time_series


async def generate_recommendations(activities: List[Dict[str, Any]], stats: CarbonStats) -> List[str]:
    """Generate personalized recommendations"""
    recommendations = []

    # Analyze transport usage
    transport_activities = [a for a in activities if a.get("category") == "transport"]
    if transport_activities:
        car_usage = sum(a.get("carbon_emitted", 0) for a in transport_activities if a.get("type") == "car")
        if car_usage > 50:  # High car usage
            recommendations.append("Consider using public transport or biking for short distances")

    # Analyze energy consumption
    energy_activities = [a for a in activities if a.get("category") == "energy"]
    if energy_activities:
        electricity_usage = sum(a.get("value", 0) for a in energy_activities if a.get("type") == "electricity")
        if electricity_usage > 200:  # High electricity usage
            recommendations.append("Switch to LED bulbs and unplug devices when not in use")

    # General recommendations
    if stats.total_carbon > 100:
        recommendations.append("Try meat-free days to reduce your carbon footprint")
        recommendations.append("Recycle and compost to minimize waste impact")

    return recommendations[:3]  # Limit to 3 recommendations


# Achievement CRUD operations
async def get_achievements(db: AsyncIOMotorDatabase) -> List[AchievementInDB]:
    achievements = []
    cursor = db.achievements.find()
    async for achievement_doc in cursor:
        achievements.append(AchievementInDB(**achievement_doc))
    return achievements


async def create_achievement(db: AsyncIOMotorDatabase, achievement: AchievementCreate) -> AchievementInDB:
    achievement_doc = {
        "name": achievement.name,
        "description": achievement.description,
        "icon": achievement.icon,
        "criteria": achievement.criteria,
        "points": achievement.points,
        "category": achievement.category,
        "created_at": datetime.utcnow()
    }

    result = await db.achievements.insert_one(achievement_doc)
    achievement_doc["_id"] = result.inserted_id
    return AchievementInDB(**achievement_doc)


async def check_and_award_achievements(db: AsyncIOMotorDatabase, user_id: str, activities: List[Dict[str, Any]]):
    """Check if user qualifies for new achievements"""
    # This would be more complex in a real implementation
    # For now, just award basic achievements based on activity count
    activity_count = len(activities)

    if activity_count >= 10:
        await award_achievement(db, user_id, "first_steps")
    if activity_count >= 50:
        await award_achievement(db, user_id, "eco_warrior")
    if activity_count >= 100:
        await award_achievement(db, user_id, "carbon_hero")


async def award_achievement(db: AsyncIOMotorDatabase, user_id: str, achievement_name: str):
    """Award an achievement to a user"""
    # Check if already awarded
    existing = await db.user_achievements.find_one({
        "user_id": user_id,
        "achievement_name": achievement_name
    })

    if not existing:
        achievement_doc = {
            "user_id": user_id,
            "achievement_name": achievement_name,
            "unlocked_at": datetime.utcnow()
        }
        await db.user_achievements.insert_one(achievement_doc)


def achievement_in_db_to_response(achievement: AchievementInDB) -> AchievementResponse:
    return AchievementResponse(
        id=str(achievement.id),
        name=achievement.name,
        description=achievement.description,
        icon=achievement.icon,
        criteria=achievement.criteria,
        points=achievement.points,
        category=achievement.category,
        created_at=achievement.created_at
    )
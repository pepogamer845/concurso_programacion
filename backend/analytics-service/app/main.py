from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import AnalyticsRequest, AnalyticsResponse, AchievementResponse
from .crud import get_user_analytics, get_achievements, achievement_in_db_to_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="EcoTrack Analytics Service",
    description="Servicio de analytics y logros para EcoTrack",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    user_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get comprehensive analytics for a user"""
    request = AnalyticsRequest(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        category=category
    )
    return await get_user_analytics(db, request)


@app.get("/achievements", response_model=list[AchievementResponse])
async def list_achievements(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all available achievements"""
    achievements = await get_achievements(db)
    return [achievement_in_db_to_response(achievement) for achievement in achievements]


@app.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(10, description="Número de usuarios a retornar"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get leaderboard of users by carbon reduction (simplified)"""
    # This would aggregate data from activities collection
    # For now, return mock data
    return {
        "period": "monthly",
        "leaderboard": [
            {"rank": 1, "user_name": "EcoWarrior", "carbon_saved": 150.5},
            {"rank": 2, "user_name": "GreenHero", "carbon_saved": 120.3},
            {"rank": 3, "user_name": "PlanetSaver", "carbon_saved": 98.7}
        ]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analytics-service"}
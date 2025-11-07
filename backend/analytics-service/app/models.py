from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}


# Analytics Models
class AnalyticsRequest(BaseModel):
    user_id: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    category: Optional[str] = None


class CarbonStats(BaseModel):
    total_carbon: float
    average_daily: float
    average_weekly: float
    average_monthly: float
    trend_percentage: float  # percentage change from previous period


class CategoryBreakdown(BaseModel):
    category: str
    total_carbon: float
    percentage: float
    count: int


class TimeSeriesData(BaseModel):
    date: str
    carbon_total: float
    activities_count: int


class AnalyticsResponse(BaseModel):
    user_id: str
    period: str
    stats: CarbonStats
    category_breakdown: List[CategoryBreakdown]
    time_series: List[TimeSeriesData]
    recommendations: List[str]


# Achievement Models
class AchievementBase(BaseModel):
    name: str
    description: str
    icon: str
    criteria: Dict[str, Any]  # flexible criteria for unlocking
    points: int
    category: str


class AchievementCreate(AchievementBase):
    pass


class AchievementInDB(AchievementBase):
    id: PyObjectId
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class AchievementResponse(AchievementBase):
    id: str
    created_at: datetime


# User Achievement Models
class UserAchievement(BaseModel):
    user_id: str
    achievement_id: str
    unlocked_at: datetime
    progress: Optional[Dict[str, Any]] = None


class UserAchievementInDB(UserAchievement):
    id: PyObjectId

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserAchievementResponse(UserAchievement):
    id: str
    achievement: AchievementResponse
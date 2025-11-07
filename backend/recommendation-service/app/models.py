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
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# Recommendation Models
class RecommendationRequest(BaseModel):
    user_id: str
    context: Optional[Dict[str, Any]] = None  # Additional context for recommendations


class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    category: str  # transport, energy, food, waste
    priority: str  # high, medium, low
    potential_savings: float  # kg CO2
    difficulty: str  # easy, medium, hard
    tags: List[str] = []


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[Recommendation]
    generated_at: datetime


# User Recommendation History
class UserRecommendation(BaseModel):
    user_id: str
    recommendation_id: str
    shown_at: datetime
    clicked: bool = False
    implemented: bool = False
    feedback: Optional[str] = None


class UserRecommendationInDB(UserRecommendation):
    id: PyObjectId

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserRecommendationResponse(UserRecommendation):
    id: str
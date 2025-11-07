from pydantic import BaseModel, EmailStr
from typing import Optional, List
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


# Activity Models
class ActivityBase(BaseModel):
    user_id: str
    category: str  # transport, energy, food, waste
    type: str  # specific type within category
    value: float
    unit: str
    date: datetime
    notes: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    category: Optional[str] = None
    type: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None


class ActivityInDB(ActivityBase):
    id: PyObjectId
    carbon_emitted: float

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ActivityResponse(ActivityBase):
    id: str
    carbon_emitted: float


# Token models for authentication
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
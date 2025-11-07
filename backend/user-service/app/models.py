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
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}


class UserBase(BaseModel):
    email: EmailStr
    name: str
    country: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    diet_type: Optional[str] = None
    transport_mode: Optional[str] = None
    household_size: Optional[int] = None
    carbon_goal: Optional[float] = None


class UserProfile(BaseModel):
    diet_type: Optional[str] = None
    transport_mode: Optional[str] = None
    household_size: Optional[int] = None
    carbon_goal: Optional[float] = None


class UserInDB(UserBase):
    id: PyObjectId
    hashed_password: str
    created_at: datetime
    profile: UserProfile
    achievements: List[PyObjectId] = []

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserResponse(UserBase):
    id: str
    created_at: datetime
    profile: UserProfile
    achievements: List[str] = []


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
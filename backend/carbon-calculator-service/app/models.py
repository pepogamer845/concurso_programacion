from pydantic import BaseModel
from typing import Optional
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


# Carbon Calculation Models
class CarbonCalculationRequest(BaseModel):
    category: str  # transport, energy, food, waste
    type: str  # specific type within category
    value: float
    unit: str
    region: Optional[str] = "global"  # for regional factors


class CarbonCalculationResponse(BaseModel):
    carbon_emitted: float
    unit: str = "kg CO2"
    category: str
    type: str
    factors_used: dict


# Emission Factor Models
class EmissionFactorBase(BaseModel):
    category: str
    type: str
    factor: float  # kg CO2 per unit
    unit: str
    source: str
    region: str
    last_updated: datetime


class EmissionFactorCreate(EmissionFactorBase):
    pass


class EmissionFactorUpdate(BaseModel):
    factor: Optional[float] = None
    source: Optional[str] = None
    last_updated: Optional[datetime] = None


class EmissionFactorInDB(EmissionFactorBase):
    id: PyObjectId

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class EmissionFactorResponse(EmissionFactorBase):
    id: str
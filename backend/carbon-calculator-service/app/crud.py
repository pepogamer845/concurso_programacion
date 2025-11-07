from datetime import datetime
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import (
    CarbonCalculationRequest, CarbonCalculationResponse,
    EmissionFactorCreate, EmissionFactorUpdate, EmissionFactorInDB, EmissionFactorResponse
)


# Default emission factors (kg CO2 per unit)
DEFAULT_EMISSION_FACTORS = {
    "transport": {
        "car": 0.21,      # kg CO2 per km
        "bus": 0.089,     # kg CO2 per km
        "bicycle": 0,     # kg CO2 per km
        "walk": 0,        # kg CO2 per km
        "train": 0.041,   # kg CO2 per km
        "plane": 0.255,   # kg CO2 per km
    },
    "energy": {
        "electricity": 0.5,   # kg CO2 per kWh (global average)
        "gas": 2.3,           # kg CO2 per m3
        "water": 0.001,       # kg CO2 per liter
        "heating_oil": 2.7,   # kg CO2 per liter
    },
    "food": {
        "meat": 7.2,          # kg CO2 per meal
        "vegetarian": 2.5,    # kg CO2 per meal
        "vegan": 1.5,         # kg CO2 per meal
        "local": 1.0,         # kg CO2 per meal
        "dairy": 3.2,         # kg CO2 per serving
        "eggs": 4.8,          # kg CO2 per serving
    },
    "waste": {
        "recycling": -0.5,    # negative = savings per kg
        "compost": -0.3,      # negative = savings per kg
        "general": 1.5,       # kg CO2 per kg waste
        "plastic": 2.0,       # kg CO2 per kg plastic
        "paper": 0.8,         # kg CO2 per kg paper
    }
}


async def calculate_carbon_emission(
    db: AsyncIOMotorDatabase,
    request: CarbonCalculationRequest
) -> CarbonCalculationResponse:
    """Calculate carbon emission for an activity"""

    # Try to get factor from database first
    factor_doc = await db.emission_factors.find_one({
        "category": request.category,
        "type": request.type,
        "region": request.region
    })

    if factor_doc:
        factor = factor_doc["factor"]
    else:
        # Use default factors
        factor = DEFAULT_EMISSION_FACTORS.get(request.category, {}).get(request.type, 0.1)

    carbon_emitted = request.value * factor

    return CarbonCalculationResponse(
        carbon_emitted=round(carbon_emitted, 3),
        unit="kg CO2",
        category=request.category,
        type=request.type,
        factors_used={
            "factor": factor,
            "source": factor_doc.get("source", "default") if factor_doc else "default",
            "region": request.region
        }
    )


async def get_emission_factors(
    db: AsyncIOMotorDatabase,
    category: Optional[str] = None,
    region: str = "global"
) -> List[EmissionFactorInDB]:
    """Get emission factors, optionally filtered by category"""
    query = {"region": region}
    if category:
        query["category"] = category

    factors = []
    cursor = db.emission_factors.find(query)
    async for factor_doc in cursor:
        factors.append(EmissionFactorInDB(**factor_doc))
    return factors


async def create_emission_factor(
    db: AsyncIOMotorDatabase,
    factor: EmissionFactorCreate
) -> EmissionFactorInDB:
    factor_doc = {
        "category": factor.category,
        "type": factor.type,
        "factor": factor.factor,
        "unit": factor.unit,
        "source": factor.source,
        "region": factor.region,
        "last_updated": factor.last_updated
    }

    result = await db.emission_factors.insert_one(factor_doc)
    factor_doc["_id"] = result.inserted_id
    return EmissionFactorInDB(**factor_doc)


async def update_emission_factor(
    db: AsyncIOMotorDatabase,
    factor_id: str,
    factor_update: EmissionFactorUpdate
) -> Optional[EmissionFactorInDB]:
    update_data = {}

    if factor_update.factor is not None:
        update_data["factor"] = factor_update.factor
    if factor_update.source is not None:
        update_data["source"] = factor_update.source
    if factor_update.last_updated is not None:
        update_data["last_updated"] = factor_update.last_updated

    if update_data:
        await db.emission_factors.update_one({"_id": factor_id}, {"$set": update_data})

    # Return updated factor
    factor_doc = await db.emission_factors.find_one({"_id": factor_id})
    if factor_doc:
        return EmissionFactorInDB(**factor_doc)
    return None


def emission_factor_in_db_to_response(factor: EmissionFactorInDB) -> EmissionFactorResponse:
    return EmissionFactorResponse(
        id=str(factor.id),
        category=factor.category,
        type=factor.type,
        factor=factor.factor,
        unit=factor.unit,
        source=factor.source,
        region=factor.region,
        last_updated=factor.last_updated
    )
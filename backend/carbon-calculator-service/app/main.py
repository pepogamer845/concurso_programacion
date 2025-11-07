from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager
from typing import List, Optional

from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import (
    CarbonCalculationRequest, CarbonCalculationResponse,
    EmissionFactorCreate, EmissionFactorResponse
)
from .crud import (
    calculate_carbon_emission, get_emission_factors,
    create_emission_factor, emission_factor_in_db_to_response
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="EcoTrack Carbon Calculator Service",
    description="Servicio de cálculo de emisiones de carbono para EcoTrack",
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


@app.post("/calculate", response_model=CarbonCalculationResponse)
async def calculate_emission(
    request: CarbonCalculationRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Calculate carbon emission for an activity"""
    return await calculate_carbon_emission(db, request)


@app.get("/factors", response_model=List[EmissionFactorResponse])
async def get_factors(
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    region: str = Query("global", description="Región para los factores"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get emission factors, optionally filtered by category"""
    from .crud import get_emission_factors as get_factors_crud
    factors = await get_factors_crud(db, category, region)
    return [emission_factor_in_db_to_response(factor) for factor in factors]


@app.post("/factors", response_model=EmissionFactorResponse)
async def create_factor(
    factor: EmissionFactorCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new emission factor (admin only)"""
    factor_in_db = await create_emission_factor(db, factor)
    return emission_factor_in_db_to_response(factor_in_db)


@app.get("/categories")
async def get_categories():
    """Get available categories and their types"""
    return {
        "transport": ["car", "bus", "bicycle", "walk", "train", "plane"],
        "energy": ["electricity", "gas", "water", "heating_oil"],
        "food": ["meat", "vegetarian", "vegan", "local", "dairy", "eggs"],
        "waste": ["recycling", "compost", "general", "plastic", "paper"]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "carbon-calculator-service"}
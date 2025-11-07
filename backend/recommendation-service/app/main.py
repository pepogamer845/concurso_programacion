from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager

from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import RecommendationRequest, RecommendationResponse
from .crud import generate_recommendations, update_recommendation_feedback


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="EcoTrack Recommendation Service",
    description="Servicio de recomendaciones inteligentes para EcoTrack",
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


@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate personalized recommendations for a user"""
    request = RecommendationRequest(user_id=user_id)
    return await generate_recommendations(db, request)


@app.post("/recommendations/{recommendation_id}/feedback")
async def submit_feedback(
    recommendation_id: str,
    user_id: str,
    feedback: dict,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Submit feedback for a recommendation"""
    await update_recommendation_feedback(db, user_id, recommendation_id, feedback)
    return {"message": "Feedback recorded successfully"}


@app.get("/recommendations/categories")
async def get_recommendation_categories():
    """Get available recommendation categories"""
    return {
        "categories": [
            {"id": "transport", "name": "Transporte", "description": "Recomendaciones de movilidad sostenible"},
            {"id": "energy", "name": "Energía", "description": "Consejos para eficiencia energética"},
            {"id": "food", "name": "Alimentación", "description": "Hábitos alimenticios sostenibles"},
            {"id": "waste", "name": "Residuos", "description": "Gestión y reducción de residuos"}
        ]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "recommendation-service"}
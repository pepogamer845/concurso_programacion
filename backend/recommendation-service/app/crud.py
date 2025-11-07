from datetime import datetime
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import (
    RecommendationRequest, RecommendationResponse, Recommendation,
    UserRecommendation, UserRecommendationInDB
)
import httpx
from .config import settings
import uuid


# Predefined recommendations database
PREDEFINED_RECOMMENDATIONS = [
    {
        "id": "transport_bike",
        "title": "Usa bicicleta para distancias cortas",
        "description": "Cambia el auto por bicicleta para viajes menores a 5km. Ahorra hasta 2.3 kg CO₂ por día.",
        "category": "transport",
        "priority": "high",
        "potential_savings": 2.3,
        "difficulty": "medium",
        "tags": ["transport", "exercise", "savings"]
    },
    {
        "id": "energy_led",
        "title": "Cambia a bombillas LED",
        "description": "Reemplaza todas las bombillas incandescentes por LED. Reduce consumo eléctrico en un 75%.",
        "category": "energy",
        "priority": "medium",
        "potential_savings": 15.0,
        "difficulty": "easy",
        "tags": ["energy", "home", "savings"]
    },
    {
        "id": "food_meat_free",
        "title": "Día sin carne",
        "description": "Prueba comer vegetariano 2 días por semana. Impacto significativo en reducción de CO₂.",
        "category": "food",
        "priority": "high",
        "potential_savings": 8.0,
        "difficulty": "medium",
        "tags": ["food", "diet", "health"]
    },
    {
        "id": "waste_recycle",
        "title": "Recicla correctamente",
        "description": "Separa plásticos, papel y orgánicos. Reduce la producción de metano en vertederos.",
        "category": "waste",
        "priority": "medium",
        "potential_savings": 5.0,
        "difficulty": "easy",
        "tags": ["waste", "recycling", "environment"]
    },
    {
        "id": "transport_public",
        "title": "Transporte público",
        "description": "Usa buses o metro en lugar de auto particular. Reduce emisiones significativamente.",
        "category": "transport",
        "priority": "high",
        "potential_savings": 3.5,
        "difficulty": "easy",
        "tags": ["transport", "public", "savings"]
    },
    {
        "id": "energy_unplug",
        "title": "Desconecta dispositivos",
        "description": "Apaga y desconecta aparatos en stand-by. Ahorra energía 'vampiro'.",
        "category": "energy",
        "priority": "low",
        "potential_savings": 2.0,
        "difficulty": "easy",
        "tags": ["energy", "home", "efficiency"]
    }
]


async def generate_recommendations(
    db: AsyncIOMotorDatabase,
    request: RecommendationRequest
) -> RecommendationResponse:
    """Generate personalized recommendations for a user"""

    # Get user activities and profile
    user_activities = await get_user_activities(request.user_id)
    user_profile = await get_user_profile(request.user_id)

    # Get previously shown recommendations
    shown_recommendations = await get_shown_recommendations(db, request.user_id)

    # Filter out already shown recommendations
    shown_ids = {rec["recommendation_id"] for rec in shown_recommendations}
    available_recommendations = [r for r in PREDEFINED_RECOMMENDATIONS if r["id"] not in shown_ids]

    # Score and rank recommendations based on user behavior
    scored_recommendations = []
    for rec in available_recommendations:
        score = await calculate_recommendation_score(rec, user_activities, user_profile)
        scored_recommendations.append((rec, score))

    # Sort by score and take top 3
    scored_recommendations.sort(key=lambda x: x[1], reverse=True)
    top_recommendations = scored_recommendations[:3]

    recommendations = []
    for rec, score in top_recommendations:
        recommendations.append(Recommendation(**rec))

    # Store shown recommendations
    await store_shown_recommendations(db, request.user_id, [r.id for r, _ in top_recommendations])

    return RecommendationResponse(
        user_id=request.user_id,
        recommendations=recommendations,
        generated_at=datetime.utcnow()
    )


async def calculate_recommendation_score(
    recommendation: Dict[str, Any],
    activities: List[Dict[str, Any]],
    user_profile: Dict[str, Any]
) -> float:
    """Calculate how relevant a recommendation is for the user"""
    score = 0.0

    category = recommendation["category"]

    # Analyze user's current behavior in this category
    category_activities = [a for a in activities if a.get("category") == category]

    if category == "transport":
        # Check if user uses car frequently
        car_activities = [a for a in category_activities if a.get("type") == "car"]
        if car_activities:
            score += 2.0  # High priority for car users

    elif category == "energy":
        # Check energy consumption
        energy_activities = [a for a in category_activities if a.get("type") == "electricity"]
        total_energy = sum(a.get("value", 0) for a in energy_activities)
        if total_energy > 200:  # High consumption
            score += 1.5

    elif category == "food":
        # Check meat consumption
        meat_activities = [a for a in category_activities if a.get("type") == "meat"]
        if meat_activities:
            score += 2.0

    elif category == "waste":
        # Always relevant but lower priority
        score += 1.0

    # Adjust based on potential savings
    score += recommendation["potential_savings"] * 0.1

    return score


async def get_user_activities(user_id: str) -> List[Dict[str, Any]]:
    """Fetch user activities from activity service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.activity_service_url}/activities",
                params={"user_id": user_id, "limit": 100}
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Error fetching user activities: {e}")
    return []


async def get_user_profile(user_id: str) -> Dict[str, Any]:
    """Fetch user profile from user service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.user_service_url}/users/{user_id}")
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Error fetching user profile: {e}")
    return {}


async def get_shown_recommendations(db: AsyncIOMotorDatabase, user_id: str) -> List[Dict[str, Any]]:
    """Get recommendations already shown to user"""
    recommendations = []
    cursor = db.user_recommendations.find({"user_id": user_id})
    async for rec_doc in cursor:
        recommendations.append(rec_doc)
    return recommendations


async def store_shown_recommendations(db: AsyncIOMotorDatabase, user_id: str, recommendation_ids: List[str]):
    """Store that recommendations were shown to user"""
    for rec_id in recommendation_ids:
        rec_doc = {
            "user_id": user_id,
            "recommendation_id": rec_id,
            "shown_at": datetime.utcnow(),
            "clicked": False,
            "implemented": False
        }
        await db.user_recommendations.insert_one(rec_doc)


async def update_recommendation_feedback(
    db: AsyncIOMotorDatabase,
    user_id: str,
    recommendation_id: str,
    feedback: Dict[str, Any]
):
    """Update feedback for a recommendation"""
    update_data = {"feedback": feedback.get("feedback")}

    if feedback.get("clicked"):
        update_data["clicked"] = True
    if feedback.get("implemented"):
        update_data["implemented"] = True

    await db.user_recommendations.update_one(
        {"user_id": user_id, "recommendation_id": recommendation_id},
        {"$set": update_data}
    )
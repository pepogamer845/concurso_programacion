from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager
from typing import List
from datetime import datetime

from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import ActivityCreate, ActivityUpdate, ActivityResponse, TokenData
from .auth import verify_token
from .crud import (
    get_activities_by_user, get_activity_by_id, create_activity,
    update_activity, delete_activity, activity_in_db_to_response
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="EcoTrack Activity Service",
    description="Servicio de gestión de actividades para EcoTrack",
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

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract user ID from JWT token"""
    token_data = verify_token(credentials.credentials)
    if not token_data or not token_data.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # For now, we'll use email as user_id. In production, you'd validate against user service
    return token_data.email


@app.post("/activities", response_model=ActivityResponse)
async def create_new_activity(
    activity: ActivityCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Override user_id from token
    activity.user_id = user_id
    activity_in_db = await create_activity(db, activity)
    return activity_in_db_to_response(activity_in_db)


@app.get("/activities", response_model=List[ActivityResponse])
async def get_user_activities(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(50, description="Número máximo de actividades a retornar"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    activities = await get_activities_by_user(db, user_id, limit)
    return [activity_in_db_to_response(activity) for activity in activities]


@app.get("/activities/{activity_id}", response_model=ActivityResponse)
async def get_single_activity(
    activity_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    activity = await get_activity_by_id(db, activity_id)
    if not activity or activity.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )
    return activity_in_db_to_response(activity)


@app.put("/activities/{activity_id}", response_model=ActivityResponse)
async def update_existing_activity(
    activity_id: str,
    activity_update: ActivityUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if activity exists and belongs to user
    activity = await get_activity_by_id(db, activity_id)
    if not activity or activity.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )

    updated_activity = await update_activity(db, activity_id, activity_update)
    if not updated_activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Error al actualizar actividad"
        )
    return activity_in_db_to_response(updated_activity)


@app.delete("/activities/{activity_id}")
async def delete_existing_activity(
    activity_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if activity exists and belongs to user
    activity = await get_activity_by_id(db, activity_id)
    if not activity or activity.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )

    deleted = await delete_activity(db, activity_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Error al eliminar actividad"
        )

    return {"message": "Actividad eliminada exitosamente"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "activity-service"}
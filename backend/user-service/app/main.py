from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager

from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import UserCreate, UserUpdate, UserResponse, LoginRequest, Token
from .auth import verify_password, create_access_token, verify_token
from .crud import get_user_by_email, create_user, update_user, user_in_db_to_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="EcoTrack User Service",
    description="Servicio de gestión de usuarios para EcoTrack",
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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    token_data = verify_token(credentials.credentials)
    if not token_data or not token_data.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await get_user_by_email(db, token_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    return user


@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    # Check if user already exists
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    user_in_db = await create_user(db, user)
    return user_in_db_to_response(user_in_db)


@app.post("/login", response_model=Token)
async def login_user(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await get_user_by_email(db, login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )

    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")


@app.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user=Depends(get_current_user)):
    return user_in_db_to_response(current_user)


@app.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    updated_user = await update_user(db, str(current_user.id), user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user_in_db_to_response(updated_user)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user-service"}
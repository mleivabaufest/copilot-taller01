from datetime import timedelta

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth import (
    ACCESS_TOKEN_EXPIRE_SECONDS,
    authenticate_user,
    create_access_token,
    decode_token,
)
from app.models import LoginRequest, RefreshRequest, Token

app = FastAPI(
    title="JWT Authentication API",
    description="FastAPI application implementing JWT authentication",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/token", response_model=Token, summary="Login and obtain a JWT token")
def login(request: LoginRequest):
    """
    Authenticate with username and password to receive a JWT access token.

    - **username**: admin
    - **password**: admin123
    """
    user = authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS),
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_SECONDS,
    )


@app.post("/token/refresh", response_model=Token, summary="Refresh a JWT token")
def refresh_token(request: RefreshRequest):
    """
    Provide a valid (non-expired) JWT token to receive a new one with a fresh expiration.
    """
    token_data = decode_token(request.token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    new_access_token = create_access_token(
        data={"sub": token_data.username},
        expires_delta=timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS),
    )
    return Token(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_SECONDS,
    )

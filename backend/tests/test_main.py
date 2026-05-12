import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_success():
    response = client.post(
        "/token",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 300


def test_login_wrong_password():
    response = client.post(
        "/token",
        json={"username": "admin", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_unknown_user():
    response = client.post(
        "/token",
        json={"username": "unknown", "password": "admin123"},
    )
    assert response.status_code == 401


def test_refresh_token():
    # First obtain a token
    login_response = client.post(
        "/token",
        json={"username": "admin", "password": "admin123"},
    )
    token = login_response.json()["access_token"]

    # Then refresh it
    refresh_response = client.post(
        "/token/refresh",
        json={"token": token},
    )
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 300
    assert data["access_token"] is not None


def test_refresh_invalid_token():
    response = client.post(
        "/token/refresh",
        json={"token": "not.a.valid.token"},
    )
    assert response.status_code == 401

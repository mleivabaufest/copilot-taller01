# JWT Authentication API — Backend

Una API REST construida con **Python** y **FastAPI** que implementa autenticación basada en **JWT (JSON Web Tokens)**. Incluye endpoints para obtener y refrescar tokens de acceso.

---

## Tecnologías

| Herramienta | Propósito |
|---|---|
| Python 3.11 | Lenguaje de programación |
| FastAPI | Framework web |
| Uvicorn | Servidor ASGI |
| python-jose | Generación y verificación de JWT |
| passlib / bcrypt | Hash de contraseñas |
| Poetry | Gestión de dependencias |
| Docker / Docker Compose | Contenedorización |

---

## Estructura del proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── auth.py        # Lógica de autenticación JWT
│   ├── main.py        # Rutas FastAPI
│   └── models.py      # Modelos Pydantic
├── pyproject.toml     # Dependencias (Poetry)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `JWT_SECRET_KEY` | Clave secreta para firmar los tokens JWT | valor de desarrollo incluido en el código |

> **Importante:** En producción siempre define `JWT_SECRET_KEY` con una clave segura y aleatoria.

---

## Credenciales

| Campo    | Valor      |
|----------|------------|
| username | `admin`    |
| password | `admin123` |

---

## Endpoints

### `POST /token`
Autentica al usuario y devuelve un JWT con expiración de **300 segundos**.

**Request body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

---

### `POST /token/refresh`
Recibe un token válido y devuelve uno nuevo con expiración renovada de **300 segundos**.

**Request body (JSON):**
```json
{
  "token": "<jwt_vigente>"
}
```

**Response:**
```json
{
  "access_token": "<nuevo_jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

---

### `GET /health`
Verifica que el servicio esté en línea.

**Response:**
```json
{ "status": "ok" }
```

---

## Documentación interactiva

Una vez levantado el servicio, la documentación Swagger UI está disponible en:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Ejecución con Docker (recomendado)

### Requisitos
- [Docker](https://docs.docker.com/get-docker/) ≥ 20
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2

### Pasos

```bash
# Desde la carpeta backend/
cd backend

# Construir y levantar el contenedor
docker compose up --build

# En segundo plano
docker compose up --build -d

# Detener
docker compose down
```

La API estará disponible en **http://localhost:8000**.

---

## Ejecución local con Poetry

### Requisitos
- Python 3.11+
- [Poetry](https://python-poetry.org/docs/#installation)

### Pasos

```bash
# Desde la carpeta backend/
cd backend

# Instalar dependencias
poetry install

# Iniciar el servidor
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Ejemplo de uso con cURL

```bash
# 1. Obtener token
curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 2. Refrescar token (reemplaza <TOKEN> con el valor obtenido)
curl -s -X POST http://localhost:8000/token/refresh \
  -H "Content-Type: application/json" \
  -d '{"token": "<TOKEN>"}'
```

---

## Pruebas

```bash
# Instalar dependencias de desarrollo
poetry install

# Ejecutar pruebas
poetry run pytest tests/ -v
```

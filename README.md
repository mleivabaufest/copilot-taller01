# Copilot Taller 01

Aplicación de ejemplo compuesta por:

- `backend/`: API JWT en FastAPI.
- `frontend/`: aplicación React para login y pantalla de bienvenida protegida.

## Funcionalidades del frontend

- Login contra `POST /token`.
- Persistencia del token en `sessionStorage`.
- Protección de la ruta `/welcome`.
- Cierre de sesión y limpieza de la sesión del navegador.
- Interfaz alineada con la guía visual definida en `DESIGN.md`.

## Estructura

```text
.
├── backend/
└── frontend/
```

## Cómo ejecutar la aplicación

### 1. Levantar el backend

Desde la raíz del proyecto:

```bash
cd backend
python -m pip install fastapi "uvicorn[standard]" "python-jose[cryptography]" "passlib[bcrypt]" python-multipart
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> Si prefieres usar Poetry, puedes seguir las instrucciones detalladas en `backend/README.md`.

### 2. Levantar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

La aplicación quedará disponible en `http://localhost:5173`.

## Configuración opcional

El frontend usa `http://localhost:8000` por defecto como URL del backend. Si necesitas otra URL, define la variable:

```bash
VITE_API_URL=http://localhost:8000
```

## Rutas de la aplicación

- `/login`: formulario de autenticación.
- `/welcome`: pantalla protegida, accesible solo si existe una sesión válida en el navegador.

## Credenciales de prueba

- Usuario: `admin`
- Contraseña: `admin123`

## Validación

### Backend

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

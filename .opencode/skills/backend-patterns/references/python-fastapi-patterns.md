# Python / FastAPI Backend Patterns

## Layered File Structure

```
src/
├── api/
│   ├── routes/        # Route handlers
│   └── middleware/    # Auth, logging, validation
├── core/
│   └── services/      # Business logic
├── data/
│   └── repositories/  # Database access
├── config/
│   └── settings.py    # Pydantic Settings
└── main.py            # FastAPI app, lifecycle events
```

## Middleware Chain Pattern

```python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("x-correlation-id", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id
        response = await call_next(request)
        response.headers["x-correlation-id"] = correlation_id
        return response

app = FastAPI()
app.add_middleware(LoggingMiddleware)
# Order: auth → logging → validation → routes
```

## Handler with Validation and Typed Errors

```python
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Depends
from app.errors import AppError  # from error-handling skill

class CreateUserInput(BaseModel):
    email: str
    name: str

@app.post("/api/v1/users")
async def create_user(input: CreateUserInput, service: UserService = Depends()):
    try:
        user = await service.create_user(input)
        return {"data": user.model_dump()}
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail={
            "code": e.code,
            "message": e.message,
        })
```

## Service Layer with Typed AppError

```python
class UserService:
    def __init__(self, repo: UserRepository = Depends()):
        self.repo = repo

    async def create_user(self, input: CreateUserInput) -> User:
        existing = await self.repo.find_by_email(input.email)
        if existing:
            raise AppError("USER_EXISTS", "User already exists", status_code=409)
        return await self.repo.create(input)
```

## Dependency Injection

```python
from fastapi import Depends

class UserService:
    def __init__(self, repo: UserRepository = Depends()):
        self.repo = repo

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: str, service: UserService = Depends()):
    user = await service.get_user(user_id)
    return {"data": user.model_dump()}
```

## Config from Env

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://localhost:5432/app"
    log_level: str = "INFO"
    cors_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
```

## Health Check Endpoints

```python
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready(db: Database = Depends()):
    if not await db.is_connected():
        raise HTTPException(status_code=503, detail="Database not connected")
    return {"status": "ready"}
```

## Graceful Shutdown

```python
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    logger.info("Shutting down...")
    await asyncio.wait_for(db.close(), timeout=30)
    logger.info("Database connections closed")
```

## Response Envelope

```python
from pydantic import BaseModel
from typing import Optional, Any

class ResponseEnvelope(BaseModel):
    data: Optional[Any] = None
    error: Optional[dict] = None
    meta: Optional[dict] = None
```

## Structured Logging

```python
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    correlation_id = request.headers.get("x-correlation-id", str(uuid.uuid4()))
    structlog.contextvars.bind_contextvars(correlation_id=correlation_id)
    response = await call_next(request)
    return response

logger.info("user_created", user_id=user.id, email=user.email)
```

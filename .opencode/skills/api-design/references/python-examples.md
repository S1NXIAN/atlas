# Python API Examples

## FastAPI Paginated Endpoint

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel

class PaginationParams:
    def __init__(self, cursor: str | None = None, limit: int = Query(default=20, le=100)):
        self.cursor = cursor
        self.limit = limit

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class PaginatedResponse(BaseModel):
    data: list[UserResponse]
    next_cursor: str | None = None
    has_more: bool = False

@app.get("/api/v1/users")
async def list_users(pagination: PaginationParams = Depends()):
    users, next_cursor = await user_service.list(cursor=pagination.cursor, limit=pagination.limit)
    return PaginatedResponse(data=users, next_cursor=next_cursor, has_more=next_cursor is not None)
```

# API Documentation Standards

## OpenAPI Envelope

Every endpoint must document:
- summary (1 sentence)
- description (paragraph if non-trivial)
- parameters (path, query, header)
- requestBody (for POST/PUT/PATCH)
- responses (200/201 + 4xx + 5xx)

## Response Format

Success:
```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1 }
}
```

Error:
```json
{
  "error": {
    "code": "validation_error",
    "message": "Human readable message",
    "details": [{ "field": "email", "message": "Must be valid email" }]
  }
}
```

## Rules

- Group endpoints by resource tag
- Every error code must be documented
- Response examples for success AND error cases
- No `operationId` unless auto-generated
- Request/Response schemas defined once and referenced ($ref)

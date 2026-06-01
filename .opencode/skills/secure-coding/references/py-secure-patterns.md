# Python Secure Patterns

## Django Security Middleware

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

## Flask-Talisman

```python
from flask_talisman import Talisman
talisman = Talisman(app, content_security_policy={
    'default-src': "'self'",
})
```

## SQLAlchemy (Parameterized)

```python
user = db.session.execute(
    db.select(User).where(User.email == email)
).scalar_one_or_none()
```

## passlib (Password Hashing)

```python
from passlib.hash import bcrypt
hash = bcrypt.using(rounds=12).hash(plain_password)
bcrypt.verify(plain_password, hash)
```

## Pydantic Validation

```python
from pydantic import BaseModel, EmailStr, Field

class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
```

## pip-audit CI

```bash
pip install pip-audit
pip-audit --desc on --fail-on high
```

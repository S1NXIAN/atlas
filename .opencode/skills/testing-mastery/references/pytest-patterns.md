# Pytest Testing Patterns

## Fixtures

```python
import pytest
from app.user import UserService

@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)

@pytest.fixture
def user_service(db):
    return UserService(db)
```

## conftest.py

```python
import pytest
from app import create_app

@pytest.fixture
def app():
    return create_app(testing=True)

@pytest.fixture
def client(app):
    return app.test_client()
```

## Parametrize

```python
@pytest.mark.parametrize("input,expected", [
    ("hello@test.com", True),
    ("not-an-email", False),
    ("", False),
])
def test_email_validation(input, expected):
    assert validate_email(input) == expected
```

## Markers

```python
@pytest.mark.slow
def test_full_user_onboarding():
    pass

@pytest.mark.skip(reason="not implemented yet")
def test_billing_integration():
    pass
```

## mock.patch

```python
from unittest.mock import patch

@patch("app.user.email_service.send_verification")
def test_create_user_sends_email(mock_send):
    mock_send.return_value = True
    service.create_user({"email": "test@test.com"})
    mock_send.assert_called_once()
```

## pytest-asyncio

```python
@pytest.mark.asyncio
async def test_async_fetch_user():
    user = await user_service.get_by_id(1)
    assert user.email == "test@test.com"
```

## pytest-cov

```bash
pytest --cov=src --cov-report=term-missing --cov-fail-under=80
```

## Hypothesis (Property-Based)

```python
from hypothesis import given, strategies as st

@given(st.emails())
def test_email_parsing_is_symmetric(email):
    parsed = parse_email(email)
    assert parsed.raw == email
```

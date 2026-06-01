# Alembic Migration Patterns

## Migration File

```python
"""create users table

Revision ID: abc123
Revises:
Create Date: 2025-05-31 00:00:01
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

def downgrade():
    op.drop_table('users')
```

## Adding a Column (Backward-Compatible)

```python
def upgrade():
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))

def downgrade():
    op.drop_column('users', 'avatar_url')
```

## Batch Data Migration

```python
def upgrade():
    BATCH_SIZE = 1000
    op.add_column('users', sa.Column('display_name', sa.String(), nullable=True))

    op.execute("SET lock_timeout = '5s'")

    conn = op.get_bind()
    migrated = 0
    rows = conn.execute(
        sa.text("SELECT id, first_name, last_name FROM users WHERE display_name IS NULL ORDER BY id LIMIT :limit"),
        {"limit": BATCH_SIZE}
    ).fetchall()

    while rows:
        ids = tuple(row.id for row in rows)
        conn.execute(
            sa.text("""
                UPDATE users SET display_name = CONCAT_WS(' ', first_name, last_name)
                WHERE id = ANY(:ids)
            """),
            {"ids": ids}
        )
        migrated += len(rows)
        print(f"Migrated {migrated} rows")
        rows = conn.execute(
            sa.text("SELECT id, first_name, last_name FROM users WHERE display_name IS NULL ORDER BY id LIMIT :limit"),
            {"limit": BATCH_SIZE}
        ).fetchall()
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade -1` | Revert last migration |
| `alembic history` | Show migration history |
| `alembic current` | Show current migration |
| `alembic revision --autogenerate -m "description"` | Auto-generate migration |
| `alembic upgrade head --sql` | Dry run (print SQL) |

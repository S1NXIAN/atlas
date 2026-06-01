---
name: database-migrations
description: Database migration patterns — schema evolution, rollback strategy, data migrations, seeding, zero-downtime migrations, timestamp naming, and migration tooling. Use when designing database schema, writing migrations, planning rollbacks, or seeding test data.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: error-handling
---

# Database Migrations

Safe, reversible database schema evolution patterns.

## Core rules

1. **One change per migration** — Never bundle unrelated schema changes. Each migration should do exactly one thing (add a column, create a table, add an index).
2. **Always reversible** — Every migration must have both `up` (apply) and `down` (revert) methods. Test the `down` path. Irreversible migrations (DROP COLUMN without data backup) require explicit approval.
3. **Timestamp-based naming** — Use `YYYYMMDDHHMMSS_description.sql` format. Timestamps ensure order and prevent conflicts. Never use sequential numbers.
4. **Seed data separate** — Seed/test data goes in seed files, not migrations. Migrations evolve schema. Seeds populate data. Run seeds after all migrations.
5. **Backward-compatible changes** — For zero-downtime deploys: add column before using it, drop column after removing all references. Never rename columns — add new + migrate data + drop old.
6. **Lock timeout handling** — Set `statement_timeout` or `lock_timeout` for long-running migrations. Recommended value: 5s (`SET lock_timeout = '5s'`). If migration exceeds timeout, it should fail fast rather than block production.
7. **Batch large data migrations** — Process data changes in batches of 1000 rows. Log progress per batch. Add a progress indicator for migrations affecting >100K rows.
8. **Never edit committed migrations** — Once a migration is committed (and especially if it ran in production), create a new migration to fix issues. Editing existing migrations breaks reproducibility.
9. **Index creation separate** — Create indexes in a separate migration after the table/column is created. This avoids table locks during index creation and allows parallel deployment.
10. **Migration order is execution order** — Apply migrations in timestamp order. If migration 2 depends on migration 1, their timestamps must reflect this. No circular dependencies between migrations.

## Procedures

1. Identify the schema change needed (add column, new table, index, data migration).
2. Write `up` migration: forward change with all constraints.
3. Write `down` migration: reverse the change completely. Test it.
4. Name file: `YYYYMMDDHHMMSS_description.sql` matching the change.
5. For large data migrations: add batching (1000 rows per batch) and progress logging.
6. Set lock timeout: `SET lock_timeout = '5s';` at top of migration.
7. Add seed data: create seed file, not inline in migration.
8. Verify backward compatibility: old code must still work with new schema.
9. Run migration in dry-run mode first (if available).
10. Commit: migration file + application code changes in the same PR.

## Gotchas

- `ALTER COLUMN ... SET DEFAULT` locks the table in PostgreSQL and MySQL. Add defaults via application layer first, then add DB default in a separate migration.
- Irreversible migrations (DROP COLUMN, data transformation without reverse function) create production risk. Always test the down path.
- Long-running migrations timeout in CI. Set higher timeout for migrations that process large datasets, or run them out of band.
- Running migrations in production without a dry run is risky. Use migration tools with dry-run support (knex dry-run, alembic --sql).
- Editing a committed migration that already ran in production breaks reproducibility. Create a new migration instead.
- Migration dependencies across services create coupling. Each service manages its own migrations independently.

## References

| File | Load when |
|------|-----------|
| `references/knex-examples.md` | Implementing migrations in Node.js/Knex |
| `references/alembic-examples.md` | Implementing migrations in Python/Alembic |
| `references/golang-migrate-examples.txt` | Implementing migrations in Go/golang-migrate |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Designing schema for new feature | database-migrations + api-design |
| Zero-downtime deployment | database-migrations + backend-patterns |
| Data backfill migration | database-migrations + error-handling |
| Adding index to existing table | database-migrations + coding-standards |

## Checklist

- [ ] One schema change per migration (not bundled)
- [ ] Up and down methods both present and tested
- [ ] File named `YYYYMMDDHHMMSS_description.sql`
- [ ] Seed data in seed files, not migrations
- [ ] Changes are backward-compatible (add before use, drop after refs removed)
- [ ] Lock timeout set for long-running migrations
- [ ] Data migrations batched in 1000-row chunks
- [ ] No edits to committed migrations (new migration instead)
- [ ] Index creation in separate migration from table/column
- [ ] Migration order is correct (timestamp-based, no cycles)

# Knex.js Migration Patterns

## Migration File

```typescript
// migrations/20250531000001_create_users.ts
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid())
    table.string('email').notNullable().unique()
    table.string('name').notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users')
}
```

## Adding a Column (Backward-Compatible)

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('avatar_url').nullable()  // nullable so old code works
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('avatar_url')
  })
}
```

## Batch Data Migration

```typescript
export async function up(knex: Knex): Promise<void> {
  // Set lock timeout
  await knex.raw("SET lock_timeout = '5s'")

  const BATCH_SIZE = 1000
  let migrated = 0

  // Add column first
  await knex.schema.alterTable('users', (t) => {
    t.string('display_name').nullable()
  })

  // Backfill in batches
  let rows = await knex('users').whereNull('display_name').orderBy('id').limit(BATCH_SIZE)
  while (rows.length > 0) {
    const updates = rows.map(r => ({
      id: r.id,
      display_name: `${r.first_name} ${r.last_name}`,
    }))
    await knex('users').insert(updates).onConflict('id').merge()
    migrated += rows.length
    console.log(`Migrated ${migrated} rows`)
    rows = await knex('users').whereNull('display_name').orderBy('id').limit(BATCH_SIZE)
  }
}
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npx knex migrate:latest` | Apply pending migrations |
| `npx knex migrate:rollback` | Revert last batch |
| `npx knex migrate:up` | Apply next pending migration |
| `npx knex migrate:down` | Revert last migration |
| `npx knex seed:run` | Run seed files |
| `NODE_ENV=test npx knex migrate:latest` | Apply to test DB |

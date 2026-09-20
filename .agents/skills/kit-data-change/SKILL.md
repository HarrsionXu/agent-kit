---
name: kit-data-change
description: Assess and prepare backend schema changes and data migrations. Use when modifying persistent fields, Prisma models, migration scripts, backfills, or delete/retention behavior; not as automatic permission to run migrations.
---

# Data change boundary

Read project backend rules, schema, migration history and environment-specific release procedure. Never copy migration numbering, host paths or deploy commands from another repository.

Before implementation identify existing data behavior, compatibility with old/new clients, nullable/default semantics, constraints/indexes, backfill cost and recovery plan. Destructive or irreversible changes require explicit approval and validated exact targets.

Keep controller validation, DTO/OpenAPI, service boundaries and audit behavior consistent. Record whether a schema change requires a migration, deployment ordering, or a separate backfill.

Generate or edit migration artifacts only within the request. Use disposable databases for tests when authorized. Do not connect to production, run reset, apply migrations, seed or send notifications as a side effect of preparing code.

Deliver generated artifacts, tests actually run, required operational steps and unresolved compatibility risks. Local schema validation is not proof that a remote migration ran successfully.

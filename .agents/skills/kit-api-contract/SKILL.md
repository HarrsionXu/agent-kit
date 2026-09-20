---
name: kit-api-contract
description: Check or implement an API contract across frontend and backend boundaries. Use when adding endpoints, wiring a UI action, fixing parameter types or status mappings, or changing response structures and error handling.
---

# Contract loop

Read the caller, transport adapter, DTO/schema and authoritative endpoint documentation. For multiple repositories read each repository's instructions before accessing it. Permission to inspect does not authorize changing all repositories.

Create a compact operation mapping: user action → method/path/host/auth → exact payload → response → UI state. Include pagination, timezone, null/zero/false, long identifiers and failure semantics. Do not infer a working host from the page domain.

Use explicit payload allowlists. Preserve integer precision end-to-end; converting an already-rounded Number to a string does not repair the ID. For numeric JSON contracts outside the safe integer range use a verified lossless serialization strategy, not Number(id).

Map statuses by exact enum and business phase, not string truthiness or attachment secrecy alone. Test invitation, submission, opening, scoring and award as separate axes when the API separates them.

Keep authentication errors scoped to their authentication domain. Do not globally log out a valid session merely because another service rejects a token.

Update only authorized code/types/docs and regression tests. If an endpoint is absent, record the gap and display the agreed unsupported behavior; never substitute mock success. Real approval/send/start APIs need explicit task authority and a safe test context.

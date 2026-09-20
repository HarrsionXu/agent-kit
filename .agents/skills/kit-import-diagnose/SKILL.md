---
name: kit-import-diagnose
description: Diagnose spreadsheet or batch import failures across parsing, preview, validation and persistence. Use for wrong field mappings, lost values, rejected rows, mismatched preview counts or partially successful imports.
---

# Import diagnosis

Start read-only unless a fix is requested. Trace the smallest representative, anonymized row through source header → parser → normalization → preview → DTO → persistence → response.

Check header aliases, whitespace, locale/date formats, number precision, required/optional fields, empty versus zero/false, duplicate identity and row numbering. Compare preview and final submit mappings; do not assume they share code.

Separate parse errors, validation errors, network errors and partial write outcomes. Never retry an entire destructive batch without understanding idempotency and already-persisted rows.

For a fix, use minimal synthetic fixtures and regression tests for the broken mapping and nearby valid cases. Preserve useful row-level error reporting; do not suppress rejected rows to make totals agree.

Deliver root cause with evidence, affected stages, code changes if authorized, and verification limits. Do not embed real supplier or employee records in fixtures, logs or central standards.

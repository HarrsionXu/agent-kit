---
name: kit-crud
description: Implement or assess business CRUD and administrative workbench interactions. Use for searchable paginated lists, create/edit dialogs, configuration forms, details workbenches, and staged attachment actions in admin applications.
---

# CRUD versus workbench

Read the local framework and admin rules, reusable controls, API contract and existing nearby screens. Reuse the project's actual component library; do not assume Element Plus in Angular or React.

Choose a compact dialog for a small form. Use a page or drawer for multistep collaboration, large datasets or persistent navigation. Keep list/edit/details models separate and submit an explicit writable-field payload.

Define search/reset/page behavior, total counts, stable row identity and state refresh after mutations. Prevent stale async responses from replacing a newer query. Avoid N+1 detail calls when list data or batching suffices.

Model file additions/removals as a draft when cancellation must discard changes. Do not remotely delete on click if Save is the agreed commit boundary. Distinguish immediate actions and staged changes visibly.

Test cancel, validation, duplicate submission, failed save, retry, long text and row ordering after refresh. A successful toast without a server-side operation is not completion.

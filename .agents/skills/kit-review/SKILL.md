---
name: kit-review
description: Review an implementation against acceptance evidence and regression risks. Use for code reviews, pre-delivery verification, checking an agent result, or evaluating whether a task is actually complete.
---

# Evidence review

Read the task goal, effective rules, changed files, and project verification commands. A review request is read-only unless implementation is also authorized.

Check:

- The implementation satisfies each acceptance example, including empty/error/loading/permission states.
- API fields, long IDs, enum combinations, pagination, timezone, and save payloads follow verified contracts.
- UI uses the project's component/token baseline, handles long labels and small heights, and preserves navigation/scroll position where required.
- No hidden mock success, swallowed errors, unrequested migration, or destructive side effects.
- Tests exercise the changed behavior rather than merely naming the function or checking that a file exists.

Run safe configured checks where available. For installed kits, `verify` is preview-only without `--execute`; review the underlying commands before running. This is not a sandbox.

Report actionable findings with severity, location, trigger, impact, and recommendation. If none, say what was covered and what was not. Do not call self-review independent QA. Do not produce a deployment success claim from a local build.

---
name: kit-task
description: Establish a scoped engineering task and acceptance loop. Use when starting a feature, fixing a bug, continuing an incomplete implementation, or coordinating a multi-step change in a project using Agent Kit.
---

# Task loop

1. Read effective repository instructions and project facts. For installed projects read `.agent-kit/project.json`, its documents, and scope-matched rules. In the kit source read `standards/common.md` and `standards/workflow.md`.
2. Separate the goal from the proposed implementation. Verify uncertain assumptions using code or authoritative contracts. Challenge a proposal only with a concrete risk or counterexample.
3. Determine whether the request authorizes diagnosis only or implementation. Preserve unrelated changes; do not infer deployment, database mutation, or outbound-message authority.
4. Define observable acceptance examples before coding: state/input, action, expected request/result. Use the task template for substantial changes; a short delivery record suffices for small fixes.
5. Choose only relevant framework rules and task Skills. Small tasks complete in one loop; pause for material unresolved decisions, not for ceremonial role changes.
6. Implement, run appropriate checks, inspect actual UI where relevant, correct failures, and rerun affected checks. Never equate static hygiene with browser verification.
7. Deliver changes, actual evidence, unverified aspects, and remaining decisions. If blocked, record exactly what is missing; do not manufacture completion.

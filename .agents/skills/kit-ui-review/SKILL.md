---
name: kit-ui-review
description: Design, implement, or validate product-native frontend interfaces. Use for pages, dialogs, tables, forms, responsive layout, interaction changes, or visual regressions in Angular, Vue, and React projects.
---

# Product-native UI

Read scope-specific frontend rules and the project's tokens, shared components, and two relevant accepted screens. Do not choose a new visual style from a generic trend list.

1. State the user task, hierarchy, primary action, and expected feedback. Distinguish read-only context from editable data.
2. Reuse project primitives. Choose density, spacing, typography, surfaces and state colors from existing tokens; add a new token only with an identified repeated need.
3. Avoid ornamental gradients, glass, oversized shadows and explanatory banners unless the product intentionally uses them. These are context-sensitive design decisions, not a universal ban on effects.
4. Specify loading/empty/error/success/disabled states and keyboard behavior. Keep scroll inside bounded panels, floating menus within the viewport, and header/actions stable where the workflow requires them.
5. Test long and multilingual text, validation, repeated submission, retry, pagination and relevant viewport sizes. Use isolated data for destructive operations.
6. Inspect the rendered result and interactions; record route, viewport and evidence. A screenshot alone cannot prove network behavior, and passing a build cannot prove layout.

If a project-installed ui-ux-pro-max or design Skill is relevant, read it explicitly and use it within project constraints; do not claim it ran because it is installed. Never silently download another skill or send private project information to an external design service.

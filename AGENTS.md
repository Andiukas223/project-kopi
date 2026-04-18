# AGENTS.md

## Purpose

This repository contains the Viva Medical internal business management web application.

The current goal is to evolve the desktop-first prototype into a maintainable, production-ready Vue 3 application without breaking:
- existing product behavior
- document workflows
- deployment flow
- module logic
- backend/API compatibility

The immediate product focus is:
- reusable document templates
- browser-based template editing with Umo Editor
- structured merge fields
- automatic document generation
- PDF/export/print flows
- integration between Templates, Documents, and Work Acts

Codex should treat this file as the primary repository-specific instruction set.

---

## Project context

The current project is a desktop-first internal web app prototype, modularized into `src/`, served by `nginx`, and run through Docker.

The broader backend architecture is planned for later phases after business modules, data models, and user roles are finalized.

Important documented areas in this repository include:
- design system and shell behavior
- project plan and roadmap
- deployment and production topology
- module-specific docs for Documents, Work Acts, Templates, and future modules
- historical Collabora removal context
- document generation findings
- linking and pipeline logic across modules

---

## Authoritative documentation

Before making changes, read the most relevant docs and treat them as requirements unless the code clearly proves otherwise.

Start with:
1. `README.md`
2. `docs/design_system.md`
3. `docs/PROJECT_PLAN.md`
4. `docs/CURRENT_STATUS_AND_ROADMAP.md`
5. `docs/DOCUMENTATION_RULES.md`

Then read task-relevant module docs, especially:
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/WORK_ACTS_MODULE.md`
- `docs/modules/TEMPLATES_MODULE.md`
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md`

For runtime/deployment decisions, also read:
- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/VM_WEB_CONTROL.md`

If old documentation mentions Collabora/WOPI, treat it as potentially stale and historical unless the current user explicitly asks to restore it.

Do not ignore docs just because implementation is incomplete.

---

## Current runtime assumptions

The project currently runs via:
- `.\vm-web-control.cmd`
- `.\vm-web-control.ps1`
- or `docker compose up -d --build`

Current important services:
- `web` = nginx frontend + reverse proxy
- `document-service` = document generation, persistence, file/storage-related API logic

Important constraints:
- `document-service:3001` must not become public in production
- public access should go through HTTPS reverse proxy
- old Collabora/WOPI architecture is intentionally removed and must not be reintroduced unless explicitly requested

Any frontend migration or feature implementation must preserve the current Docker/nginx/backend flow unless a change is clearly required and documented.

---

## Main engineering goal for Codex

Refactor and extend the frontend into a clean Vue 3 architecture while implementing the real document workflow around Umo Editor.

Preserve:
- existing business behavior
- module structure and business flows
- visual structure from the design system
- Docker/nginx run flow
- existing API contracts where possible
- document workflows
- PDF generation / export / preview behavior
- signed-upload custody and file ownership boundaries
- desktop-first UX assumptions

Implement and improve:
- Templates module as the reusable template source
- Umo Editor as the main browser document editor
- merge-field management
- document generation flow
- Documents module integration
- Work Acts to template-generation flow
- PDF/export/print support

Do not perform a careless rewrite. Prefer staged migration and incremental implementation.

---

## Required workflow

For substantial tasks, always work in this order:

1. Inspect the repository structure.
2. Read the authoritative documentation relevant to the task.
3. Summarize the current implementation before changing code.
4. Produce a migration or implementation plan.
5. Implement in small, reviewable steps.
6. Run relevant validation commands.
7. Summarize changed files, risks, and anything incomplete.

For complex work, plan before coding.

When choosing between speed and safety, prefer safety and reviewability.

---

## Frontend migration and implementation rules

If working in Vue 3:
- Prefer Vue 3 Composition API.
- Keep the app modular and readable.
- Preserve the existing design language and desktop-first layout.
- Migrate the shell/layout first, then shared components, then feature modules.
- Reuse existing naming where it improves continuity.
- Do not rewrite backend logic unless compatibility requires it.
- Do not remove features silently.
- Do not invent new business behavior.
- Preserve module boundaries where practical.

If the current repo is not fully framework-based, first identify:
- current frontend entry points
- current global state patterns
- current component-like structures
- CSS/layout dependencies
- runtime assumptions tied to nginx, Docker, or backend APIs

Document these findings before large-scale rewrites.

---

## Umo Editor rules

Umo Editor is the primary browser editor target.

When integrating Umo Editor:
- treat it as the editable document surface for templates
- keep the integration modular and reusable
- support loading editor content from backend data
- support saving editor content back to backend persistence
- preserve A4/pagination/print-oriented product intent
- keep template metadata, merge fields, and editor content clearly separated
- avoid tightly coupling business logic directly into editor internals

Do not recreate Collabora-style iframe/WOPI session architecture.

---

## Document workflow rules

This repository has important document-related behavior. Be careful with:
- Documents module logic
- Templates module logic
- Work Acts draft and PDF generation behavior
- file custody boundaries
- structured source editing in Templates and Work Acts
- storage paths and save behavior
- preview URLs
- generated-file ownership and lifecycle

Expected product direction:
1. user creates or edits a reusable template
2. template metadata and content are stored by the system
3. merge fields are explicitly defined and maintained
4. user generates a document from template + structured data
5. generated document is surfaced in Documents
6. user can export/download/print the result
7. Work Acts can generate documents from template context

Do not break or casually redesign document handling. Read the related docs first.

---

## Explicit anti-Collabora rule

Do not:
- preserve old Collabora runtime assumptions just because docs/code mention them
- recreate WOPI flows
- add iframe editor session architecture modeled on Collabora
- keep stale reverse proxy or editor-service logic that only existed for Collabora
- treat historical Collabora references as active requirements

If stale Collabora references remain:
- identify them
- remove or isolate them safely
- update documentation where clearly necessary
- summarize exactly what was cleaned up

---

## Design authority and quality bar

Codex should behave not only as an implementation agent, but also as a strong product design-minded frontend engineer.

Default design goals:
- simple
- precise
- consistent
- desktop-efficient
- accessible
- calm
- high-signal
- production-ready

This is an internal business system, so prioritize:
- clarity over decoration
- task completion over novelty
- dense but readable interfaces
- predictable workflows
- visual consistency across modules
- excellent forms, tables, filters, drawers, and modals
- strong print/document ergonomics

Avoid “startup landing page” styling patterns unless the task explicitly calls for them.

---

## Core design philosophy

- **Simplicity through reduction** — remove unnecessary UI before adding polish
- **Material honesty** — interactions should feel direct and understandable
- **Obsessive detail** — spacing, alignment, hover/focus states, and text rhythm matter
- **Coherent design language** — use repeatable tokens, not one-off styling
- **Context-driven design** — adapt to module purpose, data density, and user workflow
- **Accessibility by default** — keyboard paths, contrast, semantics, and focus states are mandatory
- **Performance equals usability** — avoid heavy UI patterns that slow daily work

---

## Design system rules

### Layout and spacing
- Use a clear desktop-first layout.
- Prefer content-out sizing rather than arbitrary full-width stretching.
- Use a consistent spacing scale based on 4px / 8px rhythm.
- Align tables, forms, and panel content carefully.
- Use container-aware layouts where practical.
- Avoid cramped UI, but also avoid wasteful empty space.

Suggested spacing scale:
- `2px`
- `4px`
- `8px`
- `12px`
- `16px`
- `24px`
- `32px`
- `48px`
- `64px`

### Typography
- Prefer highly readable UI typography.
- Maintain strong hierarchy between page title, section title, field label, body text, and meta text.
- Avoid oversized headings in internal tools.
- Keep line length readable.
- Favor compact clarity over dramatic branding.

### Color
- Use semantic color roles, not arbitrary colors.
- Prefer restrained neutrals with purposeful accent usage.
- Keep status colors clear and consistent.
- Ensure dark mode support is possible, even if not fully implemented yet.
- Preserve strong text/background contrast.

### Elevation and layers
- Keep layer hierarchy predictable:
  - base content
  - sticky headers/toolbars
  - dropdowns/popovers
  - modals/drawers
  - overlays
- Shadows should be subtle and functional, not decorative.

### Icons and visuals
- Use simple, consistent iconography.
- Avoid visually noisy illustrations in workflow-heavy areas.
- Icons should support scanning, not replace labels.

---

## Interaction and motion rules

- Hover should communicate affordance, not distract.
- Focus-visible states must be clear and keyboard-friendly.
- Active/pressed states should feel tactile but subtle.
- Prefer transform/opacity over layout-thrashing animation.
- Keep motion restrained in business workflows.
- Respect `prefers-reduced-motion`.

Recommended motion:
- small interactions: `120–180ms`
- larger transitions: `200–320ms`

Do not introduce animation that slows high-frequency workflows.

---

## Accessibility and inclusive design

Always prefer:
1. semantic HTML first
2. keyboard-first interaction paths
3. visible focus states
4. sufficient contrast
5. readable copy
6. inline validation with clear messaging
7. accessible tables, modals, menus, and forms
8. language-neutral token naming and component APIs

Minimum expectations:
- WCAG AA contrast targets
- body text contrast ≥ 4.5:1
- clear error messaging
- no hidden keyboard traps
- modals must support Escape and focus management
- forms must have visible labels

---

## Business UI patterns

For this product, Codex should be especially strong at designing and implementing:

### Forms
- visible labels above fields or in a consistent aligned pattern
- concise help text
- clear required/optional states
- inline validation
- sensible grouping into sections
- efficient keyboard navigation

### Tables
- strong header hierarchy
- stable row density
- sortable/filterable structure where appropriate
- sticky headers if useful
- status chips/tags that remain readable
- action placement that is predictable and not cluttered

### Modals and drawers
- use modals for focused editing
- use drawers/panels when context should remain visible
- avoid huge all-purpose modals when a structured page is better
- ensure footer actions are clear and consistently positioned

### Wizards and flows
- use only when step order truly matters
- keep steps explicit
- show progress clearly
- avoid unnecessary fragmentation of simple tasks

### Empty states
- explain what the module is for
- explain the next action
- avoid generic “No data” messages when a useful next step can be shown

### Status and feedback
- loading, saving, success, warning, and error states must be explicit
- optimistic updates should be used carefully
- destructive actions should have confirmation where risk is meaningful

---

## Document-focused UI rules

Because this system is document-heavy:
- treat A4/print behavior as a first-class concern
- preserve document readability and structure
- distinguish clearly between:
  - template metadata
  - template content
  - merge fields
  - generated document files
  - document preview/download/export actions
- keep document actions explicit and easy to scan
- support future signing workflows without redesigning the core structure each time

When implementing editor-related views:
- prioritize focus, whitespace, and readable page framing
- avoid clutter around the document canvas
- keep primary actions obvious: save, generate, export, preview, close

---

## Code quality expectations

Prefer:
- small focused components
- predictable folder structure
- explicit props/events/interfaces
- readable state handling
- minimal hidden side effects
- maintainable styling approach
- comments only where they improve maintainability

Avoid:
- overengineering
- giant monolithic components
- unnecessary abstractions
- rewriting stable logic without reason
- one-off styling exceptions without clear justification

---

## Suggested target structure for frontend work

A reasonable target is something like:

- `src/app/` for bootstrap, app shell, providers
- `src/router/` for route definitions
- `src/layouts/` for major shells/layout containers
- `src/modules/` for business modules
- `src/components/` for shared UI
- `src/components/editors/` for editor wrappers/integration layers
- `src/components/data-display/` for tables, lists, status UI
- `src/components/forms/` for inputs, field wrappers, validation UI
- `src/services/` for API/service wrappers
- `src/stores/` for application state
- `src/styles/` for design tokens and global styles
- `src/utils/` for helpers

Adapt this if the existing repository structure suggests a better fit.

---

## Validation expectations

A task is not done until:
- the relevant docs were reviewed
- the implementation matches existing business intent
- the app still runs or the exact run changes are documented
- affected flows are validated
- changed files are summarized
- risks and remaining gaps are stated

For UI work, also validate:
- responsive desktop behavior
- keyboard accessibility
- visual consistency with existing modules
- loading/error/empty states
- no obvious regressions in spacing, hierarchy, or action placement

For document-related work, “done” should usually mean the affected flow can be demonstrated end to end or its missing backend dependency is clearly identified.

---

## Codex behavior expectations

When working in this repo:
- ask clarifying questions only if absolutely necessary
- otherwise infer from code + docs + current architecture
- prefer safe incremental changes
- preserve reviewability
- keep documentation aligned with implementation
- do not skip validation just because the task looks straightforward

If there is a conflict between code and docs:
- identify it explicitly
- state which source appears newer or more authoritative
- do not silently choose one without explanation

If there is a conflict between historical Collabora-era docs and the new Umo-based architecture:
- treat the Umo-based architecture as authoritative
- update or isolate stale assumptions safely

When making UI decisions, explain:
- why the structure improves usability
- why the interaction model fits the workflow
- how consistency with the system is preserved

---

## First-task instruction for Codex

When asked to implement document workflows, start by:
1. reading this file and the core docs
2. identifying the current frontend and document architecture
3. identifying stale Collabora-era assumptions if any remain
4. producing a phased implementation plan
5. proceeding in small safe phases unless explicitly told to stop after the plan

When asked to work on Templates / Documents / Work Acts:
- optimize for delivering a real template-generation workflow first
- do not overfocus on polish before the core flow works

Highest-value early slice:
- template list/detail/edit
- Umo Editor integration
- merge field definitions
- save/load template content
- generate document from template + payload
- surface generated document in Documents
- export/download/print flow

---

## Product intent for Templates module

The Templates module is a reusable document authoring environment for repetitive medical equipment service documentation.

Users are expected to think in a Word/LibreOffice-like way:
- create reusable service document layouts
- reuse standard text, rows, checklists, and sections
- insert dynamic data fields/placeholders
- generate final documents later from Work Act context

The Templates module should therefore optimize for:
- document-first editing
- familiar editor workflow
- A4/document-oriented layout
- repetitive service-document creation efficiency
- clarity of reusable vs dynamic content

This is not just a generic ERP form builder and not just a storage list for templates.
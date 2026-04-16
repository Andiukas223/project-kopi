# AGENTS.md

## Purpose

This repository contains the Viva Medical internal business management web application. The current goal is to evolve the desktop-first prototype into a maintainable production-grade system without breaking the existing product behavior, document workflows, deployment flow, or module logic. The immediate coding objective is frontend modernization and migration toward Vue 3 while preserving current runtime assumptions and existing backend integrations. :contentReference[oaicite:0]{index=0}

Codex should treat this file as the main repo-specific instruction set.

---

## Project context

The current project is a desktop-first internal web app prototype, modularized into `src/`, served by `nginx`, and run through Docker. The broader backend architecture is planned for later phases after business modules, data models, and user roles are finalized. :contentReference[oaicite:1]{index=1}

Important documented areas in this repository include:
- design system and shell behavior
- project plan and roadmap
- deployment and production topology
- module-specific docs for Documents, Work Acts, Templates, and future modules
- Collabora CODE / WOPI integration flow
- document generation findings
- linking and pipeline logic across modules :contentReference[oaicite:2]{index=2}

---

## Authoritative documentation

Before making changes, read the most relevant docs and treat them as requirements unless the code clearly proves otherwise.

Start with:
1. `README.md`
2. `docs/design_system.md`
3. `docs/PROJECT_PLAN.md`
4. `docs/CURRENT_STATUS_AND_ROADMAP.md`
5. `docs/DOCUMENTATION_RULES.md`

Then read module-specific docs that apply to the task, especially:
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/WORK_ACTS_MODULE.md`
- `docs/modules/TEMPLATES_MODULE.md`
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md`
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md` :contentReference[oaicite:3]{index=3}

For production/runtime/deployment decisions, also read:
- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/VM_WEB_CONTROL.md` :contentReference[oaicite:4]{index=4}

Do not ignore docs just because implementation is incomplete.

---

## Current runtime assumptions

The project currently runs via:
- `.\vm-web-control.cmd`
- `.\vm-web-control.ps1`
- or `docker compose up -d --build` :contentReference[oaicite:5]{index=5}

Current services:
- `web` = nginx frontend + reverse proxy
- `document-service` = document generation/file storage API
- `collabora` = Collabora CODE runtime on internal Docker network only :contentReference[oaicite:6]{index=6}

Important constraints:
- `document-service:3001` must not become public in production
- Collabora `9980` must remain private
- public access should go through HTTPS reverse proxy
- direct public exposure of internal editing services is not acceptable :contentReference[oaicite:7]{index=7}

Any frontend migration must preserve these assumptions unless explicitly instructed otherwise.

---

## Main engineering goal for Codex

Refactor the existing frontend into a clean Vue 3 architecture while preserving:
- existing product behavior
- module structure and business flows
- visual structure from the design system
- Docker/nginx run flow
- existing API contracts
- document workflows and Collabora integration paths
- desktop-first UX assumptions

Do not perform a careless rewrite. Prefer a staged migration plan and incremental implementation. OpenAI recommends using planning first for difficult tasks and encoding repository expectations in `AGENTS.md`; follow that approach here. :contentReference[oaicite:8]{index=8}

---

## Required workflow

For substantial tasks, always work in this order:

1. Inspect the repository structure.
2. Read the authoritative documentation relevant to the task.
3. Summarize the current implementation before changing code.
4. Produce a migration or execution plan.
5. Implement in small, reviewable steps.
6. Run relevant validation commands.
7. Summarize changed files, risks, and anything incomplete.

For complex work, plan before coding. Codex best practices explicitly recommend planning first for ambiguous or difficult tasks. :contentReference[oaicite:9]{index=9}

---

## Frontend migration rules

If migrating to Vue 3:
- Prefer Vue 3 Composition API.
- Keep the app modular and readable.
- Preserve the existing design language and desktop-first layout.
- Migrate the shell/layout first, then shared components, then feature modules.
- Reuse existing naming where it improves continuity.
- Do not rewrite backend logic unless compatibility requires it.
- Do not remove features silently.
- Do not invent new business behavior.
- Preserve current module boundaries where practical.
- Keep future document editor integration in mind.

If the current repo is not already framework-based, first identify:
- current frontend entry points
- current global state patterns
- current component-like structures
- CSS/layout dependencies
- runtime assumptions tied to nginx, Docker, or iframe integrations

Document these findings before large-scale rewrites.

---

## Document workflow rules

This repository has important document-related behavior. Be careful with:
- Documents module logic
- Templates module logic
- Work Acts draft and PDF generation behavior
- file custody boundaries
- WOPI / Collabora editor session flow
- storage paths and save behavior

Do not break or casually redesign document handling. Read the related module docs first. :contentReference[oaicite:10]{index=10}

---

## Deployment and runtime safety rules

Do not:
- expose internal ports publicly
- remove reverse proxy assumptions
- break Docker startup flow
- change storage or service connectivity without documenting it
- assume localhost-only development behavior is equivalent to production

If runtime changes are necessary:
- explain why
- update documentation
- keep production-safe defaults

---

## Change management rules

Every meaningful change should include:
- what changed
- why it changed
- which files were affected
- how to run/verify it
- any risks or follow-up work

If migration is incomplete, clearly mark:
- finished
- partially migrated
- blocked
- intentionally deferred

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

---

## Suggested target structure for frontend migration

A reasonable target is something like:

- `src/app/` for bootstrap, app shell, providers
- `src/router/` for route definitions
- `src/layouts/` for major shells/layout containers
- `src/modules/` for business modules
- `src/components/` for shared UI
- `src/services/` for API/service wrappers
- `src/stores/` for application state
- `src/styles/` for design system and global styles
- `src/utils/` for helpers

Adapt this if the existing repository structure suggests a better fit.

---

## Done criteria

A task is not done until:
- the relevant docs were reviewed
- the implementation matches existing business intent
- the app still runs or the exact run changes are documented
- major flows affected by the task are validated
- changed files are summarized
- risks and remaining gaps are stated

OpenAI’s Codex guidance recommends giving clear “done when” criteria and practical repo instructions in `AGENTS.md`; follow that standard here. :contentReference[oaicite:11]{index=11}

---

## Codex behavior expectations

When working in this repo:
- ask clarifying questions only if absolutely necessary
- otherwise infer from code + docs
- prefer safe incremental changes
- preserve reviewability
- keep documentation aligned with implementation
- do not skip validation just because the task looks straightforward

If there is a conflict between code and docs:
- identify it explicitly
- state which source appears newer or more authoritative
- do not silently choose one without explanation

---

## First-task instruction for Codex

When asked to migrate the frontend to Vue 3, start by:
1. reading this file and the core docs
2. identifying the current frontend architecture
3. producing a migration plan only
4. waiting for implementation approval only if the user explicitly asked for a plan-first workflow; otherwise proceed in small safe phases after presenting the plan

Codex can read, edit, and run code in the selected directory, and OpenAI recommends using `AGENTS.md` plus plan-first prompting for complex repository work. :contentReference[oaicite:12]{index=12}
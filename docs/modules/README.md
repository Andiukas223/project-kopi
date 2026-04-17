# Module Documentation Index

Date: 2026-04-16

This folder is the current source of truth for Viva Medical workspace/module behavior. It keeps module rules separate from the broad project plan so future work can change one module without rewriting the whole roadmap.

Before editing module docs, read `../DOCUMENTATION_RULES.md`. It defines the required documentation method for future chats/agents: source-of-truth order, detail level, ownership rules, UI terminology, future module rules, production notes, and changelog expectations.

## Documents In This Folder

- `WORKSPACE_MODULES.md` - overview of the focused active workspace modules plus dormant prototype modules that should not receive new UX polish right now.
- `DOCUMENTS_MODULE.md` - detailed specification for the Documents repository: table columns, status logic, upload modal, generated/signed/uploaded files, search, and backend file custody.
- `WORK_ACTS_MODULE.md` - detailed specification for the Work Acts workspace: source service job context, one Work Act per job, template copying, work rows, generated PDF handoff, and Documents custody boundary.
- `TEMPLATES_MODULE.md` - detailed specification for the Templates workspace: user-facing Work List Template configuration, Umo editor, output layouts, merge fields, and where template modifications should be made.
- `WORK_EQUIPMENT_FUTURE_MODULE.md` - future Work Equipment module context: service/metrology tools, calibration-oriented fields, and how Templates/Work Acts should link to them.
- `COLLABORA_WOPI_INTEGRATION.md` - historical/decommissioned Collabora/WOPI decision record. Active runtime no longer uses Collabora.
- `LINKING_AND_PIPELINE_LOGIC.md` - detailed linking and workflow logic across the active modules and dormant prototype domains.

## Documentation Ownership Rules

- If the UI behavior of one workspace changes, update `WORKSPACE_MODULES.md`.
- If the Documents table, upload, generated file, signed file, preview, or search behavior changes, update `DOCUMENTS_MODULE.md`.
- If Work Act records, Work Act rows/options, source service job selection, generated PDF handoff, or Work Act routing changes, update `WORK_ACTS_MODULE.md`.
- If a reusable procedure/checklist template, output layout, FODT template, or merge-field rule changes, update `TEMPLATES_MODULE.md`.
- If service/metrology tool registry, calibration fields, or Work Equipment links change, update `WORK_EQUIPMENT_FUTURE_MODULE.md`.
- If anyone proposes reintroducing Collabora/WOPI, update `COLLABORA_WOPI_INTEGRATION.md` with a new explicit decision record before runtime code changes.
- If a change affects how records are linked across modules or how one workflow hands off to another module, update `LINKING_AND_PIPELINE_LOGIC.md`.
- If server launch, Docker production overrides, `.env`, reverse proxy, backup/restore, or go-live process changes, update `../PRODUCTION_DEPLOYMENT.md`.
- Keep `CURRENT_STATUS_AND_ROADMAP.md` as the short operational summary.
- Keep `PROJECT_PLAN.md` as the historical plan/backlog. New detailed rules should live here instead of expanding the project plan forever.
- Keep `../DOCUMENTATION_RULES.md` as the chat/agent documentation methodology. If future chats misunderstand how to document work, update that file instead of scattering new rules across module specs.

## Current Product Split

- `Templates` owns reusable procedure/checklist template configuration, Umo editing, and advanced output layout metadata.
- `Service` owns the simple job tracker.
- `Work Acts` owns one concrete Work Act per Service job, generated from service job context and copied Templates.
- Future `Work Equipment` will own service/metrology tool registry and calibration context; Templates currently only link to seed tool ids.
- Collabora/WOPI is decommissioned. Template content editing uses Umo, and Work Act editing stays in structured source screens.
- Source workflows create generated document records from structured records and reuse templates where applicable.
- `Documents` stores/searches/views/upload signed copies and owns document file custody.
- `Service`, `Contracts`, `Customers`, `Equipment`, and `Calendar` own active domain records.
- `Sales`, `Finance`, `Parts`, and `Reports` are dormant prototype modules and are hidden from the active sidebar.
- `Admin` owns users, permissions, feedback reports, and system oversight.

The most important design rule: a module should own one business concept clearly. If a flow crosses concepts, use explicit links rather than copying the same ownership into several modules.

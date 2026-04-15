# Documentation Rules For Future Chats

Date: 2026-04-16

This document defines how every future chat/agent must document changes in this project.
It exists so implementation knowledge does not stay only in chat history.

Core goal:

- A future chat should be able to continue work without reading the old conversation.
- Documentation must explain product logic, module ownership, UI behavior, data links, server/runtime impact, and known limitations.
- Documentation must use the same methodology as the project owner: detailed context first, clear module boundaries, no hidden assumptions, and enough detail to implement the next module safely.

## Required Reading Order

Before changing a module, read in this order:

1. `docs/DOCUMENTATION_RULES.md`.
2. `docs/CURRENT_STATUS_AND_ROADMAP.md`.
3. `docs/modules/README.md`.
4. The relevant module document in `docs/modules/`.
5. `docs/modules/LINKING_AND_PIPELINE_LOGIC.md` if records cross module boundaries.
6. `docs/PRODUCTION_DEPLOYMENT.md` if Docker, server, storage, reverse proxy, Collabora, WOPI, ports, TLS, backups, or env vars are touched.
7. `docs/CHANGELOG.md` to understand recent uncommitted decisions.

If the task is about a future module, also search for `*_FUTURE_MODULE.md`.

## Documentation Is Part Of Done

A change is not complete until documentation is updated.

For every meaningful change, update:

- The module doc that owns the behavior.
- `docs/modules/WORKSPACE_MODULES.md` if the visible workspace/module behavior changed.
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md` if ownership, linking, generated document flow, or handoff logic changed.
- `docs/CURRENT_STATUS_AND_ROADMAP.md` if the current implemented state or next-step roadmap changed.
- `docs/CHANGELOG.md` under `Unreleased`.
- `README.md` if a new important doc/runbook/module doc was created.
- `docs/modules/README.md` if a module doc was created, renamed, or its ownership changed.

Do not leave documentation for later unless the user explicitly asks to pause.

## Source Of Truth Rules

Each business concept must have one owner document.

Use this map:

- Overall current state and next steps: `docs/CURRENT_STATUS_AND_ROADMAP.md`.
- Historical plan/backlog: `docs/PROJECT_PLAN.md`.
- User-visible module ownership overview: `docs/modules/WORKSPACE_MODULES.md`.
- Cross-module links, ownership, and pipeline flow: `docs/modules/LINKING_AND_PIPELINE_LOGIC.md`.
- Documents repository/file custody: `docs/modules/DOCUMENTS_MODULE.md`.
- Work Act concrete source drafts and Work Act rows: `docs/modules/WORK_ACTS_MODULE.md`.
- Reusable Templates and Output Layouts: `docs/modules/TEMPLATES_MODULE.md`.
- Collabora/WOPI advanced editor integration: `docs/modules/COLLABORA_WOPI_INTEGRATION.md`.
- Future service/metrology tool registry: `docs/modules/WORK_EQUIPMENT_FUTURE_MODULE.md`.
- Production/private server runbook: `docs/PRODUCTION_DEPLOYMENT.md`.
- Web control scripts: `docs/VM_WEB_CONTROL.md`.
- Tomis research/crawl rules: `docs/TOMIS_CRAWL_PLAYBOOK.md`.
- Viva Medical website knowledge base: `docs/VIVAMEDICAL_WEBSITE.md`.
- Important change history: `docs/CHANGELOG.md`.

If a new module is planned but not implemented yet, create `docs/modules/<MODULE_NAME>_FUTURE_MODULE.md`.
If a new module is implemented, create `docs/modules/<MODULE_NAME>_MODULE.md`.

## Project Owner Methodology

The project owner works by building detailed context module by module.
Documentation must therefore capture:

- What the user asked for.
- What the final product decision is.
- What the module owns.
- What the module explicitly does not own.
- What the UI should look like and how it should behave.
- Which data fields are stored.
- Which links are ids and which are only display names.
- How the module connects to other modules.
- Which part is implemented now.
- Which part is future/planned.
- What must be checked after changes.

Never document only "we added a feature".
Always document how the feature should be used and where future implementation should continue.

## Detail Level Required

Every module document must be detailed enough that a future chat can implement changes without asking for old chat context.

Include these sections when relevant:

- Purpose.
- User-facing terminology.
- Ownership and non-goals.
- Current UI behavior.
- Current data fields.
- Workflow.
- Links to other modules.
- Generated document behavior.
- Backend/API/runtime behavior.
- Production/server impact.
- Security or privacy assumptions.
- Known limitations.
- Future work.
- Regression checklist.
- Related source files if helpful.

If a feature affects documents/PDF generation, also document:

- Source record.
- Template/layout used.
- Payload fields.
- Generated file ownership.
- Preview/download behavior.
- Signed file upload/custody.
- Edit route back to source module.

## Current Terminology Rules

Use project terms consistently.

Current locked terms:

- `Templates`, not `Template Generation`, for the user-facing reusable template workspace.
- `Work List Template` for reusable service/procedure templates.
- `Output Layouts` for advanced print/export layout templates.
- `Work Acts` for concrete service act source drafts.
- `Work rows` or `Work Act rows/points` only in `Work Acts`, not as active editable rows in `Templates`.
- `Equipment` means customer/customer-site devices being serviced.
- `Work Equipment` means service/metrology tools used by engineers, for example multimeter, oscilloscope, safety analyzer, pressure gauge, thermometer, flow meter, load-test set.
- `searchable combobox` or `autocomplete dropdown` for a field where the main input is also the search field.
- `checkbox list` only when actual checkboxes are visible.
- `Advanced editor` means Collabora CODE through the local WOPI integration.
- `Documents` owns document/file custody.

If the user uses an imprecise term, correct the naming gently in the implementation and docs.
Example: if the user asks for a "dropdown where you type in the main field", document it as `searchable combobox/autocomplete dropdown`.

## UI Documentation Rules

When UI changes, document exact behavior, not only component names.

Always describe:

- Field labels.
- Whether a field is input, select, searchable combobox, checkbox list, table, modal, tab, or button.
- Whether data saves instantly or only after `Save`.
- What `Cancel` does.
- What happens when there are no matches.
- Whether the control supports one value or multiple values.
- Whether selected values are shown as text, chips, highlighted rows, hidden ids, or table rows.
- How mouse use works.
- How search/filtering works.
- Which values are examples only and which are canonical.

If the user provides a screenshot, document the intended control type and behavior from the screenshot.

Do not call a control a dropdown if it is actually a full checkbox panel.
Do not call a control a checkbox list if selection is done by clicking dropdown rows.

## Data And Linking Rules

Document data as stable business objects.

Always specify:

- Field name.
- Field meaning.
- Whether it is source of truth or copied snapshot.
- Whether it should use stable id or display name.
- Which module owns the record.
- Which modules may display/link to the record.

Prefer stable ids:

- `customerId`
- `equipmentId`
- `jobId`
- `quotationId`
- `documentId`
- `generatedDocumentId`
- future `workEquipmentId`

Display names are allowed for UI, but should not be treated as ownership.

## Ownership Boundary Rules

Do not duplicate ownership across modules.

When documenting a cross-module flow, write:

- Owner module.
- Consumer module.
- Link fields.
- What can be edited where.
- What cannot be edited there.
- What happens after a source record changes.

Examples:

- `Templates` can define reusable template body and applicability links.
- `Work Acts` owns concrete Work Act rows/points.
- `Documents` owns generated/signed/uploaded document custody.
- Future `Work Equipment` owns service/metrology tool serial/calibration details.

If a module shows another module's data, document it as a link/display, not ownership.

## Future Module Rules

Create a future module document when the user describes logic for a module that will be built later.

Future module docs must include:

- What the future module means.
- What it is not.
- Example records.
- Planned fields.
- Planned statuses.
- Current temporary seed data or placeholder implementation.
- Current module links.
- Future links.
- Non-goals.
- Implementation phases.
- Regression checklist for when it becomes real.

The goal is to give the future chat enough context to build the module without re-asking the same product questions.

## Production And Runtime Rules

If a change affects server setup, document it in `docs/PRODUCTION_DEPLOYMENT.md`.

This includes:

- Docker services.
- Docker networks.
- Ports.
- Reverse proxy paths.
- TLS/HTTPS.
- `.env` values.
- Secrets.
- Volumes/storage.
- Backup/restore.
- Health checks.
- Deployment commands.
- Migration steps.
- Collabora/WOPI host allowlists.
- Anything that must be different between local/dev and production/private server.

For this project, production/private server docs are important even if the app is currently personal/private use.
Do not assume a local-only decision is safe for production.

## Collabora And Advanced Editor Rules

If advanced editor behavior changes, update `docs/modules/COLLABORA_WOPI_INTEGRATION.md`.

Document:

- Which module opens the editor.
- Session creation endpoint.
- WOPI source type.
- Payload contract.
- File format.
- Save behavior.
- PDF export behavior.
- iframe/proxy path.
- Storage path.
- Known Collabora limitations.
- Local-only vs production assumptions.

If the UI button changes from FODT download to PDF download, say so explicitly.

## Changelog Rules

Every meaningful change needs a short entry under `docs/CHANGELOG.md` -> `Unreleased`.

Changelog entries should mention:

- What changed.
- Which module changed.
- Important product decision.
- New doc created or updated.
- Runtime/deployment impact if any.

Keep changelog concise, but not vague.
Good: "`Templates` Equipment/Hospitals/Work Equipment changed to searchable comboboxes; checkbox lists removed for those fields."
Bad: "Updated UI."

## Current Status Rules

`docs/CURRENT_STATUS_AND_ROADMAP.md` must stay a short operational truth.

Update it when:

- A module becomes implemented.
- A module is renamed.
- A route/sidebar behavior changes.
- A feature moves from future to current.
- A production/runtime capability changes.
- The next-step roadmap changes.

Do not put full module specs there.
Point to module docs for detail.

## Module README Rules

`docs/modules/README.md` is the module documentation index.

Update it when:

- A module doc is added.
- A future module doc is added.
- Ownership of a module changes.
- A module doc becomes the source of truth for a behavior.
- A new cross-module rule should tell future chats which doc to update.

## README Rules

Root `README.md` should list important docs and run commands.

Update it when:

- A new important doc or runbook is added.
- Launch/run instructions change.
- Docker service list changes.
- Production/server guidance changes.

Do not duplicate full module docs in root README.

## Decision Record Rules

When a product decision is made, document it as a decision, not just implementation.

Use this shape inside the relevant module doc:

```text
Decision:
- What was decided.
- Why.
- What this replaces.
- What future work must respect.
```

Examples:

- Templates no longer owns Work rows.
- Work Equipment means service/metrology tools, not customer devices.
- Collabora CODE is acceptable for local/personal/private prototype use, not a support/SLA promise.

## Regression Checklist Rules

Every detailed module doc should end with or contain a regression checklist.

Checklist items should be concrete:

- "Opening sidebar `Templates` renders the configurator."
- "`Equipment` searchable combobox filters by equipment name, serial, or hospital."
- "`Work rows` are not visible in Templates."
- "`Download PDF` exports current Collabora session as PDF."

Avoid vague checklist items:

- "UI works."
- "Docs okay."
- "Test feature."

## Verification Notes

When the implementation is done, final response should say what was checked.

Use exact commands when useful:

- `node --check src/js/render.js`
- `node --check src/js/interactions.js`
- `docker compose ps`
- Playwright UI checks.

If something was not checked, say so.
Do not imply browser testing happened if it did not.

## Stale Documentation Cleanup

When a concept is renamed or moved:

- Update active docs.
- Add compatibility notes only if old names still exist in code/state/routes.
- Remove old terminology from active behavior descriptions.
- If historical changelog entries keep old terms, leave them unless they create confusion.

Example:

- User-facing `Template Generation` became `Templates`.
- Internal compatibility alias may remain, but docs should call the module `Templates`.

## Writing Style

Use clear, direct technical English in docs unless the file is already Lithuanian.

Rules:

- Prefer ASCII.
- Avoid marketing language.
- Avoid vague words like "somehow", "maybe", "probably".
- Mark future work as `Future`, `Planned`, or `Not implemented yet`.
- Mark prototype-only behavior clearly.
- Write enough context, but do not paste chat transcripts.
- Use code identifiers exactly as they appear in code.
- Keep user-facing terminology consistent with the UI.

Lithuanian user notes can be summarized in English if that helps future chats parse the project faster.
If Lithuanian terms are important, add them as terminology notes.

## Documentation Workflow For Each Chat

Use this workflow:

1. Read relevant docs before editing.
2. Identify owner module and linked modules.
3. Implement code changes.
4. Update owner module doc.
5. Update cross-module docs if ownership/linking changed.
6. Update deployment docs if runtime/server changed.
7. Update changelog.
8. Update indexes if new docs were created.
9. Run appropriate checks.
10. In final response, list code changes, docs updated, and checks run.

## Definition Of Done For Documentation

Documentation is done when:

- A future chat can find the source of truth.
- The product decision is explicit.
- Current behavior and future behavior are separated.
- UI terms match the actual UI controls.
- Data ownership is clear.
- Cross-module links are clear.
- Server/runtime impact is documented when relevant.
- Regression checklist exists or was updated.
- Changelog has an entry.


# Current Status And Roadmap

Date: 2026-04-16

Latest pushed implementation baseline noted before the current uncommitted review pass: `28fd1dd refactor: split contracts from sales and finance`.

This document is the current operating truth for the Viva Medical web prototype. It summarizes what has been built, what product decisions are locked for now, what is still missing, and how the next implementation steps should be done.

## Active Working Rules

- Do not run `git commit` or `git push` automatically. Commit/push only when the user explicitly asks for it.
- Code comments must be written in English. User-facing UI copy may follow the product language/context, but implementation comments stay EN so future chats can parse the code quickly.
- Keep documentation current after meaningful implementation work, but leave git changes uncommitted until the user approves commit/push.
- LT/EN language support is now scaffolded, not complete: use `src/js/i18n.js` and `state.language` for new global UI copy, then revise module-level copy in later passes.
- User-facing Owner means creator initials: the person who produced/added the record. Admin user creation generates initials from full name for later record ownership display. Document `owner` can still be an internal queue/module bucket (`Service`, `Sales`, `Finance`) for filters and routing; show `createdByInitials` to users.

## Current Product Shape

The project is now a Docker-runnable internal operations prototype for Viva Medical. It is not a landing page and not only a static mockup. It models daily work across Service, Sales, Finance, Logistics, Warehouse, Office, Manager, and Admin roles.

The app currently runs as:

- `web`: nginx static frontend, served on `http://localhost:8080`.
- `document-service`: Node.js + Carbone + LibreOffice service, served behind nginx under `/api/documents/`.
- `document-service/generated`: generated document output.
- `document-service/storage`: persistent local runtime storage for uploaded files, feedback screenshots, and file registry JSON. Runtime contents are ignored by git; only `.gitkeep` is tracked.

Server deployment is now documented separately in `docs/PRODUCTION_DEPLOYMENT.md`. Treat the current compose setup as local/private-server prototype baseline until a production override, HTTPS reverse proxy, secrets, backups, and backend auth/storage blockers are completed.

Frontend now has a Vue 3/Vite app shell with a compatibility layer that hosts the existing vanilla JavaScript module renderer. Backend is still a prototype document/feedback service, not the final app API.

Collabora/WOPI was removed on 2026-04-16. Do not preserve or reintroduce Collabora editor behavior during the Vue migration unless there is a new explicit product decision.

Key project/runbook docs:

- `docs/DOCUMENTATION_RULES.md` - mandatory documentation method for future chats/agents: reading order, source-of-truth rules, module doc structure, UI terminology, ownership, production notes, changelog, and definition of done for docs.
- `docs/FRONTEND_ARCHITECTURE.md` - current Vue 3/Vite frontend architecture, legacy compatibility boundary, and migration rules.
- `docs/PRODUCTION_DEPLOYMENT.md` - server configuration, launch, backup/restore, health checks, no-Collabora runtime notes, and go-live checklist.

## Implemented Modules

Detailed module documentation now lives in `docs/modules/`:

- `docs/modules/WORKSPACE_MODULES.md` - current workspace module ownership and UI rules.
- `docs/modules/DOCUMENTS_MODULE.md` - detailed Documents repository/file custody behavior.
- `docs/modules/WORK_ACTS_MODULE.md` - detailed Work Acts behavior, one-job-one-Work-Act rule, and Work Act/Templates/Documents boundary.
- `docs/modules/TEMPLATES_MODULE.md` - detailed Templates and Output Layouts behavior.
- `docs/modules/WORK_EQUIPMENT_FUTURE_MODULE.md` - future Work Equipment/metrology tool module context.
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md` - historical/decommissioned Collabora/WOPI decision record.
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md` - cross-module linking and pipeline logic.

### App Shell

- Fixed topbar, sidebar, main workspace, and role switcher.
- Topbar, sidebar navigation, theme toggle, language toggle, and active module highlighting are Vue-owned shell components.
- Major active modules now have Vue Router routes (`/service`, `/work-acts`, `/contracts`, `/documents`, `/templates`, `/customers`, `/equipment`, `/calendar`, `/admin`). Vue-owned routes render their module components directly; non-migrated routes still host the legacy module renderer.
- Shell state is managed through a small Vue shell store that syncs router state with the existing legacy `state.page` during gradual migration.
- `Documents` is now a Vue-rendered module route. It still uses the existing document pipeline handlers for upload/generation/edit routing/preview actions until that business logic is moved behind Vue services.
- The old legacy Documents page renderer in `src/js/render.js` has been removed. Legacy support for Documents is now limited to shared overlays and delegated document handlers.
- `Templates` is now a Vue-rendered module route for the active Work List Template configurator. The old legacy Templates landing renderer and unused new/filter/archive/start-work-act handlers have been removed. The route still uses existing delegated `data-wlt-*` handlers for save/delete/cancel, combobox behavior, and visual editor commands until Template state/actions are moved into Vue services.
- `Work Acts` is now a Vue-rendered module route for the active Work Act source workspace. It still uses delegated `data-work-act-*` handlers for create/open, equipment changes, template selection/application, row edits, report options, and PDF draft creation until Work Act actions are moved into Vue services.
- Other feature module pages still render through the legacy compatibility host until each module is migrated.
- Shared Vue UI primitives now exist for buttons, fields, form grids, panels, stat cards, status chips, table wrappers, modal shells, and wizard shells. They reuse existing CSS class names so module migration can be incremental.
- Umo is the active browser editor integration for template content. The old disabled shell-level advanced editor boundary has been removed, and no Collabora/WOPI runtime behavior, endpoints, proxy paths, or UI launch buttons are active.
- The unused `legacyStore` compatibility shim has been removed; active Vue/legacy synchronization is handled directly by `src/stores/shellStore.js`.
- Topbar wordmark subtitle is `Informational system` in EN and `Informacine sistema` in LT.
- Light and dark mode with persisted theme state.
- Theme toggle is fixed near the bottom-left and centered within the `Workspace` sidebar column, using `☀️` / `🌙` labels.
- LT/EN language toggle foundation for topbar/sidebar/global shell labels.
- Sidebar navigation now shows only module names. Initials/icons and yellow status/count badge bubbles are intentionally removed from the active shell.
- The top non-functional `Workspace` sidebar label is hidden so the sidebar starts directly with module navigation.
- Docker/web control is intentionally outside the web UI through `vm-web-control.ps1` / `.cmd`.
- `Report issue` is global and available from every page.

### Command Center

- Dormant prototype only; hidden from the active sidebar.
- The current default/start workspace is `Service`.
- The old sidebar Reminders strip is removed from the active shell. Reminder/notification logic is not considered connected enough yet and will be redesigned later.
- Future overview/command logic should be designed from scratch instead of polishing the old Command Center screen.

### Active Module Focus

Current active sidebar modules are intentionally limited to the workflows that will be refined now:

- Service
- Work Acts
- Contracts
- Documents
- Templates
- Customers
- Equipment
- Calendar
- Admin

`Sales`, `Finance`, `Parts`, and `Reports` are no longer active sidebar modules. Their prototype code/data can remain as dormant reference state, but new UX polish should target the active module set above.

### Service

- Service is now the simple job tracker.
- New service job creation is a single focused form, not the old 8-step A/B/C/D routing wizard.
- Required job fields: Job ID, Hospital/customer, System, Contact name, Contact number, Short problem description, Planned visit date, Responsible engineer.
- Service job statuses are intentionally simple: `Open`, `Waiting signature`, `Done`, `Cancelled`.
- The Service tracker summary intentionally shows only `Open` and `Waiting signature`.
- Service has a compact search/filter bar for job text, status, customer, and planned visit date. Text/date filters apply with `Enter` or the `Search` button, and the date field supports partial dates or calendar picker selection.
- One Service job has exactly one Work Act.
- The selected job panel shows only Service job fields. Work Act specifics and create/edit controls stay in the `Work Acts` workspace.
- Work Act generation moves the linked job to `Waiting signature`.
- Signed Work Act upload confirmation in `Documents` marks the linked job `Done`.
- PM scheduling and parts/approval flows remain prototype reference logic and should not drive the active Service UX until redesigned.

### Sales

- Dormant prototype only; hidden from the active sidebar.
- Quotation pipeline with offer/approval/handoff detail tabs remains in old code as reference.
- New quotation form.
- Sales owns commercial offers, customer approval, and service handoff only.
- Contract upload/configuration moved to `Contracts`.
- Invoice creation/upload/payment status moved to `Finance`.

### Contracts

- Signed contract intake opens the shared document upload flow preselected as `Contract`.
- Contract register and detail/configuration panel.
- Admin can configure type/status/value/consumed/remaining/start/end/PM visits per year/notes.
- Contracts are the source for PM/install/service agreement specifications consumed by Service and Calendar.

### Finance

- Dormant prototype only; hidden from the active sidebar.
- Invoice register for created and uploaded invoices remains in old code as reference.
- Upload invoice opens the shared document upload flow preselected as `Invoice`.
- Uploaded invoice files create invoice register rows.
- `Generate invoice`, `Mark paid`, `Mark cancelled` remain prototype actions.
- Payment status and invoice links are still frontend/demo-state logic.

### Documents

Documents is now a repository and file custody module, not the main template editor.

Current implementation:

- The Documents route is rendered by Vue 3 components for filters, table, upload modal, and Work Act completion confirmation.
- Existing `documentPipeline.js` behavior still owns document generation, signed/external upload mutation, file-registry API calls, source edit routing, print preview actions, warranty sync, and audit updates.
- The generated document print preview and feedback overlays are still legacy-rendered overlays mounted beside the Vue Documents route during migration.

Implemented behavior:

- Search/filter table by text, type, customer, creator initials, and a single compact created-date query. The created-date filter accepts partial dates (`2026`, `2026-04`, `2026-04-15`) or a calendar picker selection. Queue and status filters were removed from the active UI to reduce clutter.
- Table contains the important document custody fields directly; the old selected document side panel is no longer needed as the primary source of information. Documents index does not show delivery status; delivery belongs to Parts/Shipping flows. The table columns are `Reference`, `Type`, `Customer`, `Job status`, `Created`, `Status`, `Action`. The document register focuses on one upload `Status`: before signed/uploaded file exists it shows a yellow `Upload signed` action, and after upload it shows a green `Download signed` link. File names are not shown as a separate index column.
- The repository table shows document `Created` date instead of `Due`; creation/upload date is the daily reference point. Internal due dates can still support SLA/overdue reminders.
- Documents index rows no longer show the old red overdue stripe; overdue remains a reminder/overview concern, while the table focuses on upload status and actions.
- `View` opens the generated document through PDF/print preview or the generated file `previewUrl`. The table `Status > Download signed` action is reserved for the uploaded signed copy.
- `Edit` routes to the correct source workspace where possible:
  - Work Act -> `Work Acts`
- Retired/inactive source modules stay in Documents until their source workspace is reactivated.
- Work Act / legacy Service Act `Edit` opens the exact linked Work Act configuration page. Legacy/demo Service Act rows without a Work Act source create a minimal linked Work Act shell instead of landing on an empty Work Acts page. It does not open a Collabora editor.
- `Download signed` appears in the table `Status` column when a signed/uploaded file is available. Generated-file download remains available from preview/source contexts rather than as a separate Documents index action.
- `Reject` is not exposed in the Documents index action column.
- The generic `Advance` button was removed.
- Archiving is removed from the active Documents workflow for now.
- Generated documents expose the `Upload signed` action directly in the table `Status` column. The action opens a centered upload modal with drag-and-drop/click file selection plus `Upload` and `Cancel`.
- After a signed copy is uploaded, the table `Status` column changes to green `Download signed`; `Finish` / `DONE` is not exposed in the Documents index action column.
- If the signed upload is for a Work Act, a completion confirmation opens. Confirming marks the linked Service job `Done`; declining keeps the job `Waiting signature`.
- Uploaded signed copies are stored through `document-service` and linked back to the same document record.
- Nginx allows larger document uploads with `client_max_body_size 20m`.
- The table reference uses the source/job reference (`VM-SV-...`, `QTE-...`) instead of exposing the internal `DOC-...` as the primary daily identifier. Internal document IDs remain for system links and logs.
- User-facing Owner is the creator initials (`AL`, `VK`, `RP`). Internal module queue ownership remains in data for routing, but it is no longer exposed as an active Documents filter.
- Newly created document drafts auto-generate a PDF through `document-service` by default, with file registry metadata, preview URL, and download URL. Manual generate remains available as a regenerate action.
- Document workflow status is normalized from file state: generated file -> `Signature` / `Needs signed upload`, signed file -> green `Download signed` in Status. Persisted `Auto generating` states are reset on load and queued again so documents do not get stuck without a generated file.
- Mock preview artifacts are not treated as real generated files in the repository. A document must have a `document-service` download/preview URL before it can signal signed-upload readiness.
- Documents table text remains selectable for copy/paste; row selection must not clear an active text selection.
- Document types without a dedicated output layout use `tpl-generic-document` / `generic-document.fodt` until a specific layout is designed.

Current active document lifecycle:

```text
Draft / generated draft
  -> Preview or download generated file
  -> Collect signature outside the system
  -> Upload signed copy into the same document record
  -> Status changes to green Download signed
  -> For Work Acts, confirm whether the linked Service job is Done
```

Reject path is not exposed in the Documents index table:

```text
Review / Customer / Signature
  -> Reject with required comment
  -> Rejected
  -> Back to Draft
```

Deferred:

- Archive/restore for documents.
- Full DB-backed file versions.
- Real role permission checks.
- Legal retention policy.
- Real e-mail sending.

### Templates

Templates is the reusable Work List Template configuration workspace. It is separate from Documents.

Current landing screen:

- Work List Template configurator.
- The active route is rendered by Vue 3 components in `src/modules/templates/`.
- Fields: Company, Entry person, Template name, Service type.
- Link configuration: searchable combobox/autocomplete dropdowns for Equipment, Hospitals, and Work Equipment. The field itself acts as the search input; options are clicked in the dropdown rows, not selected through a checkbox list.
- Actions: Save, Delete, Cancel.
- Same-page Umo editor for template content.
- Collabora/WOPI advanced editor actions were removed. Template editing stays in structured fields plus Umo.
- Work rows are no longer edited in Templates. Concrete Work Act points/rows belong to the `Work Acts` module and are appended to generated Work Act documents.
- Output layout metadata, merge fields, and FODT/template-file concerns remain separate from the Work List Template landing and are preserved as existing data/helper behavior until a dedicated Vue admin surface is planned.
- Template applicability options are now owned by the Vue Work Acts route/view model; the old matching legacy helper in `src/js/render.js` has been removed.

### Work Acts

Work Acts is the concrete Work Act source workspace. It is separate from Templates.

Current state:

- Sidebar module `Work Acts` exists.
- Internal route/page id is `workacts`.
- The page is rendered by Vue 3 components in `src/modules/workActs/` and remains the concrete Work Act workspace for the selected Service job.
- The old legacy Work Acts route renderer in `src/js/render.js` has been removed. Compatibility now means delegated Work Act handlers, preview/output helpers, and document pipeline integration only.
- One Service job has exactly one Work Act.
- `Documents -> Edit` for Work Act routes to `Work Acts`.
- Detailed implementation handoff lives in `docs/modules/WORK_ACTS_MODULE.md`.

Work Acts implemented:

- Tomis-aligned grouped/list view.
- Source service job selector.
- `Create Work Act` / `Open Work Act` behavior.
- Equipment auto-prefill from job and manual equipment search/dropdown add/remove.
- Template picker.
- Work Description field.
- Work rows/checklist editing.
- Report options/print settings, including equipment working, ready for use, hygiene, signature, working hours, travel hours, started/completed time, system identity/name.
- `Create PDF draft` / `Update PDF draft`, then `Generate from template`.
- Generated Work Act PDF sets the linked Service job to `Waiting signature`.
- Work Act edits stay in structured Work Act fields and rows.
- Generated PDF/preview remains the review path for Work Act documents.
- Generated file version metadata (`fileId`, `version`, `versionLabel`, `downloadUrl`, `previewUrl`).
- Source-aware preview/download/email audit.

Defect Acts implemented:

- Source service job selector.
- Defect Act draft creation.
- Defect description, engineer findings, recommended correction, risk, customer acknowledgement.
- Actual Visits grid with DA/WA, planned start, work hours, travel hours, completed, comments.
- Document draft creation.
- Direct `Generate PDF file` after document draft creation.
- Generated file version metadata (`fileId`, `version`, `versionLabel`, `downloadUrl`, `previewUrl`).
- Source-aware preview/download/email audit.
- Output template conditional rendering.

Commercial Offers implemented:

- Source quotation selector.
- Commercial offer draft creation.
- Tomis-style fields: profile, group, hospital/system, side, contract, recipient, fax, invoice, currency.
- Header/footer text blocks.
- Line items, pricing, validity, payment terms, notes.
- Active/archived/price missing style filters.
- Document draft creation.
- Direct `Generate PDF file` after document draft creation.
- Generated file version metadata (`fileId`, `version`, `versionLabel`, `downloadUrl`, `previewUrl`).
- Source-aware preview/download/email audit.
- Output template conditional rendering.

Templates implemented:

- Selected-template configurator based on the Tomis Work List Template screen.
- Template picker for existing procedure/checklist templates.
- Template name, company, entry person, service type, and description metadata.
- Linked service types, equipment, hospitals, work equipment.
- Work equipment now means service/metrology tools such as digital multimeter, oscilloscope, safety analyzer, pressure gauge, thermometer, flow meter, or load-test set. It is seed data for a future `Work Equipment` module.
- Applicability logic for Work Act template selection.
- Delete action for prototype template records.
- Umo editor MVP:
  - same-page document editor
  - HTML/text/json editor snapshots
  - merge-field insertion
  - visual HTML persistence
  - save/load through `document-service`
- Template applicability metadata remains a reusable source. Concrete Work Act rows now belong to Work Acts. The visual editor is for controlled template body/layout micro edits, not for forcing daily users to lay out documents from scratch.

Output Layouts current state:

- Output template seed data and blueprint metadata remain in `src/js/data.js`.
- Carbone template mapping and `.fodt` files remain in `document-service`.
- Conditional `.fodt` rendering remains for Work Act report options, Commercial Offer sections, and Defect Act visits/findings/correction/risk.
- The old frontend Documents-side output-layout editor/mock panel has been removed as dead legacy code after the Vue migration.
- A future output-layout editor should be rebuilt as a dedicated Vue/admin surface, not restored as the old `Generate mock` / `Edit template` panel.

### Generated Document Preview And Delivery

Implemented Tomis-inspired preview flow:

- Integrated print preview overlay.
- PDF inline preview for service-generated PDF files.
- Mock A4 pages for generated preview fallback.
- Zoom controls.
- Print and quick print audit actions.
- Export/download action.
- Email compose panel with recipient, subject, message, attachment.
- Current email action records an audit event; it does not send via SMTP/API yet.
- Generated files have separate `downloadUrl` and `previewUrl` so preview does not force a browser download dialog.

### Feedback / Bug Reporting

Implemented:

- Global `Report issue` action.
- Native browser screen capture prompt is used where possible. Browser security means this permission cannot be silently persisted for normal web apps.
- DOM screenshot fallback exists but native capture is preferred.
- User selects a screen area in a Windows snipping style flow.
- Screenshot is attached as admin-only additional info.
- Red pencil annotation canvas after capture.
- Short comment required.
- Report context includes page, role, selected document/template/job/work act/equipment where available.
- Admin-only queue in Admin page.
- Backend persistence through:
  - `POST /feedback/reports`
  - `GET /feedback/reports`
  - `PATCH /feedback/reports/:id`
  - `/feedback/attachments/:fileName`
- Status/assignee workflow exists as prototype logic.

### File Storage Foundation

Implemented in `document-service`:

- `files.json` registry.
- Generated document file records.
- Uploaded document file records.
- Uploaded signed-copy file records.
- Output template upload records.
- Feedback screenshot/annotation attachment records.
- SHA/checksum, size, MIME/type-ish metadata, owner/source links, `downloadUrl`, optional `previewUrl`.
- Storage folder is mounted in Docker and ignored by git.

Not implemented yet:

- PostgreSQL-backed file metadata.
- Object storage/S3/Azure style backend.
- Signed document version chains.
- Permission checks per file.
- Retention and deletion rules.
- Virus/malware scanning.
- Backup and restore.

## Product Decisions Locked For Now

- `Documents` is a repository/search/file-custody module.
- `Work Acts` is the concrete Work Act source/generation module.
- `Templates` is the reusable procedure/checklist and output-layout configuration module.
- User-facing equipment/procedure checklists are called `Templates` in the web UI. Internal notes may still refer to Tomis `Work List Templates` when describing the old system.
- `Output Layouts` are advanced/admin printable form layouts for Carbone/LibreOffice generation; they should not dominate the daily document creation flow and may later move under Admin/settings.
- Daily users should normally generate documents from structured records and prepared templates, not design each document from scratch.
- Daily users still need access to the controlled Umo editor for micro edits, user-specific templates, and production bug/workaround capture.
- Admin is an overseer for users, roles, permissions, pipeline progress, and exception queues, not just a final approver.
- Archive in Documents is deferred.
- The main document return path is: generate -> preview/download generated file -> collect signature -> upload signed copy -> green Download signed in Status.
- Page/document previews should stay white even in dark mode because they represent printable output.
- Runtime files and captured screenshots should not be committed to git.

## Known Technical Debt

- Frontend state is still mostly demo/localStorage state.
- Some old docs and demo labels still reference archival concepts for non-document modules. Document archiving itself is deferred.
- No real authentication or authorization.
- No production database.
- No migrations.
- No automated end-to-end test suite checked into the repo.
- Browser screen capture must ask permission every time in normal web security model.
- Output template logo is still text/placeholder in `.fodt`; proper embedded logo asset pipeline is needed.
- Email delivery is audit-only.
- Existing demo data contains placeholder hospital requisites that must be verified before real use.

## Roadmap

### B-38 - Defect Act / Commercial Offer Generation Parity - Done

Completed 2026-04-15.

- Defect Act and Commercial Offer source panels now expose generated file/version metadata.
- Both panels show direct `Generate PDF file`, `Open preview`, and `Download` actions once a document draft exists.
- Delivery audit entries from preview/download/print/export/email are mirrored back onto the source record.
- Generated Documents records and source records share the same file registry object.
- Verified with Docker build, container-based JS syntax checks, document-service health check, web HTTP 200, and direct Defect Act / Commercial Offer PDF generation smoke tests.

### B-39 - Document Repository Workflow Polish

Goal: make Documents feel like a simple work queue, not a pipeline admin tool.

Plan:

1. Keep table-first layout.
2. Add clearer row signals:
   - `Upload signed`
   - green `Download`
3. Add upload affordance next to the exact matching document row.
4. Add better empty states for filtered searches.
5. Add a concise row audit popover or expandable row for file history.
6. Keep archive hidden until a future retention design exists.

### B-40 - Finance Invoice Register Polish

Goal: Finance should be the single intuitive place for invoice files and payment status.

Plan:

1. Add Finance filters/search similar to Documents.
2. Improve uploaded invoice metadata: amount, invoice number, due date, payment terms.
3. Link invoices back to source quotation/job/document without exposing invoice actions in Sales.
4. Add paid/signed invoice upload flow if needed.
5. Add tests for document upload -> invoice register -> payment status.

### B-41 - Umo Template Editor V2

Goal: harden the Umo-based editor experience while keeping structured generation safe.

Plan:

1. Continue Tomis crawl focused on editor behavior and save/copy semantics.
2. Keep Umo as the primary browser editor target unless a new explicit product/runtime decision replaces it.
3. Add table editing, stronger merge fields, image/logo placeholders, page breaks, signature placeholders.
4. Add autosave draft, dirty-state warning, revert, duplicate as personal template.
5. Add version history and compare/diff.
6. Keep concrete Work Act rows canonical in Work Acts for automated generation.

### B-42 - Backend Data Model And Auth

Goal: replace demo state with production storage.

Plan:

1. Introduce PostgreSQL.
2. Add Prisma or equivalent migration tool.
3. Model users, roles, permissions, customers, equipment, jobs, documents, templates, generated files, feedback reports, audit events.
4. Add auth/session layer.
5. Add permission checks per route and per UI action.
6. Build seed data from current `data.js`.
7. Keep `document-service` as a separate rendering/file service or merge behind the same API gateway after architecture review.

### B-43 - Production File Custody

Goal: make all uploaded/generated files reliable and auditable.

Plan:

1. Move `files.json` metadata to DB.
2. Keep local storage for dev; add object storage adapter for production.
3. Add file version chains:
   - generated draft
   - exported PDF
   - signed upload
   - corrected replacement
4. Add checksum validation, MIME validation, size limits, retention flags.
5. Add permission checks and admin-only bug attachment access.
6. Add backup/restore plan.

### B-44 - Real Email Delivery

Goal: make preview `E-Mail As PDF` usable in production.

Plan:

1. Decide SMTP/API provider.
2. Store outbound email drafts and sent audit events.
3. Support attachments from file registry.
4. Add recipient autofill from customer contacts.
5. Add send failure/retry status.
6. Keep "open local mail client" as optional fallback if desired.

### B-45 - Tomis Deep Crawl Completion

Goal: finish reverse-engineering enough of Tomis to avoid guessing.

Plan:

1. Follow `docs/TOMIS_CRAWL_PLAYBOOK.md`.
2. Crawl Work Acts, Defect Acts, Commercial Offers, Templates, Output Layouts, document upload, preview, email/export, signatures, permissions, and admin/user behavior.
3. Record field names, list columns, tabs, hidden options, status changes, generated output, and error/loading behavior.
4. Update `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md` after every crawl session.
5. Convert findings into backlog items only when they improve our product direction.

### B-46 - LT/EN Language Plan

Goal: align UI language and generated document language.

Plan:

1. Keep templates Lithuanian for current local work.
2. Decide UI language strategy: LT, EN, or mixed during prototype.
3. Prepare a translation dictionary or i18n layer before full production.
4. Do not translate legal/generated document text casually; template text needs controlled approval.

### B-47 - Production Readiness

Goal: prepare the system for real users.

Plan:

1. Add automated smoke tests for critical flows.
2. Add Playwright flows for document generation, signed upload, Status-column download, feedback capture, and admin queue.
3. Add logging and error boundaries.
4. Add DB backups and restore drills.
5. Add environment config and secrets handling.
6. Add deployment notes and rollback plan.

## Verification Standard

For every implementation step:

1. Run syntax checks for touched JS files.
2. Rebuild web/document-service Docker if relevant.
3. Use Playwright for at least one realistic UI path.
4. Check browser console errors.
5. Update docs and changelog.
6. Do not commit or push unless the user explicitly asks for it.

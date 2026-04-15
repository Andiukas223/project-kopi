# Web Prototype Implementation Plan

Date: 2026-04-15

Current status source of truth: `docs/CURRENT_STATUS_AND_ROADMAP.md`.

Tomis reverse-engineering process: `docs/TOMIS_CRAWL_PLAYBOOK.md`.

## Goal

Build a Docker-runnable web prototype for Viva Medical's internal business management system.

The prototype is not a marketing website. It is a desktop-first internal operations tool for service, sales, and admin users who manage medical equipment service work, document creation pipelines, document processing status, work acts, approvals, and job completion.

## Product Scope

The first prototype should support these workflows:

- Service job intake for medical equipment.
- Job status monitoring from request to finished work act.
- Document creation pipeline for service documents, sales documents, and administrative documents.
- Service technician workflow with diagnostics, repair, parts, vendor return, and final checklist.
- Sales workflow for quotations, customer approval, contract/warranty context, and handoff to service.
- Admin workflow for user role visibility, overdue work, document exceptions, and system configuration.

The prototype should use realistic demo data, not a real backend yet.

## Technology Direction

The original `design_system.md` recommends a single `.html` file. For this new request, the prototype should still visually follow that design system, but the code should be modularized.

Recommended implementation:

- `src/index.html` - app shell and mount points.
- `src/styles/` - CSS split by purpose.
- `src/js/` - modular JavaScript files.
- `src/data/` - demo data and workflow definitions.
- `public/` - generated or copied static output served by Docker.
- `Dockerfile` - static nginx container.
- `docker-compose.yml` - local web service.

No heavy frontend framework is needed for the first prototype. Use vanilla JavaScript modules so the app stays easy to inspect and close to the existing design system.

All code comments must be in English.

## Document Generation Direction

The Documents module should be designed for a later Carbone integration.

Reference:

- Carbone GitHub: `https://github.com/carboneio/carbone`

Planned use:

- Users prepare LibreOffice or Microsoft Office templates such as `.odt`, `.docx`, `.ods`, or `.xlsx`.
- The system injects job, customer, equipment, parts, and approval data into templates using JSON data.
- Users generate work acts, diagnostic reports, quotations, acceptance reports, contract annexes, warranty confirmations, parts requests, and vendor return notes.
- Users can save generated documents as `.docx`, `.odt`, or `.pdf`.
- Users can preview generated files inside the app, download/export PDF, and queue a controlled e-mail handoff/audit event. Real SMTP/API sending remains a later backend step.

Carbone integration notes from the upstream project:

- Carbone is a server-side report generator that injects JSON data into document templates.
- It supports templates from LibreOffice and Microsoft Office formats such as ODT, DOCX, ODS, XLSX, PPTX, and related XML-based formats.
- PDF conversion needs a server-side document converter. LibreOffice is the established path documented by Carbone.
- The static prototype should only model the UI and pipeline states. Actual Carbone rendering belongs in a later backend/document-service phase.

Future backend shape:

- `document-service` container with Node.js, Carbone, LibreOffice, and a templates volume.
- `templates/` volume for approved document templates.
- `generated/` volume for output files.
- `storage/` volume for uploaded documents, signed copies, feedback screenshots, and the prototype file registry.
- API endpoints for preview, generate DOCX/ODT/PDF, download, template upload/download, file upload/download, and feedback report storage.
- Audit trail fields for who generated, reviewed, approved, downloaded, or sent a document.

Document module UI step:

- Add a "Templates" tab in the Documents module.
- Add template cards for service act, diagnostic report, quotation, acceptance report, and vendor return.
- Add a "Generate from template" action on documents and service jobs.
- In the first UI prototype, this action should open a mock generation panel that shows selected template, source JSON payload, output format, and a planned backend integration state.

## Proposed File Structure

```text
.
|-- Dockerfile
|-- docker-compose.yml
|-- vm-web-control.cmd
|-- vm-web-control.ps1
|-- public/
|   `-- index.html
|-- src/
|   |-- index.html
|   |-- js/
|   |   |-- app.js
|   |   |-- data.js
|   |   |-- dom.js
|   |   |-- navigation.js
|   |   |-- render.js
|   |   |-- state.js
|   |   `-- wizard.js
|   `-- styles/
|       |-- base.css
|       |-- shell.css
|       |-- components.css
|       |-- pages.css
|       `-- wizard.css
`-- docs/
    `-- WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md
```

For phase one, `public/index.html` can be the runnable assembled artifact. If we want to avoid a build pipeline at first, it can load CSS and JS directly from copied static paths.

## Docker Plan

Use nginx to serve the static prototype.

Planned service:

- Service name: `web`
- Port: `8080:80`
- Image built from local `Dockerfile`
- Static root: `/usr/share/nginx/html`

Suggested commands:

```powershell
docker compose up -d --build
docker compose ps
```

Root control utility:

- `vm-web-control.cmd` opens the Windows-friendly launcher.
- `vm-web-control.ps1` supports `menu`, `on`, `off`, `restart`, `status`, `logs`, `open`, and `quit`.
- Web startup and restart controls must stay outside the web UI, because a broken or stopped web app cannot reliably start itself.

Because the current environment approval policy is `never`, if Docker commands require outside-sandbox access, the assistant should not request escalation. Instead, provide the exact command for the user to run manually.

## App Shell

Follow `design_system.md`:

- Topbar with Viva Medical / Service IS wordmark.
- Sidebar with grouped navigation.
- Main area with one active page at a time.
- Page header with title, subtitle, and contextual actions.
- Content area using stat cards, tiles, tables, flow diagrams, and wizard modal.
- No web-hosted `CMD` start/stop/restart control. Use the root control utility instead.

Primary navigation:

- Command Center
- Service
- Sales
- Documents
- Template Generation
- Finance
- Customers
- Equipment
- Parts
- Reports
- Admin

Role switcher:

- Service user
- Sales user
- Admin user

The role switcher is only a prototype control. It should change visible emphasis, dashboard cards, and allowed action labels, but it does not need authentication yet.

## Core Data Model For Demo State

Use plain JavaScript objects in `src/js/data.js`.

### Job

Fields:

- `id`
- `customer`
- `equipment`
- `serial`
- `department`
- `owner`
- `roleOwner`
- `priority`
- `status`
- `stage`
- `due`
- `sla`
- `contract`
- `warranty`
- `quotationStatus`
- `partsStatus`
- `documentStatus`

Example statuses:

- `New request`
- `Diagnostics`
- `Waiting for quotation`
- `Customer approval`
- `Parts pending`
- `Repair`
- `Document drafting`
- `Signature pending`
- `Finished`

### Document

Fields:

- `id`
- `type`
- `jobId`
- `customer`
- `owner`
- `status`
- `created`
- `due`
- `pipelineStep`

Document types:

- Service act
- Diagnostic report
- Quotation
- Contract annex
- Warranty confirmation
- Parts request
- Vendor return note
- Acceptance report

Document statuses:

- Draft
- In review
- Waiting for customer
- Waiting for signature
- Approved
- Rejected
- Signed uploaded
- Done

`Archived` is intentionally deferred for the Documents module until a retention/file-custody design exists.

### Equipment

Fields:

- `id`
- `name`
- `category`
- `customer`
- `serial`
- `location`
- `warrantyUntil`
- `servicePlan`
- `lastService`

Use product/domain names inspired by `docs/VIVAMEDICAL_WEBSITE.md`, for example ARIETTA ultrasound systems, ARJO patient lifting equipment, WASSENBURG systems, EEG, radiology, and surgery-related equipment.

## Pages And Components

### Command Center

Purpose: one-page operational overview.

Components:

- Stat cards for open service jobs, overdue documents, waiting customer approvals, and jobs finishing this week.
- Pipeline board with grouped counts by stage.
- "Needs attention" table.
- Quick actions: New service job, New quotation, Create service act.

### Service

Purpose: medical equipment service workflow.

Components:

- Subgroup tiles: New requests, Diagnostics, Parts pending, Repairs, Vendor returns, Final documents.
- Service jobs table.
- Process flow diagram.
- New service job wizard.
- Diagnostics and repair process nodes should be labeled as duration entry points, not live timers.

Wizard steps:

1. Customer and equipment
2. Issue intake
3. Contract and warranty check
4. Diagnostics duration entry
5. Quotation decision
6. Parts and vendor handling
7. Repair duration entry
8. Final documents and checklist

### Sales

Purpose: sales-managed quotation and customer approval pipeline.

Components:

- Quote pipeline table.
- Customer approval queue.
- Handoff to service panel.
- Document status chips.

Primary actions:

- Create quotation
- Mark customer approved
- Send to service

### Documents

Purpose: document repository, search, status tracking, and file custody.

Components:

- Table-first document repository. Avoid pipeline counters and side panels that repeat information already visible in the list.
- Filters by document type, owner, status, due date, customer, job, equipment, generated/uploaded/signed state.
- Table with document ID, job ID, customer, equipment, owner, status, source, signed state, and file action.
- Row actions: `View`, `Edit`, `Download`, `Reject`, `Upload signed`, `Finish`, `DONE` depending on document state.
- Upload external document panel.
- Download/open generated or uploaded document action.
- Audit/history section for generated, uploaded, signed, finished, and rejected events.

Documents must not become the main template editing workspace. Template generation can link back to Documents after a generated file is saved.

Pipeline stages:

- Draft
- Review
- Customer
- Signature
- Approved

Active user-facing close state:

- DONE

The generic `Advance` button and active document archive action are removed for now. The practical flow is generate/preview/download -> collect signature -> upload signed copy -> Finish -> DONE.

### Template Generation

Purpose: document creation workspace separated from the document repository.

Components:

- Work Acts workspace: draft list, create from job/equipment/manual, equipment search/add/remove, Work List Template Name picker, Work Description and Work Rows editor, generate output.
- Defect Acts workspace: create from job/equipment/manual, defect description, findings, recommended correction, generate output.
- Commercial Offers workspace: sales scope, pricing, validity, approval text, generate output.
- Work List Templates registry: equipment/procedure-specific checklist templates used as isolated copies inside Work Acts.
- Output Templates editor: standardized printable forms for Work Act, Commercial Offer, Defect Act, and future documents.
- Preview and generate panel for `pdf`, `docx`, and `odt`.

Primary actions:

- Create draft
- Apply work list template
- Generate document
- Save generated file into Documents
- Edit output template

### Customers

Purpose: customer context for hospitals, clinics, and private medical institutions.

Components:

- Customer list.
- Open jobs count.
- Equipment count.
- Outstanding documents.

### Equipment

Purpose: equipment registry.

Components:

- Equipment table.
- Warranty and service plan indicators.
- Last service and next service date.

### Parts

Purpose: parts and vendor return tracking.

Components:

- Parts request table.
- Warehouse status.
- Vendor return queue.
- Expected delivery date tracking.

### Reports

Purpose: management view.

Components:

- SLA summary.
- Document cycle time.
- Service jobs by stage.
- Sales-to-service handoff count.

### Admin

Purpose: admin-facing prototype configuration.

Components:

- User role summary.
- Document template list.
- Workflow settings mock panel.
- System alerts.

## Component Inventory

Build reusable render helpers:

- `renderPageHeader()`
- `renderStatCard()`
- `renderModuleTile()`
- `renderSubgroupTile()`
- `renderDataTable()`
- `renderStatusChip()`
- `renderPipelineBoard()`
- `renderFlowNode()`
- `renderFlowTrack()`
- `renderWizardStepIndicator()`
- `renderDurationField()`
- `renderChecklist()`
- `renderInfoBox()`
- `renderDecisionCards()`

Keep these helpers pure where possible: input data in, HTML string out.

## Interaction Plan

Prototype interactions:

- Sidebar changes active page.
- Role switcher changes dashboard framing and visible mock permissions.
- Table row click opens a side/detail panel or updates a detail area.
- "New service job" opens wizard modal.
- Decision cards change wizard state inline.
- Diagnostics and repair time are entered manually as duration fields after the user completes each procedure.
- Submitting wizard adds a new demo job into in-memory state and returns to Service page.
- Document actions should express the real user task: preview/download, upload signed copy, finish, reject, back to draft. Do not reintroduce a generic `Advance` button.

No real persistence is required in phase one. Optional phase two can add `localStorage`.

## Styling Plan

Use `design_system.md` as the visual contract:

- Dark topbar/sidebar.
- Brand accent border on topbar and modal.
- CSS variables for all colors.
- Card radius no larger than 8px.
- Stable table, tile, and toolbar dimensions.
- No animations or keyframes.
- Hover uses border or shadow changes only.

Palette direction:

- Avoid a one-note blue/slate UI.
- Use a clean medical palette with dark neutral shell, green/teal brand signal, red/amber/green operational status colors, and white/very light cool surfaces.
- Keep all colors in `:root`.

## Full Role List

| Role | ID | Responsibilities |
|---|---|---|
| Service Engineer | service | Creates technical cases, logs diagnostics/repair duration, uploads signed documents |
| Service Manager | svcmgr | Approves parts requests, assigns engineers, controls service queue |
| Sales / Sales Manager | sales | Commercial offers, contract upload/indexing, customer approval, invoice handoff |
| Finance | finance | Generates/uploads invoices, manages payment status (paid/pending/canceled) |
| Office Manager | office | Customer registry, contacts, calendar, case creation, reminders to engineers |
| Logistics Manager | logistics | Parts delivery, vendor returns, logistics issue resolution |
| Warehouse | warehouse | Stock confirmation, parts arrival, inventory management |
| Manager | manager | Read-only overview across all modules and reports |
| Admin | admin | Users, roles, permission grid, pipeline/progress overseer dashboard, exception queues, controlled system configuration |

Admin assigns permissions via a per-user checkbox grid. One user can hold multiple roles. Admin is an overseer for progress and exceptions, not only the final approval role.

---

## Pipeline Types

### Type A — Repair Without Service Contract

```
Technical Case → Diagnostics (duration entry) → Parts check
  → [if parts needed] Parts Request → Service Manager approves → Logistics/Warehouse fulfills → Engineer notified
  → Commercial Offer (customer must confirm: cost and what will be changed)
  → Repair (duration entry)
  → Work Act generation → Signature collected → Upload signed document into system
  → INVOICE NEEDED status → Finance generates/uploads invoice PDF
  → Engineer downloads → collects signature → uploads signed invoice
  → Admin review: [Diagnostics ✓][Commercial offer ✓][Repair ✓][System working ✓]
  → Approval Required → Admin Approves → ARCHIVED
```

### Type B — Repair With Service Contract

```
Technical Case → Diagnostics → Parts check (if needed)
  → Repair (system shows contract balance; warns if repair cost > remaining balance)
  → Work Act → Signature → Upload
  → Admin review → ARCHIVED
```

Contract balance logic: contract has a total amount (e.g. €100,000) and duration (e.g. 36 months). Each repair deducts the consumed amount. Visible in repair workflow and contract view: remaining balance / consumed / work history.

### Type C — New System Installation

```
Sales: Commercial Offer → Customer approval
  → Contract indexing (fields + warranty dates + comments section for any missing field info)
  → Installation (engineer)
  → Acceptance Act generation → Signature → Upload
  → WARRANTY STARTS from upload date (not from admin approval date)
  → Admin verification (manual check only) → ARCHIVED
  → Calendar syncs warranty expiry date
```

### Type D — PM Periodic Maintenance

```
System AUTO generates PM case from contract
  → PM submodule status: [Scheduled / Unscheduled / Problem]
  → Date distribution: even split over contract period
    (rule: N visits / M months, evenly spaced — e.g. 4x/year = one per quarter; stacking consecutive months not allowed)
  → User can move date within same month → main calendar auto-updates
  → Service work → Work Act → Admin review → ARCHIVED
```

---

## Document Types

Work Act / Diagnostic Report / Commercial Offer / Contract Annex / Warranty Confirmation / Parts Request / Vendor Return Note / Acceptance Report / Invoice

Document workflow: `Draft/generated -> preview/download -> upload signed copy -> Finish -> DONE`.

Rejection path: `Rejected → Draft` (comment required). Permanent rejection: comment + Admin resolves.

Create (from Carbone template, mock in prototype) or Upload (external document with indexed metadata).

Upload metadata fields (indexed for global search): location · contract reference · date · executor · who signed · short description.

Search: filter chips (type / owner / status / customer / date range) + free text field + Search / Cancel buttons.

---

## Support Portal — Client Fault Reporting

Each installed system record has a **Support** tab with three sub-tabs:

### Settings sub-tab
- **Support Page Is Enabled** checkbox — when checked, the system generates unique URLs for this installed system
- **Group Name** — groups multiple systems under one support URL (e.g. all systems at one hospital department)
- **Image (override)** — optional custom image for the support page

### Emails sub-tab
- **Company Emails** — Viva Medical internal recipients for new case notifications
- **Manufacturer Emails** — manufacturer rep notification on new fault
- **Hospital Emails** — hospital-side contact who gets confirmation when case is created

### Web Links sub-tab
- **System link** — unique URL for this specific installed system (with Copy button)
- **Hospital link** — URL scoped to all systems at the hospital
- **Group link** — URL scoped to all systems in the group

### Support page flow
When a hospital staff member visits the system link:
1. Page shows: system name, model, location (pre-filled from system record, no login required)
2. Staff fills in: short problem description + optional contact name
3. Submit → new Technical Case is auto-created in the system
4. Case is pre-filled with: system info / hospital / problem description / source = "Support portal"
5. Case status: **New / Unassigned**
6. Admin receives notification → assigns case to engineer → normal service pipeline continues

In the prototype: the Support tab UI is shown on the Equipment detail page. The public support page is a planned sub-page (no authentication). Mock case creation on submit.

---

## Parts Flow

```
Engineer identifies part needed (during diagnostics)
→ Parts request created with situation description
→ Service Manager approves
→ Logistics / Warehouse fulfills
→ Parts arrive → Warehouse confirms → Engineer notified
→ Engineer specifies delivery:
   [Pick up from warehouse]  OR  [Deliver to site: address + contact person (saveable to registry)]
   Recipient: named engineer OR local person at site
→ Repair proceeds
```

Vendor return: triggered by "repair exchange" in Work Act. Logistics creates return case. Engineer specifies destination: bad-parts spot or warehouse re-stock.

Delivery address registry: hospital address + contact person saved from customer registry. Autofill suggestions when entering address on future parts requests.

---

## Calendar

- Colour-coded by user
- Filters: user / date range / equipment / service contract
- Permission-based: user sees own events; with permission sees assigned users; Admin sees all and can assign
- Event types: Service case / Diagnostics / Repair / PM visit / Sales meeting / Equipment demo / Contract validity period
- PM date distribution: even split over contract period; user can move date within same month; main calendar auto-updates
- Contract validity visible when filtering by contract

---

## Reminders

Sidebar strip (list type). Each entry: `place / case open date / status` with colour indicator (red/yellow/green/gray). Office Manager and users with permissions can send reminders to engineers (collect signature, upload document).

---

## Implementation Phases

### Phase 1: Static Docker Shell ✅ DONE

- `src/` structure created.
- HTML shell, CSS modules, Dockerfile, docker-compose in place.
- Served via nginx static container.

### Phase 2: Core Pages ✅ DONE

- Command Center, Service, Sales, Documents, Finance, Customers, Equipment, Parts, Reports, Admin, Calendar pages.
- Full demo data in `data.js` (jobs, documents, invoices, equipment, customers, contracts, quotations, partsRequests, users, templates, calendarEvents).
- Navigation, role switcher, dynamic sidebar badges.

### Phase 3: Service Wizard ✅ DONE

- New service job wizard — 8 steps.
- Pipeline type routing (A/B/C/D) with real-time type detection.
- Duration entry fields for diagnostics and repair.
- Contract balance info block for type B.
- Submit creates in-memory job + document, redirects to Service page.

### Phase 4: Document Pipeline ✅ DONE

- Document workflow now focuses on generated file preview/download, signed-copy upload, `Finish`, and `DONE`; rejected documents can return through `Back to Draft`.
- Generic stage advance/step-back controls have been removed from the active Documents UI; rejected documents can return through `Back to Draft`.
- Owner filter, `Review next`, overdue monitoring (due-today / customer / signature cards, red row indicator).
- Template generation: select template, output format, edit template metadata/body, click Generate -> styled document preview with filled fields, signature lines, `.txt` download, or service-generated DOCX/ODT/PDF through `document-service`.
- Five per-template renderers: Service act, Diagnostic report, Quotation, Acceptance report, Vendor return note.

### Phase 4B: Role-Filtered Views ✅ DONE


- 9 roles: service, svcmgr, sales, finance, office, logistics, warehouse, manager, admin.
- Command Center: per-role stat cards + focus panels.
- Service page: service engineer sees only own jobs; svcmgr sees parts approval queue.
- Documents page: default filter by role (service/svcmgr → Service, sales → Sales, finance → Finance).
- Page header: "New service job" button hidden for roles that cannot create jobs.
- Sales module: full quotation pipeline (Draft → Sent → Awaiting approval → Approved → Handed off / Rejected) with 4-tab detail (Offer / Contract / Approval / Handoff).
- Finance module: invoice queue with job-linked invoice records, payment status, and mock Generate invoice / Mark paid / Mark cancelled actions.

### Phase 5: Template Generation Workspaces ✅ DONE

- `Template Generation` sidebar module and page added; `Documents` page no longer mixes template creation with repository/search.
- Sub-tabs: Work Acts, Defect Acts, Commercial Offers, Work List Templates, Output Templates.
- Work Acts workspace (B-19): source job selector, draft create, equipment search/add/remove, Work List Template picker, Work Description + Work Rows editor, generate Service act document draft into Documents.
- Defect Acts workspace (B-20): source job selector, draft create, defect description / findings / correction / risk / acknowledgement editor, generate Defect act document draft into Documents.
- Commercial Offers workspace (B-22): source quotation selector, draft create, scope text, line items table (add/remove, description, amount), validity date, payment terms, notes, `Create document draft` → Documents; `commercialOfferDrafts` collection persisted via `localStorage`.
- Work List Templates CRUD (B-23): `+ New template` form with name/category/serviceType/language/bodyText/workRows; table with per-row Duplicate and Archive/Restore; selected template detail and edit panel with inline work row add/remove/text edit; `isActive` flag — non-destructive archiving.
- Output Templates editor: structured section editors with merge fields, reset/save logic, `localStorage` persistence; section content passed through to `document-service` Carbone payload.

---

## Current Backlog — Ordered

### Priority 1 — Pipeline completeness

| ID | Task | Description |
|---|---|---|
| ~~B-02~~ | ~~**Document rejection path**~~ | Done: Review / Customer / Signature documents can be rejected with a required comment, move to `Rejected`, show the latest rejection note, then return to Draft with `Back to Draft`. |
| ~~B-03~~ | ~~**Service job detail panel**~~ | Done: clicking a Service job row opens a right-side detail panel with job info, current stage, linked documents, and linked parts requests. |
| ~~B-04~~ | ~~**Finance module**~~ | Done: Finance page added with job-linked invoice list, payment status (Paid / Pending / Cancelled), and mock "Generate invoice", "Mark paid", "Mark cancelled" actions. |

### Priority 2 — Data completeness and UX

| ID | Task | Description |
|---|---|---|
| ~~B-05~~ | ~~**Document upload flow**~~ | Done: `Upload document` opens a metadata form (type, job ref, customer, who signed, due date, description) and inserts a Draft document record into the pipeline. |
| ~~B-06~~ | ~~**Document search**~~ | Done: free-text search plus type/status/customer/date filters in the documents table with `Search` / `Cancel` actions. |
| ~~B-07~~ | ~~**PM date reschedule**~~ | Done: PM submodule date fields allow moving a visit within the same month only and update Calendar PM events. |
| ~~B-08~~ | ~~**Sales: New quotation**~~ | ~~"New quotation" button with a mini form (customer, equipment, type, amount) → creates a Draft QTE entry in memory.~~ **Done:** `New quotation` opens a mini form and creates a selected Draft QTE entry in memory. |
| ~~B-09~~ | ~~**Vendor return flow**~~ | ~~From Parts module: "Create vendor return" button → creates return case → visible in Logistics queue.~~ **Done:** Parts detail creates a vendor return case that appears in the Parts vendor return queue and Logistics role queue / badge. |

### Priority 3 — Later / deferred

| ID | Task | Description |
|---|---|---|
| ~~B-10~~ | ~~**Contract management**~~ | ~~Dedicated contract view/edit screen in Sales module. Contracts currently read-only.~~ **Done:** Sales module has a contract management view with edit mode, validation, and automatic `remaining = value - consumed` recalculation. |
| ~~B-11~~ | ~~**Warranty/calendar sync**~~ | ~~Type C installation: acceptance act upload auto-populates warranty expiry date in calendar.~~ **Done:** `Acceptance report` upload updates linked equipment acceptance/warranty fields and creates a warranty expiry event in Calendar. |
| ~~B-12~~ | ~~**Parts delivery address registry**~~ | ~~Autofill suggestions when entering delivery address on parts requests (populated from customer registry).~~ **Done:** Parts delivery flow has a registry autofill form with customer address/contact suggestions and saves the selected delivery address/contact to the parts request. |
| ~~B-13~~ | ~~**localStorage persistence**~~ | ~~Optional: persist in-memory state across page reloads.~~ **Done:** UI state and mutable demo collections are saved to `localStorage`, so changes survive page reloads. |
| ~~B-14~~ | ~~**Carbone document service**~~ | ~~Phase 4C: backend container with Node.js + Carbone + LibreOffice; real DOCX/ODT/PDF generation replacing mock. API endpoints: preview, generate, download. Audit trail metadata.~~ **Done:** added the `document-service` container with Carbone/LibreOffice API (`/health`, `/preview`, `/generate`, `/download`), nginx proxy, and Documents UI `Generate via service` action. |
| ~~B-15~~ | ~~**Work Act draft + Work List Template flow**~~ | **Done:** Service job detail can create a Work Act draft, preselect job equipment, search/add extra customer equipment, apply a Work List Template as an isolated copy, edit `Work Description` / `Work: List`, and create a Service act document draft. |
| ~~B-16~~ | ~~**Standardized document output templates**~~ | **Done:** Carbone output templates are now separate from the Work List Template registry; added `work-act.fodt`, `commercial-offer.fodt`, `defect-act.fodt`, backend `templateMap`, Documents UI `Commercial offer` / `Defect act` options, and payload fields for equipment/work rows, quotation, defect, and signature content. |
| ~~B-17~~ | ~~**Template Generation module split**~~ | **Done:** added a dedicated `Template Generation` sidebar module/page and removed the template generation panel from `Documents`, keeping Documents focused on repository/search/detail/upload. Next: split Template Generation into Work Acts, Defect Acts, Commercial Offers, Work List Templates, and Output Templates sub-tabs. |
| ~~B-18~~ | ~~**Template Generation sub-tabs**~~ | **Done:** added Template Generation sub-tabs for Work Acts, Defect Acts, Commercial Offers, Work List Templates, and Output Templates. Output Templates keeps the current Carbone generation/editor panel; the other tabs establish separate Tomis-aligned workspaces. |
| ~~B-19~~ | ~~**Work Acts workspace in Template Generation**~~ | **Done:** Work Acts tab now has a source service job selector, Work Act draft create flow, and the full Work Act builder: equipment selection, Work List Template apply, Work Description / Work: List editing, and Service act document draft creation. |
| ~~B-20~~ | ~~**Defect Acts workspace in Template Generation**~~ | **Done:** Defect Acts tab now has a source service job selector, Defect Act draft create flow, defect description / engineer findings / recommended correction / risk / acknowledgement editing, and Defect act document draft creation back into Documents. |
| ~~B-21~~ | ~~**Work Act builder UX labels and equipment search**~~ | **Done:** renamed Work List Template to Work List Template Name, replaced the Work Text term with Work Description, and replaced equipment checkboxes with search/dropdown, Add equipment, selected-equipment strip, and X remove controls. |
| ~~B-22~~ | ~~**Commercial Offers workspace**~~ | **Done:** `Template Generation / Commercial Offers` tab has full create/edit flow: source quotation selector, draft create, scope/line items/validity/payment terms/notes editor, `Create document draft` action. `commercialOfferDrafts` collection with `localStorage` persistence. |
| ~~B-23~~ | ~~**Work List Templates CRUD**~~ | **Done:** `Template Generation / Work List Templates` tab has `+ New template` form, selected template detail/edit panel, `Duplicate` and `Archive/Restore` buttons, inline work row add/remove/text-edit in edit mode. `isActive` flag controls archiving without deletion. |

### Open — Next steps

| ID | Task | Description |
|---|---|---|
| ~~B-24~~ | ~~**fodt template upload/export**~~ | **Done:** Output Templates tab has `Export sections as .fodt` and `Upload .fodt template` actions. `document-service` exposes `POST /template/upload` and `GET /template/download/:fileName`, and the edited section content can be written as an actual `.fodt` template used by Carbone. |
| ~~B-25~~ | ~~**Tomis comparison pass**~~ | **Done:** re-examined Tomis read-only after B-17–B-24 across Work List Templates, Work Acts, Commercial Offers, and Defect Acts. Detailed deltas and post-B-25 backlog are documented in `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`. |
| ~~B-26~~ | ~~**Work Act Tomis-aligned list and options**~~ | **Done:** `Template Generation / Work Acts` upgraded from basic drafts to a grouped/searchable table with Work Act `Options` / print settings. `reportOptions` are persisted and sent into the document-service payload. |
| ~~B-27~~ | ~~**Work List Template applicability rules**~~ | **Done:** Work List Templates registry has Search/Find/Clear, status and entry person filters, linked service types/equipment/hospitals/work equipment, entry person/date metadata, and the Work Act template picker uses applicability rules. |
| ~~B-28~~ | ~~**Commercial Offer Tomis-aligned detail**~~ | **Done:** Commercial Offers now has active/price missing/archived/entry person filters, Tomis-style list columns, profile/group/hospital-system/side/contract/recipient/fax/invoice/currency metadata, Offer Text Header/Footer sections, archive action, and commercial offer payload fields for document-service generation. |
| ~~B-29~~ | ~~**Defect Act Tomis-aligned visits**~~ | **Done:** Defect Acts now include an Actual Visits grid with DA/WA, planned start, work/travel hours, completed, comments, add/remove rows, document-service payload fields, preview rendering, and a `Create Part Request Offer` placeholder. |
| ~~B-30~~ | ~~**Output template conditional rendering**~~ | **Done:** `.fodt` output templates now use Carbone conditional blocks for Work Act report options/signature area, Commercial Offer header/scope/footer/line items, and Defect Act visits/findings/correction/risk fields. |
| ~~B-31~~ | ~~**Tomis visual editor crawl**~~ | **Done:** read-only inspected Tomis `Work List Template (Aespire TB)` detail, embedded rich/table editor, service/equipment/hospital/work-equipment applicability tabs, dual-list assignment controls, and `Template - Advanced Editor` Word-like ribbon. Findings documented in `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`. |
| ~~B-32~~ | ~~**User-accessible visual template editor**~~ | **Done as MVP:** `Template Generation / Work List Templates` now has a document-like visual preview, contenteditable rich editor, basic formatting/list toolbar, checklist-row insertion, visual HTML persistence, and bug/workaround note field while keeping structured work rows and applicability metadata as the default generation source. |
| ~~B-33~~ | ~~**Generated document preview and delivery**~~ | **Done as MVP:** source records, generated output preview, Work Act links, and `Documents` rows now expose `Open preview`; the Tomis-style modal includes print/quick print, zoom, export/download, email compose, inline service PDF preview, delivery status, and audit history. `document-service` now returns a separate inline `previewUrl` so PDF preview does not trigger a download dialog. |
| ~~B-34~~ | ~~**Bug/feedback capture for production**~~ | **Done as MVP:** every user has `Report issue`, which enters a Windows-snipping-style click-drag selection mode, captures only the selected area, attaches that screenshot as admin-only supporting info, optionally opens a red-pencil annotation canvas, requires a short comment, saves context/page/role/selected records, and stores the report in the demo state. The report queue, screenshot, comment, status, and history are visible only when the active role is `admin`. |
| ~~B-35-lite~~ | ~~**Production feedback backend foundation**~~ | **Done as storage/API foundation:** bug reports moved from browser-only `localStorage` into `document-service` backend storage: persistent `storage` volume, screenshot attachment files, `feedback-reports.json`, `files.json`, `POST/GET/PATCH /feedback/reports`, admin status/assignee filters, and status/assignee workflow. Full auth/permissions and database migration remain for backend phase. |
| ~~B-36-lite~~ | ~~**Unified document file storage foundation**~~ | **Started as file registry foundation:** generated documents, uploaded documents, output template uploads, and feedback screenshots are now registered through `files.json` with kind/owner/source links/checksum/size/download/preview metadata; binary files are stored under `document-service/storage` or `generated`. Full DB file model, signed-file versions, permission checks, and retention rules remain for backend phase. |
| ~~B-37~~ | ~~**Production Work Act generation storage**~~ | **Done:** Work Act generation now creates a `generated-document` file registry record with stable `fileId`, `downloadUrl`, PDF `previewUrl`, source Work Act link, and per-document `version/versionLabel`. The source Work Act receives the generated file/version, preview/download/email audit entries reference the same file/version, and the Work Act panel can generate the PDF directly after a document draft exists. |
| B-38 | **Defect Act / Commercial Offer generation parity** | Apply the same source-panel generated-file UX to Defect Acts and Commercial Offers: show generated file/version, add direct generate/open-preview buttons, and make their delivery/email audit trail fully source-aware. |
| B-39 | **Document repository workflow polish** | Make Documents a simpler work queue: row signals for needs signed upload / signed uploaded / ready to finish / DONE, row-level file history, better empty states, and no archive controls until retention design. |
| B-40 | **Sales invoice workflow integration** | Link Sales `Generate invoice` to Finance records, reflect invoice status back in Sales lists, and define Finance vs Sales ownership of final invoice PDF. |
| B-41 | **Visual template editor V2** | After deeper Tomis editor crawl, add table editing, merge fields, logo/image placeholders, autosave, dirty-state warning, revert, personal duplicate, and version history. |
| B-42 | **Backend data model and auth** | Move from demo/localStorage state to PostgreSQL, migrations, users/roles/permissions, documents/templates/files/feedback/audit models, sessions, and route permission checks. |
| B-43 | **Production file custody** | Move `files.json` metadata into DB, add file version chains, signed-copy versions, object storage adapter, checksum/MIME/size validation, retention, backup, and access rules. |
| B-44 | **Real email delivery** | Add SMTP/API sending, stored outbound email drafts, attachments from file registry, customer contact autofill, send audit, failure, and retry handling. |
| B-45 | **Tomis deep crawl completion** | Follow `docs/TOMIS_CRAWL_PLAYBOOK.md` to finish Work Act, Defect Act, Commercial Offer, Work List Template, preview/export/email/upload, admin/permissions, and close-status crawl. |

---

## Tomis Document Generation Findings

Detailed read-only findings are documented in `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.

Core decision:
- Work List Template = equipment/procedure checklist copied into a concrete Work Act.
- Document Output Template = standardized printable form rendered by Carbone/LibreOffice.
- Work Act generation flow implemented: Draft record -> auto-prefill equipment from case/equipment or manual equipment search/add/remove -> apply Work List Template -> edit isolated work rows/work description -> generate output document draft.
- The current generic template editor is temporary and should be superseded by the Work Act-specific workflow.
- Daily users should not lay out a document from scratch each time. The normal flow is structured work record -> selected Work List Template / Output Template -> generated document.
- Daily users still need access to a visual/rich editor for micro edits, bug/workaround capture, or user-specific templates, similar to Tomis. This requires a focused Tomis crawl with the user before implementation.
- Generated documents need a Tomis-style delivery step: integrated print preview, PDF preview, print/quick print, export/download local copy, email PDF attachment, and keep delivery status linked to the source record and Documents repository. The crawl also confirmed page-level settings to model: A4 portrait, margins, header/footer, page size, orientation, page color/watermark, footer document/page numbering, and signature blocks.
- Admin should be treated as an overseer role for users, roles, permissions, and pipeline/progress dashboards, not only as an approver.

## Documentation Rule

After every implementation session:
1. Update `docs/CHANGELOG.md` — add entries under `[Unreleased]`.
2. Update `docs/PROJECT_PLAN.md` section 18 — mark completed backlog items ✅, add new items as they arise.
3. `git commit` + `git push` — one commit per session's work.

---

## Definition Of Done For First Prototype ✅ ACHIEVED (2026-04-13)

All original criteria met and exceeded:

- ✅ Runs with `docker compose up -d --build` (nginx + document-service containers).
- ✅ Shows Viva Medical internal business management shell with topbar, sidebar, 9-role switcher.
- ✅ Service, Sales, Documents, Finance, Customers, Equipment, Parts, Admin, Calendar, Reports, Template Generation workflows all visible.
- ✅ Working New Service Job wizard (8 steps, Pipeline type A/B/C/D routing).
- ✅ Document workflow monitoring: generated preview/download, signed-copy upload, Finish/DONE close, plus rejection path and Back to Draft.
- ✅ Code split into clear modules: `app.js`, `data.js`, `state.js`, `render.js`, `interactions.js`, `navigation.js`, `documentPipeline.js`, `persistence.js`.
- ✅ All code comments in English.
- ✅ `docs/CHANGELOG.md` and `docs/PROJECT_PLAN.md` document implemented changes after every session.
- ✅ `localStorage` persistence across page reloads.
- ✅ Real Carbone document generation via `document-service` container with `.fodt` templates.
- ✅ Template Generation module with Work Acts, Defect Acts, Commercial Offers, Work List Templates, and Output Templates workspaces.

### Remaining open questions (user decision)

| Question | Where it applies |
|---|---|
| App name in UI (`Viva Medical` / `Service IS` / other) | `src/index.html` topbar, all `pageHeader()` titles |
| Brand colour from logo → `--brand` CSS variable | `src/styles/base.css` `:root` |
| Logo export → `assets/logo.svg` | `src/index.html` topbar |
| UI language (Lithuanian / English / mixed) | All of `render.js` |

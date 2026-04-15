# Tomis Crawl Playbook

Date: 2026-04-15

This playbook explains how to inspect Tomis effectively without changing production data. The goal is to learn Tomis logic, fields, workflows, document layout, and edge cases so the Viva Medical web app can keep the useful parts while becoming lighter and easier to use.

## Core Rule

Tomis crawl is read-only unless the user explicitly prepares a safe test record and says it is OK to interact with that record.

Never click destructive or persistent actions during crawl unless the user confirms in the moment:

- `Save`
- `OK`
- `Delete`
- `Move to Archive`
- `Upload Document`
- `Send to Hospital`
- `Quick Print`
- final `Send` in an email window
- any action that changes a real case, hospital, contract, template, or generated document

Safe actions in normal crawl:

- open list windows
- open existing records
- switch tabs
- open dropdowns/menus
- open preview windows
- use `Cancel` / close buttons
- take screenshots
- record visible field names and values
- inspect generated previews without saving changes

## Why We Crawl Tomis

We are not copying Tomis blindly. We are extracting operational logic:

- which document types exist
- which fields are required
- how records link to jobs, equipment, hospitals, contracts, invoices, and people
- how templates apply to equipment/service/hospital context
- how generated documents look
- how preview/export/email/upload works
- how users fix small document problems
- how slow or confusing Tomis behavior should be improved in the web app

The output of a crawl session is not code. The output is a precise set of findings, screenshots, questions, and backlog changes.

## Current Known Entry Logic

Use the top menu bar. Tomis can be slow, so wait after each window open and do not double-click repeatedly unless the first attempt clearly did nothing.

Known paths:

- Work Act Templates:
  - `Registers`
  - `Work Act Templates`
  - mini popup opens
  - click `Template list`
  - template list loads
  - open a template such as `Aespire TB`

- Work List Template detail:
  - open template from the template list
  - inspect header fields
  - inspect embedded editor
  - inspect applicability tabs
  - inspect `Open in Advanced Editor`

- Work Acts:
  - `Service Jobs`
  - `Work Acts`
  - open an existing or user-created test Work Act
  - inspect main fields, tabs, Work Template body, Equipment, Files, Log
  - click `Open Document` when user says the record is safe
  - if browser/download dialog appears, use `Cancel` when we want Tomis internal preview

- Print Preview:
  - opened from Work Act `Open Document` after canceling the browser download
  - inspect toolbar, page setup, export, email, page navigation, zoom, page size, margins, orientation

## Session Preparation

Before crawling:

1. Ask the user what Tomis area is open and whether it is a safe test record.
2. Confirm the goal:
   - field inventory
   - workflow sequence
   - generated document layout
   - editor behavior
   - upload/finish/signature behavior
   - admin/permissions behavior
3. Make sure screenshots can be saved under `output/`.
4. Start a short observation note in `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md` or a scratch note before editing docs.
5. Decide a screenshot prefix.

Recommended screenshot naming:

```text
output/tomis-YYYYMMDD-area-01-list.png
output/tomis-YYYYMMDD-area-02-detail-main.png
output/tomis-YYYYMMDD-area-03-tab-equipment.png
output/tomis-YYYYMMDD-area-04-preview-page1.png
output/tomis-YYYYMMDD-area-05-export-menu.png
```

Examples:

```text
output/tomis-20260415-workact-01-list.png
output/tomis-20260415-workact-02-detail.png
output/tomis-20260415-workact-03-open-document-dialog.png
output/tomis-20260415-workact-04-print-preview-page1.png
```

Do not commit `output/` screenshots. They are local research artifacts. Summarize the findings in docs.

## Slow App Tactics

Tomis often responds slowly. Use a patient loop:

1. Click once.
2. Wait 3-8 seconds.
3. Watch for window title changes, list reloads, or disabled controls.
4. Take a screenshot if the UI is blank but has loaded chrome.
5. Wait again before concluding the screen is broken.
6. If a rich editor opens blank, wait longer. The observed Advanced Editor initially showed blank content and rendered later.
7. Avoid repeated Save/OK-style clicks.
8. If the app is not responding, ask the user whether to wait, close, or reopen.

## Crawl Method

For every screen, capture five layers:

1. Navigation path
   - How did we get here?
   - Which top menu, submenu, popup, or list action?

2. List model
   - Columns
   - Grouping
   - Filters
   - Search/find behavior
   - Bottom filter bars
   - Row status colors/icons
   - Row double-click or open behavior

3. Detail model
   - Header fields
   - Required/recommended fields
   - Tabs
   - Subtables
   - Dropdown options
   - Checkboxes
   - Default values
   - Read-only vs editable fields

4. Actions
   - Top toolbar actions
   - Bottom actions
   - Context-menu actions
   - Actions that create related records
   - Actions that generate documents
   - Actions that upload, email, print, archive, or reject

5. Output and side effects
   - What changes on screen after action?
   - Is a file downloaded?
   - Is a preview opened?
   - Is an audit/log row created?
   - Does status change?
   - Does linked job/case close?

## Data Capture Template

Use this format when adding findings:

```markdown
### Area / Screen Name

Observed path:
- `Top menu / submenu / screen`

Purpose:
- What this screen is for.

List fields:
- Column 1
- Column 2

Detail fields:
- Field name: meaning / observed value / required?

Tabs:
- Tab name: what it contains.

Actions:
- Action name: what it appears to do.

Generated output:
- File name, format, preview behavior, layout observations.

Side effects:
- Status changes, logs, related records, warnings.

Implications for web:
- What we should copy.
- What we should simplify.
- What we should not copy.

Questions:
- What still needs user help?
```

## Priority Crawl Areas

### 1. Work Act Creation And Completion

Goal: understand the full daily service flow.

Inspect:

- Work Act list columns and grouping.
- How a new Work Act is created.
- Whether Work Act is created from job, equipment, hospital, or manual context.
- How equipment is selected.
- How multiple equipment items appear.
- How Work List Templates are selected and copied into the Work Act.
- Work Description behavior.
- Work rows/checklist behavior.
- Options/print settings.
- Responsible persons.
- Files tab.
- Log tab.
- Upload signed document behavior.
- Whether upload closes the Work Act, job, ticket, or only adds a file.

Important questions:

- What exact status means "work done but signed document missing"?
- What exact status means "signed document uploaded"?
- Does Tomis have a final Done/Closed state separate from archive?
- What is visible to service user vs admin/manager?

### 2. Generated Document Preview And Delivery

Goal: refine our preview/export/email model.

Inspect:

- `Open Document` button behavior.
- Download dialog fields and buttons.
- What happens on `Open`, `Save As`, and `Cancel`.
- Internal `Print Preview` toolbar.
- Page navigation and zoom.
- Page settings:
  - header/footer
  - scale
  - margins
  - orientation
  - page size
  - page color
  - watermark
- Export formats.
- Email formats.
- Whether email opens a compose form or sends directly.
- Whether print/quick print creates any log entry.
- Whether preview is accessible later from Files/Documents.

Important questions:

- Which output formats matter for daily work now?
- Is PDF always the customer-facing format?
- Should DOCX/ODT be hidden until advanced/export settings?
- What metadata should be shown in our preview title/status bar?

### 3. Work List Templates

Goal: make our template registry strong enough for real equipment workflows.

Inspect:

- Template list columns.
- Grouping by company or category.
- Search/find/clear behavior.
- Filters such as `All Templates`, `Equipment not assigned`, entry person.
- Detail header fields.
- Embedded editor behavior.
- Advanced editor behavior.
- Save/reject/refresh behavior.
- Clear/copy/paste behavior.
- Applicability tabs:
  - Service Types
  - Equipment
  - Hospitals
  - Work Equipment
- Dual-list transfer behavior.
- Rule when a linked list is empty, especially Hospitals.
- Whether templates have version history.
- Whether templates can be duplicated per user.

Important questions:

- Is Work List Template global, company-specific, hospital-specific, or all of these?
- What happens if user edits an applied template inside a Work Act?
- Does editing a template update old Work Acts or only future ones?
- How are obsolete templates hidden?

### 4. Advanced Editor

Goal: decide how far our visual editor must go.

Inspect:

- Load time and blank/loading states.
- Ribbon tabs.
- Table tools.
- Insert tools.
- Page layout tools.
- Mail merge/field insertion.
- Image/logo insertion.
- Header/footer editing.
- Copy/paste from external documents.
- Save/cancel/reject semantics.
- Whether dirty state is shown.
- Whether closing with unsaved changes warns user.
- Whether the editor can edit generated document instance copies or only templates.

Important questions:

- What are the top 10 editing operations real users actually use?
- Do users need page-level layout, or mostly table/text micro edits?
- Should the first production web editor support tables deeply or just preserve them?

### 5. Defect Acts

Goal: finish parity with Work Acts and improve parts/sales follow-up.

Inspect:

- List columns and filters.
- Creation path.
- Detail fields.
- Actual Visits grid.
- DA/WA checkbox meaning.
- Planned start, work hours, travel hours, completed behavior.
- Engineer/signature fields.
- `Create Part Request Offer`.
- Send/export/upload behavior.
- Generated document layout.
- Status and close behavior.

Important questions:

- Does a Defect Act create a Commercial Offer or a Parts Request Offer?
- Which fields are customer-facing?
- How should it link back to Service and Sales?

### 6. Commercial Offers

Goal: improve Sales document generation and invoice handoff.

Inspect:

- List columns and filters.
- Price missing logic.
- Active/archived behavior.
- Entry date filters.
- Detail fields:
  - profile
  - group
  - hospital/system
  - side
  - contract
  - recipient
  - fax
  - invoice
  - currency
- Pricing Details tab.
- Options tab.
- Offer Text Header/Footer.
- Add Part/Add Work.
- Send to Hospital.
- Generated output layout.
- Link to invoice generation.

Important questions:

- Which Sales actions belong in Sales module vs Template Generation?
- Does invoice generation start from Commercial Offer, signed document, or Finance?
- What status tells Sales to follow up?

### 7. Document Upload And File Custody

Goal: model signed document return and file history.

Inspect:

- Upload Document button and dialog.
- Required fields.
- File type restrictions.
- Whether upload attaches to current record or creates a new Documents record.
- Whether uploaded file has version/history.
- Whether upload changes status.
- Whether upload closes case/ticket.
- Where uploaded files are later searched.
- Whether wrong uploads can be replaced or deleted.

Important questions:

- Is signed upload final, or does someone review it?
- Who can replace a signed upload?
- Does upload trigger warranty/acceptance logic?

### 8. Admin / Permissions / Overseer

Goal: clarify admin role.

Inspect:

- User management.
- Roles and permission assignment.
- Whether permissions are role-based, user-based, or both.
- Dashboard progress views.
- Exception queues.
- Document correction/rejection workflow.
- Bug/problem reporting if any.
- Audit logs.

Important questions:

- What should admin see that daily users do not?
- Which actions need approval vs only visibility?
- Should admin be a pipeline overseer, not final bottleneck?

## What To Record From Each Crawl

Always record:

- exact screen title
- exact menu path
- exact button labels
- visible field names
- dropdown option names when relevant
- status labels
- required/recommended markers
- table column names
- generated file name pattern
- output format
- audit/log row wording
- any slow/blank/loading behavior
- any confusing behavior we should improve

Avoid recording sensitive real data unless the user confirms it is safe. For docs, replace real hospital/person/customer data with a short placeholder if needed.

## How To Convert Crawl Findings Into Our Product

Use this decision filter:

1. Copy the business rule if it is clearly necessary.
2. Copy the data field if it supports search, generation, audit, or legal/financial accuracy.
3. Simplify the UI if Tomis shows too many controls at once.
4. Split heavy screens into modules/tabs if the user goal is different.
5. Do not copy visual clutter, duplicated buttons, or hidden side effects.
6. Preserve the daily user's fast path.
7. Keep advanced controls available but not dominant.

Example:

- Tomis has a powerful `Print Preview`. We copy the integrated preview/export/email concept.
- Tomis preview can appear after canceling a browser download dialog. We improve this by opening our integrated preview directly.
- Tomis has many page settings. We keep these in Output Template/page settings, not as daily per-document clutter.

## Documentation Output After Each Crawl

After every crawl session:

1. Add detailed findings to `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.
2. Add implementation implications to `docs/CURRENT_STATUS_AND_ROADMAP.md` if they change the roadmap.
3. Update `docs/PROJECT_PLAN.md` and `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md` if backlog order changes.
4. Add a short changelog entry.
5. Do not commit screenshots unless explicitly requested.

## Minimum Useful Crawl Session

If time is short, one useful session should still capture:

1. One list screen screenshot.
2. One detail screen screenshot.
3. All visible field names.
4. All tabs.
5. All action buttons.
6. One generated preview or output path.
7. At least three implications for our web app.
8. Open questions for the user.

## Red Flags During Crawl

Stop and ask the user if:

- the app asks to save changes
- a record appears dirty/modified
- a dialog asks for confirmation
- the action may email a customer
- the action may upload/delete/archive
- the screen shows real sensitive data that should not be documented
- Tomis freezes or appears to be processing a write action


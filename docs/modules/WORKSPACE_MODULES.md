# Workspace Modules

Date: 2026-04-18

This document describes active Viva Medical workspace modules. It replaces the old pattern where module rules were mixed into the broad project plan.

## Active Module Focus

The active sidebar is intentionally narrowed to the modules that are expected to be used and refined now:

- `Service`
- `Work Acts`
- `Contracts`
- `Documents`
- `Templates`
- `Customers`
- `Equipment`
- `Calendar`
- `Admin`

The following prototype modules are no longer active sidebar modules:

- `Sales`
- `Finance`
- `Parts`
- `Reports`

Their older prototype code/data can remain temporarily as dormant reference/fallback state, but new UX polish should not target them unless the product direction changes.

## Global Module Rules

- Each module owns one business concept.
- A module can show linked records from another module, but it should not silently become the owner of those records.
- Daily list pages should be table-first and action-light.
- `View` should open/read the current record or generated preview.
- `Edit` should route to the owning/source workspace when possible.
- Status colors must describe business status, not decorate layout.
- Delivery/shipping status belongs to Parts/Logistics/Warehouse flows, not to the Documents index.
- Document upload/download custody belongs to Documents, unless a module is explicitly displaying its own source preview/download action.

## App Shell

Purpose:

- Provide fixed topbar, sidebar navigation, role context, language toggle, theme toggle, and global feedback entry.

Owns:

- Current page, role, theme, language.
- Sidebar module grouping and active item state.
- Global `Report issue` entry point.

Current UI:

- Topbar wordmark: `Viva Medical` + `Informational system` / `Informacine sistema`.
- Theme toggle fixed near the bottom-left, centered in the `Workspace` sidebar column, with light/dark labels.
- Sidebar modules are grouped visually, but the top non-functional `Workspace` text label is not shown.
- Sidebar can collapse/expand from a top toggle button in the rail.
- Collapse now targets the sidebar rail itself, not Equipment content sections.
- Expanded mode shows neutral outline icon + module label; collapsed mode is a neutral outline icon rail with tooltip/aria module naming.
- Yellow status badge bubbles are intentionally not used because they confuse module navigation with task/status queues.
- The old sidebar `Reminders` block is not active. Reminder/notification logic will be redesigned later.

In-progress handoff (2026-04-18):

- Shell collapse state and toggle wiring are implemented.
- Equipment-local list collapse behavior was removed so sidebar collapse is the primary navigation collapse mechanism.
- Neutral outline collapsed icon rail is implemented; next step is explicit browser keyboard/tooltip smoke validation.

Does not own:

- Docker start/stop controls.
- Final authentication/session handling.

## Roles And Workspaces

Current roles:

- `service` - Service Engineer.
- `svcmgr` - Service Manager.
- `sales` - Sales / Sales Manager.
- `finance` - Finance.
- `office` - Office Manager.
- `logistics` - Logistics Manager.
- `warehouse` - Warehouse.
- `manager` - Manager/read-only overview.
- `admin` - Admin/system overseer.

Rules:

- One user can have multiple roles.
- Admin is fixed as a system-control role.
- Other permissions are intended to be assigned per user through Admin.
- User-facing `Owner` means creator initials, not necessarily the internal module queue owner.
- Internal document `owner` can still mean module queue bucket such as `Service`, `Sales`, or `Finance`.

## Command Center

Purpose:

- Dormant prototype module for open work, reminders, queue pressure, and role-specific focus.
- Not an active sidebar module in the current focused workspace.
- The current default/start workspace is `Service`.
- Do not polish or extend this area unless a new command/overview concept is intentionally designed.

Owns:

- Overview composition.
- Role-aware stat card selection.
- Sidebar reminder rendering.

Shows:

- Open service jobs.
- Overdue document reminders.
- Customer approvals.
- Finishing/ready work hints.
- Parts/PM reminders.

Links to:

- Service jobs, Documents, Parts requests, PM schedule.

Does not own:

- Service job editing, document upload state, or parts delivery state.

## Service

Purpose:

- Own the simple Service job record used to track that work exists, who owns it, and where/when it should be done.
- Service is intentionally not the document editor. The real work content belongs to `Work Acts`.

Owns:

- Service job records.
- Job id.
- Hospital/customer.
- System/equipment label.
- Contact name and contact number.
- Short problem description.
- Planned visit date.
- Responsible engineer.
- Simple job status: `Open`, `Waiting signature`, `Done`, `Cancelled`.

Shows:

- Service job tracker.
- Search/filter bar for job text, status, customer, and planned visit date.
- Two tracker cards only: `Open` and `Waiting signature`.
- Selected job detail with job fields only.

Creates/updates:

- New service job through the simplified job form.
- Job status updates coming from Work Act generation and Documents signed upload confirmation.

Links to:

- `Work Acts` as the separate owner of Work Act content/configuration.
- `Documents` for generated/signed document custody.
- `Customers` and `Equipment` for registry context where available.
- `Calendar` later for planned visit visibility.

Does not own:

- Commercial offer approval.
- Invoice/payment status.
- Signed file storage.
- Work Act content, work rows, generated PDF editing, or signed file download.
- Work Act create/edit controls in the Service job detail panel.
- Parts/logistics delivery state.

## Work Acts

Purpose:

- Own the concrete Work Act for a Service job: document content, configuration, preview, structured editing, and generated PDF handoff.
- One Service job has exactly one Work Act.

UI naming:

- Sidebar label: `Work Acts`.
- Internal route/page id: `workacts`.
- Legacy/internal notes may still say `Template Generation / Work Acts`.

Detailed Work Acts source of truth:

- See `WORK_ACTS_MODULE.md` for source service job context, concrete Work Act rows/options, generated PDF handoff, and Documents custody boundary.

Owns:

- Work Act source/configuration record.
- Work Act number/reference.
- Source service job link.
- Selected equipment for the specific act.
- Concrete work rows/points for the specific act.
- Work description, report options, and entry person.
- Generated document/file metadata link.

Shows:

- Source service job selector.
- Work Act list.
- Selected Work Act builder.
- Equipment picker.
- Template picker.
- Work rows/points and comments.
- Generated PDF actions when available.

Creates/updates:

- Work Act from a Service job.
- Work Act-specific equipment/work row data.
- Generated document draft link.
- Service job status to `Waiting signature` after generated PDF exists.

Links to:

- `Service` for source job context.
- `Templates` for reusable procedure/checklist templates.
- `Documents` for generated PDF and signed-file custody.
- `Equipment` for device records.
- `Parts` later for vendor return/repair-exchange triggers.

Does not own:

- Reusable template configuration.
- Signed file upload/download custody.
- Invoice/payment state.
- Final Service job completion confirmation. Documents owns that signed upload confirmation step.

## Sales

Purpose:

- Dormant prototype module for commercial offers, customer approval, and handoff to Service.
- Not an active sidebar module in the current focused workspace.
- Do not polish or extend this area unless Sales becomes active again.

Owns:

- Quotation/commercial offer records.
- Customer approval status.
- Sales handoff details.

Shows:

- Quotations table.
- Offer detail/edit state.
- Approval tab.
- Handoff tab.

Creates/updates:

- New quotation.
- Customer approval/rejection state.
- Handoff to a service job.
- Commercial Offer source record until a separate Commercial Offers module exists.

Links to:

- Future `Commercial Offers` source module for printable offer generation.
- `Service` after customer approval/handoff.
- `Contracts` if an approved offer becomes a service/PM/install agreement.
- `Finance` later when billing is needed.

Does not own:

- Signed contract storage/configuration.
- Invoice register/payment.
- Documents index delivery status.

## Contracts

Purpose:

- Own signed customer contract intake, PM/install/service specifications, contract value, validity, and consumed/remaining tracking.

Owns:

- Contract register.
- Contract type/status/value/currency.
- Contract validity period.
- Consumed/remaining values.
- PM visits per year.
- Contract notes/specification metadata.

Shows:

- Contract table.
- Contract detail/config panel.
- Edit mode for contract configuration.

Creates/updates:

- Contract metadata.
- PM frequency/contract dates used by Calendar.
- Remaining balance calculations in prototype state.

Links to:

- `Documents` for signed contract upload intake.
- `Service` for coverage decisions and repair balance.
- `Calendar` for PM schedule generation.
- `Customers` and `Equipment` through `customerId` / `equipmentId`.

Does not own:

- Quotation approval, invoice payment, or parts delivery.

## Templates

Purpose:

- Own reusable Work List Template configuration, Umo-based content editing, and advanced document template/output layout metadata.

UI naming:

- Sidebar label: `Templates`.
- Internal route/page id: `templates`.
- Legacy route/page id `templategen` is kept only as a compatibility alias.
- Legacy/internal documentation may still use `Template Generation` when describing the original split from `Documents`.

Detailed templates source of truth:

- See `TEMPLATES_MODULE.md` for the `Templates` tab, output layouts, merge fields, FODT/template file rules, and where future template modifications should be made.

Owns:

- User-facing Work List Templates for reusable procedure/checklist templates.
- Advanced/admin `Output Layouts` for printable document layouts.
- Template naming, service-type, equipment, hospital, and work-equipment applicability links.

Current routes:

- `/templates`: Templates list/table management page.
- `/templates/:templateId`: Template detail/edit page.

List screen:

- List filters: search, type, status, and owner.
- List actions: `Open / Edit`, `Duplicate`, and `Archive`.
- Records come from `/api/templates/`; the list does not read from Documents.

Detail/edit screen:

- Fields: `Company`, `Entry person`, `Template name`, `Service type`, searchable linked `Equipment`, searchable linked `Hospitals`, searchable linked `Work equipment`.
- Editor actions: `Save`, `Duplicate`, `Archive`, `Cancel`.
- Preview/editor: Umo editor is the primary surface for reusable template content.
- Supporting sections: metadata, applicability, and merge fields.
- Collabora/WOPI advanced editor runtime is decommissioned; reusable template content editing uses Umo.

Creates/updates:

- Reusable template metadata.
- Umo editor HTML/text/JSON content snapshots.
- Applicability links used when a Work Act chooses a template.
- Template list/detail records loaded from `/api/templates/`; this flow does not read from Documents.

Links to:

- `Work Acts` when a concrete act selects a reusable Template as generation input.
- `Documents` only after a source module, currently Work Acts, creates a generated output. Templates do not create document rows directly.
- `document-service` for Template persistence and Work Act template-based rendering support.

Does not own:

- Signed copy upload.
- Document repository filtering/search.
- Direct persisted document generation.
- Reusable Templates in the Documents table/list.
- Invoice payment status.
- Final file custody after a document is generated or signed.

## Documents

Purpose:

- Repository and file custody module for generated, uploaded, and signed documents.

Detailed source of truth:

- See `DOCUMENTS_MODULE.md`.

Owns:

- Document register.
- Search/filter UX.
- Generated/signed/uploaded file custody view.
- Signed upload modal and `Signed return` column download action.

Current table:

- `Reference`
- `Type`
- `Customer`
- `Job status`
- `Created`
- `Generated output`
- `Signed return`
- `Actions`

Action rule:

- `Job status` shows the linked Service job status.
- `Generated output` owns generated preview/print, generated PDF download, and generated PDF export.
- `Signed return` owns yellow `Upload signed` / green `Download signed`.
- `Actions` owns source/custody row actions: `Edit source`, `Delete`.
- Uploading a signed Work Act opens a confirmation. Confirming marks the linked Service job `Done`; declining leaves it `Waiting signature`.
- `Delete` asks for confirmation, removes the Documents custody row, asks `document-service` to remove matching generated/signed/uploaded file records for that document id, and clears generated-document pointers on linked source records without deleting the source records themselves.

Does not own:

- Delivery/shipping status.
- Template/procedure checklist editing.
- Reusable Templates or direct template-source generated artifacts.
- Invoice payment status.

## Finance

Purpose:

- Dormant prototype module for invoice register, uploaded invoice files, and payment status.
- Not an active sidebar module in the current focused workspace.
- Do not polish or extend this area unless Finance becomes active again.

Owns:

- Invoice records.
- Invoice number.
- Amount/currency.
- Payment status.
- Invoice due date.
- Invoice notes.

Shows:

- Invoice register.
- Selected invoice detail.
- Payment status actions.

Creates/updates:

- Uploaded invoice register rows from shared document upload flow.
- Prototype generated invoice rows.
- Payment status: Pending/Paid/Cancelled.

Links to:

- `Documents` through `documentId`.
- `Service` through `jobId`.
- `Sales`/quotation indirectly through job/customer context.

Does not own:

- Commercial offer approval.
- Signed Work Act upload.
- Parts delivery.

## Customers

Purpose:

- Own customer registry, contact details, addresses, and customer-linked overview.

Owns:

- Customer master data.
- Contacts.
- Addresses.
- Customer/customerId references used by other modules.

Shows:

- Customer table/detail.
- Linked equipment.
- Linked jobs/contracts/documents where available.

Links to:

- Equipment through `customerId`.
- Contracts through `customerId`.
- Service jobs and documents through customer name/id context.
- Parts delivery address autofill.

Does not own:

- Service job pipeline.
- Contract value/PM specs.
- File custody.

## Equipment

Purpose:

- Own installed systems/equipment, serials, warranty/install metadata, and support portal settings.

Owns:

- Equipment registry.
- Customer/equipment links.
- Serial/model/system identity.
- Support portal settings/emails/web links in prototype.
- Warranty/acceptance structured metadata fields.

Shows:

- Equipment detail tabs.
- Installation and acceptance information.
- Support settings.

Links to:

- Customers through `customerId`.
- Contracts through `equipmentId`.
- Service jobs through equipment name/serial.
- Calendar through warranty expiry events.

Does not own:

- Service job execution.
- Document generation.
- Invoice/payment.

## Parts

Purpose:

- Dormant prototype module for parts requests, approval, fulfillment, delivery decision, and vendor return cases.
- Not an active sidebar module in the current focused workspace.
- Do not polish or extend this area unless Parts becomes active again.

Owns:

- Parts request records.
- Parts approval status.
- EDD.
- Delivery method/address/contact.
- Vendor return records.

Shows:

- Parts requests table/detail.
- Approval/transit/arrival/delivery actions.
- Vendor return context.

Pipeline:

- Engineer request.
- Service Manager approval.
- Logistics/Warehouse fulfillment.
- Arrival at warehouse or in transit.
- Delivery/pickup decision.
- Repair can proceed.

Links to:

- Service through `jobId`.
- Equipment through equipment name/part context.
- Customers for delivery address/contact autofill.
- Vendor returns for repair exchange/bad-part handling.

Does not own:

- Document repository status.
- Invoice payment.
- Customer approval of commercial offer.

## Calendar

Purpose:

- Own operational schedule view, PM date planning, and contract/warranty related date visibility.

Owns:

- Calendar rendering.
- PM date overrides.
- Month-limited PM reschedule rule.
- Warranty expiry event display.

Shows:

- Month grid.
- PM schedule table.
- Contract/warranty events.

Links to:

- Contracts for PM schedule generation.
- Equipment for warranty expiry events.
- Service for PM jobs.

Does not own:

- Contract value/remaining balance.
- Equipment master data.
- Document file custody.

## Reports

Purpose:

- Dormant prototype module for read-only health/summary views across modules.
- Not an active sidebar module in the current focused workspace.
- Useful reporting should move into the owning module or Admin overview instead of a separate Reports module.

Owns:

- Report composition.
- Aggregated counts/charts in prototype.

Shows:

- Jobs by stage.
- Document pipeline health.
- Contract utilization.
- Module status overview.

Does not own:

- Editing any domain record.
- Closing workflow.

## Admin

Purpose:

- Own users, role permissions, feedback reports, and operational oversight.

Owns:

- User list.
- Role assignment.
- Per-user permission grid.
- Feedback/bug report queue.
- Admin logs and oversight panels.

Shows:

- Users.
- Permission matrix.
- Bug reports with screenshots/context.
- Admin logs from demo/audit events.
- No top shortcut tile row; Admin should start with real admin work panels, not decorative module cards.

Creates/updates:

- New users.
- User role/permission state.
- Feedback report status/assignee.

Links to:

- Every module for oversight.
- Document/file/audit events.

Does not own:

- Daily execution of service/sales/finance work.
- User-facing document upload/download flow.

## Sidebar Navigation

Current rules:

- Sidebar has a top collapse/expand control.
- Collapse affects only the shell navigation rail; module content panels remain visible.
- Expanded mode shows labels; collapsed mode is icon/marker-focused and remains clickable for direct module routing.
- Neutral outline-style icons are the target style. Temporary compact placeholders may appear during the in-progress refactor.
- Yellow status/count badge bubbles are not shown.
- Queue pressure, reminders, overdue states, and module counters should be redesigned as a separate notification/overview concept instead of being attached to every sidebar item.

## Future Backend Split

When moving from prototype state to DB/API, module boundaries should become resource boundaries:

- `customers`
- `equipment`
- `contracts`
- `service_jobs`
- `work_acts`
- `quotations`
- `parts_requests`
- `documents`
- `document_files`
- `invoices`
- `calendar_events`
- `users`
- `feedback_reports`
- `audit_events`

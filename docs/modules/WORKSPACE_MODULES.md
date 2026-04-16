# Workspace Modules

Date: 2026-04-16

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
- Theme toggle fixed near the bottom-left, centered in the `Workspace` sidebar column, with sun/moon labels.
- Sidebar modules are grouped visually, but the top non-functional `Workspace` text label is not shown.
- Sidebar navigation shows module names only. Initials/icons (`SV`, `WA`, `CT`, etc.) and yellow status badge bubbles are intentionally not used because they confuse module navigation with task/status queues.
- The old sidebar `Reminders` block is not active. Reminder/notification logic will be redesigned later.

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

- Own the concrete Work Act for a Service job: document content, configuration, preview, advanced edit, and generated PDF handoff.
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
- Work Act-specific Collabora advanced editor session for the exact generated document.

Shows:

- Source service job selector.
- Work Act list.
- Selected Work Act builder.
- Equipment picker.
- Template picker.
- Work rows/points and comments.
- Generated PDF actions when available.
- Advanced editor section with Collabora `Editing`, source `.fodt` download, and inline PDF result preview.

Creates/updates:

- Work Act from a Service job.
- Work Act-specific equipment/work row data.
- Generated document draft link.
- Advanced edited `.fodt` session state for the linked Work Act document.
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

- Own reusable Work List Template configuration and advanced document template/output layout metadata.

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

Current landing screen:

- Work List Template configurator.
- Fields: `Company`, `Entry person`, `Template name`, `Service type`, searchable linked `Equipment`, searchable linked `Hospitals`, searchable linked `Work equipment`.
- Actions: `Open in advanced editor`, `Save`, `Delete`, `Cancel`.
- Preview: same-page advanced editor document preview.
- Future advanced editor runtime: Collabora Online Development Edition (`CODE`) for personal/development use only; production/company use must revisit paid support/subscription.
- Collabora runtime is local/server-side only: the `collabora` Docker service has no public host port and is reachable by the browser only through the app nginx proxy.

Creates/updates:

- Reusable template metadata.
- Advanced-editor HTML preview/source.
- Applicability links used when a Work Act chooses a template.

Links to:

- `Work Acts` when a concrete act needs to copy rows from a reusable Template.
- `Documents` only through generated output/layout behavior, not signed-file custody.
- `document-service` for generation/file registry.

Does not own:

- Signed copy upload.
- Document repository filtering/search.
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
- Signed upload modal and Status column download action.

Current table:

- `Reference`
- `Type`
- `Customer`
- `Job status`
- `Created`
- `Status`
- `Action`

Action rule:

- `Job status` shows the linked Service job status.
- `Status` owns yellow `Upload signed` / green `Download signed`.
- `Action` owns only daily row actions: `View`, `Edit`.
- Uploading a signed Work Act opens a confirmation. Confirming marks the linked Service job `Done`; declining leaves it `Waiting signature`.

Does not own:

- Delivery/shipping status.
- Template/procedure checklist editing.
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
- Warranty/acceptance fields synced from acceptance upload.

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

- Sidebar items show only the module label.
- Module initials/icons are not shown.
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

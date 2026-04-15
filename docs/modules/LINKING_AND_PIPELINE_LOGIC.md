# Linking And Pipeline Logic

Date: 2026-04-15

This document explains how records link across Viva Medical modules and how work should move through the prototype. It is intentionally detailed because most future bugs will come from unclear ownership or hidden duplicated state.

## Core Principle

Every business object has one owner module, but many modules can link to it.

Examples:

- A service job is owned by `Service`.
- A generated Work Act source is owned by `Work Acts`.
- A reusable procedure/checklist template is owned by `Templates`.
- Future service/metrology tool registry is owned by `Work Equipment`.
- The document record/file custody is owned by `Documents`.
- The invoice payment state is owned by `Finance`.
- The customer and equipment master data are owned by `Customers` and `Equipment`.

Do not copy ownership into another module just because a row is displayed there. Display links, not duplicated business truth.

## Main Record Types

Current prototype record groups:

- `customers`
- `equipment`
- `contracts`
- `jobs`
- `quotations`
- `partsRequests`
- `vendorReturns`
- `documents`
- `invoices`
- `calendarEvents`
- `users`
- `bugReports`
- source drafts:
  - Work Acts
  - Defect Acts
  - Commercial Offer drafts
  - Procedure/checklist templates
  - Output layouts
- file registry records from `document-service`

## Link Keys

Primary link fields:

- `customerId` - stable link to a customer record.
- `equipmentId` - stable link to an equipment record.
- `jobId` - stable link to a service job, for example `VM-SV-1024`.
- `quotationId` - stable link to a quotation/commercial offer, for example `QTE-501`.
- `contractId` - stable link to a contract, for example `CTR-101`.
- `documentId` - stable link to a document record, for example `DOC-3108`.
- `generatedDocumentId` - source record points to the document draft it produced.
- `fileId` / `fileRecord.id` - stable link to file registry record.
- `invoiceId` - stable link to invoice register record.
- `calendarEventId` - stable link to a calendar event.

Fallback links currently still used in prototype:

- `customer` name.
- `equipment` name.
- `serial`.
- `owner` display name.

Future backend should prefer stable ids over names.

## Reference Display Rule

Daily UI should show the business/source reference first.

Display priority for Documents index:

1. `jobId`
2. `quotationId`
3. `id`

Reason:

- Daily users remember job/quotation numbers better than internal `DOC-...` ids.
- Internal ids still matter for linking, file storage, and audit.

## Ownership Map

| Object | Owner module | Can be shown in | Main links |
|---|---|---|---|
| Customer | Customers | Service, Sales, Contracts, Equipment, Documents, Finance | `customerId`, customer name |
| Equipment | Equipment | Service, Contracts, Calendar, Customers | `equipmentId`, serial |
| Service job | Service | Command Center, Documents, Parts, Finance, Work Acts | `jobId` |
| Quotation | Sales | Commercial Offer source workflows, Documents, Finance | `quotationId`, `customerId`, `equipmentId` |
| Contract | Contracts | Service, Calendar, Customers, Equipment | `contractId`, `customerId`, `equipmentId` |
| Work Act source | Work Acts | Service, Documents preview/source context | `jobId`, `generatedDocumentId` |
| Defect Act source | Source workflow | Service, Documents preview/source context | `jobId`, `generatedDocumentId` |
| Commercial Offer source | Source workflow | Sales, Documents preview/source context | `quotationId`, `generatedDocumentId` |
| Procedure/checklist template | Templates | Work Act draft selector | `workTemplateId`, `linkedEquipmentIds`, `linkedHospitalIds`, `linkedServiceTypes` |
| Work equipment tool | Future Work Equipment | Templates, Work Acts | `linkedWorkEquipmentIds`, future used-tool ids |
| Output layout | Templates / output layout metadata | document-service, generated preview | `templateId`, document type |
| Document record | Documents | Service, Sales, Finance, Admin, Reports | `documentId`, `jobId`, `quotationId` |
| File record | document-service / Documents custody | Documents, source preview, Admin logs | `fileId`, `ownerId` |
| Invoice | Finance | Documents, Service, Reports | `invoiceId`, `documentId`, `jobId` |
| Parts request | Parts | Service, Command Center, Reports | `partsRequestId`, `jobId` |
| PM event | Calendar | Service, Reports, Command Center | `contractId`, `equipmentId`, date |
| Feedback report | Admin | Admin only | report id, page/context ids |

## High-Level Link Graph

```text
Customer
  -> Equipment
  -> Contracts
  -> Service Jobs
  -> Quotations
  -> Documents
  -> Invoices

Equipment
  -> Service Jobs
  -> Contracts
  -> Calendar warranty/PM events

Service Job
  -> Parts Requests
  -> Work Act / Defect Act source drafts
  -> Documents
  -> Invoices

Quotation
  -> Commercial Offer source draft
  -> Documents
  -> Service handoff / Contract setup

Source document draft
  -> Procedure template copied into source draft when applicable
  -> Output layout selected for generation
  -> Document record
  -> Generated file record

Document record
  -> Generated file record
  -> Signed/uploaded file record
  -> Source workspace via Edit route
```

## Pipeline Type A: Repair Without Service Contract

Business meaning:

- Customer does not have active service coverage for this repair.
- Diagnosis may lead to parts and commercial offer before repair proceeds.

Current desired flow:

```text
Service creates/receives technical case
  -> Service job `VM-SV-...` is created
  -> Diagnostics stage
  -> Engineer enters diagnostic duration manually
  -> If parts needed, create Parts Request
  -> Service Manager approves Parts Request
  -> Logistics/Warehouse fulfill parts
  -> If customer price approval needed, Sales creates Quotation
  -> Commercial Offer source creates document
  -> Customer approves offer
  -> Sales hands off to Service
  -> Repair stage
  -> Engineer enters repair duration manually
  -> Work Acts creates Work Act
  -> document-service generates PDF
  -> Documents shows `Upload signed`
  -> Engineer collects signature outside system
  -> Engineer uploads signed copy in Documents
  -> Documents Status becomes green `Download`
  -> Finance creates/uploads invoice when billing is needed
```

Owner modules:

- Service owns technical case and repair state.
- Parts owns parts approval/delivery state.
- Sales owns quotation/customer approval.
- Work Acts owns Work Act source document creation.
- Commercial Offer source workflow owns commercial offer source creation until a separate module is created.
- Documents owns file custody and signed upload.
- Finance owns invoice/payment state.

Important links:

- `jobs.id` -> `documents.jobId`
- `jobs.id` -> `partsRequests.jobId`
- `quotations.id` -> commercial offer source `quotationId`
- source draft `generatedDocumentId` -> `documents.id`
- `documents.id` -> `invoices.documentId` when invoice is tied to document

## Pipeline Type B: Repair With Service Contract

Business meaning:

- Repair is covered by active service contract, or contract balance/coverage affects decision.

Flow:

```text
Service job created
  -> Link customer/equipment to active contract
  -> Show remaining/consumed contract value where relevant
  -> Diagnostics
  -> Parts check if needed
  -> Repair proceeds under contract rules
  -> Work Acts creates Work Act
  -> document-service generates PDF
  -> Documents handles signed upload
  -> Documents Status becomes green `Download`
```

Rules:

- Contracts owns coverage and remaining balance.
- Service owns job execution.
- Documents owns file custody.
- Contract remaining/consumed must not be edited from Documents.
- Work Act upload does not itself change contract value unless explicit repair-cost logic is implemented.
- Over-contract warning belongs to Service/Contracts context.

## Pipeline Type C: New System Installation

Business meaning:

- Sales/quotation leads to installation of new equipment.
- Warranty should start from acceptance upload, not from admin review.

Flow:

```text
Sales creates Commercial Offer / Quotation
  -> Customer approves
  -> Contract/install specification configured in Contracts
  -> Service performs installation
  -> Acceptance Report source workflow creates Acceptance Report
  -> document-service generates PDF
  -> Customer signs acceptance
  -> Acceptance report uploaded in Documents
  -> Equipment acceptance date is set from upload date
  -> Warranty expiry is calculated
  -> Calendar gets warranty expiry event
  -> Documents Status becomes green `Download`
```

Owner modules:

- Sales owns commercial approval.
- Contracts owns agreement/specification.
- Service owns installation execution.
- Equipment owns installed-system master data.
- Documents owns acceptance file custody.
- Calendar owns warranty expiry event display.

Important rule:

- Warranty starts from accepted/signed upload date when acceptance report is uploaded, not from later admin close/review.

## Pipeline Type D: Preventive Maintenance

Business meaning:

- PM jobs are generated/scheduled from PM contract settings.

Flow:

```text
Contract has `pmPerYear`
  -> Calendar computes PM schedule across contract period
  -> User can reschedule within same month
  -> Service performs PM visit
  -> Work Acts creates PM/Work Act document
  -> document-service generates PDF
  -> Documents handles signed upload
  -> Documents Status becomes green `Download`
```

PM rules:

- Contracts owns PM frequency and contract period.
- Calendar owns schedule display and date override.
- Service owns PM execution.
- Documents owns signed file custody.
- PM visits should be distributed through the contract period.
- User can move date within the same month.

## Document Creation And Generation Pipeline

Use this when a document is created from structured source data.

```text
Source record exists
  -> User creates/updates source draft in the owning source module
  -> Create document draft
  -> Document record gets `DOC-...`
  -> Source record stores `generatedDocumentId`
  -> document-service generates file
  -> File registry returns file record
  -> Document stores `generatedFile`
  -> Source record stores same generated file/version metadata
  -> Documents index shows yellow `Upload signed`
```

Source record examples:

- Work Act source.
- Defect Act source.
- Commercial Offer draft.

Fields to sync to document:

- `id`
- `type`
- `jobId`
- `quotationId` if applicable.
- `customer`
- `owner` internal queue.
- `createdBy`
- `createdByInitials`
- `created`
- `createdAt`
- `status`
- `pipelineStep`
- `generatedFile`

Fields to sync back to source:

- `generatedDocumentId`
- `generatedFile`
- `generatedFileVersions`
- `generatedFileId`
- `generatedFileVersion`
- `generatedAt`
- `deliveryStatus` / audit state where source uses it

## Template Selection And Layout Pipeline

Detailed template rules live in `TEMPLATES_MODULE.md`.

Use this when a source draft needs reusable work instructions or a printable layout.

```text
Procedure/checklist template exists in Templates
  -> Work Act draft selects an applicable active template
  -> Template rows are copied into the Work Act draft
  -> User edits the concrete Work Act draft as needed
  -> Output Layout is selected from document type / template mapping
  -> document-service renders generated file
  -> Documents receives generated file custody
```

Procedure template rules:

- Procedure/checklist templates are registry-style reusable instructions.
- Applicability can use service type, equipment, customer/hospital, and work-equipment tags.
- Empty applicability links mean broadly applicable.
- Work equipment currently means service/metrology tools such as multimeter, oscilloscope, safety analyzer, pressure gauge, thermometer, flow meter, or load-test set.
- Exact tool serial/calibration tracking belongs to the future `Work Equipment` module, not Templates.
- Archived templates should not be offered for new active work.
- Concrete rows/points belong to Work Acts. Later template edits should not silently mutate existing Work Act rows.

Output layout rules:

- Output layouts define printable generated document structure.
- Output layouts can expose merge fields and editable sections.
- Merge fields must match the payload sent to `document-service`.
- FODT/template file upload belongs to output layout administration, not signed customer upload.
- Signed customer upload still belongs to Documents.

## Signed Upload Pipeline

Use this when the customer has returned a signed file.

```text
Documents row has yellow `Upload signed`
  -> User opens centered upload modal
  -> User selects/drops file
  -> User clicks Upload
  -> Frontend uploads file to document-service
  -> document-service creates file registry record
  -> Document stores signed/uploaded file metadata
  -> Documents row Status becomes green `Download`
```

Document fields:

- `signedFile`
- `signedUploadedAt`
- `signedBy`
- `uploaded`
- `uploadedAt`
- `uploadedFile`
- `description`

File metadata:

- `kind = signed-document`
- `ownerType = document`
- `ownerId = document id`
- `meta.signedCopy = true`

UI rules:

- Upload button lives in `Status`.
- Download after upload lives in `Status`.
- `Action` remains `View` / `Edit`.

## External Upload Pipeline

Use this when user uploads a file that did not originate from a generated source draft.

```text
User clicks Upload document
  -> Select type/job/customer/created/file/description
  -> Upload file to document-service
  -> Create new document record
  -> If type is Invoice, create/update Finance invoice row
  -> If type is Acceptance report, sync warranty/acceptance fields
```

Invoice-specific behavior:

- Type `Invoice` creates invoice row in Finance.
- Finance remains owner of payment status.
- Documents remains owner of file custody.

Acceptance-specific behavior:

- Type `Acceptance report` can update equipment acceptance/warranty fields.
- Calendar warranty event can be created/updated.

## Invoice Pipeline

Current prototype:

```text
Service/Sales work creates need for billing
  -> Finance owns invoice register
  -> Invoice can be generated or uploaded
  -> Uploaded invoice file creates document record when using shared upload flow
  -> Invoice row links to `documentId` and `jobId`
  -> Finance manages payment status
```

Rules:

- Documents must not show payment status in its index.
- Finance must not own signed service act upload.
- Invoice file custody can be displayed through Documents, but payment truth stays in Finance.

## Parts And Delivery Pipeline

Current prototype:

```text
Engineer identifies part need
  -> Parts request created with `jobId`
  -> Service Manager approves/rejects
  -> Logistics/Warehouse mark transit/arrival
  -> Delivery method/address/contact selected
  -> Repair proceeds
```

Rules:

- Delivery status belongs to Parts.
- Parts delivery address/contact can use Customer registry data.
- Documents index must not display delivery state.
- Parts/vendor documents can be linked to Documents for file custody, but shipping workflow stays in Parts.

## Contracts To Calendar Link

Contract fields:

- `start`
- `end`
- `pmPerYear`
- `equipmentId`
- `customerId`

Calendar behavior:

- Compute PM schedule from contract period and PM frequency.
- Respect user date overrides within the same month.
- Show warranty expiry events from equipment/warranty sync.

Rules:

- Calendar does not edit contract value or PM frequency.
- Contracts does not render the whole calendar.
- Documents upload can trigger warranty expiry only through acceptance/warranty sync rules.

## Customer And Equipment Link Rules

Customer:

- Owns contacts and addresses.
- Provides delivery/contact data to Parts.
- Provides display context to Service/Sales/Documents/Finance.

Equipment:

- Owns serial/model/install/warranty context.
- Links to Customer.
- Links to Contracts.
- Links to Service jobs.
- Receives acceptance/warranty updates from acceptance report upload.

Use stable ids where available:

- `customerId`
- `equipmentId`

Use display names only as fallback in prototype logic.

## Admin And Feedback Link Rules

Admin owns:

- Users.
- Role/permission matrix.
- Feedback reports.
- Admin logs.

Feedback report context should capture:

- Current page.
- Current role.
- Selected document id.
- Selected template id.
- Selected service job id.
- Screenshot/annotation attachment ids.

Rules:

- Feedback report visibility is admin-only by default.
- Feedback screenshots are runtime files and must not be committed.
- Admin logs can aggregate document upload/rejection/finish legacy events, but Admin does not own daily document upload UX.

## Status Terms By Module

Avoid using one generic `Status` meaning everywhere.

Documents:

- `Upload signed`
- green `Download`
- internal generated/signed metadata

Service:

- job execution status/stage, for example Open/Blocked/Finished or Diagnostics/Repair.

Sales:

- quotation/commercial approval status, for example Draft/Sent/Awaiting approval/Approved/Handed off/Rejected.

Contracts:

- contract lifecycle/status, for example Active/Edit mode/Expired.

Finance:

- invoice status and payment status.

Parts:

- request fulfillment status and delivery status.

Calendar:

- event/PM schedule status.

## Persistence And Current Prototype Limits

Current state persistence:

- Mutable frontend state is saved to localStorage.
- Runtime document/feedback files are saved through `document-service/storage`.
- File registry is JSON-based for prototype.

Known limits:

- No final DB model yet.
- No real auth/permission enforcement yet.
- No final audit schema yet.
- No legal retention/archive policy yet.
- Some legacy workflow functions still exist even when not exposed in current index UI.

## Future Backend Data Model Direction

Suggested entities:

- `users`
- `roles`
- `permissions`
- `customers`
- `contacts`
- `equipment`
- `contracts`
- `service_jobs`
- `quotations`
- `parts_requests`
- `vendor_returns`
- `documents`
- `document_files`
- `document_file_versions`
- `invoices`
- `calendar_events`
- `feedback_reports`
- `audit_events`

Suggested core constraints:

- A document file must have one owner record.
- A generated file should be versioned.
- Signed uploads should never overwrite generated files; they should be separate file records linked to the same document.
- Invoice payment status should not live in document files.
- Delivery status should not live in document index state.
- Warranty start should be traceable to acceptance upload/audit event.

## Regression Checklist For Cross-Module Work

When implementing a flow that crosses modules, verify:

- The source module remains owner of the business record.
- Documents owns only document/file custody.
- Finance owns only invoice/payment truth.
- Parts owns only parts/delivery truth.
- Calendar derives PM/warranty dates from Contracts/Equipment, not from copied state.
- `Edit` routes to the source workspace.
- Display reference uses job/quotation/source reference before internal document id.
- File upload creates file registry metadata.
- Generated and signed files are separate records.
- Sidebar badges count the intended role-specific queues.
- Documentation links are updated in this folder.

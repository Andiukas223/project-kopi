# Documents Module

Date: 2026-04-16

This document is the detailed source of truth for the `Documents` workspace. Documents is a repository and file custody module. It is not the main template editor, not the shipping tracker, and not the invoice payment module.

## Product Purpose

Documents answers these daily questions:

- Which document record exists for this job/quotation/invoice/parts flow?
- Has a generated document been created?
- Does the user need to upload a signed copy?
- If a signed/uploaded file exists, where can the user download it?
- Can the user search old and current documents quickly by reference, customer, owner initials, type, and created date?
- Can the user open the source workspace to edit the business record that produced the document?

## Current UI Contract

The Documents index is table-first.

Current columns:

- `Reference`
- `Type`
- `Customer`
- `Job status`
- `Created`
- `Status`
- `Action`

Columns intentionally removed from the index:

- Old workflow `Status` stage column.
- Delivery/Delivery Status.
- File name/details.
- Separate Uploaded/Signed column.
- Due date.
- Red overdue row stripe.

Reason:

- The daily document register should be a simple custody queue.
- Delivery/shipping belongs to Parts/Logistics/Warehouse.
- File detail belongs in preview/detail/audit contexts, not the index row.
- Created/uploaded date is a better daily reference than due date for document lookup.

## Status Column Logic

The `Status` column is the document upload/download action location.

If no signed/uploaded file exists:

```text
Status = yellow Upload signed button
```

If a signed/uploaded file exists and has a download or preview URL:

```text
Status = green Download signed link
```

If upload state exists but a usable URL is missing:

```text
Status = disabled green Download signed button
```

The `Status` column must not show:

- Delivery/shipping status.
- Generated file name.
- `DONE`.
- `Finish`.
- Rejection workflow controls.

## Action Column Logic

The `Action` column is intentionally minimal.

Current actions:

- `View`
- `Edit`

## Job Status Column Logic

The `Job status` column shows the linked Service job state, not document workflow state.

Current statuses:

- `Open` - job exists and still needs work/configuration.
- `Waiting signature` - generated Work Act exists and the app is waiting for signed upload or completion confirmation.
- `Done` - signed Work Act upload was confirmed as final job proof.
- `Cancelled` - job was stopped but retained.

Rules:

- Documents can display job status because signed Work Act custody is the clearest proof of completion.
- Documents must not use this column for shipping/delivery, invoice payment, or template status.
- Uploading a signed Work Act does not silently close the job. The completion confirmation decides whether the job becomes `Done`.

Not shown in the Documents index action column:

- `Download` for generated files.
- `Reject`.
- `Finish`.
- `DONE`.
- `Advance`.
- Archive/restore.

`Download signed` for signed/uploaded files lives in `Status`.

Generated-file download remains available from preview/source contexts, not as an index action.

## Filters And Search

Current filters:

- Free text search.
- Type.
- Customer.
- Created date query.

Removed filters:

- Queue.
- Old workflow status.
- Date range `from/to`.

Created date query accepts:

- `2026`
- `2026-04`
- `2026-04-15`
- `202604`
- Native calendar picker full date.

Search should match:

- Internal document id, for example `DOC-3108`.
- Source/job reference, for example `VM-SV-1024`.
- Quotation reference, for example `QTE-501`.
- Customer.
- Internal owner bucket.
- Creator name.
- Creator initials.
- Document type.
- Description.
- Signed by.
- Created date.

Pressing `Enter` in search/date fields applies the search.

## Reference Column Rule

Daily users should see the source/business reference first.

Display priority:

1. `jobId`
2. `quotationId`
3. `id`

Examples:

- Work Act for job `VM-SV-1024` displays `VM-SV-1024`.
- Quotation document linked to `QTE-501` should display the source quotation/job reference where available.
- Internal `DOC-...` remains valid for system links, file records, preview state, and audit.

## Owner Rule

User-facing `Owner` means creator initials.

Preferred fields:

1. `createdByInitials`
2. initials derived from `createdBy`
3. fallback from legacy owner/name if needed

Internal `owner` can remain a queue/module bucket such as:

- `Service`
- `Sales`
- `Finance`
- `Admin`

Do not expose internal module queue ownership as the primary daily owner when creator initials exist.

## Created Date Rule

Documents index uses `Created`.

Source priority:

1. `created`
2. `createdAt` date portion
3. `uploadedAt` date portion for uploaded external docs
4. legacy fallback only if needed

`Due` remains available for reminders/SLA/overdue logic but is not the main index column.

## View Behavior

`View` opens the generated document for review through Collabora view mode.

Current behavior:

1. Use the real generated file from `generatedFile`.
2. Create a read-only local WOPI session through `document-service`.
3. Open Collabora in `view` permission mode inside a centered/full-window modal.
4. If the document has no generated file yet, generate a PDF first and then open Collabora view mode.
5. If Collabora cannot open, show the printable fallback preview instead of forcing a browser download.

Rules:

- `View` is for reviewing what the system generated.
- `View` must not download the signed/uploaded customer return.
- `View` must not expose the signed/uploaded file as the primary preview.
- Collabora sessions opened from Documents are read-only.
- The WOPI source file is copied from the generated file registry entry; signed upload custody stays separate.
- Viewing should not force a browser download.

Download separation:

- Documents index `Status > Download signed` downloads the signed/uploaded file that the user uploaded.
- Generated-file download can still exist in source/advanced contexts, but it must not return to the Documents index `Action` column.

## Edit Behavior

`Edit` routes to the owning source workspace when possible.

Routing examples:

- Work Act / legacy Service Act -> `Work Acts`.
- Contract -> `Contracts` where applicable.

If no dedicated source workspace exists, keep the user in Documents and open the available detail/preview context.

Inactive source modules:

- Sales/Commercial Offer.
- Finance/Invoice.
- Parts/Vendor Return.
- Reports.

These are hidden from the active sidebar. Documents must not route users into those retired prototype modules; keep the document in the repository context until that source module is intentionally reactivated.

Work Act / legacy Service Act current implementation:

1. User clicks `Edit` on a Documents row.
2. The app routes to `Work Acts`.
3. The exact linked Work Act source is selected when `doc.workActId`, `generatedDocumentId`, or `jobId` can resolve it.
4. If the document is a legacy/demo Service Act and no Work Act source exists yet, the route creates a minimal Work Act configuration shell linked to that same `doc.id`.
5. The Work Act configuration panel opens for that source record.
6. The app creates a writable Collabora session with `sourceType = work-act-document`.
7. Collabora opens in `Editing` mode inside the Work Act page.
8. The user can save in Collabora and open `Preview result PDF` from the Work Act advanced-editor section.

Rules:

- Documents `View` is still generated-output review only.
- Documents `Edit` is source-workspace editing.
- Work Act is the only implemented advanced-editor edit path for now.
- Other document types should not reuse the Work Act editor; they need their own module/configuration page first.

## Upload Signed Flow

Trigger:

- User clicks yellow `Upload signed` in the `Status` column.

UI:

- Centered modal.
- Drag-and-drop file zone.
- Click-to-upload file zone.
- `Who signed` field.
- `Short description` field.
- Buttons: `Upload`, `Cancel`.

Accepted file types:

- PDF.
- ODT/DOC/DOCX.
- PNG/JPG/JPEG/WEBP.

On upload:

1. Read file as base64 in browser.
2. POST to `/api/documents/files/upload`.
3. Send `kind = signed-document`.
4. Send `ownerType = document`.
5. Send `ownerId = doc.id`.
6. Send metadata: `documentType`, `jobId`, `customer`, `signedCopy = true`.
7. Backend stores binary under runtime storage.
8. Backend creates file registry record.
9. Frontend stores returned `fileRecord` as signed/uploaded file metadata on the document.
10. Row rerenders with green `Download signed` in `Status`.
11. If the document is a Work Act, a completion confirmation opens.
12. If the user confirms completion, the linked Service job and Work Act document become `Done`.
13. If the user declines completion, the linked Service job remains `Waiting signature`.

Document fields set/updated:

- `signedFile`
- `signedUploadedAt`
- `signedBy`
- `uploaded = true`
- `uploadedAt`
- `uploadedFile`
- `description`
- `pipelineStep = Signature`
- `status = Signature`
- `deliveryStatus = Signed copy uploaded` as internal/legacy metadata, not index display
- delivery audit entry

Current UI note:

- The Documents index does not expose `Finish` / `DONE` controls. Existing close logic can remain as backend/future workflow logic, but it is not part of the daily index UI.
- Work Act completion is handled through the signed-upload confirmation, not through a permanent row action button.

## Upload External Document Flow

Trigger:

- User clicks `Upload document`.

UI:

- Same centered modal.
- For non-target upload it includes metadata fields:
  - document type
  - job reference
  - customer
  - who signed
  - created date
  - file
  - short description

Required:

- Document type.
- Job reference.
- Customer.
- File.

On upload:

1. Create new `DOC-...` id.
2. POST file to `/api/documents/files/upload`.
3. Send `kind = uploaded-document`.
4. Add document record to `documents`.
5. If type is `Invoice`, also create an invoice register row in `invoices`.
6. If type is `Acceptance report`, sync warranty/acceptance fields where possible.

## Generated Document Flow

Generated documents are usually created from their owning source module, not directly from Documents.

Flow:

1. Source workspace creates/updates a source draft.
2. Source action creates a document draft in `documents`.
3. Auto-generation or explicit generation calls `document-service`.
4. `document-service` returns file registry metadata.
5. Document gets `generatedFile`.
6. Source record gets the same generated file/version metadata.
7. Documents index sees generated file as valid only when it has a real `document-service` download/preview URL.
8. If no signed file exists, Documents index shows yellow `Upload signed`.

Mock file rule:

- Legacy `*-mock.pdf` or `source = mock` artifacts do not count as real generated files in the repository.
- A document with only a mock artifact should be queued for real generation.

## File Record Model

Current backend record comes from `document-service`.

Expected useful fields:

- `id` / `fileId`
- `kind`
- `ownerType`
- `ownerId`
- `fileName`
- `mimeType`
- `size`
- `checksum`
- `downloadUrl`
- `previewUrl`
- `createdAt`
- `version`
- `versionLabel`
- `meta`

Kinds currently used or expected:

- `generated-document`
- `uploaded-document`
- `signed-document`
- `template-file`
- `feedback-screenshot`

Runtime storage:

- `document-service/storage` for uploaded/runtime files.
- `document-service/generated` for generated outputs.
- Runtime file contents are ignored by git.

## Status Normalization

On load/bind, document workflow state is normalized from real file state.

Rules:

- Real generated file exists, signed file missing -> `Signature` / `Needs signed upload`.
- Signed file exists -> uploaded state and green `Download signed` in UI.
- Persisted `Auto generating` without real generated/signed file -> reset and queue generation again.
- Mock generated file only -> treat as missing generated file.

This prevents stale localStorage/demo-state records from getting stuck in `Auto generating` or showing upload readiness without a real file.

## Warranty Sync

Acceptance upload can update equipment/calendar warranty fields.

When an `Acceptance report` is uploaded:

- Use upload date as acceptance date where appropriate.
- Calculate warranty expiry according to current prototype rules.
- Update linked equipment acceptance/warranty fields.
- Create/update warranty expiry calendar event.

Detailed cross-module rules are in `LINKING_AND_PIPELINE_LOGIC.md`.

## Text Selection Rule

The Documents table must allow text selection and copy/paste.

Row click/selection must not rerender or clear active user text selection.

Interactive elements inside rows (`button`, `a`, `input`, `select`, `textarea`) must not trigger row selection.

## Out Of Scope For Documents Index

Not part of the current Documents index:

- Delivery state.
- Shipping status.
- Parts arrival state.
- Invoice payment state.
- Commercial approval state.
- Contract balance.
- Template/body editing.
- Archive/restore.
- Final legal retention management.
- File version history expansion in the index row.

## Future Improvements

Planned or expected later:

- File history popover/row expansion.
- DB-backed document/file version model.
- Role/permission checks.
- Real retention/archive policy.
- Real email sending.
- Better empty states for filtered searches.
- Automated Playwright smoke test for generated -> upload signed -> green Download signed.

## Regression Checklist

When changing Documents, verify:

- Table columns remain `Reference`, `Type`, `Customer`, `Job status`, `Created`, `Status`, `Action`.
- `Job status` shows the linked Service job state.
- `Status` shows yellow `Upload signed` when signed/uploaded file is missing.
- `View` opens the generated file through Collabora read-only view mode.
- If no generated file exists, `View` generates a PDF before opening Collabora.
- Collabora Documents view does not reuse the signed/uploaded file as its source.
- `Edit` on a Work Act routes to `Work Acts`, selects the exact document source, and opens a Collabora `Editing` session.
- `Edit` on a legacy/demo Service Act without a source Work Act creates a linked Work Act shell for the same document id.
- Clicking `Upload signed` opens centered modal.
- Drag/drop or click file selection updates selected filename.
- `Upload` stores a file and changes `Status` to green `Download signed`.
- Work Act signed upload opens the job completion confirmation.
- Confirming completion marks the linked Service job `Done`.
- Declining completion leaves the linked Service job `Waiting signature`.
- Green `Download signed` downloads the uploaded signed file, not the generated preview file.
- `Action` remains only `View` and `Edit`.
- Generated `Download` is not reintroduced into `Action`.
- `Reject`, `Finish`, `DONE`, and delivery status are not reintroduced into Documents index.
- Search works with `Enter`.
- Created date partial search works.
- Text selection/copy in table works.
- No browser console errors.

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

Documents must not list reusable Templates as document rows. A Template is a reusable source asset owned by `Templates`; a Document is a generated or uploaded output owned by `Documents`.

## Current Implementation Entry Points

- `src/modules/documents/DocumentsPage.vue` renders the active Vue 3 Documents page: filters, table, upload modal, and Work Act completion confirmation.
- `src/modules/documents/documentViewModel.js` contains Vue-facing display/filter/status helpers copied from the documented Documents rules.
- `src/js/documentPipeline.js` still owns business behavior during migration: document generation, signed/external upload, file registry API calls, source edit routing, warranty sync, and audit updates.
- `src/js/render.js` still renders the generated document print preview and feedback overlays used beside the Vue route. It no longer renders the Documents index, selected-document side panel, old pipeline board, reject controls, or old Documents completion modal.
- `document-service/src/server.js` remains the document generation/upload/download backend.

## Current UI Contract

The Documents index is table-first.

Current columns:

- `Reference`
- `Type`
- `Customer`
- `Job status`
- `Created`
- `Generated output`
- `Signed return`
- `Actions`

Columns intentionally removed from the index:

- Old workflow `Status` stage column.
- Delivery/Delivery Status.
- Separate Uploaded/Signed column.
- Due date.
- Red overdue row stripe.

Reason:

- The daily document register should be a simple custody queue.
- Delivery/shipping belongs to Parts/Logistics/Warehouse.
- Generated-file detail is intentionally compact and limited to custody/action context.
- Created/uploaded date is a better daily reference than due date for document lookup.

## Generated Output Column Logic

The `Generated output` column is the generated-file custody and generated-output action location.

If a generated document exists with a usable preview or download URL:

```text
Generated output = Generated PDF + file/version detail + Open + Download + Export
```

If generated file metadata exists but no URL is usable:

```text
Generated output = Generated + disabled Download
```

If no generated file exists:

```text
Generated output = Not generated + Open
```

Rules:

- `Open` reviews the generated output through the PDF/print preview flow.
- `Download` downloads the generated file returned by `document-service`.
- Export is available from the row and remains available inside the print preview ribbon.
- Generated file actions must not use the signed/uploaded customer return file.

## Signed Return Column Logic

The `Signed return` column is the signed/uploaded customer-return action location.

If no signed/uploaded file exists:

```text
Signed return = yellow Upload signed button
```

If a signed/uploaded file exists and has a download or preview URL:

```text
Signed return = green Download signed link
```

If upload state exists but a usable URL is missing:

```text
Signed return = disabled green Download signed button
```

The `Signed return` column must not show:

- Delivery/shipping status.
- Generated file name.
- `DONE`.
- `Finish`.
- Rejection workflow controls.

## Actions Column Logic

The `Actions` column is intentionally minimal.

Current actions:

- `Edit source`
- `Delete`

`Delete` behavior:

1. User clicks `Delete` on the matching row.
2. Browser confirmation explains that the Documents custody row and document-service custody records will be removed.
3. Frontend calls `DELETE /api/documents/documents/:documentId`.
4. `document-service` removes the matching generated document record from `generated-document-records.json`.
5. `document-service` removes file registry rows where `ownerType = document` and `ownerId = documentId`, and deletes the matching generated/signed/uploaded binary files when they are inside the service storage root.
6. Frontend removes the document from the in-browser `documents` collection and persists the change to `localStorage`.
7. Linked source records such as Work Acts, Defect Acts, and Commercial Offer drafts keep their source data but have generated document/file pointers cleared so the user can regenerate.
8. If the deleted document was the one that marked a Service job done, the explicit document link is cleared and the job returns to an open/waiting-signature style state.

Rules:

- Delete is not archive/restore and does not implement a retention policy.
- Source records are not deleted from `Work Acts`, Defect Acts, Commercial Offer drafts, Service jobs, Customers, or Equipment.
- Production delete must later become permissioned, audited, and retention-aware.

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

Not shown in the Documents index actions column:

- `Reject`.
- `Finish`.
- `DONE`.
- `Advance`.
- Archive/restore.

`Download signed` for signed/uploaded files lives in `Signed return`.

Generated-file open/download actions live in `Generated output`.

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

## Open Behavior

`Open` opens the generated document for review through PDF/print preview or the generated file `previewUrl`.

Current behavior:

1. Use the real generated file from `generatedFile`.
2. Prefer `generatedFile.previewUrl` when it exists.
3. Otherwise show the printable preview fallback.
4. If the document has no generated file yet, generate a PDF first and then open the preview path.

Rules:

- `Open` is for reviewing what the system generated.
- `Open` must not download the signed/uploaded customer return.
- `Open` must not expose the signed/uploaded file as the primary preview.
- Viewing should not force a browser download.
- Collabora/WOPI sessions are not used.

Download separation:

- Documents index `Signed return > Download signed` downloads the signed/uploaded file that the user uploaded.
- Generated-file download lives in the `Generated output` column and must not download signed returns.

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
6. The user edits the structured Work Act fields, rows, equipment, and report options.
7. The user regenerates/updates the PDF draft when needed.

Rules:

- Documents `Open` is still generated-output review only.
- Documents `Edit` is source-workspace editing.
- Work Act editing is structured, not Collabora-based.
- Other document types need their own module/configuration page first.

## Upload Signed Flow

Trigger:

- User clicks yellow `Upload signed` in the `Signed return` column.

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
10. Row rerenders with green `Download signed` in `Signed return`.
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

Generated documents are created from their owning source module, not directly from Documents or Templates. The active source module for this flow is currently `Work Acts`.

Flow:

1. Source workspace creates/updates a source draft.
2. Source action creates a document draft in `documents`.
3. Auto-generation or explicit generation calls `document-service`.
4. `document-service` returns file registry metadata.
5. Document gets `generatedFile`.
6. Source record gets the same generated file/version metadata.
7. Documents index sees generated file as valid only when it has a real `document-service` download/preview URL.
8. If no signed file exists, Documents index shows yellow `Upload signed`.

Rules:

- Direct template-source generated records, for example records with `sourceType = template` or `type = Template document` and no Work Act/source context, are not valid Documents rows.
- Documents generated-record sync must ignore old template-source artifacts so reusable Templates never appear as normal documents.
- A Work Act generated from a Template remains a `Work Act` document because the source owner is `Work Acts`; the Template id is only input metadata.

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
- Source record deletion.

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

- Table columns remain `Reference`, `Type`, `Customer`, `Job status`, `Created`, `Generated output`, `Signed return`, `Actions`.
- `Job status` shows the linked Service job state.
- `Generated output` shows generated-file custody and Open/Download/Export actions.
- `Signed return` shows yellow `Upload signed` when signed/uploaded file is missing.
- `Open` opens the generated file through PDF/print preview or `generatedFile.previewUrl`.
- If no generated file exists, `Open` generates a PDF before opening preview.
- Documents view does not reuse the signed/uploaded file as its source.
- `Edit` on a Work Act routes to `Work Acts` and selects the exact document source.
- `Edit` on a legacy/demo Service Act without a source Work Act creates a linked Work Act shell for the same document id.
- Clicking `Upload signed` opens centered modal.
- Drag/drop or click file selection updates selected filename.
- `Upload` stores a file and changes `Signed return` to green `Download signed`.
- Work Act signed upload opens the job completion confirmation.
- Confirming completion marks the linked Service job `Done`.
- Declining completion leaves the linked Service job `Waiting signature`.
- Green `Download signed` downloads the uploaded signed file, not the generated preview file.
- `Actions` contains `Edit source` and `Delete`.
- `Delete` asks for confirmation before changing state.
- Deleting a generated/signed/uploaded document removes the row from Documents and calls the document-service delete endpoint so backend-generated records do not reappear on reload.
- Deleting a Work Act document clears the generated document/file link on the Work Act source without deleting the Work Act itself.
- Generated `Download` stays in `Generated output`.
- `Reject`, `Finish`, `DONE`, and delivery status are not reintroduced into Documents index.
- Search works with `Enter`.
- Created date partial search works.
- Text selection/copy in table works.
- No browser console errors.

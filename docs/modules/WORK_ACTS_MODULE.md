# Work Acts Module

Date: 2026-04-16

This document is the source of truth for the user-facing `Work Acts` workspace.

## Scope

`Work Acts` owns concrete Work Acts and their generated source records.

It does not own reusable procedure templates. Those belong to `Templates`.
It does not own signed-file custody. That belongs to `Documents`.

The module exists so daily service work has a clear home:

- select a source Service job;
- create or open the one Work Act linked to that job;
- choose equipment serviced in that act;
- choose a reusable Template and copy its rows into the Work Act;
- edit the concrete Work Act rows, work description, options, and report settings;
- create/generate the printable PDF draft;
- hand the generated/signed document lifecycle to `Documents`.

Core rule:

- One Service job has exactly one Work Act.
- `Create Work Act` creates the missing Work Act for the selected job.
- `Open Work Act` opens the existing Work Act for the selected job.
- Generating the PDF moves the linked Service job to `Waiting signature`.
- The Service job becomes `Done` only after a signed Work Act is uploaded in `Documents` and the user confirms completion.

## Current UI Location

Workspace:

- Sidebar module: `Work Acts`
- Internal route/page id: `workacts`
- Legacy source area: old notes may still say `Template Generation / Work Acts`.

Current implementation status:

- A first `Work Acts` sidebar route exists.
- It reuses the existing Work Act workspace renderer and handlers that were originally inside `Template Generation`.
- Remaining legacy code names can be renamed gradually when safe; user-facing copy should say `Work Act`.

Implementation entry points:

- `src/index.html` - sidebar item `Work Acts`.
- `src/js/render.js` - `workActsPage()`, `workActsWorkspace()`, Work Act panels, list/table rendering, generated file actions.
- `src/js/interactions.js` - Work Act creation, selection, equipment/template/row updates, document draft creation.
- `src/js/workActAdvancedEditor.js` - opens a specific Work Act document in Collabora edit mode and builds the Work Act-specific WOPI payload.
- `src/js/state.js` - selected Work Act, source job id, filters, and Work Act errors.
- `src/js/data.js` - `workActs` seed/prototype collection.
- `src/js/documentPipeline.js` - Documents `Edit` route into Work Acts.
- `document-service/src/server.js` - Work Act PDF generation through `tpl-service-act` / `work-act.fodt`.
- `document-service/templates/viva-medical-logo.png` - Viva Medical logo embedded into the Collabora Work Act editing template.
- `docs/modules/TEMPLATES_MODULE.md` - reusable template source.
- `docs/modules/DOCUMENTS_MODULE.md` - generated/signed file custody.

## Ownership

Owns:

- Work Act source/configuration record.
- Work Act number/reference.
- Source service job link.
- Selected equipment for this specific act.
- Concrete work rows/points for this specific act.
- Work description / customer-facing work text.
- Report options / print settings.
- Entry person and created/updated timestamps.
- Generated document id and generated file metadata link.
- Collabora advanced-editor session metadata for this Work Act document.
- Source-side preview/download/email audit hints.

Does not own:

- Reusable Work List Templates.
- Output layout definition.
- Signed PDF upload/storage.
- Final document repository search.
- Invoice/payment state.
- Service job creation itself.
- Signed upload completion confirmation.
- Parts delivery status.

## Source Records

Current collection:

- `workActs` in `src/js/data.js`.

Important fields currently used or expected:

- `id` - internal Work Act source id.
- `number` - user-facing Work Act number.
- `jobId` - source service job id.
- `customer` - customer/hospital name, copied from source job for display/search.
- `equipment` - primary equipment label.
- `equipmentItems` - selected equipment rows for this act.
- `workTemplateId` - reusable Template copied into the act.
- `workText` - customer-facing work description.
- `workRows` - concrete rows/points owned by the Work Act and appended to the generated Work Act document.
- `reportOptions` - print/output flags.
- `entryPerson` - person who created/maintains the act.
- `status` - draft/workflow status.
- `documentId` / `generatedDocumentId` - linked Documents/generated document record.
- `generatedFile` - generated file metadata when available.
- `previewUrl` / `downloadUrl` - generated document access where applicable.
- `audit` / `history` - source-side actions where available.

Future backend model should keep these as database records rather than localStorage state and enforce the one-job-one-Work-Act constraint.

## Workflow

Happy path:

```text
Service job exists
  -> Work Acts module selects source service job
  -> Create Work Act, or open the existing Work Act
  -> Add/select equipment serviced in this act
  -> Choose reusable Template
  -> Add concrete Work Act rows/points for the real service visit
  -> Edit work description, row completion/comments, report options
  -> Create PDF draft
  -> Generate PDF
  -> Linked Service job becomes Waiting signature
  -> Preview/download generated PDF
  -> Optional: open exact Work Act document in Collabora advanced editor
  -> Optional: preview exported PDF result from the edited Collabora source
  -> Collect signature outside app
  -> Documents module handles Upload signed
  -> User confirms whether the signed Work Act completes the job
  -> If confirmed, linked Service job becomes Done and Status becomes green Download signed
```

Important rules:

- Templates no longer expose row editing in the Templates page.
- Work Act rows are added/edited in `Work Acts` and are independent from the reusable Template after they are created.
- Templates do not create or copy Work Act rows. The user adds/selects rows in `Work Acts` for the concrete service visit.

## Current UI Behavior

The Work Acts page should show:

- Source service job selector.
- `Create Work Act` or `Open Work Act`.
- Selected Work Act panel.
- Equipment picker/search/add/remove.
- Template picker.
- `Apply template`.
- `Add row`.
- `Create PDF draft` / `Update PDF draft`.
- `Generate PDF`.
- `Preview`.
- Work description textarea.
- Work rows table with completion/comments.
- Report options / print settings.
- All Work Acts list with search/status/person filters.
- Generated file metadata and actions once a document exists.
- `Edit in advanced editor` for generated Work Act documents.
- Same Work Act panel advanced-editor section with:
  - Collabora iframe in `Editing` mode.
  - exact linked document id.
  - source `.fodt` download.
  - exported PDF result preview.

Daily UI principle:

- Work Acts should feel like a production work register, not a template editor.
- Reusable template configuration should always route to `Templates`.
- Concrete rows/points should always be edited here, not in `Templates`.
- Generated/signed document custody should always route to `Documents`.

## Links To Other Modules

Service:

- Provides source job, customer, equipment, engineer, service type, and pipeline context.
- Work Act should not edit the full Service job except through explicit links/actions.
- One Service job can create/open exactly one Work Act.
- Generated PDF handoff sets the Service job status to `Waiting signature`.

Templates:

- Provides reusable work/procedure templates.
- Work Act uses the selected template as context for the document body, service type, and applicability links.
- Concrete rows/points are created in `Work Acts` and appended to the generated Work Act document.
- Work Act may show template name and link back to template configuration.

Documents:

- Receives generated Work Act document record.
- Owns signed upload/download status.
- Documents `Edit` for Work Act should route back to `Work Acts`.
- Documents `Edit` for Work Act opens the exact document row in the Work Acts configuration page and starts the Collabora advanced editor for that same `doc.id`.
- If a legacy/demo Service Act document has no Work Act source draft yet, the edit route may create a minimal Work Act configuration shell linked to that same document so the user is not left on an empty Work Acts page.
- Documents signed upload asks for completion confirmation. `Done` is set only after that confirmation.

Equipment:

- Provides equipment registry records.
- Work Act stores selected equipment snapshot/link for the act.

Parts:

- Future: Work Act notation such as repair exchange/vendor return may create or link Parts/Vendor Return cases.

Finance:

- Future: billable/non-billable Work Act context may trigger invoice need, but invoice ownership stays in Finance.

## Generated Document Rules

Output layout:

- Current Work Act generated PDF uses `document-service/templates/work-act.fodt`.
- Template id: `tpl-service-act`.
- Output format should default to PDF for daily users.

Collabora advanced editor layout:

- Work Act advanced edit sessions use `sourceType = work-act-document`.
- The backend renders a Work Act-specific flat ODT source for Collabora, using the current Work Act config and the exact linked Documents record.
- The Collabora Work Act source embeds the Viva Medical logo from `document-service/templates/viva-medical-logo.png`.
- Example/customer screenshots from Tomis or other systems are visual references only; generated Work Act content must use Viva Medical branding, not Eminentis or any other vendor logo.
- Saving in Collabora writes the edited `.fodt` back into local WOPI storage.
- `Preview result PDF` exports the latest saved Collabora session to PDF and opens it inline.
- The edited `.fodt` is not yet parsed back into structured Work Act rows/options. Structured fields remain canonical until a parser/promote flow is designed.

Generation flow:

- Work Act creates or updates a `Documents` draft record.
- `document-service` generates the PDF.
- Generated file metadata should be saved back to both the document record and the Work Act source record.

Do not:

- Store signed PDF as Work Act source state.
- Treat Collabora template sessions as signed customer documents.
- Regenerate automatically over a signed/uploaded document without version review.

## Documents Edit And Advanced Editor

Current implemented path:

```text
Documents row
  -> Edit
  -> route to Work Acts
  -> select or create the Work Act source record for that document
  -> show the Work Act configuration sections
  -> POST /api/documents/collabora/sessions with sourceType=work-act-document
  -> render Collabora iframe in Editing mode inside the Work Act panel
  -> user saves in Collabora
  -> user opens Preview result PDF
```

Rules:

- `View` in Documents remains read-only generated preview.
- `Edit` for Work Act is the configurable/editable source path.
- Only Work Act / Service Act currently gets the advanced-editor implementation.
- Defect Act, Commercial Offer, Invoice, Parts, Acceptance Report, and future modules should get their own source-specific configuration pages before advanced edit is enabled for them.
- The Work Act advanced editor must use the same Documents row the user clicked, not a generic template.

## Status Model

Current statuses may still be prototype-level.

Current practical statuses:

- `Draft` - Work Act source exists but generated document is not ready.
- `Generated` - PDF draft generated.
- `Signature` - waiting for signed copy handled in Documents.
- `Signed uploaded` - Documents has signed file.
- `Done` - signed upload was confirmed as final job proof.
- `Revision needed` - signed/generated file must be corrected.
- `Cancelled` - Work Act is voided but retained for audit.

Status rule:

- Source status belongs to Work Acts.
- File upload status belongs to Documents.

## Permissions

Prototype permissions are not final.

Recommended production behavior:

- Service Engineer can create/edit own Work Acts before signature.
- Service Manager can review/edit service-side fields.
- Admin can reopen/cancel/repair exceptional records.
- Manager can view but not edit by default.
- Signed/closed Work Acts should require explicit revision/reopen flow.

## Migration From Templates

Current split:

- `Templates` stays for reusable procedure/checklist template configuration and output layout/admin template behavior.
- `Work Acts` becomes the concrete source module for Work Acts.
- Work rows/points move fully into `Work Acts`; `Templates` only stores applicability and reusable template context.

Migration tasks for the next implementation pass:

- Keep `workActsWorkspace()` behavior but make `workacts` the canonical route.
- Rename UI copy from `Template Generation / Work Acts` to `Work Acts`.
- Rename remaining state names only when safe:
  - `templateGenWorkActJobId` can become `workActSourceJobId`.
  - `templateGenTab` should become unnecessary once Defect Acts and Commercial Offers have their own modules.
- Update Documents edit routing to `workacts`.
- Update Service links to route to `workacts`.
- Keep backwards compatibility for old persisted state where `page=templategen`.

## Verification Checklist

After implementation changes:

- Sidebar `Work Acts` opens the Work Acts page.
- Sidebar `Templates` opens only the template configurator.
- Service job can create/open exactly one Work Act.
- Template can be applied into Work Act rows.
- Work Act rows can be edited independently after apply.
- `Create PDF draft` creates/updates a Documents record.
- `Generate PDF` produces a PDF through `document-service`.
- Generating a Work Act PDF changes the linked Service job to `Waiting signature`.
- Documents `Edit` on Work Act routes back to `Work Acts`.
- Documents `Edit` on a Service Act with no existing Work Act source creates a linked Work Act shell for that same document.
- Work Act advanced editor opens Collabora in `Editing` mode, not `Viewing`.
- Work Act advanced editor shows the exact linked document id and a `Preview result PDF` action.
- Preview result PDF returns `Content-Type: application/pdf` and inline content disposition.
- The Collabora Work Act source contains the Viva Medical logo and does not contain external/example branding.
- Signed upload remains in Documents.
- Signed Work Act upload opens completion confirmation.
- Confirming completion marks the linked Service job `Done`.
- No Work Act-specific workflow appears as a Templates responsibility.

## Related Docs

- `docs/modules/TEMPLATES_MODULE.md`
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/WORKSPACE_MODULES.md`
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md`
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md`
- `docs/CURRENT_STATUS_AND_ROADMAP.md`
- `docs/CHANGELOG.md`

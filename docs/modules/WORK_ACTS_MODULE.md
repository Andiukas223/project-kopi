# Work Acts Module

Date: 2026-04-15

This document is the source of truth for the user-facing `Work Acts` workspace.
Use it in the next implementation chat when moving Work Act creation out of the legacy Templates/Template Generation source-flow area.

## Scope

`Work Acts` owns concrete Work Act drafts and generated Work Act source records.

It does not own reusable procedure templates. Those belong to `Templates`.
It does not own signed-file custody. That belongs to `Documents`.

The module exists so daily service work has a clear home:

- select or create a Work Act draft;
- link it to a source service job;
- choose equipment serviced in that act;
- choose a reusable Template and copy its rows into the Work Act;
- edit the concrete Work Act rows, work description, options, and report settings;
- create/generate the printable PDF draft;
- hand the generated/signed document lifecycle to `Documents`.

## Current UI Location

Workspace:

- Sidebar module: `Work Acts`
- Internal route/page id: `workacts`
- Legacy source area: old notes may still say `Template Generation / Work Acts`.

Current implementation status:

- A first `Work Acts` sidebar route exists.
- It reuses the existing Work Act workspace renderer and handlers that were originally inside `Template Generation`.
- Next implementation pass should rename remaining legacy code names only when it is safe and low-risk.

Implementation entry points:

- `src/index.html` - sidebar item `Work Acts`.
- `src/js/render.js` - `workActsPage()`, `workActsWorkspace()`, Work Act draft panels, list/table rendering, generated file actions.
- `src/js/interactions.js` - Work Act draft creation, selection, equipment/template/row updates, document draft creation.
- `src/js/state.js` - selected Work Act, source job id, filters, and Work Act errors.
- `src/js/data.js` - `workActs` seed/prototype collection.
- `src/js/documentPipeline.js` - Documents `Edit` route into Work Acts.
- `document-service/src/server.js` - Work Act PDF generation through `tpl-service-act` / `work-act.fodt`.
- `docs/modules/TEMPLATES_MODULE.md` - reusable template source.
- `docs/modules/DOCUMENTS_MODULE.md` - generated/signed file custody.

## Ownership

Owns:

- Work Act source draft.
- Work Act number/reference.
- Source service job link.
- Selected equipment for this specific act.
- Concrete work rows/points for this specific act.
- Work description / customer-facing work text.
- Report options / print settings.
- Entry person and created/updated timestamps.
- Generated document id and generated file metadata link.
- Source-side preview/download/email audit hints.

Does not own:

- Reusable Work List Templates.
- Output layout definition.
- Signed PDF upload/storage.
- Final document repository search.
- Invoice/payment state.
- Service job lifecycle itself.
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

Future backend model should keep these as database records rather than localStorage state.

## Workflow

Happy path:

```text
Service job exists
  -> Work Acts module selects source service job
  -> Create Work Act draft
  -> Add/select equipment serviced in this act
  -> Choose reusable Template
  -> Add concrete Work Act rows/points for the real service visit
  -> Edit work description, row completion/comments, report options
  -> Create document draft
  -> Generate PDF
  -> Preview/download generated PDF
  -> Collect signature outside app
  -> Documents module handles Upload signed / Download signed copy
```

Important rules:

- Templates no longer expose row editing in the Templates page.
- Work Act rows are added/edited in `Work Acts` and are independent from the reusable Template after they are created.
- Templates do not create or copy Work Act rows. The user adds/selects rows in `Work Acts` for the concrete service visit.

## Current UI Behavior

The Work Acts page should show:

- Source service job selector.
- `Create Work Act draft`.
- Selected Work Act draft panel.
- Equipment picker/search/add/remove.
- Template picker.
- `Apply template`.
- `Add row`.
- `Create draft` / generated document action.
- Work description textarea.
- Work rows table with completion/comments.
- Report options / print settings.
- All Work Act drafts list with search/status/person filters.
- Generated file metadata and actions once a document exists.

Daily UI principle:

- Work Acts should feel like a production work register, not a template editor.
- Reusable template configuration should always route to `Templates`.
- Concrete rows/points should always be edited here, not in `Templates`.
- Generated/signed document custody should always route to `Documents`.

## Links To Other Modules

Service:

- Provides source job, customer, equipment, engineer, service type, and pipeline context.
- Work Act should not edit the full Service job except through explicit links/actions.

Templates:

- Provides reusable work/procedure templates.
- Work Act uses the selected template as context for the document body, service type, and applicability links.
- Concrete rows/points are created in `Work Acts` and appended to the generated Work Act document.
- Work Act may show template name and link back to template configuration.

Documents:

- Receives generated Work Act document record.
- Owns signed upload/download status.
- Documents `Edit` for Work Act should route back to `Work Acts`.

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

Generation flow:

- Work Act creates or updates a `Documents` draft record.
- `document-service` generates the PDF.
- Generated file metadata should be saved back to both the document record and the Work Act source record.

Do not:

- Store signed PDF as Work Act source state.
- Treat Collabora template sessions as signed customer documents.
- Regenerate automatically over a signed/uploaded document without version review.

## Status Model

Current statuses may still be prototype-level.

Recommended future statuses:

- `Draft` - Work Act source exists but generated document is not ready.
- `Ready to generate` - required rows/context complete.
- `Generated` - PDF draft generated.
- `Signature` - waiting for signed copy handled in Documents.
- `Signed uploaded` - Documents has signed file.
- `Closed` - business process finished, after final decision.
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
- `Work Acts` becomes the concrete source module for Work Act drafts.
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
- Service job can create/open a Work Act draft.
- Template can be applied into Work Act rows.
- Work Act rows can be edited independently after apply.
- `Create draft` creates a Documents record.
- `Generate PDF` produces a PDF through `document-service`.
- Documents `Edit` on Work Act routes back to `Work Acts`.
- Signed upload remains in Documents.
- No Work Act-specific workflow appears as a Templates responsibility.

## Related Docs

- `docs/modules/TEMPLATES_MODULE.md`
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/WORKSPACE_MODULES.md`
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md`
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md`
- `docs/CURRENT_STATUS_AND_ROADMAP.md`
- `docs/CHANGELOG.md`

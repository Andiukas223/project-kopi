# Templates Module

Date: 2026-04-18

This document is the source of truth for the user-facing `Templates` workspace.
Use it for future changes to reusable procedure/checklist templates and output document layouts.

Collabora/WOPI is decommissioned. Keep this file focused on active Templates behavior: structured metadata, applicability links, Umo editing, and output layout configuration.

## Scope

`Templates` is the workspace sidebar label. The canonical internal route/page id is `templates`.
The old route id `templategen` is kept only as a compatibility alias, and older documentation may still refer to this workspace as `Template Generation`.

When a user opens `Templates`, the landing screen is a Templates list/management page. Editing one Template happens on a separate detail route so browsing controls do not compete with the Umo editor.

Templates are split into two different concepts:

- Procedure/checklist templates copied into concrete Work Acts.
- Advanced printable output layouts used for generated files.

Do not mix these two concepts. A procedure/checklist template describes what work should be performed. An output layout describes how a generated document should look.

## Current UI Location

Workspace:

- Sidebar module: `Templates`
- Internal route/page id: `templates`
- Legacy route/page id: `templategen`
- Landing route: `/templates`, a Template list/table with template-domain filters/actions only.
- Detail/edit route: `/templates/:templateId`, an editor-first Template detail page with header actions, Umo content editing, and secondary metadata/applicability/merge-field panels.
- No top-level tab row is shown on the `Templates` landing screen.

Implementation entry points:

- `src/js/data.js` - seed data for templates and output layouts.
- `src/js/state.js` - selected template, edit-mode compatibility flag, and template error state.
- `src/modules/templates/TemplatesPage.vue` - route-aware wrapper that renders the Template list route or Template detail route.
- `src/modules/templates/TemplateListPage.vue` - active Vue 3 Templates list/management UI: search, filters, table rows, create, open/edit, duplicate, and archive actions.
- `src/modules/templates/TemplateDetailPage.vue` - active Vue 3 Template detail/edit UI: header actions, Umo editor, metadata, applicability comboboxes, template data fields (internal `mergeFields`), save/archive/cancel actions.
- `src/components/documentEditor/UmoDocumentEditor.vue` - Umo wrapper for template content editing, content load/save snapshots, Ctrl+S, and token insertion.
- `src/components/documentEditor/editorContent.js` - editor content normalization helpers.
- `src/modules/templates/components/WltSearchableCombobox.vue` - Vue wrapper for the existing searchable combobox DOM contract.
- `src/modules/templates/templateViewModel.js` - Vue-facing helper functions for selected template, list rows/filters, options, Umo-compatible editor HTML, and normalized link arrays.
- `src/stores/templateStore.js` - Vue-facing Template persistence store for load/create/save/duplicate/archive/select.
- `src/services/templateService.js` - `/api/templates/` client. Do not route reusable Templates through `/api/documents/`.
- `src/js/render.js` - generated document print preview/template mapping helpers still used by source preview flows. It no longer renders the active Templates landing page, the Work Acts route, or the old Documents-side output-layout editor panel.
- `src/js/interactions.js` - delegated Work List Template save/delete/cancel compatibility handlers and searchable combobox behavior. Old legacy new/filter/archive/start-work-act/rich-toolbar handlers have been removed.
- `document-service/src/server.js` - document generation and file template endpoints.
- `docker-compose.yml` - `web` + `document-service` runtime.
- `nginx.conf` - `/api/templates/` and `/api/documents/` reverse proxy. `/api/documents/templates*` is blocked because reusable Templates are not Documents.

## Terminology

`Procedure template`:

- The user-facing checklist/procedure template configured in the `Templates` workspace.
- Current persisted resource: Template records under `/api/templates/`.
- Frontend compatibility collection: `workListTemplates`.
- Old/internal abbreviation: WLT, meaning Work List Template.
- Example: ultrasound PM checklist, endoscope washer PM checklist, patient lift safety check.

`Output template`:

- A generated document layout shown in `Output Layouts`.
- Current data collection: `templates`.
- Example: Work Act, Commercial offer, Defect act.

`Output layout blueprint`:

- Structured editor metadata for an output template.
- Current data collection: `documentTemplateBlueprints`.
- Contains merge fields and editable layout sections.

`Template data field` (internal `merge field`):

- A placeholder available to document generation, for example `{d.buyerName}` or `{d.jobId}`.
- Template data fields must match the payload sent to `document-service`.

`FODT template file`:

- LibreOffice/OpenDocument template file used by real generation.
- Export/upload belongs to `Output Layouts`, not to the user-facing `Templates` tab.

## Procedure Template Configurator

Purpose:

- Store reusable work/procedure checklists as Template records.
- Let users scan, configure, save, archive, duplicate, cancel, and edit template body content through Umo.
- Provide applicable templates to concrete Work Acts.
- Keep repeatable work instructions out of individual service jobs until a specific Work Act needs them.
- Do not own concrete Work Acts. Those belong to `Work Acts`.

Current data owner:

- Template records persisted through `document-service` under `/api/templates/`.
- `workListTemplates` in `src/js/data.js` remains the frontend compatibility collection used by Work Acts selection and legacy state sync.

Current state owner:

- `selectedWltId`
- `wltEditMode`
- `wltError`

Current UI entry points:

- `src/modules/templates/TemplatesPage.vue`
- `src/modules/templates/TemplateListPage.vue`
- `src/modules/templates/TemplateDetailPage.vue`
- `src/modules/templates/templateViewModel.js`
- Work Act Template applicability is used by the Vue Work Acts route through `src/modules/workActs/workActsViewModel.js`.

## Procedure Template Fields

Current fields:

- `id` - stable template id, usually `wlt-...`.
- `company` - company doing the service, for example `Viva Medical, UAB`.
- `name` - display name.
- `equipmentCategory` - broad equipment family.
- `serviceType` - primary type, currently limited in the Templates UI to `PM` or `Service`.
- `linkedServiceTypes` - service types where this template is applicable.
- `linkedEquipmentIds` - exact equipment records where this template is applicable.
- `linkedHospitalIds` - customer/hospital records where this template is applicable.
- `linkedWorkEquipmentIds` - service/metrology work equipment used during checks, for example multimeter, oscilloscope, electrical safety analyzer, pressure gauge, thermometer, flow meter, or load-test set.
- `entryPerson` - person who entered or maintains the template.
- `entryDate` - date when the template was entered/updated.
- `language` - `lt` or `en`.
- `bodyText` - summary sentence or short procedure intro.
- `workRows` - legacy data kept only for old prototype records/migration. The active Templates UI does not edit it, and Work Act creation must not copy it.
- `richBodyHtml` - compatibility HTML snapshot for older demo records.
- `editorContent` - current Umo editor content snapshot with HTML, plain text, optional JSON, and update timestamp.
- `editorNote` - optional bug/workaround/review note.
- `isActive` - `false` means archived; missing/true means active. This is derived from the persisted Template record status.

Rules:

- Prefer stable ids over display names for links.
- Current UI archives reusable Templates instead of deleting them from management. Archived Templates stay visible in Templates but are not offered for new active Work Act generation.
- `Templates` stores applicability and reusable template body/context. It should not be used as the daily Work Act row editor.
- `editorContent` is for Umo editing and micro formatting of the template body. `richBodyHtml` remains a compatibility fallback.
- `editorNote` is for implementation notes, workaround notes, or known review needs. It is not customer-facing document copy.

## Procedure Template UI Behavior

The `Templates` workspace currently supports:

- Viewing a dedicated Templates list/table.
- Searching by template name, type, owner, applicability, status, dates, output format, or merge-field count.
- Filtering by template type, status, and owner.
- Opening a template from the list into the editor.
- Duplicating a template into a new active Template record.
- Archiving a template from the list or selected editor.
- Editing `Company`.
- Editing `Entry person`.
- Editing `Template name`.
- Editing `Service type`.
- Linking `Equipment` through a searchable combobox/autocomplete dropdown. The main field itself is the search input; opening the dropdown shows matching equipment rows.
- Linking `Hospitals` through a searchable combobox/autocomplete dropdown. The main field itself is the search input; opening the dropdown shows matching hospital/customer rows.
- Linking `Work Equipment` through a searchable combobox/autocomplete dropdown of service/metrology tools. This list is a seed registry for a future `Work Equipment` module.
- Viewing and editing the current Umo editor content on `/templates/:templateId`.
- Managing template data fields and inserting `{d.fieldKey}` tokens into template content.
- Saving template metadata, applicability links, and visual editor HTML.
- Archiving the selected template so it remains managed in Templates but is not offered to Work Acts.
- Cancelling unsaved metadata/visual-editor changes by rerendering from persisted data.
- Work rows are intentionally not shown on this page. They belong in `Work Acts`, where rows are added to a concrete Work Act and appended to the generated Work Act document.

Searchable combobox/dropdown behavior:

- This control is technically a `searchable combobox` or `autocomplete dropdown`.
- The visible field is both the selected-value display and the search box.
- Clicking the field or arrow opens the dropdown list.
- Typing into the field filters the visible options immediately without changing saved data.
- Users can also ignore search and scroll the dropdown list manually.
- Options are selected by clicking dropdown rows; the Templates page must not use a checkbox list for these three fields.
- Selected rows are highlighted in the dropdown and stored as linked ids.
- Selected options are saved only when the user presses `Save`.
- Empty selections mean broadly applicable, except where a future business rule says the link is required.

Selection behavior:

- Opening a row in the Templates list routes to `/templates/:templateId` and selects that reusable Template source record.
- The edit route is the selection context; the Template picker is not shown in the editing page.
- Editing a selected template should not silently switch to another selected template.
- Cancel should leave persisted data untouched.

## Template List Behavior

Purpose:

- Make reusable Templates easy to scan and manage inside the Templates module.
- Reuse the familiar Documents table density and toolbar pattern without using Documents data, labels, or services.
- Keep the user-facing distinction clear: list rows are reusable source assets, not generated/uploaded document outputs.

Current columns:

- `Template name`
- `Type`
- `Applicability`
- `Owner`
- `Updated`
- `Created`
- `Status`
- `Actions`

Current row actions:

- `Open / Edit` selects the Template source record and opens `/templates/:templateId`.
- `Duplicate` creates a new active Template record through `/api/templates/`.
- `Archive` changes the Template status to `Archived`; it does not create, delete, or mutate Documents.

Rules:

- The list rows are normalized from `templateStore.state.records`, which are loaded from Template persistence.
- Do not use the Documents collection, Documents view model, or Documents API to build this list.
- Archived Templates stay visible in the Templates list for management.
- Work Acts must continue to filter archived Templates out of active generation choices.
- The list may borrow table/filter styling conventions from Documents, but labels, empty states, toolbar copy, and actions must describe reusable Templates.

## Template Detail/Edit Behavior

Purpose:

- Keep Umo as the primary visual focus while editing one reusable Template source record.
- Keep list search/filter/table decisions out of the editing context.
- Keep metadata, applicability, and template data fields available as secondary supporting panels.

Current layout:

- Page header: back to Templates, Template identity/status, updated date, save, duplicate, archive, and cancel.
- Main content: large Umo editor area for reusable template body content.
- Supporting sidebar: tabbed `Metadata`, `Applicability`, and `Template data fields` sections.
- Metadata and applicability remain outside the Umo document body so structured generation inputs are not mixed into freeform content.

Rules:

- `/templates/:templateId` must load from Template persistence through `templateStore` and `/api/templates/`.
- The route must not read Documents records or create persisted Documents.
- Umo content, metadata, applicability, and template data fields save back to the Template record.
- Generated document outputs still belong to Work Acts -> Documents, not to the Template detail page.

## Editor Runtime Decision

Collabora/WOPI is decommissioned and is not part of active Templates behavior.

Active editor:

- Umo is the current Template detail body editing path on `/templates/:templateId`.
- Structured fields remain the source of truth for company, entry person, template name, service type, and applicability links.
- `editorContent` persists the Umo editor HTML/text/json snapshot, with `richBodyHtml` retained only for compatibility.
- Work Act document generation converts saved Umo template HTML into a temporary FODT source before rendering. The converter preserves editor-authored paragraphs, merge fields, bordered tables with generated ODF table columns/cell styles, header cells, multiline table-cell text, and basic merged-cell spans; it must not fall back to copying `editorContent.text` when a visual Work Act PDF is requested.
- Validate this path with `docker compose exec -T document-service npm run validate:template-generation` after generation changes. The smoke test creates a temporary saved Umo template, generates a PDF through the backend endpoint from a Work Act source context, checks the temporary FODT structure, converts the PDF to PNG, inspects table border pixels, and removes its temporary artifacts when it passes.
- Strict proof passes should verify that an HTML-only marker from `editorContent.html` appears in the generated FODT, fallback text/body markers do not appear, placeholders inside normal and merged table cells resolve, `{d.notes}` appears only where explicitly placed, the generated PDF exposes visible table border runs after PNG conversion, and the generated document/file records are accessible through the normal Documents download/preview URLs.
- PDF generation remains handled through source modules and `document-service`.

Removed behavior:

- No `Open in advanced editor` action.
- No Collabora iframe.
- No `/api/documents/collabora/sessions` calls.
- No WOPI metadata stored on templates.
- No Collabora PDF export flow.

Future rule:

- If a browser document editor other than Umo is proposed, treat `docs/modules/COLLABORA_WOPI_INTEGRATION.md` as a historical decision record and create a new explicit product/runtime decision before implementation.

## Procedure Template Applicability

Work Acts use procedure templates through applicability rules.

Current logic:

- `workListTemplateOptionsForAct(act)` first takes active templates.
- It filters active templates through `isWorkListTemplateApplicableToAct(tpl, act)`.
- If at least one template is applicable, only applicable templates are offered.
- If none are applicable, all active templates are offered as a fallback.

Current matching dimensions:

- Equipment ids from the Work Act.
- Equipment items from the Work Act.
- Equipment linked through the source service job.
- Customer/hospital linked through equipment or source job customer.
- Service type from the source job or Work Act.
- Work equipment links are stored on the template, but they are not yet used for Work Act filtering because Work Acts do not yet have a metrology/work-equipment usage registry.

Rules:

- Empty link lists mean broadly applicable.
- Specific links narrow applicability.
- Archived templates should not be offered for new active work.
- Once a procedure template is copied into a Work Act, the Work Act should have its own isolated rows. Later registry template changes should not silently rewrite historical or in-progress Work Acts.

## Output Layouts Configuration

Purpose:

- Manage generated document layout metadata.
- Provide advanced/admin control for printable document templates.
- Keep final document structure separate from procedure checklist content.

Current data owners:

- `templates` in `src/js/data.js`.
- `documentTemplateBlueprints` in `src/js/data.js`.

Current helper functions:

- `documentTemplateForDoc(doc)` in `src/js/render.js` maps document records to output templates for generated preview fallback behavior.

Removed legacy helpers:

- The old `templatePanel(doc)` Documents-side mock generation/editor surface is removed from the active frontend.

Current output templates:

- `tpl-service-act` - Work Act.
- `tpl-diagnostic` - Diagnostic report.
- `tpl-quotation` - Commercial offer.
- `tpl-defect-act` - Defect act.
- `tpl-acceptance` - Acceptance report.
- `tpl-vendor-return` - Vendor return note.
- `tpl-generic-document` - Generic document.

## Output Template Fields

Current `templates` fields:

- `id` - stable template id, usually `tpl-...`.
- `name` - display name.
- `format` - supported output formats, for example `ODT/DOCX/PDF`.
- `owner` - owning module/team bucket, for example `Service`, `Sales`, or `Admin`.
- `body` - editable plain description/body used by the current prototype editor.
- `defaultBody` - reset baseline.

Current `documentTemplateBlueprints` fields:

- `title` - editor title.
- `mergeFields` - allowed/visible fields for the layout.
- `sections` - editable layout sections.
- `sections[].id` - stable section id.
- `sections[].label` - visible section label.
- `sections[].value` - section text with merge fields.

Rules:

- `templates` define the output template identity.
- `documentTemplateBlueprints` define the structured editor experience for selected output templates.
- If a generated file needs a real FODT/DOCX layout, update the backend/template map in `document-service` as well.
- Do not add customer-specific procedure steps into output layouts. Those belong in procedure templates or source drafts.

## Output Layout Editor Behavior

There is no active Vue output-layout editor screen right now.

Current retained behavior:

- Output template seed records still live in `templates`.
- Output layout blueprint metadata still lives in `documentTemplateBlueprints`.
- Generated preview fallback still maps document records to output templates through `documentTemplateForDoc(doc)`.
- Real PDF generation still uses the backend template map and `.fodt` files in `document-service`.

Removed frontend behavior:

- The old Documents-side `Generate mock` panel.
- The old inline output template metadata/body editor.
- The old frontend `Export sections as .fodt` and `Upload .fodt template` controls.

Rules:

- A future output-layout editor should be implemented as a dedicated Vue/admin surface instead of restoring the removed legacy panel.
- This area is advanced/admin by nature.
- Daily service users should work mostly in the `Templates` configurator and source document flows.
- FODT upload/export must not be confused with signed customer upload. Signed customer upload belongs to `Documents`.

## Relationship To Work Acts

Procedure templates feed Work Acts:

```text
Procedure template
  -> selected for Work Act
  -> Work Act user adds/selects concrete rows for the real service visit
  -> those rows are appended to the generated Work Act document
  -> generated document is created
  -> Documents owns generated/signed file custody
```

Rules:

- Procedure template changes affect future Work Acts, not already uploaded signed documents.
- Work Acts own their concrete row list and comments.
- Generated and signed file custody stays in `Documents`.

## Relationship To Documents

Templates do not own uploaded files.

Documents owns:

- Document register.
- Generated file custody.
- Signed upload modal.
- Signed file metadata.
- Green `Download` status after signed upload.

Templates owns:

- Reusable checklist/procedure definitions.
- Output layout definitions.
- Template metadata, applicability, template data fields, and Umo-authored reusable source content.

Templates does not create persisted Documents directly. Work Acts selects a Template and creates the generated output that lands in Documents.

## Where To Put Future Modifications

Add or change a procedure/checklist template:

- Update Template persistence through `/api/templates/` or the default Template seed records in `document-service/src/server.js`.
- If the UI needs a new list field/filter, update `src/modules/templates/TemplateListPage.vue`, `src/modules/templates/templateViewModel.js`, and related CSS.
- If the UI needs a new editor field/action, update `src/modules/templates/TemplateDetailPage.vue`, `src/modules/templates/templateViewModel.js`, and the relevant delegated handlers in `src/js/interactions.js`.
- Keep `workListTemplates` compatibility state in sync only for frontend/Work Acts selection; it must not become the persistence owner again.
- If new state is needed, update `src/js/state.js`.
- Update this document.

Add or change an output layout:

- Update `templates` in `src/js/data.js`.
- Add/update `documentTemplateBlueprints` in `src/js/data.js` when the layout should have editable sections.
- Update `documentTemplateForDoc(doc)` mapping if the document type should automatically use the new layout.
- Update `document-service` template registry/FODT files when real generated output must change.
- Update this document.

Add a template data field:

- Add the field to the generation payload.
- Add the field to the relevant `mergeFields` list.
- Add it to the relevant FODT/output template if generation should render it.
- Add a regression check that the field renders in generated preview/PDF.
- Update this document.

Change visual editor behavior:

- Update `src/modules/templates/TemplateDetailPage.vue`, `src/modules/templates/templateViewModel.js`, rich editor command handlers in `src/js/interactions.js`, and related CSS.
- Keep concrete Work Act rows in `Work Acts`; do not reintroduce row add/edit UI into Templates unless the ownership decision changes.
- Update this document.

Change applicability rules:

- Update the applicability helper in `src/modules/workActs/workActsViewModel.js`.
- Verify equipment, hospital, service type, and fallback behavior.
- Update this document and `LINKING_AND_PIPELINE_LOGIC.md` if cross-module linking changes.

## Non-Goals

The Templates module does not own:

- Signed document upload.
- Document repository search.
- Invoice payment status.
- Parts delivery/shipping status.
- Customer/equipment master data.
- Final audit/legal retention policy.

## Regression Checklist

When changing Templates, verify:

- Opening sidebar `Templates` renders the Templates list/management page.
- The Templates list renders saved Template records from `/api/templates/`.
- Newly created Templates appear in the Templates list.
- The Templates list does not use or show Documents records.
- Opening a row routes to `/templates/:templateId`.
- The Template detail page shows Umo as the primary editing surface.
- Company, entry person, template name, and service type save.
- Equipment, hospitals, and work equipment searchable comboboxes filter by keyword, allow mouse scrolling, and do not render checkbox lists.
- Equipment, hospitals, and work equipment links save.
- Archive keeps the selected Template visible in Templates with `Archived` status and removes it from active Work Act generation choices.
- Duplicate creates a new active Template record in Template persistence.
- Cancel leaves persisted data untouched.
- Umo editor remains usable on `/templates/:templateId`.
- Visual editor Save persists expected HTML and structured metadata.
- Work Act generation from saved Umo template HTML preserves visible table borders, a distinct header row, placeholders inside table cells, multiline table-cell content, and does not inject the flattened template body through `{d.notes}`.
- No `Open in advanced editor` or Collabora iframe action is visible.
- Work rows are not visible in Templates and are handled in `Work Acts`.
- Work Act template selection offers applicable active templates first.
- Archived templates are not offered for new active work.
- Existing Work Act / Commercial offer / Defect act generation still works.
- Signed upload/download in Documents is unchanged.

## Future Improvements

Likely next improvements:

- Move Template persistence from prototype JSON/localStorage compatibility to the future production database.
- Add version history for procedure templates.
- Add approval/review state for templates before active use.
- Add import/export for template packs.
- Add stronger sanitization and allowed-block control for visual editor HTML.
- Add per-role permissions for editing Templates and Output Layouts.
- Add preview with a real Work Act payload before saving an output layout.

# Templates Module

Date: 2026-04-15

This document is the source of truth for the user-facing `Templates` workspace.
Use it for future changes to reusable procedure/checklist templates and output document layouts.

Shared Collabora CODE / WOPI runtime rules live in `COLLABORA_WOPI_INTEGRATION.md`. Keep this file focused on Templates behavior and use the Collabora document for cross-module advanced-editor setup.

## Scope

`Templates` is the workspace sidebar label. The canonical internal route/page id is `templates`.
The old route id `templategen` is kept only as a compatibility alias, and older documentation may still refer to this workspace as `Template Generation`.

When a user opens `Templates`, the landing screen is a Work List Template configurator, not a document-type tab list.

Templates are split into two different concepts:

- Procedure/checklist templates copied into Work Act drafts.
- Advanced printable output layouts used for generated files.

Do not mix these two concepts. A procedure/checklist template describes what work should be performed. An output layout describes how a generated document should look.

## Current UI Location

Workspace:

- Sidebar module: `Templates`
- Internal route/page id: `templates`
- Legacy route/page id: `templategen`
- Landing screen: Work List Template configurator with metadata, link configuration, actions, and advanced-editor preview.
- No top-level tab row is shown on the `Templates` landing screen.

Implementation entry points:

- `src/js/data.js` - seed data for templates and output layouts.
- `src/js/state.js` - selected template, edit mode, filters, Collabora session status, and template editor state.
- `src/js/render.js` - `Templates` workspace UI, template configurator, visual editor/Collabora iframe preview, and output layout helpers.
- `src/js/interactions.js` - Work List Template CRUD handlers and `Open in advanced editor` Collabora session creation.
- `document-service/src/server.js` - document generation, file template endpoints, and the local WOPI bridge used by Collabora.
- `docker-compose.yml` - local `collabora` runtime and internal Docker networks.
- `nginx.conf` - `/hosting`, `/browser`, `/cool`, `/loleaflet`, and `/lool` reverse proxy routes for Collabora.

## Terminology

`Procedure template`:

- The user-facing checklist/procedure template configured in the `Templates` workspace.
- Current data collection: `workListTemplates`.
- Old/internal abbreviation: WLT, meaning Work List Template.
- Example: ultrasound PM checklist, endoscope washer PM checklist, patient lift safety check.

`Output template`:

- A generated document layout shown in `Output Layouts`.
- Current data collection: `templates`.
- Example: Service act, Commercial offer, Defect act.

`Output layout blueprint`:

- Structured editor metadata for an output template.
- Current data collection: `documentTemplateBlueprints`.
- Contains merge fields and editable layout sections.

`Merge field`:

- A placeholder available to document generation, for example `{d.buyerName}` or `{d.jobId}`.
- Merge fields must match the payload sent to `document-service`.

`FODT template file`:

- LibreOffice/OpenDocument template file used by real generation.
- Export/upload belongs to `Output Layouts`, not to the user-facing `Templates` tab.

## Procedure Template Configurator

Purpose:

- Store reusable work/procedure checklists.
- Let users configure, save, delete, cancel, and open an advanced editor for templates.
- Provide applicable templates to Work Act drafts.
- Keep repeatable work instructions out of individual service jobs until a specific Work Act needs them.
- Do not own concrete Work Act drafts. Those belong to `Work Acts`.

Current data owner:

- `workListTemplates` in `src/js/data.js`.

Current state owner:

- `selectedWltId`
- `wltEditMode`
- `wltNewOpen`
- `wltError`
- `wltNewError`
- `wltSearchQuery`
- `wltStatusFilter`
- `wltServiceTypeFilter`
- `wltEntryPersonFilter`
- `wltCollaboraSession`
- `wltCollaboraStatus`
- `wltCollaboraError`

Current UI functions:

- `workListTemplatesWorkspace()`
- `wltVisualHtml()`
- `filteredWorkListTemplates()`
- `workListTemplateOptionsForAct()`
- `isWorkListTemplateApplicableToAct()`

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
- `richBodyHtml` - optional visual editor HTML.
- `editorNote` - optional bug/workaround/review note.
- `isActive` - `false` means archived; missing/true means active.
- `collaboraSessionId` - latest local WOPI session id saved from the advanced editor.
- `collaboraFileName` - latest generated `.fodt` session filename.
- `collaboraDownloadUrl` - local source `.fodt` download endpoint for the latest saved Collabora session.
- `collaboraPdfDownloadUrl` - local PDF export endpoint for the latest saved Collabora session.
- `collaboraUpdatedAt` - timestamp when the template was last connected to a Collabora session.

Rules:

- Prefer stable ids over display names for links.
- Current prototype has a visible `Delete` action for the selected template. Production delete should become permissioned and version-aware.
- `Templates` stores applicability and reusable template body/context. It should not be used as the daily Work Act row editor.
- `richBodyHtml` is for visual editing and micro formatting of the template body.
- `editorNote` is for implementation notes, workaround notes, or known review needs. It is not customer-facing document copy.

## Procedure Template UI Behavior

The `Templates` workspace currently supports:

- Selecting an existing template.
- Editing `Company`.
- Editing `Entry person`.
- Editing `Template name`.
- Editing `Service type`.
- Linking `Equipment` through a searchable combobox/autocomplete dropdown. The main field itself is the search input; opening the dropdown shows matching equipment rows.
- Linking `Hospitals` through a searchable combobox/autocomplete dropdown. The main field itself is the search input; opening the dropdown shows matching hospital/customer rows.
- Linking `Work Equipment` through a searchable combobox/autocomplete dropdown of service/metrology tools. This list is a seed registry for a future `Work Equipment` module.
- Viewing the current advanced-editor document preview on the same screen.
- Opening the advanced editor in Collabora CODE through the same page iframe.
- Downloading a PDF exported from the edited local Collabora session.
- Saving template metadata, applicability links, and advanced-editor HTML.
- Saving Collabora session metadata back onto the selected template when the template is saved.
- Deleting the selected template from prototype state.
- Cancelling unsaved metadata/advanced-editor changes by rerendering from persisted data.
- Work rows are intentionally not shown on this page. They belong in `Work Acts`, where rows are added to a concrete service act and appended to the generated Work Act document.

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

- Selecting a template in the picker reloads the configurator for that template.
- Editing a selected template should not silently switch to another selected template.
- Cancel should leave persisted data untouched.

## Advanced Editor Runtime Decision

See also: `COLLABORA_WOPI_INTEGRATION.md` for the full shared runtime, endpoint, payload, verification, and troubleshooting playbook.

Target editor:

- Use Collabora Online Development Edition (`CODE`) as the future LibreOffice-like advanced editor runtime.
- `CODE` is acceptable for this project because the app is intended for personal/development use:
  - the app runs on the owner's own computer or own server;
  - documents are edited only by the owner;
  - there is no customer, employee, or company production use;
  - no SLA or official vendor support is required;
  - if the editor breaks, the owner accepts debugging it or working around it.

Rules:

- Do not treat `CODE` as a production support commitment.
- If this app later becomes a real multi-user company system, revisit Collabora Online paid subscription/support before production launch.
- `Open in advanced editor` opens Collabora through a same-page iframe, using `document-service` as the file/session/WOPI bridge.
- Runtime container: `collabora` in `docker-compose.yml`.
- Network rule: the Collabora container is attached only to the internal `collabora-net` Docker network and has no host-published port.
- WOPI host allowlist rule: Collabora allows `http://document-service:3001` through `aliasgroup1`; do not point this at the public `web` proxy unless the WOPI source URL is also changed.
- Browser access goes through the existing `web` nginx proxy on `http://localhost:8080/` using Collabora paths such as `/hosting`, `/browser`, `/cool`, `/loleaflet`, and `/lool`.
- The first Docker image pull still contacts Docker Hub; after the image exists locally, the running Collabora service is intended to stay server-local/private.
- Runtime external network posture: `collabora-net` is marked `internal: true`, so the Collabora container has no normal outbound gateway. The editor UI can contain vendor links, but the running container is not given an external route.
- Runtime posture: Collabora is started with `mount_jail_tree=false` for Docker compatibility, plus `fetch_update_check=0`, `allow_update_popup=false`, and `home_mode.enable=true` so update/welcome/feedback calls are disabled for this personal/dev setup. Home mode limits concurrent open connections/documents, which is acceptable for single-owner use.

Implemented local WOPI MVP:

- Frontend calls `POST /api/documents/collabora/sessions` when the user presses `Open in advanced editor`.
- `document-service` renders a temporary flat OpenDocument Text file (`.fodt`) from the current configurator values: company, entry person, template name, service type, linked equipment, linked hospitals, linked work equipment, body text, and rich preview HTML.
- `document-service` stores the session file under `document-service/storage/collabora-wopi/`.
- The session returns a Collabora editor URL resolved from `/hosting/discovery`, a source `.fodt` download URL, and a PDF export URL.
- The frontend replaces the preview pane with a Collabora iframe and a `Download PDF` link.
- Collabora opens in `Editing` mode when `CheckFileInfo` returns writable metadata.
- Pressing Collabora `Save` writes back through WOPI and updates the stored session file, file size, version, `updatedAt`, and `lastSavedAt`.
- The runtime config disables Collabora update/welcome/feedback popups, and the frontend also suppresses the first-run welcome dialog through same-origin browser storage before opening the iframe, so the editor opens directly to the document.

Implemented WOPI endpoints:

- `GET /wopi/files/:fileId` - CheckFileInfo.
- `GET /wopi/files/:fileId/contents` - GetFile.
- `POST /wopi/files/:fileId` - LOCK, GET_LOCK, REFRESH_LOCK, and UNLOCK handling.
- `POST /wopi/files/:fileId/contents` - PutFile/save-back from Collabora.
- `GET /api/documents/collabora/sessions/:sessionId` - session metadata lookup.
- `GET /api/documents/collabora/sessions/:sessionId/download` - download the edited `.fodt`.
- `GET /api/documents/collabora/sessions/:sessionId/download?format=pdf` - export the edited session source to PDF with LibreOffice and download it.

Current limitation:

- The edited `.fodt` is saved locally and the user-facing download exports it to PDF, but it is not yet parsed back into linked equipment, linked hospitals, linked work equipment, or `richBodyHtml`.
- Template `Save` currently persists the Collabora session metadata/download link on the selected template. A later pass should add either structured FODT parsing or an explicit "promote edited FODT to template source" flow.

## Procedure Template Applicability

Work Act drafts use procedure templates through applicability rules.

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
- Once a procedure template is copied into a Work Act draft, the Work Act should have its own isolated rows. Later registry template changes should not silently rewrite historical or in-progress Work Acts.

## Output Layouts Configuration

Purpose:

- Manage generated document layout metadata.
- Provide advanced/admin control for printable document templates.
- Keep final document structure separate from procedure checklist content.

Current data owners:

- `templates` in `src/js/data.js`.
- `documentTemplateBlueprints` in `src/js/data.js`.

Current UI functions:

- `outputTemplatesWorkspace(doc)`
- `templatePanel(doc)`
- `documentTemplateForDoc(doc)`

Current output templates:

- `tpl-service-act` - Service act.
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

Output layout editing is still implemented in helper functions, but it is not exposed as a separate top-level tab on the current `Templates` landing screen.

The output layout editor supports:

- Selecting/editing output template metadata.
- Editing body text.
- Viewing merge fields.
- Editing blueprint sections where a blueprint exists.
- Resetting to defaults.
- Exporting/uploading FODT where supported by the document service.

Rules:

- This area is advanced/admin by nature.
- Daily service users should work mostly in the `Templates` configurator and source document flows.
- FODT upload/export must not be confused with signed customer upload. Signed customer upload belongs to `Documents`.

## Relationship To Work Acts

Procedure templates feed Work Act drafts:

```text
Procedure template
  -> selected for Work Act draft
  -> Work Act user adds/selects concrete rows for the real service visit
  -> those rows are appended to the generated Work Act document
  -> generated document is created
  -> Documents owns generated/signed file custody
```

Rules:

- Procedure template changes affect future draft creation, not already uploaded signed documents.
- Work Act drafts own their concrete row list and comments.
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
- Source generation choices before the generated file lands in Documents.

## Where To Put Future Modifications

Add or change a procedure/checklist template:

- Update `workListTemplates` seed data in `src/js/data.js`.
- If the UI needs a new field/filter, update `workListTemplatesWorkspace()` and related WLT handlers in `src/js/render.js`.
- If new state is needed, update `src/js/state.js`.
- Update this document.

Add or change an output layout:

- Update `templates` in `src/js/data.js`.
- Add/update `documentTemplateBlueprints` in `src/js/data.js` when the layout should have editable sections.
- Update `documentTemplateForDoc(doc)` mapping if the document type should automatically use the new layout.
- Update `document-service` template registry/FODT files when real generated output must change.
- Update this document.

Add a merge field:

- Add the field to the generation payload.
- Add the field to the relevant `mergeFields` list.
- Add it to the relevant FODT/output template if generation should render it.
- Add a regression check that the field renders in generated preview/PDF.
- Update this document.

Change visual editor behavior:

- Update `workListTemplatesWorkspace()`, rich editor command handlers, and related CSS.
- Keep concrete Work Act rows in `Work Acts`; do not reintroduce row add/edit UI into Templates unless the ownership decision changes.
- Update this document.

Change applicability rules:

- Update `isWorkListTemplateApplicableToAct()`.
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

- Opening sidebar `Templates` renders the Work List Template configurator.
- Template picker switches selected template.
- Company, entry person, template name, and service type save.
- Equipment, hospitals, and work equipment searchable comboboxes filter by keyword, allow mouse scrolling, and do not render checkbox lists.
- Equipment, hospitals, and work equipment links save.
- Delete removes the selected template from prototype state and selects the next available template.
- Cancel leaves persisted data untouched.
- Visual editor Save persists expected HTML and structured metadata.
- `Open in advanced editor` creates a Collabora session and renders the iframe in `Editing` mode.
- Collabora `Save` updates the WOPI session `version` and `lastSavedAt`.
- `Download PDF` exports and downloads the current saved session file as PDF.
- Collabora remains inaccessible directly on `localhost:9980`; browser access must go through `http://localhost:8080/`.
- Work rows are not visible in Templates and are handled in `Work Acts`.
- Work Act template selection offers applicable active templates first.
- Archived templates are not offered for new active work.
- Existing Service act / Commercial offer / Defect act generation still works.
- Signed upload/download in Documents is unchanged.

## Future Improvements

Likely next improvements:

- Move procedure templates from seed data/localStorage to backend storage.
- Add version history for procedure templates.
- Add approval/review state for templates before active use.
- Add import/export for template packs.
- Add stronger sanitization and allowed-block control for visual editor HTML.
- Add per-role permissions for editing Templates and Output Layouts.
- Add preview with a real Work Act payload before saving an output layout.

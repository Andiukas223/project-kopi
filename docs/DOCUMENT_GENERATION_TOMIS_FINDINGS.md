# Document Generation: Tomis Findings

Date: 2026-04-12

This note captures read-only observations from the existing Tradintek / Tomis application. It is intended to guide the Viva Medical web prototype document generation module, especially Work Act generation and template editing.

## Scope Observed

Observed Tomis areas:

- `Registers / Work Act Templates / Template list`
- `Registers / Work List Template` detail for an equipment-specific template
- `Service Jobs / Work Acts` list
- Saved sample Work Act `AL260412-01`

No save, delete, OK, or reject action was intentionally used during discovery.

## Key Product Split

Tomis separates two concepts that our prototype should also separate:

1. Work List Templates
   - Equipment/procedure-specific service checklists.
   - Stored as structured work rows and/or rich RTF content.
   - Examples from Tomis template names: `Aespire TB`, `Aisys CS2`, `Light monitor`, `Logiq P5/6`, `Giraffe Warmer`, etc.
   - These should not be treated as final printable document layouts.

2. Document Output Templates
   - Standardized printable forms such as Work Act, Commercial Offer, Defect Act, Delivery Acceptance, Part Order, etc.
   - These consume job/customer/equipment/work-list data and generate a document through Carbone/LibreOffice.
   - These are form/layout templates, separate from the equipment-specific checklist content.

Conclusion: the current simple Documents template editor is only a placeholder. It should be replaced or superseded by a real Work List Template registry plus standardized document output templates.

User clarification from 2026-04-14:

- Daily users should generate documents from structured records and prepared templates, not lay out every document from scratch.
- Daily users still need access to a visual/rich editor for micro edits, user-specific template copies, and practical bug/workaround capture, similar to Tomis.
- The visual editor should therefore be user-accessible and controlled, not admin-only.
- Admin should focus on users, roles, permissions, and an overseer dashboard for pipeline/progress, not only document approval.
- Before implementing the visual editor, perform a deeper read-only Tomis crawl with user help to understand editor windows, advanced editor behavior, template copy/save semantics, and bug-reporting needs.

Read-only local schema check also showed separate Tomis model groups such as `WorkActEquipment*`, `WorkActSystem*`, `WorkListItem*`, and `WorkList*`. This supports modeling Work Act equipment selection and work-list rows as separate linked data instead of a single free-text document body.

## Target Module Split

The Viva Medical prototype should now move toward a Tomis-like separation:

1. `Documents`
   - Repository and document custody module.
   - Search, filters, generated/uploaded/signed/archived status, metadata, download/open, and audit trail.
   - Should not be the main place where output templates are edited or Work Acts are composed.

2. `Template Generation`
   - Dedicated document creation workspace.
   - Work Act, Defect Act, Commercial Offer, Work List Templates, Output Templates, preview, and generate actions.
   - After generation, the file is saved back into `Documents` as a generated document record.

3. `Registers`
   - Long-lived reference data and registries.
   - Work List Templates can eventually live here or be accessible from Template Generation as a registry tab.

## Reverse Engineering Plan

Read-only Tomis discovery should continue in focused passes:

1. Work Act creation pass
   - Observe new Work Act creation from a service job/case.
   - Observe direct/manual Work Act creation.
   - Record fields that are auto-filled vs manually selected: hospital, side, contract, equipment, responsible persons, work date, invoice, work description, job information.
   - Confirm whether equipment selection is always checkbox-based or conditional by creation context.

2. Work List Template pass
   - Open `Registers / Work Act Templates / Template list`.
   - Classify templates by equipment family and procedure type, for example PM, TB, diagnostic, repair, installation.
   - Record template fields: name, active state, model/equipment link, row order, default text, rich text, comments, and any grouping.
   - Identify how a selected template is copied into a saved Work Act.

3. Output document pass
   - Observe Work Act, Defect Act, Commercial Offer, Delivery Acceptance, and related printable forms.
   - Record common form sections: header, customer, equipment, work/defect/scope text, rows/table section, responsible persons, options/visibility flags, signature block.
   - Separate printable form layout from checklist/work rows.

4. Document repository pass
   - Observe where generated/uploaded/signed documents are listed in Tomis.
   - Record search/filter fields, document source, file action, status, and relationship to job/customer/equipment.
   - Identify whether Tomis treats generated and uploaded files differently.

5. UX density pass
   - Note which Tomis areas are powerful but visually dense.
   - Keep the workflow logic, but translate it into a lighter modern layout with fewer simultaneous panels and clearer module boundaries.

## Web Refactor Plan

Recommended implementation order:

1. B-17 `Template Generation` module split
   - Add a new sidebar module.
   - Move current template generation panel out of `Documents`.
   - Keep `Documents` as repository/search/detail/upload/download.

2. B-18 Documents repository
   - Strengthen filters: type, status, customer, job, equipment, owner, date range, generated/uploaded/signed/archive.
   - Add source/status model: Generated, Uploaded, Signed, Archived, Rejected.
   - Add detail metadata and audit/history section.

3. B-19 Work Act workspace
   - Dedicated draft list.
   - Create from job/equipment/manual.
   - Equipment search/dropdown selection with add/remove controls.
   - Work List Template picker and isolated copy.
   - Work Text / Work Rows editing.
   - Generate and save into Documents.

4. B-20 Work List Template registry
   - Equipment/procedure-specific template list.
   - Create/edit/duplicate/archive.
   - Fields: name, equipment model/family, procedure type, default work text, rows, active.

5. B-21 Output Template editor v2
   - Move structured editor into `Template Generation / Output Templates`.
   - Add version metadata and later file upload for `.fodt`, `.odt`, `.docx`.
   - Keep Carbone merge field hints, preview, and service generation.

6. B-22 Tomis comparison pass
   - Revisit Tomis read-only after B-17 to B-21.
   - Compare terminology, flow order, missing fields, and density.
   - Adjust toward Tomis logic without copying unnecessary visual clutter.

## Modern Lightweight UI Principles

- Each module should answer one user question:
  - `Documents`: "Where is the document and what is its status?"
  - `Template Generation`: "What am I creating and from which data/template?"
  - `Registers`: "Which reusable template/reference data exists?"
- Keep the first view of each module calm: summary, filters, main list, selected item detail. Hide technical payloads and advanced options.
- Use tabs/stepper flows for complex documents instead of one very long form.
- Use status colors only for status and risk; avoid decorative color noise.
- Avoid nested cards. Use tables/lists for dense data, and use cards only for repeated summaries or selectable templates.
- Make primary actions obvious and singular: `Create draft`, `Generate document`, `Save into Documents`.
- Preserve visual continuity across modules, but make module boundaries obvious through page title, subtitle, selected sidebar item, and focused action set.
- Default to fewer visible controls. Reveal Work List Template details, output template fields, audit trail, and JSON payload only when the user opens that section.

## Work Act UI Model

Observed sample Work Act: `AL260412-01`

Header fields:

- Company: `Tradintek, Lithuania`
- Profile: `Default`
- Hospital: `Kardiologijos klinika VSI Testas`
- Side: `VSI Testas`
- Type: `Custom`
- Contract: recommended field
- Work Description: `TEST`
- Number: `AL260412-01`
- Date: `2026-04-12`
- Invoice: recommended field

Main tabs:

- `Work Act`
- `Options`

Work Act content tabs:

- `Equipment`
- `Working hours`
- `Measurements`
- `Files`
- `Log`

Bottom work content tabs:

- `Work: List`
- `Work Description`
- `Work: Template`

Side panels:

- Job Information: Job ID `LT260412-1124`, Job Comments
- Responsible Persons: grouped by company/role with checkboxes

Bottom actions:

- `Work Act`
- `Add Work`
- `Send to Hospital`
- `Upload Document`
- `OK`
- `Cancel`

## Work List Behavior

The sample Work Act has a structured `Work: List` grid:

| Nr. | Description | Completed | Comments |
|---|---|---|---|
| 1 | test | checked | empty |
| 2 | test 2 | checked | empty |
| 3 | test 3 | checked | empty |

Implication for our web app:

- Work rows should be first-class data, not only free text.
- Each row needs number, description, completed state, and comments.
- Work rows should be copied into the Work Act when a Work List Template is applied, so later edits affect only that Work Act.
- Work Act equipment should not be hard-limited to one item. If the Work Act is generated from a case or equipment page, the relevant equipment should be preselected automatically. If the Work Act is created manually, the user should be able to select the needed equipment with checkboxes and add work rows to the Work Act.

## Work Template Behavior

Tomis shows a `Work: Template` tab with:

- `Open in Editor`
- Rich editor ribbon (`Home`, `Insert`, `View`, `Design`, `Layout`, `Format`)
- `Work template (save record before select): [not selected]`

Important finding:

- Template selection is tied to a saved Work Act record. The UI text explicitly says the record must be saved before selecting a template.
- For our prototype, the cleaner flow is:
  1. Create Work Act as a Draft record.
  2. Preselect equipment from the originating case/equipment context, or let the user manually select equipment with checkboxes.
  3. Enable Work List Template selection.
  4. Apply the template into the Work Act as an editable copy.
  5. Generate Work Act document from the Work Act draft data.

## Work Act Options

Observed options:

- Entry Person
- Equipment working
- Ready for use
- Old part returned to manufacturer
- Hygiene Standard
- Include person name
- Include signature
- Include working hours
- Include system identity
- Include system name
- Show travel hours in report
- Show started/completed time
- Use three side template
- Use Swiss program logo
- Use Tradintek as Contractor

Implication:

- Document generation payload must include report visibility flags, not just raw data.
- These flags decide what appears in the final PDF/DOCX.
- Work Act output template should support these conditional sections.

## Data Model Requirements

Minimum Work Act draft fields:

- `id`
- `number`
- `date`
- `jobId`
- `company`
- `companyProfile`
- `hospital`
- `side`
- `type`
- `contract`
- `invoice`
- `workDescription`
- `equipmentId`
- `equipmentName`
- `equipmentItems`
- `systemIdentity`
- `responsiblePersons`
- `entryPerson`
- `jobComments`
- `workRows`
- `workText`
- `workTemplateId`
- `reportOptions`
- `generatedDocumentId`
- `status`

Minimum Work List Template fields:

- `id`
- `name`
- `company`
- `equipmentType`
- `serviceType`
- `workRows`
- `bodyText`
- `bodyRtf`
- `isActive`
- `updatedBy`
- `updatedAt`

Minimum Document Output Template fields:

- `id`
- `type` (`Work Act`, `Commercial Offer`, `Defect Act`, etc.)
- `language`
- `format`
- `templateFile`
- `dataContractVersion`
- `isActive`
- `updatedBy`
- `updatedAt`

## Carbone Payload Direction

The Work Act generation payload should be structured around the Work Act, not around a generic document body:

```json
{
  "documentType": "Work Act",
  "documentNumber": "AL260412-01",
  "jobId": "LT260412-1124",
  "language": "lt",
  "company": {},
  "hospital": {},
  "equipmentItems": [],
  "workAct": {
    "type": "Custom",
    "date": "2026-04-12",
    "description": "TEST",
    "workRows": [],
    "workText": "",
    "reportOptions": {}
  },
  "responsiblePersons": [],
  "signatures": []
}
```

## Implementation Status

Implemented in B-15:

- Added a Work Act draft model/UI flow in the Service job detail panel.
- Added Work List Template registry data and a template picker.
- Applying a Work List Template copies its work rows/body into the selected Work Act draft.
- Equipment selection supports auto-prefill from job equipment and manual search/dropdown add/remove for additional customer equipment.
- Work Act data can create a Service act document draft and is included in document generation payload fields.

Implemented in B-16:

- Kept standardized document output templates in `document-service/templates`, separate from Work List Templates.
- Added first Carbone output templates: `work-act.fodt`, `commercial-offer.fodt`, and `defect-act.fodt`.
- Mapped `tpl-service-act`, `tpl-quotation`, and `tpl-defect-act` to separate backend template files.
- Extended document generation payload with equipment/work rows, quotation amount/due date, defect description, and signature-ready metadata.
- Replaced the placeholder body-only editor for Work Act, Commercial Offer, and Defect Act with structured section editors and merge field hints. The generic editor remains only as fallback for older document types.
- Added rendered `templateSectionsText` into the document-service payload/output path, so edited sections can appear in generated files instead of only the browser preview.

Implemented in B-24:

- Added `Export sections as .fodt` and `Upload .fodt template` actions in `Template Generation / Output Templates`.
- Added `POST /template/upload` and `GET /template/download/:fileName` in `document-service`.
- Custom/exported `.fodt` files are stored in a writable generated template area and can be used by Carbone for the selected output template.

Implemented in B-26:

- Upgraded `Template Generation / Work Acts` with a Tomis-aligned grouped/searchable Work Act table.
- Added Work Act `Options` / `Print settings` with `Entry Person` and report flags such as equipment working, ready for use, signatures, working/travel hours, system identity/name, and contractor/logo/template switches.
- Persisted `reportOptions` on Work Act drafts and passed them into the `document-service` payload as structured fields and `reportOptionsText`.

Implemented in B-27:

- Upgraded `Template Generation / Work List Templates` toward the Tomis registry model with Search/Find/Clear, status filter, equipment-not-assigned filter, and entry person filter.
- Added linked service types, equipment, hospitals, work equipment, entry person, and entry date metadata to Work List Templates.
- Added applicability logic so Work Act template selection can prefer templates matching the current job/equipment/hospital/service context.

## B-31 Tomis Visual Editor Crawl

Read-only pass date: 2026-04-14

Observed area:

- `Registers / Work List Templates / Work List Template (Aespire TB)`

Observed Work List Template detail:

- Header fields: `Company`, `Entry Person`, `Template Name`.
- Main body is an embedded rich document editor, not a simple textarea. The content is a Lithuanian technical checklist in a table layout with headings, measured/default values, checkbox-like marks, and work instruction references such as `Aprasas nr. 1`, `Aprasas nr. 2`, etc.
- Right-side applicability panel uses tabs: `Service Types`, `Equipment`, `Hospitals`, `Work Equipment`.
- Each applicability tab uses a dual-list model: all available records on the left, linked records on the right, and `-->` / `<--` transfer buttons.
- `Hospitals` tab has an important rule: if the linked hospitals list is empty, the template applies to all hospitals.
- Observed linked service type for `Aespire TB`: `Technines bukles patikra`.
- Observed linked equipment examples: `Aespire 7100`, `Aespire 7900`, `Excel`, `Excel 210 SE`, `S/5 Aespire`.
- Observed linked work equipment examples: safety analyzer / leak test device style tools, including `Saugos matuoklis SECUTEST PRO` and `Tekmes matavimo prietaisas Certifier FA Plus`.
- Top actions include `Save`, `Reject Changes`, and `Refresh`; detail actions include `Open in Advanced Editor`, `Clear`, `Copy`, and `Paste`; bottom actions include `OK` and `Cancel`.

Observed Advanced Editor:

- `Open in Advanced Editor` opens a full Word-like editor window titled `Template - Advanced Editor`.
- The editor has ribbon tabs such as `Home`, `Insert`, `Page Layout`, `References`, `Mail Merge`, `Review`, `View`, and `File`.
- When editing inside a table, contextual `Table Tools` tabs appear: `Layout` and `Design`.
- `Home` ribbon exposes everyday rich-text controls: paste/copy, font family and size, bold/italic/underline, text color/highlight, paragraph alignment, styles, find, and replace.
- `Table Tools / Layout` exposes table operations: view gridlines, properties, delete, insert above/below/left/right, merge/split cells/table, AutoFit, alignment, and cell margins.
- The advanced editor loads slowly; it first showed a blank page and only rendered the real template after waiting several seconds.

Implication for web:

- B-32 should not be a plain textarea. It should be a document-like editor with rich text, tables/checklists, and a preview that resembles the generated output.
- The normal daily flow still stays structured: user selects/creates a work record, applies a Work List Template, edits only the needed isolated copy, and generates a standardized output document.
- Daily users need controlled visual editing for micro fixes and user-specific copies, but standard templates should remain reusable registry records.
- Applicability rules must remain first-class metadata beside the editor: service types, equipment models, hospitals, and work equipment should be searchable dual-list or tokenized selections.
- The web editor should separate `Edit`, `Preview`, `Applicability`, and `Output generation` concerns so the module feels lighter than Tomis while preserving the same power.
- Because Tomis advanced editor can be slow/blank while loading, the web version should show explicit loading state, dirty-state protection, autosave/draft behavior, and a safe cancel/revert path.
- Add bug/workaround capture near the visual editor: screenshot/context, template id, user, payload snapshot, and a note field for production rollout triage.

## B-33 Tomis Work Act Document Preview And Delivery Crawl

Read-only pass date: 2026-04-14

Observed area:

- `Service Jobs / Work Acts / Work Act (AL260310-01)`
- Generated document opened from `Open Document`

Observed Work Act record:

- Top toolbar includes `Open Document` beside record actions such as `Save`, `Reject Changes`, and `Refresh`.
- Work Act detail keeps structured record data on screen: company/profile/hospital/side/type/contract, work description, number, date, invoice, equipment tab, responsible persons, and a generated `Work: Template` document body.
- `Work: Template` tab shows the created technical checklist text directly inside the Work Act record before the output PDF is opened.

Observed `Open Document` flow:

- Clicking `Open Document` generated a PDF download dialog.
- Dialog fields: file name `AL260310-01.pdf`, type `PDF File`, source `is.tradintek.com`.
- Dialog actions: `Open`, `Save As`, `Cancel`.
- Choosing `Open` launched the local PDF viewer (`PDFgear - AL260310-01.pdf`) without changing the Work Act record.
- Choosing `Cancel` opened a Tomis-owned internal preview window instead of simply aborting the action.

Observed Tomis internal print preview:

- Window title: `AL260310-01 - Print Preview`.
- The preview is integrated into Tomis and displays the final generated document inside the application frame.
- Toolbar actions: `Print`, `Quick Print`, `Pointer`, `Hand Tool`, `Magnifier`, `Zoom Out`, `Zoom In`, `Export To`, `E-Mail As`, `Close Print Preview`.
- `Page Settings` is a separate tab.
- Status/footer shows page navigation such as `Page 1 of 2` and zoom percentage.
- This is the stronger target pattern for our web app: users should not depend only on the browser download dialog or an external PDF viewer.

Observed page layout and document style:

- Page is A4 portrait, centered on a light gray preview canvas, with dashed visible margin guides in the preview.
- Header uses a right-aligned company/logo block. In the observed Tomis sample the logo mark and company name are top-right, followed by compact seller requisites.
- Seller requisites are shown as a dense block in the upper-right header: company name, address, phone/email, company code, VAT code, bank account, and bank.
- Buyer block starts under the header on the left with a bold `UZSAKOVAS:` label, then company code, VAT code, and work location.
- Document title is centered/strong: `ATLIKTU DARBU AKTAS Nr. ...`.
- Date is near the title in Lithuanian legal style, for example `2026 m. kovo 10 d.`.
- Contract number is displayed directly under the title/date area: `Sutartis nr. ...`.
- Equipment metadata is a visible document section before the checklist: equipment name, equipment identifier, model, and serial number.
- Work List Template content becomes a formal checklist table in the generated Work Act. The table has bold section rows, task rows, checkbox/value cells, units such as `%`, `KPa`, `MPa`, and a notes/value column.
- Footer includes the document number on the left and the page number on the right.
- Page 2 continues the checklist and then contains legal confirmation text plus signature areas.
- Signature area is two-column: `Uzsakovas` and `Vykdytojas`, with signature lines, name/surname/position labels, and visible saved signature image on the contractor side.
- A separate technician statement/signature appears lower on the page for performed parts replacement/calibration.

Observed `Page Settings` controls:

- Page setup: `Header/Footer`, `Scale`, `Margins`, `Orientation`, `Size`.
- Page background: `Page Color`, `Watermark`.
- `Margins` menu includes presets such as Normal, Narrow, Moderate, Wide, and Custom Margins.
- `Orientation` menu supports Portrait and Landscape; observed document is Portrait.
- `Size` menu includes A6, A5, A4, Letter, Legal, Executive, B5; observed document is A4.
- These settings should become template/page settings in our document generation module. Daily users should not need to adjust them every time, but the output template must own them.

Observed export/email formats:

- `Export To` menu supports PDF, MHT, Image, DOCX, ODT, RTF, and XLSX.
- `E-Mail As` menu supports PDF, RTF, and Image.
- For our MVP the priority is PDF preview/export/email. DOCX/ODT can stay as supported service outputs, but the user-facing Tomis-like delivery flow should lead with PDF.

Captured local crawl screenshots:

- `output/tomis-print-preview-crawl-01-page1.png`
- `output/tomis-print-preview-crawl-02-page2.png`
- `output/tomis-print-preview-crawl-03-page-settings.png`
- `output/tomis-print-preview-crawl-04-export-menu.png`
- `output/tomis-print-preview-crawl-05-email-menu.png`
- `output/tomis-print-preview-crawl-07-margins-menu.png`
- `output/tomis-print-preview-crawl-08-orientation-menu.png`
- `output/tomis-print-preview-crawl-09-size-menu.png`
- `output/tomis-print-preview-crawl-10-page-color-menu.png`

Observed PDF preview:

- The PDF is a final customer-facing Work Act layout with company logo/header, customer details, work location, document number, date, contract number, and the generated work content.
- PDF viewer page controls show a multi-page document (`1/2`) and standard preview affordances such as zoom, page navigation, print, and view modes.
- `Files` menu includes `Save`, `Save as`, `Export PDF as`, `Print`, `Batch Print`, `Document Properties`, and `Share`.
- `Share` submenu includes `E-mail` and `Send File`.

Implication for web:

- Document generation must have an explicit post-generation delivery stage, not only a background PDF file creation.
- Required web flow: generate document -> open integrated print preview -> print / quick print -> export/download PDF -> send by email as PDF -> keep generated file linked back to the source Work Act / Defect Act / Commercial Offer and the central Documents repository.
- The web app needs its own preview surface similar to Tomis `Print Preview`, with page navigation, zoom, export, email, and close controls.
- Preview should be available from the source record and from `Documents`, because daily users think in both contexts: "I am inside this Work Act" and "I am searching all generated documents".
- The preview should clearly show generated file name, format, generation time, source record, and delivery status.
- Sending by email should open a controlled compose step with recipient, subject, message, attachment, and audit trail. It should not immediately send from a menu click.
- Local save/download should be a direct user action and should not alter the source record.
- This functionality is more urgent than the broader bug/feedback queue, so the next backlog step should prioritize generated document preview/download/email delivery before production feedback capture.

Implementation update from this crawl:

- Added `companyProfiles` with a `seller-viva-medical` profile sourced from Rekvizitai.lt:
  - registration code `302820861`
  - VAT `LT100007018811`
  - address `Santariškių g. 5, LT-08406 Vilnius`
  - mobile `+370 699 32161`
  - website `http://www.vivamedical.lt/`
- Added a representative 20-hospital sample registry to `data.js`. The names are based on a Ministry of Health published hospital list, but registry/PVM/bank fields are explicitly marked as `demo-placeholder` until verified against Rekvizitai.lt or official hospital pages.
- Extended the document-service payload with seller/buyer requisites, contract number, work location, and a Lithuanian-style date field.
- Updated Work Act, Commercial Offer, and Defect Act `.fodt` templates toward the Tomis layout pattern: right-aligned seller block, buyer requisites block, title/date/contract placement, and signature sections.
- Logo asset placement is documented as a requirement, but the current `.fodt` templates use a text logo placeholder until the existing `viva medical logo` asset is converted to an embeddable image format for LibreOffice/Carbone.

B-33 implementation update:

- Added a global generated document preview overlay to the web prototype, available from generated output previews, Work Act-linked documents, document detail, linked document lists, and `Documents` table actions.
- The overlay follows the Tomis delivery model: title bar, ribbon actions, preview body, and status bar. It supports mock A4 page rendering with page navigation/zoom and service-generated PDF rendering through the browser PDF viewer.
- Added delivery actions for `Preview opened`, `Quick Print`, `Print opened`, `PDF exported`, `Downloaded`, and `Email queued` so the source document keeps a visible audit trail.
- Added an email compose panel with recipient, subject, message, and attachment display. Current behavior records a queued email audit event; production SMTP/API sending remains a later backend step.
- Changed the document service API so generated files include both `downloadUrl` and PDF-only `previewUrl`. This keeps local save/download explicit and lets the integrated preview render inline without triggering the browser download dialog.
- Verified with Playwright through Docker: service PDF generation, inline preview, and email queue all completed with zero console errors. Screenshots are in `output/playwright/b33-service-pdf-preview-final.png` and `output/playwright/b33-service-email-audit-final.png`.

## B-25 Tomis Comparison Pass

Read-only pass date: 2026-04-13

Observed areas:

- `Registers / Work List Templates` list and `Aespire TB` detail.
- `Service Jobs / Work Acts` list and sample Work Act `AL260412-01`.
- `Service Jobs / Commercial Offers` list and sample Commercial Offer `EM26-1040-K1`.
- `Service Jobs / Defect Acts` list and sample Defect Act `EM26-1040-D1`.

### Work List Templates Delta

Tomis `Work List Templates` list is a registry-style table, not a simple card list.

Observed list fields and controls:

- `Search`, `Find`, `Clear`, `Customize Columns`.
- Grouping by `Company`.
- Columns: `Name`, `Equipment`, `Work Eq...`, `Service T...`, `Entry Pe...`, `Entry Date`.
- Bottom filters: `All Templates`, `Equipment not assigned`, and entry person filter.

Observed template detail fields and controls:

- `Company`
- `Entry person`
- `Template Name`
- Rich/table-like template body
- `Open in Advanced Editor`
- `Clear`, `Copy`, `Paste`
- Linked tabs: `Service Types`, `Equipment`, `Hospitals`, `Work Equipment`
- Dual-list assignment controls `-->` and `<--`
- Example linked equipment for `Aespire TB`: `Aespire 7100`, `Aespire 7900`, `Excel`, `Excel 210 SE`, `S/5 Aespire`

Implication for web:

- Work List Template needs applicability rules, not only `category/serviceType/bodyText/workRows`.
- Add fields such as `linkedEquipmentModelIds`, `linkedHospitalIds`, `linkedWorkEquipmentIds`, `linkedServiceTypes`, `entryPerson`, and `entryDate`.
- The web UI should eventually add search/filter/grouping and an "equipment not assigned" filter.

### Work Acts Delta

Tomis `Work Acts` list is grouped by `Entry Date` with rows such as `Yesterday`, `Last Week`, `Three Weeks Ago`, `Last Month`.

Observed list columns:

- `Work Act Nr.`
- `Work`
- `Equipment`
- `Systems`
- `Hospital`
- `Type`
- Contract/file/more indicator columns

Observed Work Act detail:

- Main fields: `Company`, `Profile`, `Hospital`, `Side`, `Type`, `Contract`, `Work description`, `Number`, `Date`, `Invoice`
- Work Act tabs: `Equipment`, `Working hours`, `Measurements`, `Files`, `Log`
- Equipment grid groups selected and unselected equipment and includes columns such as `Equipment`, `Part`, `Part ID`, `Custom Name`, `Contr. Nr.`
- Bottom actions: `Add Work`, `Send to Hospital`, `Upload Document`, `OK`, `Cancel`

Observed Work Act options:

- `Entry Person`
- `Eq. working`
- `Ready for use`
- `Old part returned to manufacturer`
- `Hygiene Standard`
- `Include person name`
- `Include signature`
- `Show working hours`
- `Show travel hours in report`
- `Show started / completed time`
- `Use three side template`
- `Use swiss program logo`
- `Use Tradintek as Contractor`
- `Include system identity`
- `Include system name`

Implication for web:

- Work Act builder should add an `Options` / `Print settings` panel.
- `reportOptions` must be passed into document generation as first-class payload data.
- Work Act list should be upgraded from basic draft cards to a searchable/grouped table with hospital/equipment/system/type/contract/file indicators.

### Commercial Offers Delta

Tomis `Commercial Offers` list is also a date-grouped repository/workspace list.

Observed list columns and filters:

- Columns: `Profile`, `Offer Nr.`, `Side`, `Equipment`, `Part Names`, invoice column, `Total Price`, `Currency`, `Entry Date`
- Bottom filters: `Active records`, `Price missing`, `Archived`, `Entry date Today +/- 3 months`, entry person filter

Observed Commercial Offer detail:

- General information fields: `Company`, `Profile`, `Group (optional)`, `Hospital / System`, `Side`, `Contract`, `Recipient`, `Fax`
- Tabs: `Pricing Details`, `Options`
- Output text tabs: `Offer Text (Header)`, `Offer Text (Footer)`
- Footer text is a standardized text block, for example return/validity/order confirmation language.
- Bottom actions: `Add Part`, `Add Work`, `Send to Hospital`, `Move to Archive`, `OK`, `Cancel`

Implication for web:

- Commercial Offer draft should include `headerText` and `footerText`, not only one `scope` / notes area.
- Add `recipient`, `fax`, `profile`, `group`, `contract`, `currency`, `totalPrice`, `invoiceId`, `entryDate`, `entryPerson`, `archived`, and `priceMissing` style fields.
- Add list filters for active/archived/price missing and entry date range.

Implemented in B-28:

- `Template Generation / Commercial Offers` now uses Tomis-style list columns: `Profile`, `Offer Nr.`, `Side`, `Equipment`, `Part Names`, invoice, `Total Price`, `Currency`, and `Entry Date`.
- Added active, price missing, archived, all-records, search, and entry person filtering.
- Draft detail now includes profile, group, hospital/system, side, contract, recipient, fax, invoice, currency, `Offer Text (Header)`, `Offer Text (Footer)`, archive/restore, and placeholder actions for `Add Work`, `Add Part`, and `Send to Hospital`.
- Document-service payload now carries commercial offer header/footer/scope/recipient/contract/invoice/line item data for output template rendering.

### Defect Acts Delta

Observed `Defect Acts` list:

- Columns: `Profile`, `Defect Act Nr.`, `Hospital`, `Equipment`, `Description`, `Last Visit`
- Grouped by `Entry Date`

Observed Defect Act detail:

- Fields: `Company`, `Profile`, `Hospital`, `System`, `Custom Name (optional)`, `Side`, `Contract`, `Engineer`, `Signature`, `Date`, `Number`
- `Actual Visits` grid with DA/WA checkboxes, `Planned Start`, `Work (h)`, `Travel (h)`, `Completed`, `Comments`
- Bottom actions: `Send to Hospital`, `Create Part Request Offer`, `Move to Archive`, `OK`, `Cancel`

Implication for web:

- Defect Act draft should link to actual visits/service job visits.
- Add planned start/work hours/travel hours/completed/comments into a visit grid.
- Add `Create Part Request Offer` action placeholder, because Tomis ties Defect Acts to sales/parts follow-up.

Implemented in B-29:

- `Template Generation / Defect Acts` now has an `Actual Visits` grid with DA/WA, planned start, work hours, travel hours, completed, comments, and add/remove visit rows.
- Defect Act document preview now renders Actual Visits.
- Document-service payload now includes `defectActVisits` and `defectActVisitsText`.
- Added a safe `Create Part Request Offer` placeholder for the future sales/parts follow-up workflow.

## Post B-25 Implementation Backlog

Recommended next implementation sequence:

1. B-26 Work Act Tomis-aligned list and options - Done
   - Add Work Acts table grouping/filtering in `Template Generation / Work Acts`.
   - Add `Options` / `Print settings` panel and persist `reportOptions`.
   - Pass `reportOptions` into document-service payload.

2. B-27 Work List Template applicability rules - Done
   - Add linked service types, equipment models, hospitals, and work equipment fields.
   - Add filters/search similar to Tomis: all templates, equipment not assigned, entry person/date.

3. B-28 Commercial Offer Tomis-aligned detail - Done
   - Add header/footer text sections, recipient/fax/profile/group/contract fields, currency/total/invoice metadata, archive/price-missing filters.

4. B-29 Defect Act Tomis-aligned visits - Done
   - Add Actual Visits grid and `Create Part Request Offer` placeholder.

5. B-30 Output template conditional rendering - Done
   - Use Work Act `reportOptions`, offer header/footer, and defect visit data in `.fodt` templates.
   - Carbone `ifNEM:showBegin` / `showEnd` blocks now hide empty sections and render populated Work Act, Commercial Offer, and Defect Act sections in generated service files.

6. B-31 Tomis visual editor crawl - Done
   - Inspected `Work List Template (Aespire TB)` read-only, including embedded rich/table editor, applicability tabs, dual-list assignment controls, and Advanced Editor.
   - Captured B-32 requirements: document-like rich editor, table/checklist support, applicability metadata, loading/dirty-state protection, safe cancel/revert, and bug/workaround capture.

7. B-32 User-accessible visual template editor
   - Done as MVP in `Template Generation / Work List Templates`.
   - Added a document-like visual preview and contenteditable rich editor with basic formatting/list tools, checklist-row insertion, table/checklist rendering, visual HTML persistence, and bug/workaround note capture.
   - Kept structured work rows, applicability metadata, and Work Act generation flow as the default source of truth.

8. B-33 Generated document preview and delivery
   - Done as MVP in `Template Generation` and `Documents`.
   - Added source/document `Open preview` actions, a Tomis-style print preview modal, page/zoom controls for rendered mock pages, inline PDF preview for service-generated files, print/quick print, export/download, email compose with PDF attachment, delivery status, and audit history.
   - `document-service` now returns a separate inline `previewUrl` for PDFs, while `downloadUrl` remains the explicit local save/download action.
   - Email is still a demo queue/audit action, not real SMTP/API sending.

9. B-34 Bug/feedback capture for production
   - Done as MVP across the web prototype.
   - Added a global `Report issue` action for daily users.
   - The report flow enters a Windows-snipping-style click-drag selection mode, captures only the selected screen area, attaches that image as admin-only supporting info, optionally lets the user draw with a red pencil over the screenshot, requires a short comment, and records page, role, selected document/template/job/work act/equipment context.
   - Submitted reports are stored in demo state and rendered only for active `admin` role in the Admin page, with screenshot, comment, status, and audit history.

10. B-35 Production feedback backend
   - Done as B-35-lite storage/API foundation.
   - `document-service` now owns feedback persistence through a Docker `storage` volume, `feedback-reports.json`, `files.json`, screenshot attachment files, and `POST/GET/PATCH /feedback/reports`.
   - The web prototype saves screenshot/annotation images to backend storage, loads the admin queue from the API, and supports status/assignee filters plus status/assignee workflow.
   - Full database-backed auth/permissions remain for the later backend phase.

11. B-36 Unified document file storage
   - Started as B-36-lite file registry foundation.
   - Generated documents, uploaded documents, output template uploads, and feedback screenshots are now registered through `files.json` with kind, owner/source links, checksum, size, download URL, and preview URL metadata.
   - `Upload document` now stores the real selected file in backend storage and attaches the returned file record to the document pipeline entry.
   - Remaining production work: DB-backed file metadata, signed-file versioning, permission checks, retention rules, and object storage.

12. B-37 Production Work Act generation storage
   - Done: Work Act generation now creates first-class `generated-document` file versions in `files.json`, returns registry download/preview URLs, stores `fileId`, `version/versionLabel`, source type/id and Work Act id, links the generated file back onto the Work Act record, and records preview/download/print/export/email audit entries against the same generated file/version.

13. B-38 Defect Act / Commercial Offer generation parity
   - Next step: reuse the B-37 source-file UX in Defect Acts and Commercial Offers so those panels expose generated file/version, direct generate/open-preview buttons, and source-aware delivery audit.

## Open Questions

Questions to refine before implementation:

- Should incomplete work rows be printed in the final Work Act or only stored internally?
- Should customer-facing Work Act text be edited in a rich editor immediately, or is structured row editing enough for the next prototype step?
- Should the next implementation start with Work Act `Options` / print settings before improving Commercial Offer and Defect Act?
- What email sending mode should MVP use first: local mail client handoff, simulated send queue, or real SMTP/API integration?

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

Next practical step:

- Connect structured editor sections directly into editable `.fodt` output template regeneration or template file upload/versioning.

## Open Questions

Questions to refine before implementation:

- Should incomplete work rows be printed in the final Work Act or only stored internally?
- Should customer-facing Work Act text be edited in a rich editor immediately, or is structured row editing enough for the next prototype step?
- Which document form should be implemented first after Work Act: Defect Act or Commercial Offer?
- Should `Send to Hospital` mean email/send workflow now, or only a status transition placeholder in the prototype?

# Work Equipment Future Module

Date: 2026-04-16

This document records the planned `Work Equipment` module context.
For now, Work Equipment is a seed registry used by the `Templates` searchable combobox/autocomplete dropdown. Later it should become its own module.

## Meaning

`Work Equipment` means tools and metrology-style equipment used by service engineers while checking, measuring, verifying, or calibrating customer equipment.

It is not the same as customer `Equipment`.

Examples:

- Digital multimeter.
- Oscilloscope.
- Electrical safety analyzer.
- Pressure gauge / manometer.
- Calibrated thermometer.
- Flow meter.
- Load cell / test weight set.
- Insulation resistance tester.

## Current Implementation

Current seed data:

- `workEquipmentTools` in `src/js/data.js`.

Current consumer:

- `Templates` uses `workEquipmentTools` for the `Work Equipment` searchable combobox/autocomplete dropdown.

Current saved link:

- Template records store selected tool ids in `linkedWorkEquipmentIds`.

Current UI behavior:

- User types a keyword such as `multi`, `osc`, `pressure`, or `safety`.
- Dropdown filters matching work-equipment tools.
- User can also scroll the dropdown and tick options manually.
- Saved links describe what service/metrology tools are relevant for the template.

## Future Module Scope

Future `Work Equipment` module should own:

- Tool registry.
- Serial number / asset number.
- Manufacturer/model.
- Calibration required flag.
- Calibration certificate file link.
- Calibration due date.
- Last calibration date.
- Availability/status.
- Assigned engineer/location.
- Notes and service restrictions.

Possible future statuses:

- `Available`
- `Assigned`
- `Calibration due`
- `Out of calibration`
- `Repair needed`
- `Retired`

## Links To Other Modules

Templates:

- Templates link to work-equipment types/tools to describe what metrology tools are needed for a procedure.
- Empty `linkedWorkEquipmentIds` means the template does not require a specific tool.

Work Acts:

- Work Acts should eventually record which exact work equipment was used during a service visit.
- Work Act output can include used tool name, serial number, calibration certificate/date, and comments.

Documents:

- Documents owns generated/signed file custody.
- Work Equipment calibration certificates may be uploaded through Documents or a future module-specific file flow.

Admin:

- Admin/Service Manager should manage tool registry permissions.

## Non-Goals For Now

Current Templates implementation does not:

- Track exact tool serial numbers.
- Enforce calibration validity.
- Block Work Act generation when a tool is out of calibration.
- Upload calibration certificates.
- Create inventory/assignment records.

Those belong to the future `Work Equipment` module.

## Implementation Notes For Future Chat

When creating the real module:

- Move `workEquipmentTools` from seed data into a backend-backed registry.
- Keep existing `linkedWorkEquipmentIds` on Templates as links to that registry.
- Add Work Act fields for used work equipment.
- Add validation that used tools are in calibration if the business requires it.
- Add Documents/file links for calibration certificates.
- Update `TEMPLATES_MODULE.md`, `WORK_ACTS_MODULE.md`, `WORKSPACE_MODULES.md`, and `LINKING_AND_PIPELINE_LOGIC.md`.

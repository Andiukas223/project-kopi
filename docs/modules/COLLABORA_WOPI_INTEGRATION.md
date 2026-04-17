# Collabora WOPI Integration

Date: 2026-04-16

Status: decommissioned historical reference.

## Decision

- Collabora CODE and WOPI are no longer part of the Viva Medical active architecture.
- The frontend must not open Collabora iframes or call `/api/documents/collabora/sessions`.
- The backend must not expose WOPI endpoints.
- Docker must not run a `collabora` service or `collabora-net` network.
- nginx must not proxy `/browser`, `/hosting`, `/cool`, `/loleaflet`, or `/lool`.

This replaces the earlier local/private Collabora prototype.

## Current Active Document Editing Model

- `Templates` uses the same-page Umo editor and structured metadata fields.
- `Work Acts` uses structured Work Act fields, work rows, equipment links, report options, and PDF generation.
- `Documents -> View` opens generated PDF/print preview or a generated file `previewUrl`.
- `Documents -> Edit` routes to the owning structured source module when possible.
- PDF generation through `document-service` remains the official document output path.
- Generated files and signed/uploaded files remain separate custody records.

## Runtime Contract

Active services:

- `web`: nginx static frontend + `/api/documents/` reverse proxy.
- `document-service`: document generation, file upload/download, generated preview URLs, file registry, and feedback storage.

Removed runtime pieces:

- `collabora` Docker service.
- `collabora-net` internal network.
- Collabora/WOPI environment variables.
- `/api/documents/collabora/sessions` API.
- `/wopi/files/...` API.
- nginx Collabora proxy paths.
- frontend Collabora iframe overlays.
- "Open in advanced editor" and "Edit in advanced editor" Collabora actions.

## Rules For Future Work

- Do not reintroduce WOPI endpoints as a shortcut for document editing.
- Do not treat historical Collabora screenshots, backlog items, or changelog entries as current requirements.
- If a LibreOffice-like browser editor becomes a product requirement again, create a new decision record and implementation plan before changing runtime code.
- Keep `document-service:3001` private in production even though it may remain published locally for development.
- Preserve PDF generation, preview, upload, download, signed-file custody, and feedback APIs.

## Active Umo Replacement

The earlier disabled, provider-neutral advanced editor boundary has been removed. Active browser editing is now Umo-based:

- `src/components/documentEditor/UmoDocumentEditor.vue`
- `src/components/documentEditor/editorContent.js`
- `src/modules/templates/TemplatesPage.vue`

Umo is used for reusable template content editing inside the owning Templates module. It does not add Collabora/WOPI services, endpoints, proxy paths, or file custody behavior.

Required future decision points before enabling any additional editor provider:

- editor provider and licensing/support model;
- runtime topology and whether an internal editor service is needed;
- nginx/reverse-proxy paths and same-origin browser requirements;
- backend session API contract;
- file save/versioning rules;
- permission and audit rules;
- rollback behavior if the editor cannot start.

Until that decision is made, source editing remains structured and Umo remains the approved browser editor target.

## Replacement Verification

Use these checks instead of Collabora checks:

- `docker compose config --quiet`
- `npm run build`
- `curl -f http://localhost:8080/api/documents/health`
- Generate a Work Act PDF.
- Open `Documents -> View` and confirm the generated preview opens inline.
- Upload a signed Work Act and confirm the Service completion dialog still works.

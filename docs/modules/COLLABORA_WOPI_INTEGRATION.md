# Collabora WOPI Integration

Date: 2026-04-16

This document is the source of truth for the local Collabora CODE advanced editor runtime and the WOPI bridge used by Viva Medical modules.

Use this file when another module needs a LibreOffice-like advanced editor, document preview/edit iframe, or local `.fodt` editing session.

## Current Status

Implemented as a personal/development runtime:

- Collabora Online Development Edition (`CODE`) runs in Docker as service `collabora`.
- The container has no public host port.
- Browser access goes through the existing `web` nginx proxy on `http://localhost:8080/`.
- WOPI file/session access is served by `document-service`.
- The first implemented consumer is `Templates -> Open in advanced editor`.
- `Documents -> View` also uses Collabora in read-only view mode for generated documents.
- `Work Acts -> Edit in advanced editor` uses Collabora in writable edit mode for the exact Work Act document selected from Work Acts or Documents `Edit`.
- Collabora opens in `Editing` mode and saves back into `document-service/storage/collabora-wopi`.
- The edited `.fodt` source remains in local WOPI storage, and the app download action exports the current saved session to PDF.
- Documents view sessions are different: they copy an existing generated file into local WOPI storage, open with `permission=view`, and do not save back to the document record.

Current limitation:

- Saved `.fodt` files are not yet parsed back into structured application fields.
- Modules should store the Collabora session/download metadata, but should not assume the edited `.fodt` has updated structured rows, links, prices, dates, or registry references until a parser/promote flow is implemented.

## Product Decision

Use Collabora CODE only for the agreed personal/development case:

- app runs on the owner's own computer or own server;
- documents are edited only by the owner;
- no clients, employees, or company production use;
- no SLA or official support requirement;
- if the editor breaks, the owner accepts debugging or workaround.

If this becomes a real multi-user company production system, revisit paid Collabora Online subscription/support before launch.

Server launch, reverse proxy, backup/restore, and go-live rules live in `docs/PRODUCTION_DEPLOYMENT.md`. This file only defines the Collabora/WOPI integration contract.

## Runtime Topology

Docker services:

- `web` - nginx static frontend and reverse proxy, public local URL `http://localhost:8080/`.
- `document-service` - Node.js API, generation/file storage/WOPI bridge, public local URL through nginx under `/api/documents/`, internal URL `http://document-service:3001`.
- `collabora` - Collabora CODE runtime, internal URL `http://collabora:9980`.

Docker networks:

- `app-net` - normal app network for `web` and `document-service`.
- `collabora-net` - internal-only network for `web`, `document-service`, and `collabora`.

Network rules:

- `collabora` is attached only to `collabora-net`.
- `collabora-net` is `internal: true`.
- `collabora` exposes container port `9980` to Docker services, but does not publish `9980` to the host.
- `http://localhost:9980/hosting/discovery` should fail from the host.
- `http://localhost:8080/hosting/discovery` should return Collabora discovery XML.

Important `collabora` environment values:

```yaml
aliasgroup1: http://document-service:3001
extra_params: --o:ssl.enable=false --o:ssl.termination=false --o:net.proto=IPv4 --o:mount_jail_tree=false --o:fetch_update_check=0 --o:allow_update_popup=false --o:home_mode.enable=true
```

Why these matter:

- `aliasgroup1=http://document-service:3001` allows Collabora to call the WOPI host.
- `ssl.enable=false` and `ssl.termination=false` keep local HTTP simple inside Docker.
- `net.proto=IPv4` avoids IPv6 surprises in local Docker routing.
- `mount_jail_tree=false` avoids noisy Docker namespace mount errors.
- `fetch_update_check=0` and `allow_update_popup=false` disable update checks/popups.
- `home_mode.enable=true` disables welcome/feedback popups and is acceptable for one-owner personal/dev usage.

## Nginx Proxy Contract

Collabora browser traffic must go through the `web` proxy.

Current proxied paths in `nginx.conf`:

- `/browser`
- `/hosting`
- `/cool`
- `/loleaflet`
- `/lool`

`/cool` and `/lool` must support websocket upgrade headers.

Do not move browser iframe URLs directly to `http://collabora:9980` or `http://localhost:9980`.

## WOPI Request Flow

Current happy path:

```text
User clicks Open in advanced editor
  -> frontend builds module-specific Collabora payload
  -> POST /api/documents/collabora/sessions
  -> document-service creates session id, file id, access token
  -> document-service renders initial .fodt into storage/collabora-wopi
  -> document-service reads Collabora /hosting/discovery
  -> document-service returns editorUrl, downloadUrl, and pdfDownloadUrl
  -> frontend renders Collabora iframe
  -> Collabora calls CheckFileInfo
  -> Collabora calls GetFile
  -> Collabora LOCKs the file
  -> user edits in Collabora
  -> Collabora PUTs file contents on Save
  -> document-service updates size/version/hash/lastSavedAt
  -> user can download a PDF exported from the edited .fodt
```

The browser sees Collabora through `localhost:8080`. Collabora sees the WOPI source through `http://document-service:3001`.

Documents view path:

```text
User clicks Documents / View
  -> frontend finds the real generated file registry id
  -> if missing, frontend generates PDF first
  -> POST /api/documents/collabora/sessions with mode=view and fileId
  -> document-service copies that generated file into storage/collabora-wopi
  -> document-service creates a read-only WOPI session
  -> frontend renders Collabora iframe
  -> Collabora calls CheckFileInfo / GetFile
  -> user reviews generated output only
```

Documents `View` is not the signed/uploaded-file download flow. Signed/uploaded download stays in the Documents table `Status` column.

Work Act document edit path:

```text
User clicks Work Acts / Edit in advanced editor
or Documents / Edit on a Service Act
  -> frontend selects the exact Work Act source and linked document id
  -> POST /api/documents/collabora/sessions with sourceType=work-act-document
  -> document-service renders a Work Act-specific .fodt source
  -> the .fodt embeds the Viva Medical logo from document-service/templates/viva-medical-logo.png
  -> frontend renders Collabora iframe in Editing mode
  -> Collabora saves the edited source back to storage/collabora-wopi
  -> Preview result PDF exports the latest saved source with inline PDF disposition
```

This path is implemented only for Work Act / Service Act documents. Other modules need their own source-specific payload and configuration page before they should open advanced edit mode.

## Backend Endpoints

Public app endpoints behind nginx:

- `POST /api/documents/collabora/sessions`
- `GET /api/documents/collabora/sessions/:sessionId`
- `GET /api/documents/collabora/sessions/:sessionId/download` - source `.fodt` download.
- `GET /api/documents/collabora/sessions/:sessionId/download?format=pdf` - PDF export/download from the latest saved source.
- `GET /api/documents/collabora/sessions/:sessionId/download?format=pdf&inline=1` - PDF export shown inline for preview-result flows.

Internal WOPI endpoints used by Collabora:

- `GET /wopi/files/:fileId` - CheckFileInfo.
- `GET /wopi/files/:fileId/contents` - GetFile.
- `POST /wopi/files/:fileId` - LOCK, GET_LOCK, REFRESH_LOCK, UNLOCK.
- `POST /wopi/files/:fileId/contents` - PutFile/save-back.

The raw `POST /wopi/files/:fileId/contents` route must stay before `express.json()` because Collabora sends raw file bytes.

## Current Session Object

A public Collabora session includes:

- `id`
- `fileId`
- `mode`
- `readOnly`
- `sourceType`
- `sourceId`
- `sourceFileId`
- `title`
- `fileName`
- `mimeType`
- `sizeBytes`
- `version`
- `createdAt`
- `updatedAt`
- `lastSavedAt`
- `expiresAt`
- `editorUrl`
- `downloadUrl` - source `.fodt` download endpoint.
- `fodtDownloadUrl` - same source `.fodt` download endpoint, explicit alias for module code.
- `pdfDownloadUrl` - PDF export endpoint for the user-facing download button.
- `meta`

Runtime storage:

- File bytes: `document-service/storage/collabora-wopi/<fileName>`
- Session index: `document-service/storage/collabora-wopi/sessions.json`

Runtime storage is local generated state and should not be committed.

## Current Payload Contract

The first consumer, Templates Work List Template, sends:

- `sourceType`
- `sourceId`
- `ownerId`
- `userId`
- `userName`
- `title`
- `company`
- `entryPerson`
- `serviceType`
- `bodyText`
- `equipmentLabels`
- `hospitalLabels`
- `workEquipmentLabels`
- `richBodyHtml`

Templates no longer send Work Act row data in this payload. Concrete row editing belongs to the `Work Acts` module; those rows can be added to a Work Act generated document later.

Documents generated view sends:

- `sourceType = document-generated-preview`
- `sourceId`
- `ownerId`
- `documentId`
- `fileId` - generated file registry id.
- `generatedFileName`
- `mode = view`
- `permission = view`
- `readOnly = true`
- `disableExport = true`
- `title`
- `meta` with document type, customer, job/quotation reference, and generated file version.

The backend resolves `fileId` against `files.json`, verifies the file belongs to the document when `documentId`/`ownerId` is provided, copies the stored generated file into WOPI storage, and opens Collabora with the file extension-specific `view` action where available.

Work Act document edit sends:

- `sourceType = work-act-document`
- `sourceId = doc.id`
- `ownerId = doc.id`
- `documentId`
- `workActId`
- `mode = edit`
- `permission = edit`
- `title`
- user context
- seller/company fields from the Viva Medical company profile
- buyer/customer/job/equipment fields from the Work Act and linked service job
- Work Act `workRows`
- Work Act `reportOptions`
- short `meta` with document id, Work Act id, job id, customer, and source module.

The backend renders a Work Act editing `.fodt` from this payload. This Collabora source is separate from the normal Carbone `work-act.fodt` PDF generation template and is intentionally optimized for same-page advanced editing/preview.

For new modules, keep this pattern:

- `sourceType` names the domain source, for example `commercial-offer-template`, `contract-layout`, or `work-act-draft`.
- `sourceId` is the stable app record id.
- `ownerId` is stable enough for WOPI metadata.
- `title` becomes the human-readable document name.
- `meta` should contain short searchable context, not the entire source record.

## WOPI Fields That Enable Editing

`CheckFileInfo` must include writable metadata:

- `UserCanWrite: true`
- `ReadOnly: false`
- `SupportsUpdate: true`
- `SupportsLocks: true`
- `SupportsGetLock: true`
- `SupportsExtendedLockLength: true`

If Collabora opens as `Viewing`, check these first:

- `aliasgroup1` matches the WOPI source host.
- `WOPISrc` points to `http://document-service:3001/...`.
- `CheckFileInfo` returns writable fields.
- The `editorUrl` includes `permission=edit`.
- Collabora logs do not show `No authorized hosts found matching the target host`.

Documents read-only view sessions intentionally return:

- `UserCanWrite: false`
- `ReadOnly: true`
- `SupportsUpdate: false`
- `SupportsLocks: false`
- `SupportsGetLock: false`
- `DisableExport: true` by default from the Documents payload.

This is expected for generated document review. Do not "fix" Documents view into edit mode unless the product decision changes.

Work Act advanced edit sessions intentionally return writable metadata and should show Collabora `Editing`. If they open as `Viewing`, treat it as a bug in the Work Act payload, session mode, or WOPI writable fields.

## Adding Collabora To Another Module

Use this sequence.

1. Define the module source contract.

Choose:

- `sourceType`
- `sourceId`
- document title/file naming pattern
- what source fields must be rendered into the initial `.fodt`
- what session metadata should be saved back to the module record

2. Add a frontend payload builder.

Follow the current pattern in `src/js/interactions.js`:

- gather current visible form values;
- include checked linked labels or ids;
- include structured rows/sections;
- include a safe HTML/text representation if the module has rich body content;
- call `POST /api/documents/collabora/sessions`.

3. Add module state.

Each module that opens Collabora should have:

- `...CollaboraSession`
- `...CollaboraStatus`
- `...CollaboraError`

Avoid reusing Templates state for another module.

4. Render the editor iframe.

The module page should render:

- status/error line;
- iframe with `src=session.editorUrl`;
- user-facing download link to `session.pdfDownloadUrl`;
- clear wording that saves are stored in local WOPI session storage.

5. Save session metadata back to the source record.

At minimum save:

- `collaboraSessionId`
- `collaboraFileName`
- `collaboraDownloadUrl`
- `collaboraPdfDownloadUrl`
- `collaboraUpdatedAt`

Do not claim the structured source fields were updated from Collabora until parser/promote logic exists.

6. Add a backend renderer if needed.

Current backend renderer:

- `renderWorkListTemplateFodt()`

For more modules, prefer a renderer map instead of one growing function:

```text
sourceType -> render function -> .fodt bytes
```

Each renderer should output valid flat ODT XML (`.fodt`) and use XML escaping for user data.

7. Add verification.

Verify:

- `docker compose config`
- `http://localhost:8080/hosting/discovery` returns 200
- `http://localhost:9980/hosting/discovery` does not work
- module button opens iframe
- iframe shows `Editing`
- Collabora `Save` updates session `version`
- `Download PDF` exports the latest saved session file as PDF
- Collabora logs have no WOPI host authorization errors

## What Not To Do

Do not:

- publish Collabora port `9980` to the host;
- change WOPI source to `localhost` from inside Collabora;
- put customer-signed document custody in Collabora session storage;
- treat Collabora `.fodt` saves as final signed customer documents;
- parse `.fodt` with ad hoc string hacks for business-critical fields;
- mix procedure checklist templates with output layouts without a clear source type;
- assume CODE is production-supported for company use.

## Promotion / Parsing Future Work

Current save-back is binary file save-back only.

Before Collabora-edited files can update structured app records, add one of these:

- explicit "Promote edited FODT to template source" action;
- structured placeholders/content controls in the `.fodt`;
- a parser that extracts approved fields safely;
- a review screen showing proposed structured changes before saving.

Recommended direction:

- Keep structured app data as source of truth.
- Treat Collabora as advanced layout/body editing.
- Promote changes explicitly so a user can see what structured fields will change.

## Security And Privacy Notes

Current local/dev posture:

- Collabora has no host-published port.
- Collabora is attached only to an internal Docker network.
- Browser traffic goes through app nginx.
- Runtime update/welcome/feedback calls are disabled.
- Access tokens are generated per WOPI session.

Still prototype-level:

- Access tokens are stored in local session JSON.
- There is no real database-backed auth/permission model yet.
- Sessions are local runtime files, not audited production records.
- HTTPS is disabled for local Docker simplicity.

Before production:

- add real auth and role checks;
- store session/file metadata in DB;
- add retention/cleanup policy;
- use HTTPS/TLS termination properly;
- decide paid support/subscription stance;
- run security review for WOPI access tokens and file storage.

## Troubleshooting

`localhost:9980` does not work:

- Expected. Collabora is intentionally not published to host.

`localhost:8080/hosting/discovery` fails:

- Check `web` and `collabora` containers are running.
- Check nginx proxy paths.
- Check `collabora` is attached to `collabora-net`.

Collabora opens but stays in `Viewing`:

- Check `CheckFileInfo` writable fields.
- Check `permission=edit` in editor URL.
- Check Collabora logs for WOPI host allowlist errors.
- Check `aliasgroup1=http://document-service:3001`.

Collabora logs `No authorized hosts found matching the target host`:

- `aliasgroup1` does not match the WOPI source host.
- Current WOPI source host should be `document-service:3001`.

Collabora logs `rating.collaboraonline.com`:

- Check `fetch_update_check=0`, `allow_update_popup=false`, and `home_mode.enable=true` are present in `/proc/1/cmdline`.

Collabora logs missing `lc_validatedialogsa11y.svg` or `lc_validatesidebara11y.svg`:

- Known Collabora CODE image asset mismatch.
- It affects console cleanliness/accessibility checker icons, not WOPI load/save.

Collabora logs mount namespace errors:

- Check `mount_jail_tree=false` is present in `/proc/1/cmdline`.

Save does not update `lastSavedAt`:

- Check `POST /wopi/files/:fileId/contents` is registered before JSON parser.
- Check PutFile response includes `LastModifiedTime`.
- Check lock headers do not conflict.

## Useful Commands

Start/rebuild:

```powershell
docker compose up -d --build
```

Status:

```powershell
docker compose ps
```

Discovery through proxy:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://localhost:8080/hosting/discovery
```

Confirm direct host port is closed:

```powershell
try { (Invoke-WebRequest -UseBasicParsing -Uri http://localhost:9980/hosting/discovery -TimeoutSec 3).StatusCode } catch { 'NO_DIRECT_HOST_PORT' }
```

Confirm internal network:

```powershell
docker network inspect projectkopi_collabora-net --format '{{json .Internal}}'
```

Confirm Collabora runtime flags:

```powershell
docker exec projectkopi-collabora-1 sh -c "cat /proc/1/cmdline | tr '\0' ' '"
```

Check recent Collabora errors:

```powershell
docker compose logs collabora --tail 120
```

Syntax checks after backend/frontend changes:

```powershell
node --check document-service\src\server.js
node --check src\js\interactions.js
node --check src\js\render.js
node --check src\js\state.js
```

## File Map

Core files:

- `docker-compose.yml` - Collabora service, networks, runtime flags.
- `nginx.conf` - Collabora proxy paths and websocket headers.
- `document-service/src/server.js` - Collabora session API, WOPI endpoints, `.fodt` rendering.
- `src/js/interactions.js` - frontend session creation and module payload builders.
- `src/js/render.js` - iframe/download/status UI.
- `src/js/state.js` - module Collabora session state.
- `src/styles/pages.css` - iframe/loading/action styles.

Related docs:

- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/modules/TEMPLATES_MODULE.md`
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md`
- `docs/CURRENT_STATUS_AND_ROADMAP.md`
- `docs/CHANGELOG.md`

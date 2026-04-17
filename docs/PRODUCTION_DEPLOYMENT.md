# Production Deployment

Date: 2026-04-16

This document describes the current server/runtime assumptions for the Viva Medical prototype.

Current state: the app is Docker-runnable and suitable for local/private-server prototype use. It is not yet production-ready for a multi-user company deployment without the blockers listed below.

## Current Product Decision

- Collabora/WOPI is decommissioned and is not part of the active runtime.
- There is no Collabora Docker service, no WOPI bridge, no `collabora-net`, and no public or private `9980` editor port to preserve.
- Generated documents are reviewed through PDF/print preview or a generated file `previewUrl`.
- Editing remains in structured source modules, especially `Templates` and `Work Acts`.
- `document-service` remains required for document generation, file upload/download, preview URLs, feedback reports, and file registry metadata.

## Deployment Modes

Private owner server:

- App is used by the owner only.
- Current Docker architecture can be adapted with careful network, TLS, backup, and storage configuration.
- Prototype local persistence and frontend demo state are still limitations.

Company production server:

- Real employees/clients rely on the system.
- Documents and business records are official operational data.
- Uptime, backups, audit, permissions, and support matter.
- Current prototype is not enough; see `Production Readiness Blockers`.

## Current Docker Services

Current compose services:

- `web` - nginx frontend and reverse proxy.
- `document-service` - Node.js document generation, file storage, feedback storage, and file registry API.

Current local ports:

- `web`: host `8080` -> container `80`.
- `document-service`: host `3001` -> container `3001`.

Important production notes:

- Publishing `document-service:3001` to the host is convenient for local development, but it must not be exposed publicly on a production server.
- In production, public traffic should enter through one HTTPS reverse proxy only, then go to `web`.
- The nginx frontend proxies `/api/documents/` to `document-service:3001`.
- There are no Collabora proxy paths to configure.

## Required Production Configuration

Before deploying on a server, decide and configure:

- Public domain, for example `app.example.com`.
- DNS A/AAAA record pointing to the server.
- HTTPS/TLS termination.
- Firewall rules.
- Docker Engine and Docker Compose version.
- Persistent storage location.
- Backup location and schedule.
- `.env` values.
- Upload/document size limits.
- Server time zone.
- Admin/login/security model.

## Environment Variables

Current recommended values:

```env
UPLOAD_MAX_BYTES=7340032
FEEDBACK_ATTACHMENT_MAX_BYTES=5242880
```

Do not add Collabora or WOPI environment variables unless the product decision is explicitly reversed and the runtime/docs are redesigned.

## Reverse Proxy

Preferred production shape:

```text
Internet
  -> HTTPS reverse proxy on server, port 443
  -> Docker web service, container port 80
  -> /api/documents/ -> document-service:3001
```

Expose publicly:

- `80` only for redirect/challenge if needed.
- `443` for HTTPS app access.

Do not expose publicly:

- `3001` document-service.
- Docker daemon socket.
- local storage folders.

Reverse proxy must support:

- Large request bodies enough for signed document uploads and feedback attachments.
- Long enough read timeout for document generation/download.
- HTTPS headers forwarded correctly.

## Production Compose Recommendation

Do not use the local `docker-compose.yml` as-is for a public server.

Create a production override such as `docker-compose.prod.yml` when the server/domain is known.

Expected production differences:

- `web` publishes `80` only to localhost or to the host reverse proxy, depending on proxy choice.
- `document-service` removes public `ports:` and uses only Docker networks.
- storage paths point to a server backup directory.
- environment values come from `.env`.
- restart policy stays `unless-stopped`.

Example intent:

```yaml
services:
  document-service:
    ports: []

  web:
    ports:
      - "127.0.0.1:8080:80"
```

This is an intent example, not a final production override. Final port mapping depends on the chosen host reverse proxy.

## Persistent Data

Back up these folders/files:

- `document-service/storage`
- `document-service/generated`
- uploaded custom templates under generated/template storage, if used
- production `.env`
- production compose files

Most important runtime files:

- `document-service/storage/files.json`
- `document-service/storage/feedback-reports.json`
- uploaded documents under `document-service/storage/uploads`
- bug screenshots under `document-service/storage/attachments`
- generated output under `document-service/generated`

Do not rely on Docker image rebuilds to preserve runtime data. Runtime data must live in mounted volumes or backed-up bind mounts.

## First Server Deployment Process

1. Prepare server: install OS updates, Docker Engine, Docker Compose plugin, firewall, DNS, and a non-root deployment user if possible.
2. Clone/copy the project.

```bash
git clone <repo-url> viva-medical-app
cd viva-medical-app
```

3. Create `.env` with production values.
4. Prepare storage.

```bash
mkdir -p document-service/storage
mkdir -p document-service/generated
```

5. Configure HTTPS reverse proxy.
6. Start services.

```bash
docker compose up -d --build
```

Use a production override when created:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

7. Verify containers.

```bash
docker compose ps
```

8. Verify app routes through the public domain:

```text
https://app.example.com/
https://app.example.com/api/documents/health
```

9. Verify document flows:

- Generate a Work Act PDF.
- Open generated preview from `Documents -> View`.
- Upload a signed Work Act copy.
- Confirm the completion dialog marks the linked Service job `Done`.
- Submit a feedback report with and without attachment.

10. Verify backup and restore before trusting the server.

## Update Process

Before updating:

- Create a backup of storage and `.env`.
- Note current git commit/hash.
- Check `docker compose ps`.

Update:

```bash
git pull
docker compose up -d --build
```

With production override:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

After updating:

- Check app loads.
- Check `/api/documents/health`.
- Generate and preview a document.
- Upload and download a signed document.
- Check logs for repeated errors.

## Backup Process

Minimum backup contents:

- `document-service/storage`
- `document-service/generated`
- `.env`
- production compose files

Recommended backup schedule:

- Daily local snapshot.
- Daily off-server copy.
- Keep at least 7 daily backups and 4 weekly backups for private use.
- For company production, define a formal retention policy.

Backup test:

- Restore backup into a separate folder/server.
- Run the app.
- Confirm uploaded/generated files are visible.
- Confirm feedback reports are visible.

## Restore Process

1. Stop services.

```bash
docker compose down
```

2. Restore backed-up folders/files:

- `document-service/storage`
- `document-service/generated`
- `.env`
- production compose files

3. Start services.

```bash
docker compose up -d --build
```

4. Verify app, generated files, signed uploads, and feedback reports.

## Health Checks

Basic:

```bash
docker compose ps
```

Document service through nginx:

```bash
curl -f http://localhost:8080/api/documents/health
```

Document service directly in local development:

```bash
curl -f http://localhost:3001/health
```

## Log Checks

Useful commands:

```bash
docker compose logs web --tail 100
docker compose logs document-service --tail 100
```

Investigate repeated:

- failed generation errors.
- storage write errors.
- upload size errors.
- malformed file registry errors.
- repeated container restarts.

## Production Readiness Blockers

Before company production use, implement or decide:

- Real authentication.
- Real role/permission enforcement on the backend.
- Database-backed records instead of frontend/localStorage prototype state.
- Database-backed file metadata.
- Audit log and retention policy.
- Secure session/token handling.
- HTTPS-only deployment.
- Automated backups and tested restore.
- Server monitoring.
- Error reporting.
- Upload file type policy.
- Virus/malware scanning for uploaded files if required.
- Legal/customer document retention rules.

Until these are done, treat the app as a private/internal prototype or single-owner private server app.

## Go-Live Checklist

Do not expose the app until all required private-server items are checked:

- Domain points to server.
- HTTPS works.
- Firewall exposes only expected ports.
- `document-service:3001` is not public.
- Storage folders are persistent.
- Backup job exists.
- Restore was tested.
- App loads through public URL.
- `/api/documents/health` works through public URL.
- Document generation works.
- Generated document preview works through `Documents -> View`.
- Signed document upload/download works.
- Work Act signed upload can mark the linked Service job `Done` after confirmation.
- Feedback report submission works.
- Logs are reviewed after first launch.

## Related Docs

- `README.md`
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/TEMPLATES_MODULE.md`
- `docs/modules/WORK_ACTS_MODULE.md`
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md`
- `docs/VM_WEB_CONTROL.md`
- `docs/CURRENT_STATUS_AND_ROADMAP.md`

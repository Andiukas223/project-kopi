# Production Deployment

Date: 2026-04-15

This document describes how the app should be configured and launched on a real server.

Current state: the app is Docker-runnable and suitable for local/private-server prototype use. It is not yet production-ready for a multi-user company deployment without the blockers listed below.

## Deployment Modes

Two different meanings of "production server" must stay separate.

Private owner server:

- App is used by the owner only.
- No employees/clients use it as a business-critical production system.
- Collabora CODE personal/dev setup is acceptable.
- Current Docker architecture can be adapted with careful network, TLS, backup, and secret configuration.

Company production server:

- Real employees/clients rely on the system.
- Documents and business records are official operational data.
- Uptime, backups, audit, permissions, and support matter.
- Current prototype is not enough; see `Production Readiness Blockers`.

## Current Docker Services

Current compose services:

- `web` - nginx frontend and reverse proxy.
- `document-service` - Node.js document generation, file storage, feedback storage, WOPI bridge.
- `collabora` - Collabora CODE advanced editor runtime.

Current local ports:

- `web`: host `8080` -> container `80`.
- `document-service`: host `3001` -> container `3001`.
- `collabora`: no host-published port, container-only `9980`.

Important production note:

- Publishing `document-service:3001` to the host is convenient for local development, but should not be exposed publicly on a production server.
- In production, public traffic should enter through one HTTPS reverse proxy only, then go to `web`.
- `collabora:9980` must stay private.

## Required Production Configuration

Before deploying on a server, decide and configure:

- Public domain, for example `app.example.com`.
- DNS A/AAAA record pointing to the server.
- HTTPS/TLS termination.
- Firewall rules.
- Docker Engine and Docker Compose version.
- Persistent storage location.
- Backup location and schedule.
- `.env` secrets.
- Collabora public URL.
- Upload/document size limits.
- Server time zone.
- Admin/login/security model.

## Required Environment Variables

Recommended `.env` values for a server:

```env
COLLABORA_ADMIN_USER=change-me-admin
COLLABORA_ADMIN_PASSWORD=change-me-long-random-password
COLLABORA_PUBLIC_URL=https://app.example.com
COLLABORA_INTERNAL_URL=http://collabora:9980
WOPI_INTERNAL_BASE_URL=http://document-service:3001
UPLOAD_MAX_BYTES=7340032
FEEDBACK_ATTACHMENT_MAX_BYTES=5242880
WOPI_FILE_MAX_BYTES=31457280
```

Notes:

- `COLLABORA_PUBLIC_URL` must match the URL the browser uses.
- `WOPI_INTERNAL_BASE_URL` must stay reachable from the `collabora` container.
- `COLLABORA_INTERNAL_URL` is Docker-internal and should usually stay `http://collabora:9980`.
- Never keep default Collabora admin credentials on a server.

## Reverse Proxy

Preferred production shape:

```text
Internet
  -> HTTPS reverse proxy on server, port 443
  -> Docker web service, container port 80
  -> /api/documents/ -> document-service:3001
  -> /browser, /hosting, /cool, /loleaflet, /lool -> collabora:9980
```

Expose publicly:

- `80` only for redirect/challenge if needed.
- `443` for HTTPS app access.

Do not expose publicly:

- `3001` document-service.
- `9980` Collabora.
- Docker daemon socket.
- local storage folders.

Reverse proxy must support:

- WebSocket upgrade for Collabora `/cool` and `/lool`.
- Large request body enough for uploads.
- Long read timeout for Collabora editing sessions.
- HTTPS headers forwarded correctly.

The existing `nginx.conf` already contains the internal app proxy paths. For a real server, either:

- run another host-level reverse proxy in front of Docker; or
- change `web` to publish `80:80` and terminate TLS outside the container; or
- create a production nginx/Caddy/Traefik setup.

## Production Compose Recommendation

Do not use the current local `docker-compose.yml` as-is for a public server.

Create a production override such as `docker-compose.prod.yml` when the server/domain is known.

Expected production differences:

- `web` publishes `80` only to localhost or to the host reverse proxy, depending on proxy choice.
- `document-service` removes public `ports:` and uses only Docker networks.
- `collabora` keeps no public port.
- storage paths point to a server backup directory.
- environment values come from `.env`.
- restart policy stays `unless-stopped`.

Example intent:

```yaml
services:
  document-service:
    ports: []
    environment:
      - COLLABORA_PUBLIC_URL=${COLLABORA_PUBLIC_URL}
      - COLLABORA_INTERNAL_URL=http://collabora:9980
      - WOPI_INTERNAL_BASE_URL=http://document-service:3001

  web:
    ports:
      - "127.0.0.1:8080:80"
```

This is an intent example, not a final production override. Final port mapping depends on the chosen host reverse proxy.

## Persistent Data

Back up these folders:

- `document-service/storage`
- `document-service/generated`
- any uploaded custom templates under generated/template storage
- production `.env`
- production compose files

Most important runtime files:

- `document-service/storage/files.json`
- `document-service/storage/feedback-reports.json`
- `document-service/storage/collabora-wopi/sessions.json`
- uploaded documents under `document-service/storage/uploads`
- bug screenshots under `document-service/storage/attachments`
- Collabora edited files under `document-service/storage/collabora-wopi`

Do not rely on Docker image rebuilds to preserve runtime data. Runtime data must live in mounted volumes or backed-up bind mounts.

## First Server Deployment Process

1. Prepare server.

- Install OS updates.
- Install Docker Engine and Docker Compose plugin.
- Create a non-root deployment user if possible.
- Configure firewall.
- Configure DNS.

2. Clone or copy project.

```bash
git clone <repo-url> viva-medical-app
cd viva-medical-app
```

3. Create `.env`.

Use strong random secrets and the real public URL.

4. Prepare storage.

```bash
mkdir -p document-service/storage
mkdir -p document-service/generated
```

5. Configure reverse proxy.

Ensure HTTPS and websocket support are ready before exposing the app.

6. Start services.

```bash
docker compose up -d --build
```

Use production override when created:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

7. Verify containers.

```bash
docker compose ps
```

8. Verify app routes.

Through public domain:

```text
https://app.example.com/
https://app.example.com/api/documents/health
https://app.example.com/hosting/discovery
```

From the server, direct Collabora host port should not be public. If using the current dev compose, `document-service:3001` may still be reachable locally; production override should remove it.

9. Verify Templates advanced editor.

- Open `Templates`.
- Click `Open in advanced editor`.
- Confirm Collabora iframe opens in `Editing`.
- Press Collabora `Save`.
- Confirm session `lastSavedAt` changes.
- Download edited PDF.

10. Verify backup job.

Run one manual backup and one manual restore test before trusting the server.

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
- Check `/hosting/discovery`.
- Open Collabora advanced editor and save a test document.
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
- Confirm Collabora edited `.fodt` files can be downloaded.

## Restore Process

1. Stop services.

```bash
docker compose down
```

2. Restore backed-up folders.

- restore `document-service/storage`
- restore `document-service/generated`
- restore `.env`
- restore production compose files

3. Start services.

```bash
docker compose up -d --build
```

4. Verify app and files.

## Health Checks

Basic:

```bash
docker compose ps
```

Document service through nginx:

```bash
curl -f http://localhost:8080/api/documents/health
```

Collabora discovery through nginx:

```bash
curl -f http://localhost:8080/hosting/discovery
```

Direct Collabora host port should fail:

```bash
curl -f http://localhost:9980/hosting/discovery
```

The last command failing is expected when Collabora is private.

## Log Checks

Useful commands:

```bash
docker compose logs web --tail 100
docker compose logs document-service --tail 100
docker compose logs collabora --tail 100
```

Investigate repeated:

- WOPI authorization errors.
- Collabora host allowlist errors.
- failed save-back errors.
- storage write errors.
- upload size errors.
- repeated container restarts.

Known low-risk Collabora noise:

- Missing `lc_validatedialogsa11y.svg`.
- Missing `lc_validatesidebara11y.svg`.

These affect Collabora accessibility checker icons, not normal WOPI load/save.

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
- Collabora support/subscription decision.
- Legal/customer document retention rules.

Until these are done, treat the app as a private/internal prototype or single-owner private server app.

## Collabora Production Notes

For private server use:

- Keep `collabora` internal.
- Keep `aliasgroup1=http://document-service:3001`.
- Set `COLLABORA_PUBLIC_URL` to the real HTTPS domain.
- Keep update/welcome/feedback calls disabled.
- Keep `home_mode.enable=true` for the agreed one-owner use.

For real company production:

- Revisit Collabora Online support/subscription.
- Decide whether CODE is still acceptable.
- Review concurrent document/session limits.
- Review security around WOPI access tokens.

More detailed Collabora integration rules live in `docs/modules/COLLABORA_WOPI_INTEGRATION.md`.

## Go-Live Checklist

Do not expose the app until all required private-server items are checked:

- Domain points to server.
- HTTPS works.
- Firewall exposes only expected ports.
- `document-service:3001` is not public.
- `collabora:9980` is not public.
- `.env` uses non-default secrets.
- `COLLABORA_PUBLIC_URL` matches the public HTTPS URL.
- Storage folders are persistent.
- Backup job exists.
- Restore was tested.
- App loads through public URL.
- `/api/documents/health` works through public URL.
- `/hosting/discovery` works through public URL.
- Templates advanced editor opens in `Editing`.
- Collabora `Save` updates WOPI session `lastSavedAt`.
- Upload/download document flow works.
- Logs are reviewed after first launch.

## Related Docs

- `README.md`
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md`
- `docs/modules/DOCUMENTS_MODULE.md`
- `docs/modules/TEMPLATES_MODULE.md`
- `docs/VM_WEB_CONTROL.md`
- `docs/CURRENT_STATUS_AND_ROADMAP.md`

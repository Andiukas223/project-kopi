# vm-web-control - Viva Medical Service IS Local Web Control

Date: 2026-04-16

## Purpose

`vm-web-control` is the local launcher for the Viva Medical web prototype. It starts, stops, rebuilds, opens, and inspects the Docker runtime from the project root.

The web app itself does not contain a control button for this, because a stopped web app cannot reliably start itself.

## Current Runtime

- Frontend is built with Vue 3/Vite.
- nginx serves the built `dist/` output.
- Docker runtime has two active services: `web` and `document-service`.
- Collabora/WOPI is decommissioned: there is no `collabora` service, no `collabora-net`, and no nginx proxy for `/browser`, `/hosting`, `/cool`, `/loleaflet`, or `/lool`.
- Documents are reviewed through generated PDF/print preview or `previewUrl`.
- Editing stays in structured source modules such as `Templates` and `Work Acts`.

## Files

| File | Purpose |
|---|---|
| `vm-web-control.cmd` | Windows launcher that opens PowerShell and passes arguments. |
| `vm-web-control.ps1` | Main PowerShell control script. |
| `Dockerfile` | Multi-stage build: Vue 3/Vite frontend build, then nginx serves `dist/`. |
| `nginx.conf` | Proxies `/api/documents/` to `document-service:3001`, proxies `/api/templates/` to `document-service:3001/templates/`, blocks old `/api/documents/templates*`, and serves the frontend for all other paths. |
| `docker-compose.yml` | Runs `web` on `8080:80` and `document-service` on `3001:3001`. |
| `document-service/` | Node.js + Carbone + LibreOffice document generation/file storage/feedback service. |

## Commands

Interactive menu:

```cmd
vm-web-control.cmd
```

Direct PowerShell:

```powershell
.\vm-web-control.ps1
```

Direct commands:

```powershell
.\vm-web-control.ps1 on
.\vm-web-control.ps1 off
.\vm-web-control.ps1 restart
.\vm-web-control.ps1 status
.\vm-web-control.ps1 logs
.\vm-web-control.ps1 open
```

The `.cmd` launcher accepts the same action names:

```cmd
vm-web-control.cmd on
vm-web-control.cmd off
vm-web-control.cmd restart
vm-web-control.cmd status
vm-web-control.cmd logs
vm-web-control.cmd open
```

## Behavior

```text
vm-web-control.cmd %*
  -> powershell -NoProfile -ExecutionPolicy Bypass -File vm-web-control.ps1 [action]
       -> docker compose up -d --build   (on / restart; web + document-service)
       -> docker compose down            (off / restart)
       -> docker compose ps              (status)
       -> docker compose logs --tail 80  (logs)
       -> Start-Process http://localhost:8080/  (open)
```

The script always runs `docker compose` from the project root (`$ProjectRoot`), regardless of the caller's current directory.

## Dockerfile

```dockerfile
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
```

Every `on` or `restart` rebuilds the frontend bundle and the nginx image.

## Docker Compose Shape

```yaml
services:
  document-service:
    build: ./document-service
    ports:
      - "3001:3001"
    volumes:
      - ./document-service/templates:/app/templates:ro
      - ./document-service/generated:/app/generated
      - ./document-service/storage:/app/storage
    networks:
      - app-net
    restart: unless-stopped

  web:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - document-service
    networks:
      - app-net
    restart: unless-stopped

networks:
  app-net:
```

- App URL: `http://localhost:8080/`.
- Frontend document API calls use `/api/documents/*` through nginx.
- Frontend reusable Template API calls use `/api/templates/*` through nginx.
- `document-service` is directly published on `3001` for local development only.
- In production/private-server deployment, `document-service:3001` must not be public.

## Alternative Without Docker

For frontend-only development:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite. Document generation still requires `document-service` to be running separately.

## Common Problems

| Problem | Fix |
|---|---|
| `docker: command not found` | Install Docker Desktop and make sure it is running. |
| Port `8080` is already in use | Stop the other process or change the web port mapping in `docker-compose.yml`. |
| Frontend changes do not appear in Docker | Run `restart` so the Vite build and nginx image are rebuilt. |
| PowerShell execution policy error | The launcher uses `-ExecutionPolicy Bypass`; if needed, use `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`. |
| `docker compose` vs `docker-compose` | The script uses Docker Compose V2 syntax: `docker compose`. |

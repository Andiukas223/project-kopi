# Frontend Architecture

Date: 2026-04-18

This document summarizes the current frontend architecture after the Vue 3 foundation, shell, shared component, routing/state, Documents migration, Templates migration, Work Acts migration, Equipment migration, and cleanup passes.

## Current Shape

The frontend is a Vue 3/Vite application that still hosts legacy vanilla JavaScript modules during incremental migration.

- `index.html` is the Vite HTML entry.
- `src/js/app.js` is the runtime bootstrap. It loads persisted demo state, applies theme state, installs Vue Router, mounts Vue, and binds legacy delegated handlers.
- `src/app/App.vue` is the root Vue component and renders the active route.
- `src/router/` defines active module routes and syncs them to the legacy `state.page`.
- `src/layouts/AppShell.vue` owns the visible application shell.
- `src/components/shell/` owns the topbar and sidebar navigation.
- `src/components/ui/` contains reusable Vue UI primitives that preserve the existing CSS class contract.
- `src/modules/documents/` contains the migrated Documents feature module.
- `src/modules/equipment/` contains the migrated Equipment feature module.
- `src/modules/templates/` contains the migrated Templates feature module.
- `src/modules/workActs/` contains the migrated Work Acts feature module.
- `src/components/LegacyPage.vue` hosts non-migrated legacy module HTML from `src/js/render.js`.
- `src/components/LegacyOverlays.vue` hosts legacy overlays still needed beside migrated routes.
- `src/components/documentEditor/UmoDocumentEditor.vue` is the active browser editor wrapper used by Templates.

## Vue-Owned UI

Vue currently owns:

- App bootstrap and route rendering.
- Topbar and sidebar shell.
- Active module navigation for `Service`, `Work Acts`, `Contracts`, `Documents`, `Templates`, `Customers`, `Equipment`, `Calendar`, and `Admin`.
- Theme and language toggle shell state.
- Sidebar collapse state and top-toggle behavior (`state.sidebarCollapsed`) in the Vue shell store; collapse targets the navigation rail itself. Collapsed mode uses neutral outline icon rail buttons, while expanded mode keeps icon + label navigation.
- Shared UI primitives: buttons, fields, form grids, panels, stat cards, status chips, tables, modal shell, and wizard shell.
- The Documents module surface: filters, table, signed/external upload modal, and Work Act completion confirmation.
- The Templates module surface: `/templates` list/management page and `/templates/:templateId` editor-first detail page with metadata, applicability comboboxes, action buttons, merge fields, and Umo editor.
- The Work Acts module surface: source service job selector, selected Work Act builder, equipment picker, Template picker, report options, work rows, PDF draft/generation actions, and grouped Work Act list.
- The Equipment module surface: installed system table, detail tabs (`System Info`, `Installation`, `Hospital Acceptance`, `Support`), support sub-tabs (`Settings`, `Emails`, `Web Links`), support-toggle/copy/preview actions, and Equipment ownership/boundary dev reference.

## Legacy Compatibility

Legacy code is intentionally still present for modules that have not been migrated.

- `src/js/render.js` still renders Service, Contracts, Customers, Calendar, Admin, dormant prototype pages, generated document print preview, and feedback overlays.
- `src/js/documentPipeline.js` still owns document business actions during migration: generation, upload, file registry calls, preview, source edit routing, audit updates, and Work Act completion side effects.
- `src/js/data.js`, `src/js/state.js`, and localStorage persistence remain the demo data/state source until module stores are introduced around each migrated area.

Post-Phase 8 cleanup removed the unused `src/stores/legacyStore.js` shim. Vue/legacy coexistence now goes through `src/stores/shellStore.js` directly.

The old legacy Documents index renderer has been removed. Documents is now rendered by `src/modules/documents/DocumentsPage.vue`; legacy support for Documents is limited to shared overlays and delegated document handlers.

The old legacy Templates landing renderer has been removed. The active Templates route wrapper is `src/modules/templates/TemplatesPage.vue`, with `TemplateListPage.vue` for `/templates` and `TemplateDetailPage.vue` for `/templates/:templateId`; legacy support is limited to delegated Work List Template save/delete/rich editor/combobox handlers. Template applicability is now owned by the Vue Work Acts view model.

The old legacy Work Acts route renderer has been removed. The active Work Acts route is rendered by `src/modules/workActs/WorkActsPage.vue`; legacy support is limited to delegated Work Act handlers in `src/js/interactions.js`, generated document preview/output helpers in `src/js/render.js`, and document generation/routing behavior in `src/js/documentPipeline.js`.

The old legacy Equipment route renderer has been removed from the active route surface. The active Equipment route is rendered by `src/modules/equipment/EquipmentPage.vue`; Equipment interactions are now Vue-owned through `src/stores/equipmentStore.js` (row/tab/sub-tab selection, support toggle, copy URL, support preview, and support-case submit). Equipment-specific delegated handlers were removed from `src/js/interactions.js`.

The old Documents-side template generation mock panel and inline output-layout editor helpers have been removed from the active frontend. Real generation now uses `document-service` directly through source modules and the Documents `View` path. Output-layout seed data and backend template files remain for future Vue/admin work, but there is no active legacy UI for `Generate mock`, `Edit template`, `Export sections as .fodt`, or `Upload .fodt template`.

## Runtime And Build

The deployment shape remains nginx + document-service.

- Local Docker/private-server path: `docker compose up -d --build`.
- Convenience control path: `.\vm-web-control.cmd` or `.\vm-web-control.ps1`.
- Frontend build: `npm run build`.
- Local Vite dev server: `npm run dev`.
- nginx serves the Vite build output from `/usr/share/nginx/html`.
- nginx proxies document custody/generation APIs through `/api/documents/` to `document-service:3001`.
- nginx proxies reusable Template persistence through `/api/templates/` to `document-service:3001/templates/`; the old public `/api/documents/templates*` path is blocked so Templates do not appear under the Documents API namespace.

`document-service:3001` must remain private in production. Public access should continue to go through the nginx/reverse proxy layer.

## Collabora/WOPI

Collabora/WOPI is decommissioned and is not part of the active frontend architecture.

- Do not add Collabora iframes.
- Do not call `/api/documents/collabora/sessions`.
- Do not restore `/browser`, `/hosting`, `/cool`, `/loleaflet`, or `/lool` proxy paths.
- Generated documents are reviewed through PDF/print preview or direct preview URLs.
- Editing happens in structured source workspaces and, for reusable template content, the Umo editor.

## Umo Editor Integration

Umo Editor is the active browser editor target for reusable template content.

- `src/components/documentEditor/UmoDocumentEditor.vue` wraps Umo and owns editor setup, content loading, save shortcuts, content snapshots, and template insertions.
- `src/components/documentEditor/editorContent.js` normalizes editor HTML/text/json snapshots.
- `src/modules/templates/TemplateDetailPage.vue` owns template metadata, merge fields, applicability, and save/load actions.
- `src/modules/templates/TemplateListPage.vue` owns template browse/manage filters and row actions.
- Work Acts owns document generation from selected Templates; Templates does not create persisted Documents directly.
- Future editor launch buttons should live in owning source modules, not in the Documents index. Examples: Templates reusable content editing, Work Act source editing, or output-layout administration.
- `Documents -> Edit` should continue to route to the owning source workspace; it should not directly open an editor from the Documents table.
- Any future additional editor provider must use the existing nginx/reverse-proxy safety model. Internal editor/document services must stay private, and any public browser URL must go through the approved public web origin.

Current runtime status:

- No shell-level generic editor iframe is active.
- No `/api/documents/collabora/sessions` call exists.
- No WOPI endpoints, Docker services, or nginx proxy paths were restored.
- Umo runs as a Vue component inside the Templates route.

## Migration Boundary

The next module migrations should keep this coexistence model:

1. Move the module view into `src/modules/<module>/`.
2. Reuse `src/components/ui/` primitives and existing CSS class names.
3. Keep delegated legacy business handlers until the module's behavior is safely wrapped in Vue services/stores.
4. Remove legacy renderer code only after the Vue route owns the full visible surface.
5. Validate Docker/nginx and document-service behavior after each phase.

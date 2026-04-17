# Viva Medical Business Management Web App

Vidines verslo valdymo web aplikacijos projektas pagal esama `docs/design_system.md` dokumentacija ir pateiktus logo failus.

## Esama medziaga

- `docs/design_system.md` - pagrindine UI/UX specifikacija: shell struktura, komponentai, wizard modalai, lenteles, proceduru trukmes laukeliai, process flow ir JS architekturos principai.
- `LOGO.odt` - dokumentas su imontuotu logo paveiksleliu.
- `viva medical logo.ai` - Adobe Illustrator logo saltinis.
- `viva medical logo.cdr` - CorelDRAW logo saltinis.

## Dabartinis susitarimas

Pirmas etapas yra veikiantis desktop-first vidines sistemos prototipas pagal `docs/design_system.md`, dabar moduliarizuotas i `src/` failus ir paleidziamas per Docker su nginx. Pilnesne backend architektura planuojama velesniame etape, kai bus patvirtinti verslo moduliai, duomenu modeliai ir naudotoju roles.

## Dokumentacija

Visa dokumentacija yra `docs/` aplanke:

- `docs/PROJECT_PLAN.md` - detalus kurimo planas, fazes, moduliai, techniniai sprendimai, pilnas backlog.
- `docs/DOCUMENTATION_RULES.md` - taisykles busimiems chatams/agentams: ka skaityti pirmiausia, kaip dokumentuoti modulius, ownership, UI kontroles, runtime, changelog ir handoff.
- `docs/CURRENT_STATUS_AND_ROADMAP.md` - dabartine 2026-04-16 projekto busena, kas jau padaryta, kas dar truksta, ir kaip planuojami B-38+ darbai.
- `docs/FRONTEND_ARCHITECTURE.md` - dabartine Vue 3/Vite + legacy compatibility frontend architektura, migracijos riba ir runtime/build taisykles.
- `docs/PRODUCTION_DEPLOYMENT.md` - production/private server paleidimo runbook: domenas, TLS, Docker, `.env`, reverse proxy, dokumentu servisas, backup/restore, health checks ir go-live checklist.
- `docs/CHANGELOG.md` - visi reiksmingi pakeitimai, kad kita sesija galetu greitai perimti konteksta.
- `docs/modules/README.md` - moduliu dokumentacijos rodykle ir taisykles, kada kuri faila atnaujinti.
- `docs/modules/WORKSPACE_MODULES.md` - atskiras visu workspace moduliu aprasas: paskirtis, ownership, linkai ir non-goals.
- `docs/modules/DOCUMENTS_MODULE.md` - detalus Documents modulio aprasas: lentele, Status/Action logika, upload modalas, failu custody ir paieska.
- `docs/modules/WORK_ACTS_MODULE.md` - detalus Work Acts modulio aprasas: service job saltinis, konkretus Work Act draft'ai, template kopijavimas, work rows, PDF generavimas ir Documents file custody riba.
- `docs/modules/TEMPLATES_MODULE.md` - detalus Templates modulio aprasas: procedure/checklist templates, Output Layouts, merge fields ir vieta ateities template modifikacijoms.
- `docs/modules/WORK_EQUIPMENT_FUTURE_MODULE.md` - busimo Work Equipment modulio kontekstas: serviso/metrologine iranga, kalibravimo laukai ir rysiai su Templates/Work Acts.
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md` - istorinis/decommissioned Collabora/WOPI sprendimo ir pasalinimo kontekstas. Aktyvi runtime architektura Collabora nebenaudoja.
- `docs/modules/LINKING_AND_PIPELINE_LOGIC.md` - detali linkinimo ir pipeline logika tarp Service, Work Acts, Templates, Sales, Contracts, Documents, Finance, Parts, Calendar, Customers, Equipment ir Admin.
- `docs/design_system.md` - UI/UX specifikacija.
- `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md` - moduliarinio Docker web prototipo planas Viva Medical verslo valdymo sistemai.
- `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md` - Tomis read-only radiniai ir dokumentu generavimo logikos palyginimas.
- `docs/TOMIS_CRAWL_PLAYBOOK.md` - detalus saugaus ir efektyvaus Tomis crawl procesas: ka spausti, ko nespausti, ka fiksuoti, kaip versti radinius i backlog.
- `docs/VM_WEB_CONTROL.md` - `vm-web-control.cmd` / `.ps1` valdymo įrankio dokumentacija: komandos, Docker konfigūracija, dažnos problemos.
- `docs/VIVAMEDICAL_WEBSITE.md` - `vivamedical.lt` svetaines ziniu baze ir taisykle, kaip ja pildyti per Playwright, kai informacijos truksta.

## Paleidimas

Patogiausias kelias per sakninio folderio valdymo programele:

```powershell
.\vm-web-control.cmd
```

Arba tiesiogiai per PowerShell:

```powershell
.\vm-web-control.ps1
```

Greitos komandos:

```powershell
.\vm-web-control.ps1 on
.\vm-web-control.ps1 off
.\vm-web-control.ps1 restart
.\vm-web-control.ps1 status
.\vm-web-control.ps1 logs
.\vm-web-control.ps1 open
```

Docker kelias:

```powershell
docker compose up -d --build
```

Production/server paleidimui nenaudoti sio lokalaus apraso kaip vienintelio saltinio. Pries keliant i serveri vadovautis `docs/PRODUCTION_DEPLOYMENT.md`: production aplinkoje `document-service:3001` neturi buti public, o viesas iejimas turi eiti per HTTPS reverse proxy.

Paleidziami servisai:

- `web` - nginx frontend ir reverse proxy, pasiekiamas per `http://localhost:8080/`.
- `document-service` - dokumentu generavimas/failu saugykla, taip pat pasiekiamas per `/api/documents/`.

Collabora/WOPI runtime pasalintas 2026-04-16, kad migracija i Vue 3 butu paprastesne. Generated dokumentai perziurimi per PDF/print preview arba `previewUrl`, reusable template content redaguojamas per Umo, o Work Act redagavimas lieka strukturuotuose source laukuose.

Tada atidaryti:

```text
http://localhost:8080/
```

Pastaba: web aplikacijos topbar nebeturi `CMD` valdymo mygtuko. Docker/web valdymas turi buti atliekamas is projekto sakninio folderio, nes neveikiantis web negali patikimai paleisti pats saves.

Frontend dabar build'inamas per Vue 3/Vite. Lokaliam frontend dev serveriui:

```powershell
npm install
npm run dev
```

Tada atidaryti Vite nurodyta lokalu URL. Dokumentu generavimo API dev rezime vis tiek turi veikti per `document-service` arba Docker.

Dabartine frontend architektura:

- Vue 3 owns app bootstrap, routes, shell/topbar/sidebar, shared UI primitives, and the Documents/Templates/Work Acts routes.
- Legacy vanilla renderer remains as compatibility host for not-yet-migrated modules and shared overlays.
- The old legacy Documents index renderer has been removed; Documents UI now lives in `src/modules/documents/`.
- The old legacy Templates landing renderer has been removed; Templates UI now lives in `src/modules/templates/`, with only delegated save/delete/rich-editor compatibility handlers remaining.
- The old legacy Work Acts route renderer has been removed; Work Acts UI now lives in `src/modules/workActs/`, with delegated action/document-generation compatibility still in place.
- The old Documents-side template generation mock/output-layout editor panel has been removed; real document generation now uses the PDF/document-service flow, while future output-layout editing should be rebuilt as a Vue/admin surface.
- Templates use the active Umo editor wrapper in `src/components/documentEditor/UmoDocumentEditor.vue`; no WOPI endpoint or Collabora proxy is active.

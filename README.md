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
- `docs/CURRENT_STATUS_AND_ROADMAP.md` - dabartine 2026-04-15 projekto busena, kas jau padaryta, kas dar truksta, ir kaip planuojami B-38+ darbai.
- `docs/PRODUCTION_DEPLOYMENT.md` - production/private server paleidimo runbook: domenas, TLS, Docker, `.env`, reverse proxy, Collabora/WOPI, backup/restore, health checks ir go-live checklist.
- `docs/CHANGELOG.md` - visi reiksmingi pakeitimai, kad kita sesija galetu greitai perimti konteksta.
- `docs/modules/README.md` - moduliu dokumentacijos rodykle ir taisykles, kada kuri faila atnaujinti.
- `docs/modules/WORKSPACE_MODULES.md` - atskiras visu workspace moduliu aprasas: paskirtis, ownership, linkai ir non-goals.
- `docs/modules/DOCUMENTS_MODULE.md` - detalus Documents modulio aprasas: lentele, Status/Action logika, upload modalas, failu custody ir paieska.
- `docs/modules/WORK_ACTS_MODULE.md` - detalus Work Acts modulio aprasas: service job saltinis, konkretus Work Act draft'ai, template kopijavimas, work rows, PDF generavimas ir Documents file custody riba.
- `docs/modules/TEMPLATES_MODULE.md` - detalus Templates modulio aprasas: procedure/checklist templates, Output Layouts, merge fields ir vieta ateities template modifikacijoms.
- `docs/modules/WORK_EQUIPMENT_FUTURE_MODULE.md` - busimo Work Equipment modulio kontekstas: serviso/metrologine iranga, kalibravimo laukai ir rysiai su Templates/Work Acts.
- `docs/modules/COLLABORA_WOPI_INTEGRATION.md` - Collabora CODE/WOPI integracijos playbook: Docker topology, nginx proxy, session API, WOPI endpoints, kaip prijungti advanced editor prie kitu moduliu ir troubleshooting.
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

Production/server paleidimui nenaudoti sio lokalaus apraso kaip vienintelio saltinio. Pries keliant i serveri vadovautis `docs/PRODUCTION_DEPLOYMENT.md`: production aplinkoje `document-service:3001` neturi buti public, Collabora `9980` turi likti privati, o viesas iejimas turi eiti per HTTPS reverse proxy.

Paleidziami servisai:

- `web` - nginx frontend ir reverse proxy, pasiekiamas per `http://localhost:8080/`.
- `document-service` - dokumentu generavimas/failu saugykla, taip pat pasiekiamas per `/api/documents/`.
- `collabora` - Collabora CODE personal/dev advanced editor runtime. Jis neturi atskiro public port'o ir veikia tik vidiniame Docker tinkle; browseris ji pasiekia per `web` nginx proxy.

Collabora naudojama `Templates -> Open in advanced editor` flow. `document-service` veikia kaip lokalus WOPI bridge: sukuria `.fodt` sesija, Collabora ja redaguoja per iframe, o `Save` raso atgal i `document-service/storage/collabora-wopi`. Tiesioginis `http://localhost:9980` neturi veikti, nes Collabora port'as nera publikuojamas i hosta. Runtime konfige isjungti CODE update/welcome/feedback call'ai ir `collabora-net` yra internal Docker network.

Tada atidaryti:

```text
http://localhost:8080/
```

Pastaba: web aplikacijos topbar nebeturi `CMD` valdymo mygtuko. Docker/web valdymas turi buti atliekamas is projekto sakninio folderio, nes neveikiantis web negali patikimai paleisti pats saves.

Jei Docker Desktop dar nepaleistas, laikinas statinis serveris prototipo perziurai:

```powershell
cd src
python -m http.server 8081
```

Tada atidaryti:

```text
http://localhost:8081/
```

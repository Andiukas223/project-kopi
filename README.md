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
- `docs/CHANGELOG.md` - visi reiksmingi pakeitimai, kad kita sesija galetu greitai perimti konteksta.
- `docs/design_system.md` - UI/UX specifikacija.
- `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md` - moduliarinio Docker web prototipo planas Viva Medical verslo valdymo sistemai.
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

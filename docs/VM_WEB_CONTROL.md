# vm-web-control — Viva Medical Service IS lokalaus web valdymo įrankis

## Paskirtis

`vm-web-control` yra paprastas valdymo įrankis, skirtas paleisti, stabdyti ir stebėti Viva Medical Service IS web prototipą per Docker lokaliai. Web aplikacija pati negali valdyti savo paleidimo (neveikianti aplikacija negali paleisti savęs), todėl valdymas atliekamas iš projekto šakninės direktorijos.

---

## Failai

| Failas | Paskirtis |
|---|---|
| `vm-web-control.cmd` | Windows paleidiklis — atveria PowerShell ir perduoda argumentus |
| `vm-web-control.ps1` | Pagrindinis PowerShell skriptas su visa valdymo logika |
| `Dockerfile` | nginx:1.27-alpine konteineris, kopijuoja `src/` į `/usr/share/nginx/html/` |
| `docker-compose.yml` | Vienintelis `web` servisas, port `8080:80`, `restart: unless-stopped` |

---

## Paleidimas

### Interaktyvus meniu (rekomenduojamas)

```cmd
vm-web-control.cmd
```

arba tiesiogiai PowerShell:

```powershell
.\vm-web-control.ps1
```

Atidaro interaktyvų meniu su opcijomis 1–7.

### Tiesioginės komandos

```powershell
.\vm-web-control.ps1 on        # Build + paleisti konteinerį
.\vm-web-control.ps1 off       # Sustabdyti konteinerį
.\vm-web-control.ps1 restart   # off → on
.\vm-web-control.ps1 status    # docker compose ps
.\vm-web-control.ps1 logs      # Paskutinės 80 log eilučių
.\vm-web-control.ps1 open      # Atidaro http://localhost:8080/ naršyklėje
.\vm-web-control.ps1 quit      # Išeiti (tik meniu režime)
```

Tas pats per `.cmd` paleidiklį:

```cmd
vm-web-control.cmd on
vm-web-control.cmd off
vm-web-control.cmd restart
vm-web-control.cmd status
vm-web-control.cmd logs
vm-web-control.cmd open
```

---

## Veikimo logika

```
vm-web-control.cmd %*
  └─ powershell -NoProfile -ExecutionPolicy Bypass -File vm-web-control.ps1 [action]
       └─ docker compose up -d --build   (on / restart)
       └─ docker compose down            (off / restart)
       └─ docker compose ps              (status)
       └─ docker compose logs --tail 80  (logs)
       └─ Start-Process http://localhost:8080/  (open)
```

Skriptas visada vykdo `docker compose` komandas iš projekto šakninio aplanko (`$ProjectRoot`), nepriklausomai nuo to, iš kur jis paleidžiamas.

---

## Interaktyvus meniu

```
Viva Medical Service IS - local web control
Project: C:\...\project kopi

1. Turn on
2. Turn off
3. Restart
4. Status
5. Logs
6. Open browser
7. Quit
```

---

## Docker konfigūracija

### Dockerfile

```dockerfile
FROM nginx:1.27-alpine
COPY src/ /usr/share/nginx/html/
EXPOSE 80
```

Visi `src/` failo turinys (HTML, CSS, JS) kopijuojamas į nginx statinių failų šaknį. Kiekvieną kartą paleidus `on` arba `restart`, konteineris rebuild'inamas su naujausiais `src/` pakeitimais.

### docker-compose.yml

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

- Port: `http://localhost:8080/`
- `restart: unless-stopped` — konteineris automatiškai paleidžiamas iš naujo po Docker Desktop perkrovimo, nebent jis buvo sustabdytas rankiniu būdu su `off`.

---

## Alternatyva be Docker

Jei Docker Desktop nepasiekiamas, `src/` galima patikrinti per Python HTTP serverį:

```powershell
cd src
python -m http.server 8081
```

Tada atidaryti: `http://localhost:8081/`

---

## Dažnos problemos

| Problema | Sprendimas |
|---|---|
| `docker: command not found` | Įdiegti Docker Desktop ir įsitikinti, kad jis paleistas |
| Port 8080 jau užimtas | Sustabdyti kitą procesą arba pakeisti portą `docker-compose.yml` |
| Pakeitimai `src/` neatsinaujina | Paleisti `restart` — rebuild'ina konteinerį su naujais failais |
| PowerShell execution policy klaida | Skriptas naudoja `-ExecutionPolicy Bypass`, bet jei reikia: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `docker compose` vs `docker-compose` | Skriptas naudoja `docker compose` (V2 sintaksė, Docker Desktop ≥ 3.x) |

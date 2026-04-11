# Projekto Kurimo Planas

Data: 2026-04-11

## 1. Projekto tikslas

Sukurti vidine verslo valdymo web aplikacija Viva Medical komandai. Aplikacija turi atrodyti ir veikti kaip desktop-first administracine sistema: virsutine juosta, soninis meniu, moduliai, korteles, lenteles, subpuslapiai, wizard modalai, diagnostikos/remonto timeriai ir process flow diagramos.

Pirmas tikslas - greitai gauti kokybiska, paspaudziama MVP prototipa pagal esama `design_system.md`, kad butu galima patvirtinti UX, moduliu logika ir darbo eigas pries kuriant pilna backend sistema.

## 2. Isanalizuota medziaga

### `design_system.md`

Dokumentas apibrezia labai konkretu UI kontrakta:

- Pradinis pristatymas: vienas `.html` failas, be frameworku, build tools ir isorinio JavaScript.
- CSS: visas stilius viename `<style>` bloke, spalvos tik per `:root` CSS custom properties.
- JS: vienas `<script>` blokas pries `</body>`.
- Sriftai: viena sans-serif seima UI tekstui ir viena monospace seima kodams, skaiciams, timeriams.
- Layout: fiksuota topbar, fiksuotas sidebar ir scrollinama main sritis.
- Puslapiai: vienas aktyvus `.page` vienu metu, perjungimas per JS `nav(page)`.
- Subpuslapiai: bendras `#page-subpage` su dinamiskai ikeliamu turiniu.
- Wizard: vienas flat state objektas `W`, perrenderinamas po sprendimu ir mygtuku veiksmu.
- Timeriai: `Date.now()`, `setInterval`, stop/record mechanika.
- Komponentai: stat cards, module tiles, subgroup tiles, data table, info boxes, decision cards, checklist, process flow diagram.
- Responsive kryptis: desktop-first, be media queries, naudojant `overflow-x`, `overflow-y` ir `minmax()` gridus.

Svarbi interpretacija: dokumentas yra geriausiai tinkamas MVP/prototipui. Velesnei produkcinei sistemai reikes atskiro sprendimo del backend, autentifikacijos, duomenu bazes, teisiu ir Docker deployment.

### Logo failai

Rasti failai:

- `LOGO.odt` - turi imontuota logo paveiksleli.
- `viva medical logo.ai` - tikriausiai pagrindinis vektorinis logo saltinis.
- `viva medical logo.cdr` - CorelDRAW alternatyva.

Rekomendacija: web prototipui eksportuoti logo i `assets/logo.svg` ir `assets/logo.png`. Kol eksportas neatliktas, HTML prototipe galima naudoti tekstini wordmark arba veliau prijungti konvertuota asset.

## 3. Siuloma architekturos trajektorija

### Fazes A kryptis: greitas UI MVP

Naudoti dokumentacijoje numatyta formata:

- `index.html`
- inline CSS
- inline JS
- jokio package manager
- jokio build proceso
- galima atidaryti tiesiog narsykleje

Privalumai: greita, mazai priklausomybiu, lengva parodyti ir iteruoti.

Rizika: sis formatas netinka ilgalaikei multi-user verslo sistemai su autentifikacija, DB, auditu ir realiais workflow.

### Fazes B kryptis: pilna aplikacija su Docker

Kai MVP patvirtintas, perkelti logika i full-stack struktura:

- Frontend: React/Next.js arba kitas pasirinktas frameworkas.
- Backend: Node.js API arba frameworko server routes.
- DB: PostgreSQL.
- ORM/migracijos: Prisma arba analogas.
- Auth: roles ir permissions pagal darbuotoju funkcijas.
- Docker: `docker-compose.yml` su web app ir DB servisais.

Sprendima del stacko verta priimti po MVP, nes `design_system.md` dabar specialiai apriboja technologijas iki vieno HTML failo.

## 4. MVP funkcine apimtis

Pirmas prototipas turetu tureti:

- App shell: topbar, sidebar, main area.
- Dashboard: 4 stat cards, pagrindiniu moduliu tiles.
- Moduliai:
  - Service
  - Sales
  - Customers
  - Inventory / Parts
  - Reports
  - Settings
- Service modulis:
  - subgroup tiles: Warranty, PM Jobs, Diagnostics, Repairs, Missing Documents, Vendor Returns.
  - sample lenteles su job ID, customer, system, status, due date.
- Job wizard:
  - kliento/irenginio informacija.
  - atsakingas darbuotojas ir service tipas.
  - diagnostikos timeris.
  - sutarties/garantijos/quotation sprendimu korteles.
  - daliu prieinamumas ir EDD.
  - remonto timeris.
  - uzdarymo checklist.
- Process flow:
  - service eiga nuo job sukurimo iki uzdarymo.
  - sprendimu sakos: contract/warranty/quotation/parts/vendor return.

## 5. Techniniai principai MVP etapui

- Laikytis `design_system.md` kaip auksciausio prioriteto UI specifikacijos.
- Spalvas deti tik i CSS kintamuosius `:root`.
- Nenaudoti hardcoded hex spalvu komponentu taisyklese.
- Nenaudoti animaciju, keyframes, transform scale ar nereikalingu hover judesiu.
- Timerio intervalas turi atnaujinti tik display elementa, ne visa wizard zingsni.
- Field values skaityti per Continue, ne per kiekviena klaviso paspaudima.
- Uzdarant modala visada isvalyti intervalus.
- UI tekstus rasyti kaip produkto tekstus, be paaiskinimu apie pacia sasaja.

## 6. Docker planas

### MVP

Jei MVP lieka vieno HTML failo, Docker nera butinas. Jei reikia parodyti per lokalu serveri, galima naudoti minimalu statini web serveri:

- `Dockerfile` su nginx arba kitu statiniu serveriu.
- `docker-compose.yml` su vienu `web` servisu.

### Produkcine sistema

Kai atsiras backend:

- `web` servisas aplikacijai.
- `db` servisas PostgreSQL.
- `.env.example` su privalomais kintamaisiais.
- migracijos komandos.
- seed duomenys demo/test aplinkai.
- healthcheck ir logu perziura per `docker compose logs`.

## 7. Git planas

Repozitorija inicializuota lokaliai 2026-04-11.

Rekomenduojama eiga:

- Pirmas commit: dokumentacija, planas ir changelog.
- Antras commit: statinis `index.html` MVP shell.
- Trecias commit: Service modulis ir subpuslapiai.
- Ketvirtas commit: Job wizard ir timeriai.
- Penktas commit: Docker statinio serverio konfiguracija, jeigu patvirtinama, kad reikia.

Remote dar neprijungtas. Reikia GitHub/GitLab/Bitbucket repo URL, jei norima `git remote add origin ...` ir `git push`.

## 8. Atviri klausimai

- Ar aplikacijos pavadinimas UI turi buti "Viva Medical", "Service IS", ar kitas?
- Kokia pagrindine brand spalva is logo turi tapti `--brand`?
- Ar MVP turi grieztai likti vieno `.html` failo, kaip nurodyta dokumentacijoje?
- Ar Docker reikalingas jau MVP demonstracijai, ar tik veliau full-stack etapui?
- Kokios naudotoju roles reikalingos: admin, service engineer, sales, warehouse, finance?
- Kokie realus moduliai svarbiausi pirmam leidimui?
- Ar reikia lietuvisko, anglisko, ar misraus UI teksto?

## 9. Kitos sesijos starto instrukcija

Kitas chat turetu:

1. Perskaityti `README.md`, `PROJECT_PLAN.md`, `CHANGELOG.md` ir `design_system.md`.
2. Patikrinti `git status`.
3. Jeigu vartotojas patvirtina MVP krypti, kurti `index.html` pagal `design_system.md`.
4. Kiekviena reiksminga pakeitima prideti i `CHANGELOG.md`.
5. Neliesti logo saltiniu, kol neaisku, kokiu web formatu reikia eksportuoti.


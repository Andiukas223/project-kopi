# Projekto Kurimo Planas

Data: 2026-04-11

## 1. Projekto tikslas

Sukurti vidine verslo valdymo web aplikacija Viva Medical komandai. Aplikacija turi atrodyti ir veikti kaip desktop-first administracine sistema: virsutine juosta, soninis meniu, moduliai, korteles, lenteles, subpuslapiai, wizard modalai, diagnostikos/remonto trukmes laukeliai ir process flow diagramos.

Pirmas tikslas - greitai gauti kokybiska, paspaudziama MVP prototipa pagal esama `design_system.md`, kad butu galima patvirtinti UX, moduliu logika ir darbo eigas pries kuriant pilna backend sistema.

## 2. Isanalizuota medziaga

### `design_system.md`

Dokumentas apibrezia labai konkretu UI kontrakta:

- Pradinis pristatymas: vienas `.html` failas, be frameworku, build tools ir isorinio JavaScript.
- CSS: visas stilius viename `<style>` bloke, spalvos tik per `:root` CSS custom properties.
- JS: vienas `<script>` blokas pries `</body>`.
- Sriftai: viena sans-serif seima UI tekstui ir viena monospace seima kodams, skaiciams ir techninems trukmes reiksmems.
- Layout: fiksuota topbar, fiksuotas sidebar ir scrollinama main sritis.
- Puslapiai: vienas aktyvus `.page` vienu metu, perjungimas per JS `nav(page)`.
- Subpuslapiai: bendras `#page-subpage` su dinamiskai ikeliamu turiniu.
- Wizard: vienas flat state objektas `W`, perrenderinamas po sprendimu ir mygtuku veiksmu.
- Service wizard proceduru trukme: diagnostikos ir remonto laikas ivedamas ranka i duration laukelius; live timer mechanika sioje versijoje nenaudojama.
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
  - diagnostikos trukmes laukelis.
  - sutarties/garantijos/quotation sprendimu korteles.
  - daliu prieinamumas ir EDD.
  - remonto trukmes laukelis.
  - uzdarymo checklist.
- Process flow:
  - service eiga nuo job sukurimo iki uzdarymo.
  - sprendimu sakos: contract/warranty/quotation/parts/vendor return.
  - diagnostikos ir remonto mazgai zymi ranka pildoma proceduros trukme, ne live timeri.

## 5. Techniniai principai MVP etapui

- Laikytis `design_system.md` kaip auksciausio prioriteto UI specifikacijos.
- Spalvas deti tik i CSS kintamuosius `:root`.
- Nenaudoti hardcoded hex spalvu komponentu taisyklese.
- Nenaudoti animaciju, keyframes, transform scale ar nereikalingu hover judesiu.
- Diagnostikos ir remonto trukmes laukeliai turi buti paprasti input laukai; nereikia `setInterval` ar live timerio state.
- Field values skaityti per Continue, ne per kiekviena klaviso paspaudima.
- Uzdarant modala nereikia valyti proceduru timeriu, nes trukmes laukai neturi aktyviu interval procesu.
- UI tekstus rasyti kaip produkto tekstus, be paaiskinimu apie pacia sasaja.

## 6. Docker planas

### MVP

Jei MVP lieka vieno HTML failo, Docker nera butinas. Jei reikia parodyti per lokalu serveri, galima naudoti minimalu statini web serveri:

- `Dockerfile` su nginx arba kitu statiniu serveriu.
- `docker-compose.yml` su vienu `web` servisu.
- Sakninio folderio valdymo skriptas turi valdyti Docker/web paleidima is isores. Web UI neturi tureti `CMD` paleidimo mygtuko, nes neveikianti aplikacija negaletu saves paleisti.

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
- Ketvirtas commit: Job wizard ir proceduru trukmes laukeliai.
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

## 11. Pilnas rolių sąrašas

| Rolė | ID | Funkcija |
|---|---|---|
| Service Engineer | service | Kuria technical cases, fiksuoja diagnostikos/remonto trukmę, įkelia pasirašytus dokumentus |
| Service Manager | svcmgr | Kontroliuoja inžinierius, tvirtina parts užsakymus (pagal situacijos aprašą) |
| Sales / Sales Manager | sales | Kuria commercial offers, valdo sutartis, įkelia sąskaitas (abu tas pats) |
| Finance | finance | Generuoja/įkelia invoice PDF, valdo mokėjimo statusą (paid/pending/canceled) |
| Office Manager | office | Klientų registras, kontaktai, kalendorius, case kūrimas, priminimai inžinieriams |
| Logistics Manager | logistics | Parts pristatymas, vendor returns, logistikos problemų sprendimas |
| Warehouse | warehouse | Parts inventorius, užsakymų vykdymas, atvykimo patvirtinimas |
| Manager | manager | Read-only overview visose moduliuose ir ataskaitose |
| Admin | admin | Pilna kontrolė, teisių valdymas (checkbox grid per user), case uždarymas, sutarčių archyvo valdymas |

**Teisių sistema:** Tik Admin rolė yra fiksuota. Visų kitų rolių teises Admin priskiria per checkbox grid prie kiekvieno user. Vienas user gali turėti kelias roles.

---

## 12. Pipeline tipai

### Tipas A — Remontas be serviso sutarties

```
Technical Case → Diagnostika (trukmės laukas) → Parts check
  → [jei reikia dalių] Parts Request → Service Manager tvirtina → Logistics/Warehouse vykdo → Inžinierius gauna notifikaciją
  → Commercial Offer (klientas turi patvirtinti: kaina, kas keičiama)
  → Remontas (trukmės laukas)
  → Work Act generavimas → Parašo surinkimas → Įkėlimas į sistemą
  → INVOICE NEEDED statusas → Finance generuoja/įkelia invoice PDF
  → Inžinierius parsisiunta → surenka parašą → įkelia pasirašytą
  → Admin review: [Diagnostika ✓][Commercial offer ✓][Remontas ✓][Sistema veikia ✓]
  → Approval Required → Admin patvirtina → ARCHIVED
```

### Tipas B — Remontas su serviso sutartimi

```
Technical Case → Diagnostika → Parts check (jei reikia)
  → Remontas (sistema rodo sutarties likutį; perspėja jei remonto kaina > likutis)
  → Work Act → Parašas → Įkėlimas
  → Admin review → ARCHIVED
```

Sutarties logika: sutartyje yra suma (pvz. 100 000 EUR) ir trukmė (pvz. 36 mėn.). Kiekvienas remontas minusuoja sunaudotą sumą. Remonto metu ir peržiūrint sutartį matoma: likutis / sunaudota / darbų istorija.

### Tipas C — Naujos sistemos instaliavimas

```
Sales: Commercial Offer → Kliento patvirtinimas
  → Sutarties indeksavimas (laukeliai + warranty datos + comments section)
  → Instaliavimas (inžinierius)
  → Acceptance Act generavimas → Parašas → Įkėlimas
  → GARANTIJA PRASIDEDA nuo įkėlimo datos (ne nuo admin patvirtinimo)
  → Admin verifikacija (rankinis patikrinimas) → ARCHIVED
  → Kalendorius sinchronizuojasi su warranty expiry data
```

### Tipas D — PM (Periodinis maintenance)

```
Sistema AUTO generuoja PM case iš sutarties
  → PM submodulyje statusas: [Scheduled / Unscheduled / Problem]
  → Datos paskirstymas: lygus padalinimas per sutarties laikotarpį
    (pvz. 4×/12 mėn = kas 3 mėn; negalima sukrauti 3 mėn iš eilės)
  → User gali perkelti datą per tą patį mėnesį
  → Pagrindinis kalendorius auto-atnaujinamas
  → Darbo atlikimas → Work Act → Admin review → ARCHIVED
```

---

## 13. Sutarties logika

Sutarties tipai: **pardavimas / PM / remontas / naujos sistemos instaliavimas**

- Suma + trukmė (mėnesiais)
- Remonto metu sistema rodo: **likutis / sunaudota / darbų istorija**
- Perspėjimas: jei remonto kaina > likutis
- Kiekviena remonto operacija minusuoja nuo likučio

PM sutartyje: PM dažnumas (kiek kartų per metus), sutarties pradžia/pabaiga, atsakingas inžinierius.

Sutarties valdymas: Sales įkelia → Admin valdo po handoff. Admin gali iš archyvo padaryti edit mode → Sales modifikuoja → Admin re-patvirtina.

---

## 14. Parts ir logistikos flow

```
Inžinierius identifikuoja dalį (diagnostikos metu)
→ Parts request sukurimas (su situacijos aprašu)
→ Service Manager tvirtina užsakymą
→ Logistics / Warehouse vykdo
→ Dalys atvyksta → Warehouse patvirtina → Inžinierius gauna notifikaciją
→ Inžinierius sprendžia pristatymą:
   [Pasiima iš sandėlio]  ARBA  [Pristatymas į vietą: adresas + kontaktinis asmuo (išsaugomas registre)]
   Gavėjas: inžinierius ARBA vietos asmuo (registruojamas kontaktų bazėje)
→ Remontas pradedamas
```

Vendor return trigger: Work Act'e pažymima "repair exchange" → Logistics sukuria return case → Inžinierius nurodo kur keliauja dalis (blogų detalių surinkimo vieta ARBA sandėlio re-stok).

---

## 15. Dokumentų modulis

### Dokumentų tipai

Atliktu darbu aktas / Diagnostikos ataskaita / Komercinis pasiūlymas / Sutarties priedas / Garantijos patvirtinimas / Parts request / Vendor return note / Priėmimo aktas / Invoice

### Pipeline

```
Draft → Review → Customer → Signature → Approved → Archived
Rejection path: Rejected → Draft (reikalingas komentaras)
Permanentinis rejection: komentaras → Admin resolves
```

### Create vs Upload

**Create (generate from template):** Carbone mock šiame etape. Vėliau tikras backend. User generuoja doc iš template, parsisiunta, surenka parašą, re-uploadina.

**Upload (išorinis doc):** Metadata: vieta / sutarties ref / data / vykdytojas / kas pasirašė / trumpas aprašas. Šie laukai indeksuojami globaliai.

### Paieška

Filtrai + teksto laukas + Search / Cancel mygtukai. Paieška per: dokumento tipas / owner / statusas / klientas / datos intervalas / laisvas tekstas. Rezultatai suranda dokumentus pagal indeksuotus metadata laukus (ypač seni dokumentai).

---

## 16. Support Portal — kliento gedimų registravimas

Kiekvienas instaliuotos sistemos įrašas turi **Support** tab su trimis sub-tab'ais (kaip senoje sistemoje):

### Settings sub-tab
- **Support Page Is Enabled** varnelė — kai pažymėta, sistema sugeneruoja unikalius URL šiai sistemai
- **Group Name** — grupuoja kelias sistemas po vienu URL (pvz. visi aparatai viename skyriuje)
- **Image (override)** — pasirinktilas paveikslėlis support puslapiui

### Emails sub-tab
- **Company Emails** — Viva Medical vidiniai gavėjai (notifikacija apie naują case)
- **Manufacturer Emails** — gamintojas gauna pranešimą apie gedimą
- **Hospital Emails** — ligonines kontaktas gauna patvirtinimą kai case sukurtas

### Web Links sub-tab
- **System link** — unikalus URL šiai konkrečiai instaliuotai sistemai (su Copy mygtuku)
- **Hospital link** — URL visiems sistemos aparatams ligonineje
- **Group link** — URL visiems sistemos aparatams grupėje

### Support portal flow (kliento pusė)

```
Ligonines darbuotojas atidaro System URL (be prisijungimo)
  → Puslapis rodo: sistemos pavadinimas, modelis, ligonine, vieta (pre-filled)
  → Darbuotojas įveda: trumpas gedimo aprašas + kontaktinis asmuo (neprivaloma)
  → Submit → sistema auto-sukuria naują Technical Case:
      [sistema + ligonine + gedimo aprašas + šaltinis = "Support portal"]
  → Case statusas: New / Unassigned
  → Admin gauna notifikaciją → priskiria inžinierių → normalus pipeline tęsiasi
```

**Prototipe:** Support tab UI rodomas Equipment detail puslapyje. Viešas support puslapio URL yra planuojamas sub-puslapis (be autentifikacijos). Case kūrimas — mock.

---

## 17. Kalendorius ir PM scheduling

Spalvos pagal user. Filtrai: user / datos intervalas / aparatas / sutartis. Teisės: user mato save, admin mato viską ir gali priskirti. Sutarties galiojimas matomas išfiltravus pagal sutartis ir periodą.

Renginių tipai: Service case / Diagnostika / Remontas / PM vizitas / Sales susitikimas / Demo / Sutarties galiojimas

PM datos: auto-generuojamos iš sutarties, lygiai paskirstytos. User gali perkelti datą per tą patį mėnesį. Pagrindinis kalendorius auto-atnaujinamas.

---

## 17. Priminimai

Sidebar juosta (sarašo tipo). Kiekvienas įrašas: `vieta / case open date / statusas` su spalvos indikatoriumi (raudona/geltona/žalia/pilka). Office Manager ir visi su teisėmis gali siųsti priminimus inžinieriams (surinkti parašą, įkelti dokumentą).

---

## 9. Kitos sesijos starto instrukcija

Kitas chat turetu:

1. Perskaityti `README.md`, `PROJECT_PLAN.md`, `CHANGELOG.md` ir `design_system.md`.
2. Patikrinti `git status`.
3. Jeigu vartotojas patvirtina MVP krypti, kurti `index.html` pagal `design_system.md`.
4. Kiekviena reiksminga pakeitima prideti i `CHANGELOG.md`.
5. Neliesti logo saltiniu, kol neaisku, kokiu web formatu reikia eksportuoti.

## 10. Atnaujinta prototipo kryptis 2026-04-12

Vartotojas patikslino, kad prototipas turi buti moduliarinis ir paleidziamas su Docker. Sistema yra Viva Medical verslo valdymo sistema, orientuota i medicinines irangos service darbus, sales vartotojus, service vartotojus ir admin vartotojus. Pagrindinis darbo objektas yra work act ir kitu dokumentu kurimo, apdorojimo, statusu stebejimo ir uzbaigimo pipeline.

Detalesnis planas perkeltas i `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md`.

Dokumentu generavimui velesniame backend etape planuojama naudoti Carbone (`https://github.com/carboneio/carbone`) su LibreOffice / Microsoft Office dokumentu template'ais. Pirmame UI prototipe bus rodoma mock template generation patirtis dokumentu modulyje, o tikras Carbone renderinimas bus atskiras server-side `document-service` etapas.

2026-04-12 pradetas dokumentu pipeline prototipo etapas: Documents puslapis turi owner filtra, selected document paneli, `Review next`, `Advance` pipeline perkelima ir mock template generation busena pasirinktai isvesties formai.

2026-04-12 web valdymas perkeltas is web UI i sakninio folderio programele: `vm-web-control.ps1` ir `vm-web-control.cmd`. Ji valdo Docker veiksmus `on`, `off`, `restart`, `status`, `logs`, `open`, `quit`; web topbar `CMD` mygtukas ir command modalas pasalinti.

2026-04-12 dokumentu pipeline papildytas status monitoring sluoksniu: Command Center overdue documents skaicius skaiciuojamas is demo dokumentu, Documents puslapis rodo overdue/due today/customer/signature monitoring korteles, o velyvuojantys dokumentai lenteleje turi raudona indikatoriu ir `Overdue` badge.

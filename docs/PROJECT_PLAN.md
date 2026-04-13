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

### Lengvo modernaus dizaino principai

Sistema turi atrodyti lengva, moderni ir neperkrauta, net kai duomenu ir workflow daug. Pagrindine kryptis: kiekvienas modulis turi viena aiskia paskirti, o naudotojas vienu metu turi matyti tik tam veiksmui reikalinga informacija.

- Moduliu atskirumas: `Documents` turi buti dokumentu talpykla ir paieskos vieta; `Template Generation` turi buti atskiras dokumentu kurimo ir sablonu darbo modulis; `Registers` turi laikyti registrinius template/us ir klasifikatorius.
- Vienas pagrindinis veiksmas ekrane: kiekviename modulyje turi buti aiskus primary action, o antriniai veiksmai turi buti ramesni ir neuzgozti pagrindines uzduoties.
- Progressive disclosure: advanced laukai, debug JSON, template payload, audit trail ir techniniai nustatymai turi buti paslepiami po tabsais, details blokais arba atskiromis paneliu sekcijomis.
- Vizualinis lengvumas: naudoti daug balto/sviesaus pavirsiaus, ramias linijas, ribota akcentu kieki, statuso spalvas tik statusams, o ne dekorui.
- Neperkrautos korteles: korteles naudoti tik santraukoms, pasikartojantiems items ir aiškiems objektams; nesudeti korteliu i korteles ir nedaryti kiekvienos formos grupes atskiru floating card.
- Stabilus layout: lenteles, toolbars, tabsai ir detail paneliai turi tureti stabilias dimensijas, kad statusai, hover busenos ar ilgesni tekstai nejudintu viso ekrano.
- Role-aware tankis: service, sales, finance ir admin mato skirtingus akcentus; nereikia viename ekrane rodyti visu komandu veiksmu, jei roliui jie nera aktualus.
- Lengvas skenavimas: top area = summary/filters, middle = list/workspace, right/bottom = selected item detail. Vengti viename skydelyje maisyti registry, generation, archive ir settings logika.
- Terminai turi buti produkto terminai, ne UI paaiskinimai: `Work Act`, `Work List Template`, `Output Template`, `Generated document`, `Uploaded document`, `Signed document`.
- Kai workflow sudetingas, naudoti sub-tabs arba stepper, o ne ilga viena forma.

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

## 18. Dabartinė būsena (2026-04-12)

### Implementuota ✅

| Modulis / funkcija | Pastabos |
|---|---|
| App shell — topbar, sidebar, navigacija | Dinamiški badges pagal rolę |
| Command Center | 9 rolių filtruoti stat korteliai + focus panel |
| Service puslapis | Jobs lentelė, PM submodule, svcmgr parts approval |
| Sales puslapis | Quotation lentelė + 4-tab detalė (Offer/Contract/Approval/Handoff) |
| Documents puslapis | Pipeline board, filtrai, overdue monitoring, template generation mock su vizualiniu preview + download |
| Finance puslapis | Invoice sąrašas, susieti jobs/dokumentai, payment statusai ir mock Generate / Paid / Cancelled veiksmai |
| Customers puslapis | Lentelė + detalės panel (kontaktai, mini-stat, equipment, contracts) |
| Equipment puslapis | Lentelė + 4 tabai + Support Portal (Settings/Emails/Web Links + preview modal) |
| Parts puslapis | Lentelė + stat korteliai + workflow mygtukai (Approve/Reject/Transit/Arrived/Deliver) |
| Reports puslapis | 4 stat korteliai, Jobs by stage bar chart, Document pipeline health, Contract utilisation |
| Admin puslapis | User sąrašas + permission grid (checkbox) + role assignment |
| Calendar puslapis | Mėnesio grid, Prev/Next navigacija, spalvoti events, PM schedule lentelė |
| Reminders strip | Sidebar spalvoti priminimai (overdue docs, parts, PM visits) |
| New service job wizard | 8 žingsniai, Pipeline type routing (A/B/C/D), Contract balance info |
| Role sistema | 9 rolės, role switcher, role-filtruoti vaizdai visuose moduliuose |
| Document pipeline step | Advance + **Step back** (admin/svcmgr), generatedDocPreview state |

### Laukiantis darbas (backlog) — eilės tvarka

#### 🔴 Prioritetas 1 — Pipeline pilnumas

| # | Užduotis | Aprašas |
|---|---|---|
| ~~B-01~~ | ~~**Document step-back**~~ | ✅ Implementuota — Advance + Step back mygtukai dokumentų detalės panelėje. |
| ~~B-02~~ | ~~**Document rejection path**~~ | ✅ Implementuota — Review/Customer/Signature dokumentai turi Reject veiksma su privalomu komentaru, `Rejected` busena ir `Back to Draft` grizima. |
| ~~B-03~~ | ~~**Service job detail panel**~~ | ✅ Implementuota — paspaudus Service jobs eilute rodoma desine detales panele: job info, current stage, susieti dokumentai ir parts requests. |
| ~~B-04~~ | ~~**Finance modulis**~~ | ✅ Implementuota — pridetas Finance puslapis su invoice sarasu, job linkais, payment statusais ir mock `Generate invoice` / `Mark paid` / `Mark cancelled` veiksmais. |

#### 🟡 Prioritetas 2 — Duomenų pilnumas ir UX

| # | Užduotis | Aprašas |
|---|---|---|
| ~~B-05~~ | ~~**Document upload flow**~~ | ✅ Implementuota — `Upload document` mygtukas atidaro metadata forma (tipas, job ref, klientas, kas pasirase, due date, aprasas) ir sukuria Draft dokumento irasa pipeline'e. |
| ~~B-06~~ | ~~**Document search**~~ | ✅ Implementuota — laisvo teksto paieska + type/status/customer/date filtrai dokumentu lenteleje su `Search` / `Cancel` veiksmais. |
| ~~B-07~~ | ~~**PM date reschedule**~~ | ✅ Implementuota — PM submodulyje datos laukas leidzia perkelti vizita tik to paties menesio ribose ir atnaujina Calendar PM ivykius. |
| ~~B-08~~ | ~~**Sales: New quotation**~~ | ~~„New quotation" mygtukas su mini forma (klientas, įrenginys, tipas, suma) → sukuria Draft QTE įrašą.~~ **Done:** `New quotation` atidaro mini formą ir sukuria pasirinktą Draft QTE įrašą atmintyje. |
| ~~B-09~~ | ~~**Vendor return flow**~~ | ~~Iš Parts modulio: „Create vendor return" mygtukas → sukuria return case → Logistics mato jį eilėje.~~ **Done:** Parts detaleje sukuriamas vendor return case, kuris matomas Parts vendor return queue ir Logistics role queue / badge. |

#### 🟢 Prioritetas 3 — Lentynos (vėlesniam etapui)

| # | Užduotis | Aprašas |
|---|---|---|
| ~~B-10~~ | ~~**Contract management**~~ | ~~Atskiras sutarties peržiūros/redagavimo vaizdas Sales modulyje. Dabar kontraktai tik rodomi.~~ **Done:** Sales modulyje pridetas kontraktu management vaizdas su edit mode, validacija ir auto `remaining = value - consumed` perskaiciavimu. |
| ~~B-11~~ | ~~**Warranty/calendar sync**~~ | ~~Tipo C instaliacijos acceptance akto įkėlimas auto-sinchronizuoja warranty expiry datą į kalendorių.~~ **Done:** `Acceptance report` upload'as atnaujina susieto equipment acceptance/warranty laukus ir sukuria warranty expiry eventa kalendoriuje. |
| ~~B-12~~ | ~~**Parts delivery address registry**~~ | ~~Autofill siūlymai įvedant pristatymo adresą, saugomi iš klientų registro.~~ **Done:** Parts delivery flow turi registry autofill forma su klientu adresu/kontaktu is Customers registro ir issaugo pasirinkta delivery adresa/kontakta i parts request. |
| ~~B-13~~ | ~~**localStorage persistence**~~ | ~~Pasirinktinas — išsaugoti state tarp puslapio perkrovimų.~~ **Done:** UI state ir mutable demo kolekcijos saugomos `localStorage`, todel pakeitimai islieka po puslapio reload. |
| ~~B-14~~ | ~~**Carbone document service**~~ | ~~Phase 4B: backend container su Node.js + Carbone + LibreOffice, realus DOCX/ODT/PDF generavimas.~~ **Done:** pridetas `document-service` konteineris su Carbone/LibreOffice API (`/health`, `/preview`, `/generate`, `/download`), nginx proxy ir Documents UI `Generate via service` veiksmas. |
| ~~B-15~~ | ~~**Work Act draft + Work List Template flow**~~ | **Done:** Service job detaleje sukuriamas Work Act draft, job equipment preselect'inamas automatiskai, galima per search/dropdown pasirinkti papildoma kliento equipment, pritaikyti Work List Template kaip izoliuota kopija, redaguoti `Work Description` / `Work: List` ir sukurti Service act dokumento draft. |
| ~~B-16~~ | ~~**Standardized document output templates**~~ | **Done:** Carbone output sablonai atskirti nuo Work List Template registry; prideti `work-act.fodt`, `commercial-offer.fodt`, `defect-act.fodt`, backend `templateMap`, Documents UI `Commercial offer` / `Defect act` pasirinkimai ir payload laukai equipment/work rows, quotation, defect bei signatures turiniui. |
| ~~B-17~~ | ~~**Template Generation module split**~~ | **Done:** pridetas `Template Generation` sidebar modulis ir puslapis; `Documents` nebemaiso template generation panelio su repository/search/detail/upload sritimi. Toliau reikia siame modulyje isskirti Work Acts, Defect Acts, Commercial Offers, Work List Templates ir Output Templates i atskirus sub-tabs. |
| ~~B-18~~ | ~~**Template Generation sub-tabs**~~ | **Done:** `Template Generation` modulyje prideti sub-tabs: Work Acts, Defect Acts, Commercial Offers, Work List Templates ir Output Templates. Output Templates tab'e veikia dabartinis Carbone generavimo/editoriaus panelis; kiti tab'ai paruosia atskirus Tomis krypties workspace'us. |
| ~~B-19~~ | ~~**Work Acts workspace in Template Generation**~~ | **Done:** Work Acts tab'e pridetas source service job selector, Work Act draft create flow ir pernaudotas pilnas Work Act builderis: equipment search/dropdown, Work List Template apply, Work Description / Work: List editorius ir Service act dokumento draft kurimas. |
| ~~B-20~~ | ~~**Defect Acts workspace in Template Generation**~~ | **Done:** Defect Acts tab'e pridetas source service job selector, Defect Act draft create flow, defect description / engineer findings / recommended correction / risk / customer acknowledgement editorius ir Defect act dokumento draft kurimas i `Documents`. |
| ~~B-21~~ | ~~**Work Act builder UX labels and equipment search**~~ | **Done:** `Work List Template` pervadintas i `Work List Template Name`, Work Text terminas pakeistas i `Work Description`, o equipment selection pakeistas i search/dropdown su `Add equipment` ir pasirinktu equipment juosta su `X` pasalinimu. |

---

### Tomis dokumentu generavimo tyrimas

Detalus read-only radiniu dokumentas: `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.

Svarbiausios isvados:
- Work List Template = aparatu/proceduru checklist'as, kopijuojamas i konkretu Work Act.
- Document Output Template = standartizuota spausdinama forma Carbone/LibreOffice generavimui.
- Work Act flow igyvendintas: Draft record -> auto-prefill equipment is case/equipment arba manual equipment search/add/remove -> apply Work List Template -> edit isolated work rows/work description -> generate Work Act document draft.
- `Documents` turi buti dokumentu talpykla ir paieskos vieta, o dokumentu generavimas turi persikelti i atskira `Template Generation` moduli.
- Dabartinis generic template editor yra laikinas ir turi virsti `Template Generation / Output Templates` dalimi.

### Dokumentavimo taisyklė

**Po kiekvienos implementacijos sesijos privaloma:**
1. Atnaujinti `docs/CHANGELOG.md` — pridėti prie `[Unreleased]` sekcijos.
2. Atnaujinti `docs/PROJECT_PLAN.md` § 18 — pažymėti įvykdytus backlog punktus ✅, pridėti naujus jei atsirado.
3. `git commit` + `git push` — vienas commit per sesijos darbą.

---

## 9. Kitos sesijos starto instrukcija

Kitas chat turetu:

1. Perskaityti `README.md` ir visus failus `docs/` aplanke: `PROJECT_PLAN.md`, `CHANGELOG.md`, `design_system.md`, `WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md`.
2. Patikrinti `git status`.
3. Jeigu vartotojas patvirtina MVP krypti, kurti `index.html` pagal `docs/design_system.md`.
4. Kiekviena reiksminga pakeitima prideti i `docs/CHANGELOG.md` ir atnaujinti `docs/PROJECT_PLAN.md` § 18.
5. Neliesti logo saltiniu, kol neaisku, kokiu web formatu reikia eksportuoti.

## 10. Atnaujinta prototipo kryptis 2026-04-12

Vartotojas patikslino, kad prototipas turi buti moduliarinis ir paleidziamas su Docker. Sistema yra Viva Medical verslo valdymo sistema, orientuota i medicinines irangos service darbus, sales vartotojus, service vartotojus ir admin vartotojus. Pagrindinis darbo objektas yra work act ir kitu dokumentu kurimo, apdorojimo, statusu stebejimo ir uzbaigimo pipeline.

Detalesnis planas perkeltas i `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md`.

Dokumentu generavimui velesniame backend etape planuojama naudoti Carbone (`https://github.com/carboneio/carbone`) su LibreOffice / Microsoft Office dokumentu template'ais. Pirmame UI prototipe bus rodoma mock template generation patirtis dokumentu modulyje, o tikras Carbone renderinimas bus atskiras server-side `document-service` etapas.

2026-04-12 pradetas dokumentu pipeline prototipo etapas: Documents puslapis turi owner filtra, selected document paneli, `Review next`, `Advance` pipeline perkelima ir mock template generation busena pasirinktai isvesties formai.

2026-04-12 web valdymas perkeltas is web UI i sakninio folderio programele: `vm-web-control.ps1` ir `vm-web-control.cmd`. Ji valdo Docker veiksmus `on`, `off`, `restart`, `status`, `logs`, `open`, `quit`; web topbar `CMD` mygtukas ir command modalas pasalinti.

2026-04-12 dokumentu pipeline papildytas status monitoring sluoksniu: Command Center overdue documents skaicius skaiciuojamas is demo dokumentu, Documents puslapis rodo overdue/due today/customer/signature monitoring korteles, o velyvuojantys dokumentai lenteleje turi raudona indikatoriu ir `Overdue` badge.

# Projekto Kurimo Planas

Data: 2026-04-15

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
| Admin | admin | Useriu, roliu ir leidimu valdymas; pipeline/progreso overseer dashboard; exception queues; kontroliuojama sistemos konfiguracija |

**Teisiu sistema:** Tik Admin role yra fiksuota. Visu kitu roliu teises Admin priskiria per checkbox grid prie kiekvieno user. Vienas user gali tureti kelias roles. Admin yra progreso/isimciu overseer, ne tik final approval role.
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

### Pipeline (updated 2026-04-15)

Current active Documents flow:

```text
Draft / generated draft
  -> preview/download generated file
  -> collect signature outside the system
  -> upload signed copy into the same document record
  -> Finish
  -> DONE / case-ticket closed
```

Reject path:

```text
Review / Customer / Signature
  -> Reject with required comment
  -> Rejected
  -> Back to Draft
```

There is no generic `Advance` button in the current UI. Document archiving is deferred to a later retention/file-custody design.

Older conceptual stage model kept for historical reference:

```
Draft → Review → Customer → Signature → Approved → Archived
Rejection path: Rejected → Draft (reikalingas komentaras)
Permanentinis rejection: komentaras → Admin resolves
```

### Create vs Upload

Current split:

- Create/generate happens in `Template Generation`.
- Repository search, preview, download, signed upload, and finish/close happen in `Documents`.
- Uploaded and generated files go through `document-service` file registry where possible.

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

## 18. Dabartine busena (2026-04-15)

### Implementuota ✅

| Modulis / funkcija | Pastabos |
|---|---|
| App shell — topbar, sidebar, navigacija | Dinamiški badges pagal rolę |
| Command Center | 9 rolių filtruoti stat korteliai + focus panel |
| Service puslapis | Jobs lentelė, PM submodule, svcmgr parts approval |
| Sales puslapis | Quotation lentelė + 4-tab detalė (Offer/Contract/Approval/Handoff); New quotation forma; Contract management edit mode |
| Documents puslapis | Pipeline board, filtrai, overdue monitoring, document upload flow, document search; template generation perkeltas į Template Generation modulį |
| Finance puslapis | Invoice sąrašas, susieti jobs/dokumentai, payment statusai ir mock Generate / Paid / Cancelled veiksmai |
| Customers puslapis | Lentelė + detalės panel (kontaktai, mini-stat, equipment, contracts) |
| Equipment puslapis | Lentelė + 4 tabai + Support Portal (Settings/Emails/Web Links + preview modal) |
| Parts puslapis | Lentelė + stat korteliai + workflow mygtukai (Approve/Reject/Transit/Arrived/Deliver); vendor return flow; delivery address registry |
| Reports puslapis | 4 stat korteliai, Jobs by stage bar chart, Document pipeline health, Contract utilisation |
| Admin puslapis | User sąrašas + permission grid (checkbox) + role assignment |
| Calendar puslapis | Mėnesio grid, Prev/Next navigacija, spalvoti events, PM schedule lentelė, PM date reschedule |
| Reminders strip | Sidebar spalvoti priminimai (overdue docs, parts, PM visits) |
| New service job wizard | 8 žingsniai, Pipeline type routing (A/B/C/D), Contract balance info |
| Role sistema | 9 rolės, role switcher, role-filtruoti vaizdai visuose moduliuose |
| Document pipeline | Upload signed copy + Finish/DONE workflow, rejection path su privalomu komentaru, Back to Draft, generatedDocPreview |
| Generated document preview | Tomis tipo print preview modalas: inline PDF, A4 mock fallback, zoom, print/quick print, export/download, email compose, delivery audit |
| Feedback / bug reporting | Globalus Report issue: screen capture/snipping flow, red-pencil annotation, admin-only queue, backend storage/API foundation |
| Unified file storage foundation | `document-service` registruoja generated/uploaded/signed/template/feedback failus per `files.json`; runtime storage ignoruojamas git |
| localStorage persistence | Mutable kolekcijos (jobs, documents, equipment ir kt.) išsaugomos per puslapio reload |
| Carbone document-service | Node.js + Carbone + LibreOffice Docker konteineris; `/health`, `/preview`, `/generate`, `/download` API; nginx proxy; `work-act.fodt`, `commercial-offer.fodt`, `defect-act.fodt`, `generic-document.fodt` šablonai |
| **Template Generation modulis** | Atskiras sidebar modulis su 5 sub-tabs: Work Acts, Defect Acts, Commercial Offers, Work List Templates, Output Templates |
| Work Acts workspace | Job selector, draft create, equipment search/add/remove, Work List Template picker, Work Description + Work Rows editor, Service act document draft → Documents |
| Defect Acts workspace | Job selector, draft create, defect description/findings/correction/risk/acknowledgement editor, Defect act document draft → Documents |
| Commercial Offers workspace | Source quotation selector, draft create, scope/line items/validity/payment terms/notes editor, `Create document draft` → Documents; `commercialOfferDrafts` kolekcija su localStorage |
| Work List Templates CRUD | `+ New template` forma, detail/edit panel, `Duplicate`, `Archive/Restore`; inline work row add/remove/text-edit; `isActive` flag — ne destruktyvus archyvavimas |
| Output Templates editor | Sekcijų redaktorius su merge fields, reset/save logika, localStorage; sekcijų turinys perduodamas į document-service payload |
| Warranty/calendar sync | Acceptance report upload atnaujina equipment acceptance/warranty laukus ir sukuria warranty expiry event |

### Laukiantis darbas (backlog) — eilės tvarka

#### 🔴 Prioritetas 1 — Pipeline pilnumas

| # | Užduotis | Aprašas |
|---|---|---|
| ~~B-01~~ | ~~**Document workflow controls**~~ | ✅ Implementuota — bendras perstumimo mygtukas pasalintas; dokumentai valdosi per `Upload signed`, `Finish`, `DONE` ir `Back to Draft` reject atveju. |
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
| ~~B-22~~ | ~~**Commercial Offers workspace**~~ | **Done:** `Template Generation / Commercial Offers` tab turi pilna kūrimo/redagavimo flow: source quotation selector, draft create, scope/line items/validity/payment terms/notes editor, `Create document draft` veiksmas. `commercialOfferDrafts` kolekcija su `localStorage` persistencija. |
| ~~B-23~~ | ~~**Work List Templates CRUD**~~ | **Done:** `Template Generation / Work List Templates` tab turi `+ New template` forma, selected template detail/edit panel, `Duplicate` ir `Archive/Restore` mygtukus, inline work row add/remove/text-edit edit mode'e. `isActive` flag valdo archyvavima be trynimo. |

---

### Tomis dokumentu generavimo tyrimas

Detalus read-only radiniu dokumentas: `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.

Dabartines busenos ir B-38+ roadmap source of truth: `docs/CURRENT_STATUS_AND_ROADMAP.md`.

Saugaus Tomis crawl instrukcija: `docs/TOMIS_CRAWL_PLAYBOOK.md`.

Svarbiausios isvados:
- Work List Template = aparatu/proceduru checklist'as, kopijuojamas i konkretu Work Act.
- Document Output Template = standartizuota spausdinama forma Carbone/LibreOffice generavimui.
- Work Act flow igyvendintas: Draft record -> auto-prefill equipment is case/equipment arba manual equipment search/add/remove -> apply Work List Template -> edit isolated work rows/work description -> generate Work Act document draft.
- `Documents` turi buti dokumentu talpykla ir paieskos vieta, o dokumentu generavimas turi persikelti i atskira `Template Generation` moduli.
- Dabartinis generic template editor yra laikinas ir turi virsti `Template Generation / Output Templates` dalimi.
- Kasdienis user neturi kiekviena karta maketuoti dokumento nuo nulio: normalus flow yra strukturuotas darbo irasas -> parinktas Work List Template / Output Template -> sugeneruotas dokumentas.
- Kasdienis user vis tiek turi tureti prieiga prie visual/rich editoriaus micro editams, bugui uzfiksuoti arba savo darbo sablonui susikurti, panasiai kaip Tomis. Tam reikia atskiro nuodugnaus Tomis crawl su vartotojo pagalba.
- Admin role kryptis: useriu, roliu ir leidimu valdymas bei pipeline/progreso overseer dashboard. Admin neturi buti vien tik patvirtintojo role.

### Dokumentavimo taisyklė

**Po kiekvienos implementacijos sesijos privaloma:**
0. `docs/CURRENT_STATUS_AND_ROADMAP.md` yra dabartines busenos ir B-38+ roadmap source of truth.
1. Atnaujinti `docs/CHANGELOG.md` — pridėti prie `[Unreleased]` sekcijos.
2. Atnaujinti `docs/PROJECT_PLAN.md` § 18 — pažymėti įvykdytus backlog punktus ✅, pridėti naujus jei atsirado.
3. `git commit` + `git push` — vienas commit per sesijos darbą.

---

Papildomai: jei buvo Tomis crawl, naudoti `docs/TOMIS_CRAWL_PLAYBOOK.md` ir radinius rasyti i `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.

## 9. Kitos sesijos starto instrukcija

Kitas chat turetu:

1. Perskaityti visus failus `docs/` aplanke: `PROJECT_PLAN.md`, `CHANGELOG.md`, `WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md`, `DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.
   Pirmas skaitomas dokumentas nuo 2026-04-15: `docs/CURRENT_STATUS_AND_ROADMAP.md`; Tomis crawl darbams naudoti `docs/TOMIS_CRAWL_PLAYBOOK.md`.
2. Patikrinti `git status` ir `git log --oneline -5`.
3. Phase A prototipas yra pilnai implementuotas (B-01–B-23). Visi backlog punktai pažymėti Done.
4. Sekantys žingsniai apibrėžti § 19 "Atviri klausimai ir sekantys žingsniai".
5. Kiekviena reikšmingą pakeitimą pridėti į `docs/CHANGELOG.md` ir atnaujinti `docs/PROJECT_PLAN.md` § 18.
6. Neliesti logo šaltinių, kol neaišku, kokiu web formatu reikia eksportuoti.

## 19. Atviri klausimai ir sekantys žingsniai

### Atviri klausimai (reikia vartotojo sprendimo)

Šie punktai blokuoja vizualinę polishą, bet nereikalauja kodo:

| Klausimas | Kur naudojama |
|---|---|
| App pavadinimas (`Viva Medical` / `Service IS` / kitas) | `src/index.html` topbar, `pageHeader()` titulai visuose moduliuose |
| Brand spalva iš logo → `--brand` CSS kintamasis | `src/styles/base.css` `:root` (dabar mėlyna placeholder spalva) |
| Logo eksportas → `assets/logo.svg` | `src/index.html` topbar (dabar tekstinis wordmark) |
| UI kalba (lietuviškas / angliškas / mišrus tekstas) | Visas `render.js` — dabar angliškas |

### Techniniai next steps (po atvirų klausimų)

| # | Užduotis | Aprašas |
|---|---|---|
| ~~B-24~~ | ~~**fodt template upload/export**~~ | **Done:** Output Templates tab'e pridėtas "Export sections as .fodt" ir "Upload .fodt template" veiksmai, `document-service` turi `POST /template/upload` ir `GET /template/download/:fileName`, o sekcijų editoriaus turinys gali tapti realiu `.fodt` šablonu Carbone generavimui. |
| ~~B-25~~ | ~~**Tomis comparison pass**~~ | **Done:** Tomis read-only peržiūrėti Work List Templates, Work Acts, Commercial Offers ir Defect Acts ekranai. Radiniai ir kitas backlog'as dokumentuoti `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`. |
| ~~B-26~~ | ~~**Work Act Tomis-aligned list and options**~~ | **Done:** Work Acts tab'e pridetas Tomis tipo sarasas su grupavimu/filtrais ir Work Act `Options` / print settings panelis; `reportOptions` persistinami ir perduodami i document-service payload. |
| ~~B-27~~ | ~~**Work List Template applicability rules**~~ | **Done:** Work List Templates registry turi Search/Find/Clear, statuso ir entry person filtrus, linked service types/equipment/hospitals/work equipment laukus, entry person/date metadata, o Work Act template pickeris rodo applicability atitinkancius sablonus. |
| ~~B-28~~ | ~~**Commercial Offer Tomis-aligned detail**~~ | **Done:** Commercial Offers prideti active/price missing/archived/entry person filtrai, Tomis tipo saraso stulpeliai, profile/group/hospital-system/side/contract/recipient/fax/invoice/currency metadata, Offer Text Header/Footer sekcijos, archive veiksmas ir payload laukai document-service generavimui. |
| ~~B-29~~ | ~~**Defect Act Tomis-aligned visits**~~ | **Done:** Defect Acts pridetas Actual Visits grid su DA/WA, planned start, work/travel hours, completed, comments, add/remove eilutemis, document-service payload laukais, preview renderinimu ir `Create Part Request Offer` placeholder. |
| ~~B-30~~ | ~~**Output template conditional rendering**~~ | **Done:** `.fodt` output sablonuose prideti Carbone conditional blokai Work Act report options/signature zonai, Commercial Offer header/scope/footer/line items laukams ir Defect Act visits/findings/correction/risk laukams. |
| ~~B-31~~ | ~~**Tomis visual editor crawl**~~ | **Done:** read-only perziuretas Tomis `Work List Template (Aespire TB)` detail, embedded rich/table editorius, service/equipment/hospital/work-equipment applicability tab'ai, dual-list assignment controls ir `Template - Advanced Editor` Word-like ribbon. Radiniai dokumentuoti `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`. |
| ~~B-32~~ | ~~**User-accessible visual template editor**~~ | **Done as MVP:** `Template Generation / Work List Templates` turi document-like visual preview, contenteditable rich editoriu, basic formatting/list toolbar, checklist-row insertion, visual HTML persistence ir bug/workaround note lauka, bet strukturuotos work rows ir applicability metadata lieka default generavimo source. |
| ~~B-33~~ | ~~**Generated document preview and delivery**~~ | **Done as MVP:** source record'uose, generated output preview, Work Act linkuose ir `Documents` eilutese pridetas `Open preview`; Tomis tipo modalas turi print/quick print, zoom, export/download, email compose, inline service PDF preview, delivery statusa ir audit history. `document-service` grazina atskira inline `previewUrl`, todel PDF preview nebeatidaro download dialogo. |
| ~~B-34~~ | ~~**Bug/feedback capture for production**~~ | **Done as MVP:** visi useriai turi `Report issue`, kuris ijungia Windows snipping tipo click-drag pasirinkimo rezima, padaro tik pasirinktos zonos screenshot, prisega ji kaip admin-only papildoma informacija, prireikus atidaro red-pencil anotavimo canvas, reikalauja trumpo komentaro, issaugo context/page/role/selected records ir ikelia reporta i demo state. Report queue, screenshot, komentaras, statusas ir history matomi tik aktyviai `admin` role. |
| ~~B-35-lite~~ | ~~**Production feedback backend foundation**~~ | **Done as storage/API foundation:** bug reports perkelti is browser `localStorage` i `document-service` backend storage: persistent `storage` volume, screenshot attachment failai, `feedback-reports.json`, `files.json`, `POST/GET/PATCH /feedback/reports`, admin status/assignee filtrai ir workflow. Pilna auth/permissions ir DB migracija lieka backend fazei. |
| ~~B-36-lite~~ | ~~**Unified document file storage foundation**~~ | **Started as file registry foundation:** generated documents, uploaded documents, output template uploads ir feedback screenshots dabar registruojami per `files.json` su kind/owner/source links/checksum/dydziu/download/preview metadata; binary failai saugomi `document-service/storage` arba `generated`. Pilnas DB file modelis, signed-file versijos, permission checks ir retention taisykles lieka backend fazei. |
| ~~B-37~~ | ~~**Production Work Act generation storage**~~ | **Done:** Work Act generavimas dabar sukuria `generated-document` file registry irasa su stabiliu `fileId`, `downloadUrl`, PDF `previewUrl`, Work Act source linku ir `version/versionLabel`. Source Work Act gauna generated file/version, preview/download/email audit irasai remiasi tuo paciu file/version, o Work Act panelis gali generuoti PDF tiesiai po document draft sukurimo. |
| B-38 | **Defect Act / Commercial Offer generation parity** | Ta pati source-panel generated-file logika Defect Acts ir Commercial Offers: rodyti generated file/version, prideti direct generate/open-preview veiksmus ir delivery/email audit trail susieti su source recordu. |
| B-39 | **Document repository workflow polish** | Patobulinti Documents kaip paprasta work queue: row signalai `Needs signed upload` / `Signed uploaded` / `Ready to finish` / `DONE`, geresni empty states, file history row expansion, be archyvavimo kol nera retention dizaino. |
| B-40 | **Sales invoice workflow integration** | Sales list turi `Generate invoice`, kuris kuria/linkina Finance invoice ir grazina invoice statusa i Sales dokumentu sarasa; veliau pridet paid/signed invoice flow. |
| B-41 | **Visual template editor V2** | Po papildomo Tomis crawl: table editing, merge fields, logo/image placeholders, autosave, dirty-state warning, revert, duplicate as personal template, version history. |
| B-42 | **Backend data model and auth** | PostgreSQL + migracijos, users/roles/permissions, customers/equipment/jobs/documents/templates/files/feedback/audit modeliai, auth/session, route permission checks. |
| B-43 | **Production file custody** | `files.json` perkelti i DB, file version chains, signed upload versions, object storage adapter, checksum/MIME/size validation, retention and backup policy. |
| B-44 | **Real email delivery** | SMTP/API provider, outbound email drafts/sent audit, attachments from file registry, customer contact autofill, send failure/retry flow. |
| B-45 | **Tomis deep crawl completion** | Naudoti `docs/TOMIS_CRAWL_PLAYBOOK.md`: Work Acts, Defect Acts, Commercial Offers, Work List Templates, preview/export/email/upload, admin/permissions, status and close behavior. |

### Phase B planavimas (backend)

Kai prototipas patvirtintas stakeholderių:

- Frontend: React/Next.js arba kitas frameworkas.
- Backend: Node.js API su realiais endpoints.
- DB: PostgreSQL + Prisma ORM.
- Auth: rolių ir teisių sistema pagal `allPermissions`.
- Docker: `docker-compose.yml` su `web`, `api`, `db`, `document-service` servisais.
- Migracijos ir seed duomenys iš dabartinio `data.js`.

## 10. Atnaujinta prototipo kryptis 2026-04-12

Vartotojas patikslino, kad prototipas turi buti moduliarinis ir paleidziamas su Docker. Sistema yra Viva Medical verslo valdymo sistema, orientuota i medicinines irangos service darbus, sales vartotojus, service vartotojus ir admin vartotojus. Pagrindinis darbo objektas yra work act ir kitu dokumentu kurimo, apdorojimo, statusu stebejimo ir uzbaigimo pipeline.

Detalesnis planas perkeltas i `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md`.

Dokumentu generavimui velesniame backend etape planuojama naudoti Carbone (`https://github.com/carboneio/carbone`) su LibreOffice / Microsoft Office dokumentu template'ais. Pirmame UI prototipe bus rodoma mock template generation patirtis dokumentu modulyje, o tikras Carbone renderinimas bus atskiras server-side `document-service` etapas.

2026-04-12 pradetas dokumentu pipeline prototipo etapas: Documents puslapis turi owner filtra, selected document paneli, `Review next`, dokumento workflow veiksmus ir mock template generation busena pasirinktai isvesties formai.

2026-04-12 web valdymas perkeltas is web UI i sakninio folderio programele: `vm-web-control.ps1` ir `vm-web-control.cmd`. Ji valdo Docker veiksmus `on`, `off`, `restart`, `status`, `logs`, `open`, `quit`; web topbar `CMD` mygtukas ir command modalas pasalinti.

2026-04-12 dokumentu pipeline papildytas status monitoring sluoksniu: Command Center overdue documents skaicius skaiciuojamas is demo dokumentu, Documents puslapis rodo overdue/due today/customer/signature monitoring korteles, o velyvuojantys dokumentai lenteleje turi raudona indikatoriu ir `Overdue` badge.

# Changelog

Visi reiksmingi sio projekto pakeitimai turi buti fiksuojami cia, kad kita sesija arba kitas chat galetu greitai suprasti projekto busena.

Formatas laisvai remiasi "Keep a Changelog" principu, bet rasomas praktiskai ir trumpai.

## [Unreleased]

### Added

- Implementuotas B-38 Defect Act / Commercial Offer generation parity: Defect Acts ir Commercial Offers source paneliai dabar rodo generated file/version metadata, turi direct `Generate PDF file`, `Open preview` ir `Download` veiksmus po document draft sukurimo, o preview/download/print/export/email audit irasai mirror'inami i source recorda. Sugeneruoti dokumentai ir source irasai naudoja ta pati `document-service` file registry objekta.
- Patikslinta Template Generation terminija: user-facing `Work List Templates` pervadinti i `Templates`, o `Output Templates` UI pervadinti i `Output Layouts`, kad kasdieniam useriui template reikstu pasirenkama darbo/proceduros sablona, o Carbone/LibreOffice spausdinami layout'ai liktu advanced/admin sritis.
- Pataisytas Template Generation Output Layouts toolbar responsive layout'as: template/output select'ai ir `Generate mock` / `Generate via service` / `Edit template` veiksmai wrap'ina vietoje horizontalaus overflow. `Report issue` pakeistas i maza apvalu raudona mygtuka su `!` zenklu.
- Pataisytas `Report issue` snipping startas: ikoninis mygtukas neberodo `Preparing snip...` teksto ir lieka stabilus kol ruosiamas screenshot pasirinkimas.
- Pataisytas Documents search/filter wrap: paieskos, statusu, klientu ir datu laukai wrap'ina eilutemis vietoje puslapio horizontalaus overflow; lenteliu horizontalus scroll lieka tik lenteles konteineryje.
- `Issue sent to admin.` patvirtinimas po report issue issiuntimo dabar pats pranyksta su fade animacija po 2 sekundziu.

### Documentation

- Pridetas `docs/CURRENT_STATUS_AND_ROADMAP.md` kaip 2026-04-15 projekto busenos, atliktu darbu, technines skolos ir B-38+ roadmap source of truth.
- Pridetas `docs/TOMIS_CRAWL_PLAYBOOK.md` su saugaus read-only Tomis crawl procesu, efektyvaus letos app navigavimo taktika, screenshot naming taisyklemis, ekranu duomenu rinkimo sablonu ir prioritetinemis crawl sritimis.
- Atnaujinti `README.md`, `docs/PROJECT_PLAN.md`, `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md` ir `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`, kad atspindetu nauja Documents workflow: be generic `Advance`, be aktyvaus archyvavimo, su `Upload signed` -> `Finish` -> `DONE` logika.

## [0.1.0] - 2026-04-13

### Added

- Implementuotas globalus dark mode UI pass: topbar turi `Dark mode` / `Light mode` perjungikli, tema saugoma demo state, `:root[data-theme="dark"]` turi atskira grafito/teal/amber/red spalvu tokenu palete, formos/lenteles/paneliai/modaliai/feedback flow prisitaiko prie temos, o dokumentu/paper preview palikti balti kaip spausdinamas output. `docs/design_system.md` papildytas dark mode principais is Material/Reddit patarimu.
- Patvarkytas Template Generation UI pagal 2026 enterprise/form UX principus: source/search/filters perkelti i nuoseklius command/filter bar'us, veiksmai sugrupuoti i kompaktiskus action clusters, ilgi mygtukai sutrumpinti, Work Act checkbox'ai perdaryti i skaitoma responsive grid su didesniais target'ais, o topbar ir subtab action row'ai leidzia wrap'inti veiksmus be horizontalaus overflow.
- Implementuotas B-37 Production Work Act generation storage: `document-service` generuojami Work Act PDF dabar registruojami kaip `generated-document` file version su stabiliu `fileId`, `downloadUrl`, PDF `previewUrl`, `version/versionLabel` ir source Work Act metadata. Frontend Work Act ir Documents irasai gauna ta pati generated file objekta, preview/download/print/export/email audit veiksmai remiasi tuo paciu file/version, o Work Act panelis turi direct `Generate PDF file` veiksma po document draft sukurimo.
- Implementuotas B-24 fodt template upload/export: Output Templates editoriuje prideti `Export sections as .fodt` ir `Upload .fodt template` veiksmai, `document-service` turi `POST /template/upload` ir `GET /template/download/:fileName`, o sugeneruotas arba ikeltas `.fodt` sablonas susiejamas su pasirinktu output template tolimesniam Carbone generavimui.
- Atliktas B-25 Tomis comparison pass: read-only perziureti Work List Templates, Work Acts, Commercial Offers ir Defect Acts ekranai. `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md` papildytas Tomis laukais/flow skirtumais ir suformuotas B-26-B-30 backlog'as.
- Implementuotas B-26 Work Act Tomis-aligned list and options: `Template Generation / Work Acts` turi grupuojama ir filtruojama Work Act lentele, `Options / print settings` paneli su Tomis tipo report flags, `reportOptions` persistence ir perdavima i `document-service` payload.
- Implementuotas B-27 Work List Template applicability rules: Work List Templates registry turi Search/Find/Clear, statuso ir entry person filtrus, linked service types/equipment/hospitals/work equipment, entry person/date metadata, o Work Act template picker'is rodo applicability atitinkancius sablonus.
- Implementuotas B-28 Commercial Offer Tomis-aligned detail: Commercial Offers workspace turi active/price missing/archived/entry person filtrus, Tomis tipo saraso stulpelius, profile/group/hospital-system/side/contract/recipient/fax/invoice/currency metadata, Offer Text Header/Footer sekcijas, archive veiksma ir commercial offer payload laukus document-service generavimui.
- Implementuotas B-29 Defect Act Tomis-aligned visits: Defect Acts workspace turi Actual Visits grid su DA/WA, planned start, work/travel hours, completed, comments, add/remove eilutemis, `Create Part Request Offer` placeholder, document-service payload laukais ir preview renderinimu. Patikrinta per Docker + Playwright; PDF service file sugeneruotas be console klaidu.
- Implementuotas B-30 Output template conditional rendering: `work-act.fodt`, `commercial-offer.fodt` ir `defect-act.fodt` naudoja Carbone conditional blokus Work Act report options/signature, Commercial Offer header/scope/footer/line items ir Defect Act visits/findings/correction/risk laukams. Patikrinta PDF ir ODT generavimu per `document-service`; ODT `content.xml` neliko `{d...}` markeriu.
- Atliktas B-31 Tomis visual editor crawl: read-only perziuretas `Work List Template (Aespire TB)` detail, embedded rich/table editorius, service/equipment/hospital/work-equipment applicability tab'ai, dual-list assignment controls ir `Template - Advanced Editor` Word-like ribbon. Radiniai ir B-32 kryptis irasyti i `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`.
- Implementuotas B-32 User-accessible visual template editor MVP: `Template Generation / Work List Templates` turi document-like visual preview, contenteditable rich editoriu, basic formatting/list toolbar, checklist-row insertion, visual HTML persistence ir bug/workaround note lauka. Strukturuotos work rows ir applicability metadata paliktos kaip default generavimo source. Patikrinta per Playwright po `web` Docker rebuild; console klaidu nerasta.
- Atliktas Tomis Work Act document preview/delivery crawl: `Open Document` is Work Act generuoja PDF (`AL260310-01.pdf`), rodo open/save/cancel dialoga; `Open` atidaro PDF lokaliame viewer'yje, o `Cancel` atidaro Tomis vidini `Print Preview` langa su Print, Quick Print, Export To, E-Mail As, Page Settings, zoom ir page navigation. B-33 perplanuotas i integrated generated document preview/download/email delivery flow, bug capture perkeltas i B-34.
- Isplestas B-33 crawl ir generavimo foundation: uzfiksuotas Tomis PDF layout'as (logo/seller requisites, buyer block, title/date/contract placement, A4 portrait/margins/page size/orientation, export/email formatai, footer/page numbering, signature blocks), pridetas `companyProfiles` Viva Medical seller profile is Rekvizitai.lt, demo 20 ligoniniu sample registry is SAM saraso, document-service payload papildytas seller/buyer requisites, contract/work location ir LT datos laukais, o Work Act/Commercial Offer/Defect Act `.fodt` sablonai pritraukti prie Tomis tipo seller/buyer/title/signature strukturos.
- Implementuotas B-33 Generated document preview and delivery MVP: source record'uose, generated output preview, Work Act linkuose ir `Documents` eilutese pridetas `Open preview`; Tomis tipo modalas turi print/quick print, zoom, export/download, email compose, inline service PDF preview, delivery statusa ir audit history. `document-service` dabar grazina atskira PDF `previewUrl`, todel perziura nebeaktyvuoja download dialogo. Patikrinta per Docker + Playwright; service PDF preview ir email queue veike be console klaidu.
- Implementuotas B-34 Bug/feedback capture MVP: globalus `Report issue` ijungia Windows snipping tipo click-drag pasirinkimo rezima, padaro tik pasirinktos zonos screenshot, prisega ji kaip admin-only papildoma info, prireikus atidaro red-pencil anotavimo canvas, praso trumpo komentaro ir issaugo context/page/role/selected records. Admin puslapyje aktyviai `admin` role mato report queue su screenshot, komentaru, statusu ir history; ne-admin role reportu bloko nemato. Patikrinta per Docker + Playwright; console klaidu nerasta.
- Implementuotas B-35-lite Production feedback backend foundation: `document-service` gavo persistent `storage` volume, `POST/GET/PATCH /feedback/reports`, image attachment endpointus, `feedback-reports.json` ir `files.json` indeksus. Frontend `Report issue` dabar saugo screenshot/annotation backend'e, admin queue kraunama is API, turi status/assignee filtrus, assignee workflow ir backend refresh. Sugeneruoti dokumentai ir ikelti `.fodt` template failai gauna `fileRecord` metadata, kad tas pats storage modelis aptarnautu ir busima dokumentu failu saugojima.
- Pradetas B-36-lite Unified document file storage: `Upload document` forma dabar reikalauja realaus failo, kelia ji i `/api/documents/files/upload`, issaugo binary i `document-service/storage/uploads/documents`, sukuria `fileRecord` su checksum/dydziu/download/preview URL ir priskiria ji dokumento `uploadedFile` laukui. Sugeneruoti dokumentai, ikelti output template failai, uploaded dokumentai ir bug screenshotai jau eina per viena `files.json` file registry modeli.
- Patikslinta ateities kryptis: kasdienis user turi tureti prieiga prie visual/rich template editoriaus micro editams, bugui uzfiksuoti arba savo sablonui susikurti, bet default dokumentu kurimas lieka per strukturuotus darbo irasus. Admin role patikslinta kaip user/roles/permissions valdymas ir pipeline overseer dashboard, ne vien patvirtintojas.

- Implementuotas Commercial Offers workspace `Template Generation` modulyje (B-22): source quotation selector, `Create offer draft` mygtukas, draft panel su scope textarea, line items lentele (add/remove eilutes, description ir amount), validity date, payment terms, notes ir `Create document draft` veiksmas. Sukurtas Draft dokumentas ikeltas i Documents pipeline kaip `Quotation` tipo irašas. `commercialOfferDrafts` kolekcija persisted per `localStorage`.
- Implementuotas Work List Templates CRUD `Template Generation` modulyje (B-23): `+ New template` forma su name/category/serviceType/language/bodyText/workRows laukais; templates lentele su row-level `Duplicate` ir `Archive/Restore` mygtukais; selected template detail panel su Edit/Cancel/Save controls; inline work row add/remove/text-edit edit mode'e. `isActive` flag valdo archyvavima be trynimo.

- Prideta `docs/DOCUMENT_GENERATION_TOMIS_FINDINGS.md`: read-only Tomis Work Act / Work List Template analize, atskirtas Work List Template vs document output template modelis, Work Act draft flow, Carbone payload kryptis ir nauji B-15/B-16 backlog punktai.
- Patikslintas B-15 equipment pasirinkimo modelis: Work Act gali gauti equipment automatiskai is case/equipment konteksto arba tiesioginio kurimo metu leisti pasirinkti equipment per search/dropdown ir prideti work eilutes.
- Implementuotas B-15 Work Act draft + Work List Template flow: Service job detaleje galima sukurti Work Act draft, auto-prefill'inti job equipment, papildomai rinktis kliento equipment per search/dropdown, pritaikyti Work List Template, redaguoti `Work Description` ir `Work: List` eilutes, sukurti Service act dokumento draft ir perduoti Work Act rows/equipment i `document-service` payload.
- Implementuotas B-16 Standardized document output templates: `document-service/templates` turi atskirus Carbone output sablonus Work Act, Commercial Offer ir Defect Act dokumentams; backend `templateMap` naudoja atskirus failus, payload papildytas equipment/work rows, quotation ir defect laukais, o Documents UI turi Commercial offer / Defect act pasirinkimus.
- Pradetas realus output template editor: Work Act, Commercial Offer ir Defect Act turi strukturuotus sekciju editorius su merge fields, reset/save logika, `localStorage` persistence, `templateSections` perdavimu i `document-service` payload ir sekciju teksto renderinimu sugeneruotame output faile.
- Patobulintas `localStorage` load merge: nauji default demo/template irasai nebepametami, kai narsykle turi sena issaugota demo busena.
- Papildyta dokumentacija del Tomis krypties: `Documents` turi tapti dokumentu talpykla/paieskos moduliu, `Template Generation` turi buti atskiras generavimo/editoriu modulis, o dizaino principai turi palaikyti moduliu atskiruma, lengva modernu UI ir neperkrauta vartotojo patirti.
- Implementuotas B-17 pirmas split: pridetas atskiras `Template Generation` sidebar modulis ir puslapis, o `Documents` puslapyje template generation panelis iskeliamas, paliekant dokumentu repository/search/detail/upload role.
- Implementuotas B-18 Template Generation sub-tabs: naujame modulyje atskirti `Work Acts`, `Defect Acts`, `Commercial Offers`, `Work List Templates` ir `Output Templates`; output template tab'e paliktas Carbone generavimo/editoriaus panelis, o kiti tab'ai rodo atskira kontekstini workspace.
- Implementuotas B-19 Work Acts workspace perkeltas i `Template Generation`: Work Acts tab'e galima pasirinkti source service job, sukurti Work Act draft, pasirinkti equipment, pritaikyti Work List Template, redaguoti Work Description / Work: List ir kurti dokumento draft.
- Implementuotas B-20 Defect Acts workspace: `Template Generation` Defect Acts tab'e galima pasirinkti source service job, sukurti Defect Act draft, pildyti defect description / engineer findings / recommended correction / risk / customer acknowledgement ir sukurti Defect act dokumento draft i `Documents`.
- Patobulintas Work Act builder UX: `Work List Template` label pakeistas i `Work List Template Name`, `Work Description` label'is naudojamas vietoje seno Work Text termino, o equipment pasirinkimas pakeistas is checkbox saraso i paieskos/dropdown + `Add equipment` + pasirinktu equipment juosta su `X` pasalinimu.
- Implementuoti B-03 ir B-04: Service puslapyje pridetas job detail panelis su susietais dokumentais ir parts requests; pridetas Finance puslapis su invoice sarasu, payment statusais ir mock Generate invoice / Mark paid / Mark cancelled veiksmais.

- Implementuotas B-02 Document rejection path: Review / Customer / Signature dokumentai turi Reject veiksma su privalomu komentaru, dokumentas pereina i `Rejected`, komentaras rodomas dokumento detaleje, o `Back to Draft` grazina dokumenta i Draft tolimesniam taisymui.
- Implementuotas B-05 Document upload flow: Documents puslapyje pridetas `Upload document` veiksmas su metadata forma (type, job ref, customer, who signed, due date, description), kuri sukuria nauja Draft dokumenta pipeline'e ir rodo upload metadata detaleje.
- Implementuotas B-06 Document search: Documents lentele turi laisvo teksto paieska, type/status/customer/date filtrus ir `Search` / `Cancel` veiksmus.
- Implementuotas B-07 PM date reschedule: PM submodulio lenteles datos laukai leidzia perkelti vizita tik to paties menesio ribose, rodo moved/error busena ir per `computePmSchedule()` atnaujina Calendar PM ivykius.
- Implementuotas B-08 Sales: New quotation: Sales puslapyje `New quotation` atidaro mini forma (customer, equipment, type, amount, due, notes) ir sukuria Draft QTE irasa atmintyje.
- Implementuotas B-09 Vendor return flow: Parts detaleje `Create vendor return` sukuria vendor return case, jis rodomas Parts vendor return queue ir Logistics role queue / badge.
- Implementuotas B-10 Contract management: Sales puslapyje pridetas atskiras kontraktu perziuros/redagavimo ekranas su value/consumed/remaining, periodu, PM dazniu, statusu ir notes.
- Implementuotas B-11 Warranty/calendar sync: `Acceptance report` upload'as atnaujina susieto equipment acceptance/warranty laukus ir sukuria warranty expiry eventa kalendoriuje.
- Implementuotas B-12 Parts delivery address registry: Parts delivery flow turi registry autofill forma su klientu adresu/kontaktu is Customers registro ir issaugo pasirinkta delivery adresa/kontakta i parts request.
- Implementuotas B-13 localStorage persistence: demo UI state ir mutable duomenu kolekcijos saugomos `localStorage`, todel pakeitimai islieka po puslapio reload.
- Implementuotas B-14 Carbone document service: pridetas Node.js `document-service` su Carbone/LibreOffice Docker konteineriu, `/health`, `/preview`, `/generate`, `/download` API, nginx `/api/documents/` proxy ir Documents UI `Generate via service` veiksmas.
- Prideta template editor funkcija Documents modulyje: galima redaguoti pasirinkto template pavadinima, owner, output format ir body teksta; pakeitimai issaugomi `localStorage` ir perduodami i `document-service` generavimo payload.

- Pridėta `docs/VM_WEB_CONTROL.md` — pilna `vm-web-control.cmd` / `.ps1` dokumentacija: paskirtis, visų komandų aprašas, veikimo logika, Docker konfigūracija (Dockerfile + docker-compose.yml), interaktyvus meniu, alternatyva be Docker, dažnos problemos ir sprendimai.

### Fixed

- `navigation.js`: Service badge filtras naudojo perteklinį hardkodintą vardų sąrašą su AND sąlyga — pakeista į paprastą `j.owner === ownerForRole(r)` patikrinimą. Ankstesnis kodas nesugestų, bet buvo klaidinantis ir potencialiai lauštų pridėjus naujo service inžinieriaus rolę.
- `interactions.js` `specifyDelivery`: pristatymo adresas visada grįždavo „Address to be confirmed" nes `equipment.find(eq => eq.serial === pr.partNumber)` niekada nesutapdavo (part number != serial). Pataisyta: `equipment.find(e => e.name === pr.equipment)` → `customers.find(c => c.id === eq?.customerId)`.
- `render.js` line 1731: `t.toLowerCase().replace(" ", "-")` keisdavo tik pirmą tarpą. Pakeista į `replaceAll` — aktualu support sub-tab ID generavimui.
- `documentPipeline.js`: trūkstamas `return;` po paskutinio `change` handlerio — pridėtas dėl konsistencijos.

- `design_system.md`, `PROJECT_PLAN.md`, `CHANGELOG.md` perkelti i `docs/` aplanka. Atnaujintos visos nuorodos `README.md`, `WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md` ir `PROJECT_PLAN.md` failuose. Nuo siol visa dokumentacija randama tik `docs/`.
- Atnaujintas `docs/PROJECT_PLAN.md` § 18 su pilna dabartine busena, prioritetuotu backlog'u (B-01–B-14) ir dokumentavimo taisykle. Atnaujintas `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md`: fazes pazymetos Done/TODO, pridetas isorinis backlog blokas su ta pacia eilės tvarka.
- Pataisyta document generation mock: `previewActive` check supaprastintas i `state.generatedDocPreview !== null` (saugus, nes null nustatomas bet kokiam pakeitimui); ankstesnis dvigubas ID palyginimas buvo per griežtas.

- Implementuotas Document generation mock: po "Generate mock" paspaudimo vietoj JSON payload rodomas stilizuotas dokumentas su brand header, dokumento tipu, meta eilute (No/Data/Formatas), uzpildytais laukais is job/customer/equipment duomenu ir paraso eilutemis. Kiekvienam template (Service act, Diagnostic report, Quotation, Acceptance report, Vendor return note) sava lauku rinkinys. "Download mock (.txt)" parsiuncia data URI tekstini faila. "Reset" mygtukais grizta atgal i JSON payload. `state.generatedDocPreview` objektas nustato ar ir koks preview rodomas; nustatomas i null pakeitus dokumenta, template, formata ar paspaudus Review Next.
- CSS papildymai: .doc-preview, .doc-preview-head, .doc-preview-brand, .doc-preview-type, .doc-preview-meta-row, .doc-preview-body, .dpf-section, .dpf-row, .dpf-label, .dpf-value, .dpf-sig-row, .dpf-sig, .dpf-sig-line, .dpf-sig-label, .doc-preview-actions.

- Implementuotas Sales modulis: split layout su quotation lentele (kaire) ir detale panele (desine). Detale panele turi 4 tabsus — Offer (kliento/irenginio/sumos informacija), Contract/Warranty (PM Contract ir Installation tipams: garantijos datos, PM vizitai/metus, apimtis), Approval (mygtuka "Mark customer approved" / "Mark rejected", patvirtinimo data), Handoff (mygtukass "Send to Service team" — sukuria nauja service job ir dokumenta, perjungia statusa i "Handed off"). Stat korteliai: Total, Awaiting approval, Approved, Handed off.
- Prideta quotations duomenu struktura i data.js (4 demo irasai: Repair/PM Contract/Installation/Handed off statusai).
- Papildyta state.js: selectedQuotationId, salesTab.
- Prideti Sales interaksijų handlers i interactions.js: qte-row (pasirinkimas), sales-tab (tab perjungimas), qte-send (Draft → Sent), qte-approve (→ Approved + data), qte-reject (→ Rejected), qte-handoff (sukuria job + doc, → Handed off).
- Prideti trukstami chip CSS klasiai: .chip.sent, .chip.awaiting-approval, .chip.handed-off, .chip.new-installation, .chip.new-request.
- Prideta role-filtruota Command Center: kiekviena is 9 roliu mato savo stat korteles ir focus panel (service — savo jobus, svcmgr — parts approval queue, sales/finance — savo dokumentu eile, logistics/warehouse — parts queue, office/manager — visi jobus, admin — pipeline board).
- Service puslapis: service role mato tik savo jobus; svcmgr/admin gauna papildoma parts approval paneli.
- Documents puslapis: numatytasis dokumentu filtras nustatomas pagal role (service/svcmgr → Service, sales → Sales, finance → Finance).
- pageHeader: "New service job" mygtukas slepiamas sales/finance/logistics/warehouse/manager rolemis.
- Sidebar badges: dinamiškai atnaujinamai pagal role po kiekvieno render (vietoj hardkodinto HTML).

- Implementuotas pilnas Calendar puslapis: mnesio grid (Mon-Sun, 7 stulpeliai), spauda navigacija (Prev/Next mnesiu), spalvoti ivykiai (ev-job, ev-pm, ev-sales, ev-logistics, ev-contract), siandien pazymetas apvaliu zalio fono numeriu; PM schedule lentele zemiau grid'o.
- Service puslapyje pridetas PM submodule skyrius: automatiskai generuojama PM vizitu lentele is kontraktu (computePmSchedule), su statuso chipais ir datos/vizito numeriu.
- Reports puslapis papildytas realiais duomenimis: 4 stat korteliai (open jobs, overdue docs, parts pending, PM completion), Jobs by stage horizontalios bar diagramos, Document pipeline health, Contract utilisation barsai su procentais ir remaining balance ispejimais.
- Prie Sidebar pridetas Reminders strip: raudoni/geltoni/zaliu taskines eilutes su aktualiais priminimai (velu dokumentai, parts approvals, arrived parts delivery, artejantys PM vizitai per 14 dienu).
- Wizard (New service job) papildytas Pipeline type routing: Contract step realiu laiku aptinka pipeline tipa (A/B/C/D), rodo spalvota badge su tipo aprasymu ir pipeline sriities; Pipeline B (has contract) automatiskai praleidzia Quotation zingsnio; Contract balance informacinis blokas Pipeline B atveju.
- CSS papildymai: bar-track/bar-fill/bar-row/bar-pct (Reports), cal-* (Calendar grid), ev-* event spalvos, .num/.text-red utilities, .panel.no-padding, reminder-* (Sidebar strip), pipeline-type-badge/.info-box.warn (Wizard).

- Implementuotas Admin puslapis: user sarašas su avatarais ir role tagais, permission grid (checkbox per kiekviena leidima kiekvienam user), role assignment checkboxes - visi pakeitimai gyvi atmintyje.
- Implementuotas Equipment puslapis: installiuotu sistemu lentele su detale panele, 4 tabai (System Info / Installation / Hospital Acceptance / Support), Support tab su 3 sub-tabais (Settings/Emails/Web Links), "Support Page Is Enabled" toggle, URL generavimas ir Copy mygtukais, "Preview support page" mygtuko paspaudus atsidaro hospital-facing forma per kuria galima registruoti gedima ir sukuriamas naujas Technical Case.
- Implementuotas Customers puslapis: klientu lentele su detale panele (kontaktai, mini-stat korteliai, linked equipment sarašas, linked contracts sarašas).
- Implementuotas Parts puslapis: parts requests lentele su stat korteliais pagal statusa, detale panele su situacijos aprasymu, ir workflow mygtukais (Approve / Reject / Mark in transit / Mark arrived / Specify delivery / Pick up at warehouse).
- Prideta interactions.js: centralizuotas event handling Admin / Equipment / Customers / Parts puslapiams.
- Isplesta data.js: prideti users (7) su permissions, customers (4) su kontaktais, equipment (5) su pilna Support Portal info, partsRequests (4) ivairiais statusais, contracts (3) su balance tracking, allPermissions konstanta.
- Isplesta state.js: prideti selectedEquipmentId, selectedCustomerId, selectedPartsRequestId, adminEditUserId, equipmentTab, supportSubTab.
- Prideta --mono CSS kintamasis base.css; isplesta pages.css (split-layout, customer detail, equipment tabs, support portal modal, admin permission grid, parts workflow, role tags).
- Pridetas DEV REFERENCE paneliai kiekviename modulyje (collapsible `<details>` blokai): kiekvienas puslapis rodo modulio paskirti, roles, submodulius, pipeline zingsnius, veiksmus ir ka dar planuojama - naudojama kaip spec reference development proceso metu.
- Pridetas Calendar modulis i sidebar navigacija ir kaip atskiras puslapis su dev spec.
- Isplesta roles sistema i 9 roles: service, svcmgr, sales, finance, office, logistics, warehouse, manager, admin - su aprasymu data.js.
- Atnaujintos visu puslapiu render funkcijos: customers, equipment, parts, reports gauna atskiras render funkcijas (ne simpleRegistryPage); prideti tile'ai pagal plana.
- Pridetas Support Portal feature specifikacija: Equipment iraso Support tab su Settings/Emails/Web Links sub-tab'ais; kai ijungtas "Support Page Is Enabled", generuojami unikalus URL sistemos/ligonines/grupes lygmeniu; ligonines darbuotojas per sita URL gali registruoti gedima ir sistema auto-sukuria Technical Case kuriam admin priskiria inzinieriu.
- Atnaujinta PROJECT_PLAN.md: prideti sections 11-17 su pilnu roles sarasau, pipeline tipais A/B/C/D, sutarties logika, parts flow, dokumentu moduliu aprasymu, kalendorium ir priminimu specifikacija.
- Atnaujinta WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md: prideti pilni roles, visi pipeline tipai, dokumentu tipai, Support Portal flow, parts flow, calendar ir reminders.

- Diagnostikos ir remonto wizard zingsniai pakeisti is live timeriu i rankiniu budu pildomus proceduros trukmes laukelius.
- Service puslapio diagnostikos ir remonto process flow tekstai pakeisti is timeriu i duration entry logika, kad UI neberodytu live timer workflow.
- Dokumentu modulyje pridetas pirmas pipeline valdymas: owner filtras, selected document panelis, `Review next`, statusu valdymo prototipas ir mock generation statusas.
- Dokumentu monitoringas papildytas overdue/due today/customer/signature kortelemis, dinaminiu Command Center overdue skaiciumi ir velyvu dokumentu zymejimu lenteleje.
- Prideta sakninio folderio web valdymo programele `vm-web-control.ps1` ir Windows paleidiklis `vm-web-control.cmd`: menu, `on`, `off`, `restart`, `status`, `logs`, `open`, `quit`.
- Pasalintas web topbar `CMD` mygtukas, command modalas ir `commandMenu.js`, nes web aplikacija neturi valdyti savo paleidimo, kai pati gali neveikti.
- Pridetas `New service job` wizard su 8 zingsniais: customer/equipment, issue intake, contract/warranty, diagnostics duration, quotation, parts/EDD, repair duration ir final document checklist.
- Wizard submit veiksmas prideda demo service job ir service act dokumenta i in-memory pipeline bei perjungia vartotoja i Service puslapi.
- Pradetas pirmas moduliarinio prototipo igyvendinimo etapas: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `src/index.html`, CSS moduliai ir JS moduliai su demo service/document/equipment data.
- Sukurtas pirmas Viva Medical Service IS shell: topbar, sidebar, role switcher, Command Center, Service, Sales, Documents, Registry, Reports ir Admin puslapiu pradiniai renderiai.
- Dokumentu modulyje prideta mock template generation sekcija busimai Carbone integracijai.
- I prototipo plana itrauktas Carbone dokumentu generavimo kelias: LibreOffice / Microsoft Office template'ai, JSON duomenu injekcija, DOCX/ODT/PDF output ir busimas server-side `document-service`.
- Pridetas `docs/WEB_PROTOTYPE_IMPLEMENTATION_PLAN.md` su moduliarinio Docker web prototipo planu: app shell, rolės, service/sales/admin workflow, dokumentu pipeline, komponentai, demo data modeliai ir fazes.
- Pridetas `docs/VIVAMEDICAL_WEBSITE.md` su `https://vivamedical.lt/` svetaines analize, kontaktu informacija, puslapiu struktura, produktu sarasu, partneriu nuorodomis ir ateities pildymo taisykle.
- Inicializuotas lokalus Git repozitorijos kontekstas.
- Pridetas `README.md` su projekto paskirtimi ir esama medziaga.
- Pridetas `PROJECT_PLAN.md` su detaliu MVP, Docker, Git ir tolimesnes architekturos planu.
- Uzdokumentuota, kad `design_system.md` yra pagrindinis UI/UX saltinis.
- Uzdokumentuoti rasti logo saltiniai: `LOGO.odt`, `viva medical logo.ai`, `viva medical logo.cdr`.

### Notes

- 2026-04-11: Kataloge dar nebuvo `.git`; repozitorija inicializuota lokaliai.
- 2026-04-11: Remote repo URL dar nepridetas, nes jo nera pateikta.
- 2026-04-11: `design_system.md` nurodo vieno `.html` failo MVP be frameworku ir build tools.
- 2026-04-11: `LOGO.odt` turi imontuota logo paveiksleli; rekomenduojama veliau eksportuoti i `assets/logo.svg` ir `assets/logo.png`.
- 2026-04-12: `vivamedical.lt` analizuotas su Playwright. Jei ateityje informacijos truksta, reikia grizti i svetaine su Playwright, patikrinti gyva turini ir papildyti `docs/VIVAMEDICAL_WEBSITE.md`.
- 2026-04-12: Prototipo kryptis patikslinta i moduliarine Docker paleidziama verslo valdymo sistema, orientuota i service, sales, admin ir dokumentu pipeline.
- 2026-04-13: Visas Phase A prototipas (B-01–B-23) implementuotas ir pažymėtas kaip [0.1.0]. Laukia atviri klausimai: app pavadinimas, brand spalva, logo eksportas, UI kalba. Sekantis etapas — fodt template upload/export ir Phase B (backend) planavimas.

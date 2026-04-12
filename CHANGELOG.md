# Changelog

Visi reiksmingi sio projekto pakeitimai turi buti fiksuojami cia, kad kita sesija arba kitas chat galetu greitai suprasti projekto busena.

Formatas laisvai remiasi "Keep a Changelog" principu, bet rasomas praktiskai ir trumpai.

## [Unreleased]

### Added

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
- Dokumentu modulyje pridetas pirmas pipeline valdymas: owner filtras, selected document panelis, `Review next`, `Advance` statusu perkelimas ir mock generation statusas.
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

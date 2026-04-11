# Changelog

Visi reiksmingi sio projekto pakeitimai turi buti fiksuojami cia, kad kita sesija arba kitas chat galetu greitai suprasti projekto busena.

Formatas laisvai remiasi "Keep a Changelog" principu, bet rasomas praktiskai ir trumpai.

## [Unreleased]

### Added

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

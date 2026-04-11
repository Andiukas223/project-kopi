# Vivamedical.lt Website Knowledge Base

Last analyzed: 2026-04-12
Source: https://vivamedical.lt/
Method: Playwright browser navigation and accessibility snapshots.

This document is the local project knowledge base for public information from the Viva Medical website. Use it before browsing the website again.

## Maintenance Rule For Future Chats

When a future chat needs information about Viva Medical:

1. Check this document first.
2. If the answer is here, use this document as the local source of truth.
3. If the answer is not here or may have changed, use Playwright to open the relevant page on `https://vivamedical.lt/`.
4. Extract the new information from the live website.
5. Add or update the information in this document.
6. Add a short note to `CHANGELOG.md` describing what was updated.

Preferred Playwright flow:

```powershell
npx --yes --package @playwright/cli playwright-cli open https://vivamedical.lt/
npx --yes --package @playwright/cli playwright-cli snapshot
```

Re-snapshot after navigation, filter clicks, opening forms, or modal interactions.

## Website Overview

Viva Medical presents itself as a medical equipment supplier and partner for modern healthcare. The homepage headline says the company provides modern equipment and advanced solutions for medicine, emphasizing quality, fast service, and innovative technologies.

Core positioning:

- Modern medical equipment and advanced healthcare solutions.
- Reliable partner for hospitals, clinics, polyclinics, and private medical institutions.
- Focus on the Baltic countries.
- Product supply, installation, staff training, and expert consultation.

## Main Navigation

Top navigation links found on all checked pages:

- Home: `https://vivamedical.lt/`
- Medicininė įranga: `https://vivamedical.lt/medicinine-iranga/`
- Partneriai: `https://vivamedical.lt/partneriai/`
- Apie mus: `https://vivamedical.lt/apie-mus/`
- Kontaktai: `https://vivamedical.lt/kontaktai/`
- Susisiekti button: points to `https://vivamedical.lt/kontaktai/`

Footer navigation repeats:

- Apie mus
- Kontaktai
- Partneriai
- Medicininė įranga

Footer copyright observed:

- `Visos teisės saugomos. 2026 UAB "Viva Medical"`
- Website credit: Heximus, `https://www.heximus.lt/`

## Contact And Company Information

Primary contact information:

- Address: Santariškių g. 5, Vilnius LT-08406, Lietuva
- Phone: +370 699 32 161
- Email: info@vivamedical.lt
- Website: vivamedical.lt
- Working hours: Monday to Friday, 08:00-17:00

Company information from the Kontaktai page:

- Company: Viva Medical, UAB
- Company code: 302820861
- VAT code: LT100007018811

Contact form fields:

- Vardas
- El. paštas
- Telefono numeris
- Tema (nebūtina)
- Patikslinkite užklausą
- Consent checkbox: user agrees to transfer data so UAB Viva Medical can contact them.
- Submit button: Pateikti

Map note:

- The Kontaktai page embeds Google Maps.
- During Playwright analysis, the map displayed the message: "This page can't load Google Maps correctly."
- Treat this as a website integration issue or Google Maps API/configuration warning, not as business content.

## Homepage Content

Homepage title:

- `Medicininė įranga – sveikatos priežiūrai | Vivamedical`

Hero message:

- `Moderni įranga, pažangūs sprendimai – jūsų patikimas partneris medicinoje`
- Supporting text: quality, fast service, and innovative technologies for customer success.

Homepage call-to-action links:

- Medicininė įranga
- Susisiekti

Homepage contact cards:

- Phone: +370 699 32 161, "Turite klausimų? Skambinkite!"
- Email: info@vivamedical.lt, "Parašykite mums laišką!"
- Hours: Pir - Pen 08:00 - 17:00, "Mūsų darbo laikas"

About block:

- Viva Medical is described as a reliable partner for modern medicine.
- It supplies high-quality medical equipment to hospitals, polyclinics, and private medical institutions in the Baltic countries.
- The company expands its product range, offers advanced technologies, and emphasizes close cooperation for modern patient care.

Services block:

- Smooth medical equipment supply, installation, and effective usage.
- On-time delivery and equipment implementation.
- Detailed staff training for work with modern technologies.
- Expert consultations to find the best solution for an institution's needs.

Homepage also includes:

- Partner carousel with 15 slides.
- A medical equipment preview section with selected products and a "DAUGIAU" link to the equipment catalog.

## About Page

URL: `https://vivamedical.lt/apie-mus/`
Title: `Viva Medical - Jūsų patikimas partneris moderniai medicinai`

Observed page heading:

- `Apie mus`

Intro:

- The company says it has traded high-quality medical equipment and disposable products for more than a decade.

Repeated positioning:

- High-quality medical equipment for Baltic hospitals, polyclinics, and private medical institutions.
- Constantly expanding product range.
- Advanced technologies.
- Close collaboration to help patients receive modern care.

Services listed:

- On-time delivery and equipment implementation.
- Detailed staff training for new technologies.
- Expert consultations for optimal solutions.

## Medical Equipment Page

URL: `https://vivamedical.lt/medicinine-iranga/`
Title: `Medicininė įranga | Vivamedical`

Page description:

- The offered medical equipment covers multiple healthcare fields, from radiology and nuclear medicine to surgery, anesthesiology, and resuscitation.
- The equipment is intended for diagnostic precision, treatment process support, and patient safety in medical institutions.

Category filters observed:

- Visi
- Radiologijos įranga
- Intervencinės radiologijos priemonės
- Endoskopų automatinio plovimo ir laikymo sistemos
- Diagnostikos įranga
- Kardiochirurgijos priemonės
- Anesteziologijos ir reanimacijos priemonės
- Branduolinės medicinos įranga
- Chirurgijos priemonės

Product list observed:

- ARIETTA 850 DeepInsight
- ARIETTA 850
- ARIETTA 750 DeepInsight
- ARIETTA 750 SE
- ARIETTA 750 VE
- ARIETTA 65 IntuitiveFusion
- ARIETTA 65
- ARIETTA 50 LE
- ARIETTA 50
- ARJO pacientų kėlimo ir perkėlimo įranga
- WASSENBURG endoskopų džiovinimo ir laikymo spintos
- Chirurginiai tikleliai TiO2Mesh™
- COR-KNOT® DEVICE chirurginė mazgų tvirtinimo sistema
- EEG sistema – ENOBIO 8/20/32
- Ekstrakorporinis citokinų absorberis
- FDR Smart X multifunkcinė rentgeno sistema
- HAEMOCER PLUS™ hemostatiniai milteliai
- Kabeliai ir sensoriai
- Kolposkopai
- Krioabliacija
- Hector™ daugiašakė krūtinės stento sistema
- Cratos™ krūtinės aortos šakinių arterijų stento sistema
- Castor™ šakinė aortos stento transplantato sistema
- Talos™ krūtinės aortos stento sistema
- Kulkšnies-Žasto indekso (KŽI) matavimo prietaisas
- Ti-KNOT® DEVICE chirurginė mazgų tvirtinimo sistema
- Ultragarsinis šlapimo pūslės skaneris
- UV lempos – Oro valymo sistemos
- Vienkartinių basonų maceratoriai
- WASSENBURG endoskopų plovimo – dezinfekavimo mašinos

Product links confirmed by Playwright where present in headings:

- `https://vivamedical.lt/medicinine-iranga/arietta-850-deepinsight/`
- `https://vivamedical.lt/medicinine-iranga/arietta-850/`
- `https://vivamedical.lt/medicinine-iranga/arietta-750-deepinsight/`
- `https://vivamedical.lt/medicinine-iranga/arietta-65-intuitivefusion/`
- `https://vivamedical.lt/medicinine-iranga/arietta-65/`
- `https://vivamedical.lt/medicinine-iranga/arjo-pacientu-kelimo-ir-perkelimo-iranga/`

Some products appeared as clickable headings in the snapshot but did not expose a direct heading anchor in the structured extraction. Re-check with Playwright before relying on their exact URLs.

## Product Detail Page Pattern

Checked example:

- URL: `https://vivamedical.lt/medicinine-iranga/arietta-850-deepinsight/`
- Page title: `ARIETTA 850 DeepInsight ultragarsinė sistema | Vivamedical`
- Product heading: `ARIETTA 850 DeepInsight`

Observed product content:

- Described as a high-quality diagnostic ultrasound system.
- Mentions DeepInsight technology.
- Emphasizes image quality, noise reduction, stable penetration, and high spatial resolution.
- Includes a contact CTA: `SUSISIEKTI`, linking to `#homepage-pop_up-banner`.

Observed section:

- `Sukurta atsižvelgiant į didelius lūkesčius`

Observed details:

- Ultrasound imaging can provide higher examination accuracy, more comfort, and wider application.
- Diagnostic equipment must constantly improve due to increasing medical expectations.
- Mentions tissue stiffness evaluation by generating shear waves and measuring Vs, the propagation speed in tissue.
- Mentions `Combi-Elasto`, integrating RTE and SWM, expected to be useful in cases difficult to diagnose using only SWM.
- Says ARIETTA 850 DeepInsight provides diagnostic images without compromise across clinical fields.

## Partners Page

URL: `https://vivamedical.lt/partneriai/`
Title: `Medicininės įrangos partneriai | Viva Medical`

Page heading:

- `Mūsų partneriai`

Intro:

- Viva Medical says it ensures service quality by choosing well-known and reliable partners.

Featured partner:

- `FUJIFILM (buvęs Hitachi)`
- Text says that after acquiring Hitachi in 2021, Fujifilm revolutionizes diagnostic technologies.
- It mentions advanced image processing and AI innovations through the REiLI platform.

Partner URLs observed:

- FUJIFILM is featured in content, but the visible `PLAČIAU` link on the analyzed page did not navigate to an external Fujifilm URL.
- Vitacon: `https://www.vitacon.com/`
- Sinutronic: `https://sinutronic.eu/`
- Sonotech: `http://www.sonotech.lt/`
- Clarius: `https://clarius.com/`
- Cytosorbents: `https://cytosorbents.com/`
- LSI Solutions: `https://www.lsisolutions.com/`
- BM Technica: `https://www.bmtechnica.com/`
- AtriCure: `https://www.atricure.com/`
- Neuroelectrics: `https://www.neuroelectrics.com/`
- DDC Dolphin: `https://www.ddcdolphin.com/`
- MMT Systems: `https://www.mmtsystems.com/`
- Geister: `https://www.geister.com/`
- ARJO: `https://www.arjo.com/int/`
- Huntleigh Diagnostics: `https://www.huntleigh-diagnostics.com/`
- WASSENBURG Medical: `https://www.wassenburgmedical.com/`
- EpiGuard: `https://epiguard.com/`

Note: many partner logos have non-descriptive image alt text, so partner names above are inferred from external URLs where the page did not expose useful visible text. Re-check with Playwright or image/DOM inspection if exact logo-to-company mapping matters.

## UI / Design Observations From The Public Site

These observations can help when designing the internal business management app:

- Public site is Lithuanian-first.
- Brand identity uses a medical/clinical presentation with blue-green feel in the logo area, but exact colors were not extracted here.
- Navigation is simple: equipment, partners, about, contacts.
- The business domain is equipment supply and service-style support, not only catalog browsing.
- Contact and fast communication are important: phone, email, and "Susisiekti" CTAs appear repeatedly.
- Product catalog areas map naturally to future internal app modules: equipment, partners/vendors, customers, service cases, installations, staff training, and contact requests.

## Open Items For Future Website Crawling

Use Playwright to fill these gaps when needed:

- Export exact brand colors from computed CSS or logo assets.
- Crawl all product detail pages and add product-specific descriptions.
- Verify whether category filter buttons change visible product subsets client-side.
- Confirm partner logo names by inspecting image filenames and visual logos.
- Test the contact form validation and success state without submitting real data.
- Check whether the Google Maps warning persists outside Playwright/sandbox.


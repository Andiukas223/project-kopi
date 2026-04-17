# Web Application Design System
### Service Information System — UI/UX Specification
> Colour values are intentionally omitted. All colours are defined as CSS custom properties on `:root` and tuned per project. This document describes structure, spacing, typography, component anatomy, and interaction patterns only.

---

## 1. Technology & Delivery

- Single `.html` file — no build tools, no frameworks, no external JS
- All CSS in a `<style>` block in `<head>`
- All JS in a `<script>` block before `</body>`
- One Google Fonts `<link>` import in `<head>`
- No inline `style=""` attributes except for one-off layout micro-adjustments
- All colours referenced through CSS custom properties — never hardcoded hex inside rules
- `box-sizing: border-box` on `*`, `margin: 0`, `padding: 0` reset

---

## 2. Typography

Two font families used throughout — one sans-serif for all UI text, one monospace for data/codes/timers.

### Sans-serif (primary)
Used for all labels, body copy, headings, buttons, nav items.
Weights used: 300, 400, 500, 600, 700, 800.
Characteristics: geometric, clean, slightly characterful — not system defaults like Arial or Roboto.
Good choices: **Plus Jakarta Sans**, **DM Sans**, **Outfit**, **Sora**.

### Monospace (secondary)
Used exclusively for: live timers, job ID codes, badge counts, stat card numbers, table code fields, field hints with technical values.
Weights used: 400, 500.
Good choices: **JetBrains Mono**, **DM Mono**, **IBM Plex Mono**.

### Type Scale

| Role | Size | Weight | Transform | Letter-spacing |
|---|---|---|---|---|
| Page title | 19–20px | 800 | none | -0.3px |
| Section title | 11–13px | 700–800 | uppercase | 0.8–1.2px |
| Sidebar section label | 9.5–10px | 600–700 | uppercase | 1.4–1.6px |
| Card / tile name | 13px | 600–700 | none | none |
| Body / description | 13px | 400–500 | none | none |
| Small meta / hint | 11px | 400–500 | none | none |
| Field label | 10.5–11px | 700 | uppercase | 0.7–0.9px |
| Badge / chip | 10–11px | 700 | none | none |
| Button | 13px | 600–700 | none | 0.1px |
| Stat card value | 28–30px | 700–800 | none | none (monospace) |
| Timer display | 36px | 500 | none | 3px (monospace) |

---

## 3. Spacing & Sizing Tokens

Define these as CSS variables and use them consistently:

```
--r:    4–5px    (default border-radius for inputs, buttons, small cards)
--r-lg: 8px      (border-radius for larger cards, modals, panels)
--sh:   0 1px 4px rgba(brand-dark, .07–.08)   (resting card shadow)
--sh-md:0 3–4px 12–16px rgba(brand-dark, .12–.13)  (hover/elevated shadow)
```

### Layout dimensions
- Topbar height: **50–54px**
- Sidebar width: **210–215px**
- Content area padding: **20px top/bottom, 24px left/right**
- Page header padding: **16–18px top/bottom, 24px left/right**
- Modal max-width: **680px**
- Modal body padding: **22px**
- Modal footer padding: **14px top/bottom, 22px left/right**

### Grid gaps
- Stat cards row: **12px** gap
- Tile grid: **10px** gap
- Subgroup tile grid: **10px** gap
- Flow nodes: connected directly with arrow elements (no gap)

---

## 4. Colour System — Variable Names

Define all of the following on `:root`. Fill actual hex values per project.

```css
:root {
  /* Brand */
  --brand:        /* primary brand colour */
  --brand-dk:     /* darker shade, used on hover */
  --brand-lt:     /* very light tint, used for chip/badge backgrounds */
  --brand-mid:    /* mid shade, used for active borders */

  /* Dark (topbar, sidebar, modal header) */
  --dark:         /* near-black */
  --dark-mid:     /* slightly lighter, sidebar background */
  --dark-soft:    /* even lighter, hover states on dark surfaces */

  /* Backgrounds */
  --bg:           /* app background (light grey, off-white) */
  --bg-card:      /* card / panel background (white) */
  --wb:           /* white-blue, cool light tint for secondary surfaces */
  --wb-mid:       /* medium white-blue */
  --wb-dark:      /* darker white-blue, for borders on wb surfaces */

  /* Accent blue (separate from brand if brand ≠ blue) */
  --blue:         /* accent blue */
  --blue-lt:      /* light blue tint */

  /* Text */
  --text:         /* primary text */
  --text-mid:     /* secondary text */
  --text-muted:   /* muted / label text */

  /* Borders */
  --border:       /* default border */
  --border-mid:   /* slightly stronger border */

  /* Status colours */
  --green:        /* success */
  --green-lt:     /* success light tint */
  --amber:        /* warning */
  --amber-lt:     /* warning light tint */
  --red:          /* danger */
  --red-lt:       /* danger light tint */
  --red-mid:      /* danger mid, for borders */
}
```

### Colour role rules
| Role | Variable |
|---|---|
| Topbar / sidebar background | `--dark` |
| Sidebar (slightly lighter) | `--dark-mid` |
| Active sidebar item glow | `rgba(--brand, .15–.18)` |
| Active sidebar left border | `--brand` |
| Primary CTA button | `--brand` |
| Primary text button (dark) | `--dark` |
| Page / app background | `--bg` |
| Cards, panels, modal | `--bg-card` |
| Completed step / checklist | `--green` |
| Warning badges / borders | `--amber` |
| Danger badges / borders | `--red` or `--brand` if brand is red |
| Focused input border | `--brand` |
| Stat card accent border | status colour (danger / warn / ok) |
| Flow decision nodes | `--red-lt` bg + `--red-mid` border |
| Flow timer nodes | `--blue-lt` bg + `--blue` border |
| Flow action nodes | `--amber-lt` bg + `--amber` border |
| Flow process nodes | `--wb` bg + `--wb-dark` border |
| Flow start/end nodes | `--dark` bg, white text, pill shape |

### Dark Mode Principles

Dark mode is a first-class theme, not a separate layout. The same modules, spacing and component structure remain in place; only semantic colour tokens change through `:root[data-theme="dark"]`.

- Use graphite / smoky grey surfaces instead of pure black. This follows Material dark theme guidance and Reddit UI discussions: pure black can feel harsh, while layered dark greys make elevation and grouping easier to read.
- Keep the UI calm and modular. Main app surfaces use neutral charcoal; brand, success, warning and danger accents are reserved for status, active state and required actions.
- Do not invert generated documents. Document pages, template paper previews and PDF preview pages stay white with dark print-style text, because they represent printable output.
- Separate colour roles: `--bg-card` is the panel/card surface, `--on-dark` is text on dark chrome, and `--on-accent` is text/icons on brand or status fills.
- Muted text must still be readable. Avoid very low-opacity grey for body copy; use `--text-mid` and `--text-muted` only for secondary metadata.
- Keep accent colours slightly brighter/desaturated in dark mode. This avoids neon effects while keeping status chips, badges and buttons visible.
- Sources used for the rule of thumb: Material Design dark theme guidance (`https://design.google/library/material-design-dark-theme`) and Reddit web design discussion recommending Material guidance, layered grey surfaces and desaturated/brightened primary colours (`https://www.reddit.com/r/web_design/comments/g147fv/is_there_anything_like_refactoring_ui_for_dark/`).

### Current Document Workflow UI Rules

The Documents module is a repository and work queue, not a template editor.

- Do not show large pipeline summary counters when the user is trying to search or act on documents.
- Do not show a separate selected document side panel if the same information can be shown directly in the list.
- Table rows should carry the key operational signals currently used by the Documents repository: source reference, type, customer, linked job status, created date, signed-file upload/download status, and source/preview actions.
- Primary Documents row actions are currently limited to `View` and `Edit`; signed-file custody lives in the `Status` column as `Upload signed` or green `Download signed`.
- Do not use a generic `Advance` button. It hides the real task and makes the workflow harder to understand.
- Do not expose document archive controls until retention and file custody rules are designed.
- Use status colours only for operational state:
  - amber for needs signed upload
  - green for signed/uploaded file download
  - red for overdue/rejected/problem
- Keep generated document preview surfaces white in both light and dark mode.
- Feedback capture should stay visually separate from normal document work: screenshot and red-pencil annotation are admin-supporting evidence, not part of the document form itself.

---

## 5. Application Shell

The full viewport is divided into three fixed zones:

```
┌─────────────────────────────────────────────┐  ← topbar (50–54px)
├──────────┬──────────────────────────────────┤
│          │                                  │
│ sidebar  │          main area               │
│ 210–215px│          (flex: 1, scrollable)   │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### 5.1 Topbar
- Full width, fixed height, dark background, `flex-shrink: 0`
- **Bottom border**: 3px solid brand colour — this is the single strongest brand signal in the whole UI
- Left side: logo image or wordmark text → thin vertical divider (1px, 22px tall, 15% white opacity) → small uppercase subtitle ("Service IS")
- Right side: user pill component (avatar + name), pushed to right via `margin-left: auto`
- Logo wordmark: 18px, 700 weight, white
- Sub-label: 11px, uppercase, letter-spaced, 35–40% white opacity

### 5.2 Sidebar
- Fixed width, full remaining height, dark background (slightly lighter than topbar)
- Right border: 1px, 5–6% white opacity
- Internally scrollable (`overflow-y: auto`)
- Grouped into sections with section labels

**Section label**: 9.5–10px, uppercase, letter-spacing 1.4–1.6px, 22–28% white opacity, `padding: 0 16px`, `margin-bottom: 4px`

**Nav item**:
- `padding: 9px 16px`, `display: flex`, `align-items: center`, `gap: 10px`
- Font: 13px, 500 weight, 42–55% white opacity
- Left border: 2px solid transparent (becomes brand colour when active)
- Transition: background and color 120ms
- Hover: 6–7% white background, 80–85% white text
- Active: 10–18% brand-tinted background, full white text, brand left border

**Nav icon**: 15px emoji, 18px wide fixed, centered, flex-shrink 0

**Nav badge**: pushed right via `margin-left: auto`, rounded pill, monospace font, 10px, 700 weight, 1px 7px padding. Colour variants: brand-red (urgent), amber (warning)

### 5.3 Main Area
- `flex: 1`, `overflow-y: auto`, `display: flex`, `flex-direction: column`
- Contains page-level sections (only one active at a time via JS)

---

## 6. Page Structure

Every section/page follows the same internal structure:

```
┌─ page header ────────────────────────────────┐  white bg, border-bottom
│  Title (left)          Action buttons (right) │
│  Subtitle                                     │
│  or Breadcrumb (right side)                   │
└───────────────────────────────────────────────┘
┌─ content area ───────────────────────────────┐  app bg, 20px 24px padding
│  section heading                              │
│  component grid                               │
│  section heading                              │
│  component grid                               │
└───────────────────────────────────────────────┘
```

### Page Header
- White background, 1px bottom border
- `padding: 16–18px 24px`
- Left: `.ph-title` (19–20px, 800 weight, brand-dark colour, -0.3px letter-spacing) + `.ph-sub` below it (12px, muted, margin-top 3px)
- Right: either action buttons row OR breadcrumb
- `display: flex; align-items: center; justify-content: space-between`

### Breadcrumb
- 12px, muted colour
- Links are accent-blue, 600 weight, underline on hover
- Separator `›` in border-mid colour
- Pattern: `Home › Section › Current Page`

### Section Heading
- `display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px`
- Left: section title (11–13px, 700–800 weight, uppercase, letter-spaced, text-mid colour)
- Right (optional): small ghost button "View All →"

---

## 7. Components

### 7.1 Buttons

All buttons: `display: inline-flex`, `align-items: center`, `gap: 6px`, `font-family: inherit`, `border: none`, `cursor: pointer`, `border-radius: var(--r)`

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary (brand) | `--brand` | white | none | Main CTA, new job |
| Primary (dark) | `--dark` | white | none | Wizard continue, submit |
| Ghost | transparent | `--text-mid` | 1px `--border` | Secondary actions |
| Danger | dark red | white | none | Destructive, stop timer |
| Success | `--green` | white | none | Start timer |

Standard size: `padding: 7px 16px`, `font-size: 13px`, `font-weight: 600–700`
Small modifier: `padding: 5px 12px`, `font-size: 12px`

Hover: background darkens by one shade. No scale or shadow transforms — just colour shift.

---

### 7.2 Stat Cards

Used in dashboard header row. Grid of 4, equal columns, 12px gap.

```
┌─────────────────────────┐
│  ▲ 3px accent border    │  ← top edge (colour = status)
│  LABEL TEXT             │  ← 10.5px uppercase muted
│  273                    │  ← 28–30px monospace bold
│  description text       │  ← 11px muted
└─────────────────────────┘
```

- White background, 1px default border, `border-radius: var(--r-lg)`
- `padding: 16px 18px`
- Top border 3px: danger (red), warn (amber), ok (green), blue (info)
- Fully clickable — navigate to relevant section on click

---

### 7.3 Module Tiles (Large)

Used for main module navigation (Sales, Service, etc.). Auto-fill grid, min 195–200px per tile.

```
┌──────────────────┐
│  🔧              │  ← 22px emoji icon, margin-bottom 8px
│  Service         │  ← 13px, 600–700 weight
│  Important: 273  │  ← 11px muted
│  ⚠ 273           │  ← optional badge (10px, monospace, rounded)
└──────────────────┘
```

- White background, 1px border, `border-radius: var(--r-lg)`, `padding: 16px`
- Hover: box-shadow elevates, border-colour darkens slightly
- Transition: `box-shadow .15s, border-color .15s`

**Colour variants:**
- `.t-brand` — filled brand colour background, white text (for the primary module, e.g. Service)
- `.t-dark` — filled dark background, white text (e.g. Sales)
- `.t-alert` — left 3px amber border, very light amber background tint

---

### 7.4 Subgroup Tiles (Horizontal)

Used for sub-module listings. Auto-fill grid, min 230–235px per tile.

```
┌──────────────────────────────────┐
│  ┌──────┐  Signed Document       │  ← icon box left, text right
│  │  ✍️  │  Missing               │
│  └──────┘  ⚠ 61 item(s)         │  ← meta line: monospace, muted
└──────────────────────────────────┘
```

- `display: flex; align-items: center; gap: 12px`
- `padding: 14px 16px`
- Icon box: 38×38px, `border-radius: var(--r)`, app-bg background, flex centered
- Name: 13px, 600–700 weight
- Meta: 11px, monospace, muted
- Hover: box-shadow + border darkens
- Alert variant (`.has-alert`): 3px amber left border, amber-tinted icon box
- Danger variant (`.has-danger`): 3px red left border, red-tinted icon box

---

### 7.5 Data Table

```
┌─ toolbar ──────────────────────────────────────┐
│  "5 records"                    [＋ New Job]    │
├───────────┬──────────┬──────────┬──────────────┤
│  JOB ID   │ CUSTOMER │  SYSTEM  │  STATUS  ... │  ← thead
├───────────┼──────────┼──────────┼──────────────┤
│  VM-001   │  ...     │  ...     │  [OPEN]  ... │  ← tbody rows
└───────────┴──────────┴──────────┴──────────────┘
```

- Container: white background, 1px border, `border-radius: var(--r-lg)`, `overflow: hidden`
- `border-collapse: collapse`, full width
- `thead th`: very light grey background, 9px 14px padding, 10.5–11px, uppercase, letter-spaced, muted, bottom border
- `tbody td`: 10px 14px padding, 13px, bottom border (very light)
- Last row: no bottom border
- Row hover: very subtle background tint
- Toolbar: 12px 16px padding, bottom border, flex space-between

**Status chips**: `display: inline-block`, `border-radius: 3–4px`, `padding: 2px 8px`, 10.5–11px, monospace, 700 weight
- OPEN: brand-light bg, brand-dark text
- DONE: green-light bg, green text
- PENDING: blue-light bg, blue text
- MISSED: dark bg, white text

---

### 7.6 Info Boxes

Rectangular banners used inside the wizard and on detail pages.

```
┌────────────────────────────────────┐
│  ⚠ Warning Title                   │  ← 12px bold, coloured
│  Explanatory body text here...     │  ← 12px, line-height 1.55
└────────────────────────────────────┘
```

- `border-radius: var(--r)`, `padding: 12px 14px`, `margin: 10px 0`
- Title: 12px, 700 weight, `margin-bottom: 4px`
- Body: 12px, 500 weight, `line-height: 1.55`

| Variant | Background | Border | Title colour |
|---|---|---|---|
| Default | `--wb` | `--wb-dark` | `--dark` |
| Warning | `--amber-lt` | amber | `--amber` |
| Success | `--green-lt` | green | `--green` |
| Danger | `--red-lt` | `--red-mid` | `--red` |

---

### 7.7 Decision Cards

The branching mechanic. Used inside wizard steps to route workflow paths.

```
┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │
│       ✅         │  │       ❌         │
│  Yes — Contract  │  │  No — No contract│
│  exists          │  │  Quotation needed│
│  Proceed to...   │  │                  │
└──────────────────┘  └──────────────────┘
```

- 2-column grid, `gap: 10px`
- Each card: `border: 2px solid --border`, `border-radius: var(--r-lg)`, `padding: 14px 16px`, `text-align: center`, `cursor: pointer`
- Icon: 26px emoji, `margin-bottom: 6px`
- Label: 13px, 700 weight
- Description: 11px, muted, `margin-top: 3px`

States:
- Default: white bg, `--border` border, hover darkens border + light wb tint bg
- Selected YES: `--green` border, `--green-lt` background
- Selected NO: `--red` border, `--red-lt` background

Clicking a card **does not advance the step** — it updates state and re-renders content below the cards inline (conditional reveal). This is the core branching mechanic.

---

### 7.8 Timer Widget

```
┌──────────────────────────────────────────────┐
│            DIAG TIMER                        │  ← 10px uppercase, 40% opacity
│           00:14:32                           │  ← 36px monospace, coloured when running
│     [▶ Start]  or  [⏹ Stop]                 │  ← button row
└──────────────────────────────────────────────┘
```

- Full width, dark background (`--dark`), `border-radius: var(--r-lg)`, `padding: 16px 20px`, white text, `text-align: center`
- Label: 10px, uppercase, `letter-spacing: 1.2px`, 40% white opacity, 700 weight
- Display: `font-family: monospace`, `font-size: 36px`, `letter-spacing: 3px`
  - Idle/stopped: 45% white opacity
  - Running: bright accent colour (red or green — brand choice)
- Button row: `display: flex; gap: 10px; justify-content: center; margin-top: 12px`
- After stopping: button is replaced by a small coloured confirmation text "✓ Recorded: HH:MM:SS"

**Timer mechanics**: `Date.now()` stored on start. `setInterval` every 1000ms updates only the display element text — does not re-render the step. `clearInterval` on stop and on modal close.

---

### 7.9 Checklist

```
☐  POA/ADA signed by client
─────────────────────────────
☑  Acceptance report signed
─────────────────────────────
☐  Invoice created
```

- `list-style: none`
- Each `li`: `display: flex; align-items: center; gap: 8px; padding: 7px 0`, bottom border (thin), 13px, 500 weight
- Last item: no bottom border
- Checkbox: 18×18px, `border: 2px solid --border-mid`, `border-radius: 3px`, flex-centered
  - Unchecked: empty, light border
  - Checked: `--green` background + border, white ✓ inside

---

### 7.10 Process Flow Diagram

Horizontal scrollable tracks, one per process phase. Each track is a `display: flex; align-items: center` row of alternating **nodes** and **arrows**.

**Node anatomy:**
- `width: 108px`, `min-width: 108px`, `padding: 8px 10px`, `text-align: center`, `border: 1px solid`, `border-radius: var(--r)`, `flex-shrink: 0`, `cursor: pointer`
- Hover: box-shadow + border shifts to brand colour
- Content (top to bottom): 16px emoji icon → 10.5px bold label (line-height 1.3) → optional 9px muted sub-text

**Node type styles:**

| Type | Background | Border | Label colour | Shape |
|---|---|---|---|---|
| Start / End | `--dark` | `--dark` | white | `border-radius: 20px` (pill) |
| Decision | `--red-lt` | `--red-mid` | `--red-dk` | default radius |
| Timer | `--blue-lt` | `--blue` | `--blue` | default radius |
| Action required | `--amber-lt` | `--amber` | dark | default radius |
| Process step | `--wb` | `--wb-dark` | `--text` | default radius |
| Default | `--bg-card` | `--border` | `--text` | default radius |

**Arrow element:**
- `width: 28px; min-width: 28px; height: 2px; flex-shrink: 0`
- Colour: `--border-mid` for neutral paths
- `::after` pseudo-element: `content: "▶"`, `position: absolute`, `right: -5px`, `top: -6px`, `font-size: 10px`
- Green arrow variant: `--green` colour (YES paths)
- Red arrow variant: `--red-mid` colour (NO paths)
- YES / NO text labels: 9px, 700 weight, green or red, `margin-right: 2px`, placed between arrow and next node

**Row label** (above each track):
- 10px, uppercase, `letter-spacing: .7px`, muted colour
- Optional: small pill/tag styling with `--wb` background

**Legend** (below the diagram):
- Flex row of colour swatches + labels, `font-size: 11px`, `font-weight: 600`, muted
- Each swatch: 16×16px block with matching border-radius and colour

---

## 8. Wizard Modal — Full Anatomy

### Overlay
- `position: fixed; inset: 0` — covers full viewport
- Background: semi-transparent dark (55% opacity of `--dark`)
- `z-index: 1000`
- `display: none` by default → `display: flex` when open
- `align-items: flex-start; justify-content: center; padding: 20px; overflow-y: auto`

### Modal Container
- White background, `border-radius: var(--r-lg)`, `width: 100%; max-width: 680px`
- Heavy drop shadow: `0 12px 50px rgba(dark, .22–.25)`
- `margin: auto` for centering
- **Top edge: 4px solid brand colour** — strongest brand signal on the modal
- `overflow: hidden`

### Modal Header
- Dark background (same as topbar/sidebar)
- `padding: 18px 22px`, `display: flex; align-items: flex-start; justify-content: space-between`
- Left column: title (16px, 800 weight, white) + subtitle below (11px, 40% white opacity, 500 weight) — subtitle updates dynamically: "Step 3 of 8 — Diagnostics"
- Right: ✕ close button — `background: none; border: none; font-size: 20px; cursor: pointer` — 40% white opacity, full white on hover

### Modal Body
- White background, `padding: 22px`
- Contains step indicator (top) + step content (below)

### Step Indicator
- `display: flex; align-items: flex-start` — horizontally scrollable on small screens
- Alternating: `wiz-step-wrap` (dot + label column) and `wiz-line` (connector)

**Dot** (`wiz-dot`):
- `width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700`
- Completed: `--green` fill + border, white ✓ inside
- Active: brand colour fill + border, white step number
- Upcoming: `--bg` fill, `--border` border, muted number

**Connector line** (`wiz-line`):
- `width: 24px; height: 2px; margin-top: 13px; flex-shrink: 0`
- Completed: `--green`
- Upcoming: `--border`

**Label** (below dot):
- `font-size: 9.5px; text-align: center; width: 56px; margin-top: 4px; font-weight: 600`
- Muted when upcoming, active = brand colour + 800 weight

### Modal Footer
- Very light grey background (`#FAFBFC`)
- `border-top: 1px solid --border`
- `padding: 14px 22px`
- `display: flex; justify-content: space-between; align-items: center`
- Left: Back ghost button — hidden (`visibility: hidden`) on step 1
- Right: step count label (`"3 / 8"`, 12px muted) + Continue/Submit primary button

---

## 9. Navigation & JS Architecture

### Page switching
```
All .page elements: display:none
Active .page:       display:flex; flex-direction:column; flex:1

function nav(page):
  1. Remove .active from all .page elements
  2. Add .active to #page-{page}
  3. Remove .active from all .sb-item elements
  4. Add .active to #sb-{page}
  5. Update currentPage variable
```

### Subpage pattern
Each module has sub-items (e.g. Service → Warranty, PM Jobs, etc.). These all share one `#page-subpage` element with dynamic content injection.

```
Subpage data object SP:
  key = "section-subkey" (e.g. "service-warranty")
  value = { t: title, s: subtitle, p: parent section }

function navSub(parent, key):
  1. Look up SP[parent + '-' + key]
  2. Set title, subtitle, breadcrumb labels via textContent
  3. Inject sample table HTML into #sp-content
  4. Store parent in currentSubParent
  5. Show #page-subpage

function navBack():
  nav(currentSubParent)
```

### Wizard state
Single flat object `W` holds all collected data. Re-render on every interaction — no animation, no transition, just instant DOM swap.

```js
W = {
  step: 0,
  // Step 1
  cus: '', device: '', issue: '', contact: '', mob: '',
  // Step 2
  fe: '', svc: '',
  // Step 3
  diagStart: null, diagEnd: null, diagRunning: false,
  // Step 4
  hasContract: null, hasWarranty: null, quotationOk: false,
  // Step 5
  partsInWarehouse: null, edd: '', partsDelivered: false,
  // Step 6
  repairStart: null, repairEnd: null, repairRunning: false,
  partDoa: null,
  // Step 7
  returnToVendor: null,
  checklist: [false, false, false, false, false]
}
```

**Field harvesting**: values are read from DOM (`document.getElementById('f-x').value`) only when Continue is clicked — not on every keystroke.

**Re-render function** (`renderWiz` / `rWiz`):
1. Update step label + step count text
2. Toggle Back button visibility
3. Update Continue button text (last step = "✓ Submit Job")
4. Rebuild step indicator HTML
5. Inject step content HTML via `innerHTML`
6. If step has a running timer, restart the tick interval

**Timer pattern**:
```js
// Start
W.diagStart = Date.now();
W.diagRunning = true;
renderWiz(); // re-renders button to "Stop"
// Interval only updates the display element, not the whole step
dtInterval = setInterval(() => {
  const el = document.getElementById('diag-display');
  if (el && W.diagRunning) el.textContent = formatTime(W.diagStart, null);
}, 1000);

// Stop
W.diagEnd = Date.now();
W.diagRunning = false;
clearInterval(dtInterval);
renderWiz(); // re-renders to show recorded time

// Format
function formatTime(start, end) {
  const ms = (end || Date.now()) - start;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
```

**Modal close**: `clearInterval` on all active timers, remove `.open` class from overlay.

**Submit**: close modal → `alert()` with generated Job ID → `nav('service')`.

---

## 10. Responsive Behaviour

The design is a **desktop-first internal tool**. No media queries are used. Responsive tolerance is handled by:
- `overflow-x: auto` on process flow tracks and step indicator (horizontal scroll instead of wrapping)
- `min-width` on flow nodes and step indicator dots (prevents collapse)
- `overflow-y: auto` on sidebar and main area (content scrolls, layout doesn't break)
- `auto-fill` grids with `minmax()` (tiles reflow naturally down to 1 column)

---

## 11. Micro-interaction Rules

- **Hover transitions**: `transition: box-shadow .12–.15s, border-color .12–.15s` — cards and tiles only. No `transform: scale` or `translateY` on hover.
- **Sidebar items**: `transition: background .12s, color .12s` — instant feel
- **No CSS animations or keyframes** — the design is intentionally static. The only "motion" is the timer digit updating every second.
- **No `!important`** — specificity managed through class hierarchy
- **No JavaScript animations** — state changes are instant DOM swaps

---

## 12. Accessibility Notes

- All interactive elements use `cursor: pointer`
- Buttons use `<button>` elements with `font-family: inherit`
- Inputs use proper `<label>` elements (visually above the input)
- Focus state: `outline: none` with `border-color: --brand` replacement on focus
- Colour is never the only indicator — alert tiles use both colour AND a left border width change AND a badge/icon
- Font sizes never go below 9px (only in flow sub-labels, sparingly)

---

## 13. Project Override — Procedure Duration Fields

For the Viva Medical business management prototype, diagnostics and repair steps no longer use live timer widgets.

Use duration input fields instead:

- Diagnostics step: `Diagnostics duration`
- Repair step: `Repair duration`
- Service flow labels for diagnostics and repair should read as duration entry points, not live timer nodes.
- Accepted user-facing examples: `00:45`, `45 min`, `01:20`, `1h 20m`

Implementation rules:

- Do not use `Date.now()`, `setInterval`, running/stopped timer state, or start/stop buttons for these procedure steps.
- The field is filled by the user after completing the procedure.
- Use monospace font for the duration input value.
- Keep the field inside a dark rectangular panel when using the wizard visual style.
- Continue to use the general modal, wizard indicator, checklist, and decision-card rules from this document.

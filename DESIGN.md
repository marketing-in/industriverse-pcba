---
name: Industriverse PCBA
description: Benchlight. A PCB assembly workspace in three lines, legible under factory light.
colors:
  bench: "#EEF1F3"
  silkscreen: "#FFFFFF"
  tray: "#F4F6F8"
  rail: "#E4E9ED"
  viewport: "#DCE2E7"
  ink: "#10171E"
  ink-2: "#3D4955"
  ink-3: "#586573"
  bench-ink: "#131B23"
  control-stroke: "#76828E"
  rule: "#CBD3DA"
  hair: "#E2E7EB"
  line-engineering: "#0B6569"
  line-supply: "#8C2760"
  line-production: "#1F4FA8"
  lamp-run: "#16753A"
  lamp-hold: "#F5B301"
  lamp-hold-text: "#8A5200"
  lamp-stop: "#BF2318"
typography:
  display:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.27
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Anek Latin, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.01em"
  identifier:
    fontFamily: "Sometype Mono, ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.38
rounded:
  sm: "3px"
  md: "5px"
  lg: "8px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.bench-ink}"
    textColor: "{colors.silkscreen}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.silkscreen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.silkscreen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
  line-band-supply:
    backgroundColor: "{colors.line-supply}"
    textColor: "{colors.silkscreen}"
    height: "52px"
  lamp-run:
    backgroundColor: "{colors.lamp-run}"
    textColor: "{colors.silkscreen}"
    rounded: "{rounded.sm}"
    height: "28px"
---

# Design System: Industriverse PCBA

Mode: Operate (plus one small sign-in surface). Build path: code-led. The previous look in `src/style.css` (warm paper `#f4f3ef`, one copper accent `#b4501a`, IBM Plex, uppercase tracked labels) is the anti-reference: none of it survives.

Sections 1 to 8 are the design system. The product scope it serves is in `PRODUCT.md`.

## 1. Overview

**Creative North Star: "The route card under bench light."**

Every batch in an assembly shop travels with a route card: a sheet that says what the board is, what has been bought for it and which stage it has reached. Industriverse PCBA is that card made live. The interface takes its materials from the bench the card lies on: the cool grey of stencil steel and ESD laminate, white silkscreen surfaces, and three deep inks borrowed from objects that are always within reach. The solder mask of the board itself (Engineering, teal), the pink antistatic bag components arrive in, taken to its deep plum (Supply), and the blue ESD smock every operator wears (Production). State is shown the way the factory already shows it: with tower-lamp green, amber and red.

Physical scene that forces light-first: a line lead in an ESD smock glances at a wall screen from two metres, under 5000 K overhead LED panels with reflections on the glass. A dark interface washes out there; a white surface with near-black text and solid colour fields survives it. Dark exists for the engineer's desk in the evening and for long 3D sessions, and is a complete theme.

Colour strategy: **committed shell, restrained page.** The active line's ink owns the full-width band at the top of every screen and its tile in the rail. Inside the page there are three colour jobs and no others:

- **Ink acts.** Primary buttons are Bench ink in every line, so "Save list" looks the same everywhere.
- **Line colour locates.** Current tab, current step, selection, links, focus ring, checked controls.
- **Lamp colour reports.** Green, amber and red appear only where they state a condition.

The world lends four things only: type, palette, density and one signature move. Navigation, tables, inputs, tabs and dialogs are standard web controls that an engineer could build from the platform's own components.

The signature move is **the Route**: three square nodes, Engineering, Supply, Production, always in that order, joined by a hairline. It is the product mark, the home hub at large size, a chip on every record that crosses lines, and the one authored motion when a line changes.

**Key characteristics**

- Cool steel neutrals; no warm paper, no copper accent, no IBM Plex.
- One ink per line, carried by the shell as a solid field with white text.
- Lamp colours for state only, always with a word and a shape.
- White work surfaces, 1 px rules, no resting shadows.
- One variable family with a width axis for everything people read; a separate face only for identifiers.
- 12 px minimum text; Production one density step larger.

## 2. Colors

Cool, bright and flat: steel-tinted neutrals (hue about 210°), three deep line inks from the cool half of the wheel, three lamp colours from the warm-to-green half. Every contrast figure below was computed from these exact hex values (WCAG relative luminance).

### Primary: the three line inks

One field value per line, identical in both themes, always carrying white text. A second "fg" value per theme for the ink used as text, glyph or selection on a neutral surface.

| Line | Material | Field (both themes) | White on field | White 80 % on field | Field hover | Light fg = field: on surface / bg / tray / rail | Light soft tint | Dark fg | Dark fg on surface / bg / float | Dark soft tint |
|---|---|---|---|---|---|---|---|---|---|---|
| Engineering | Solder mask | `#0B6569` | 6.8 | 5.0 | `#084F53` (9.3) | 6.8 / 6.0 / 6.3 / 5.6 | `rgba(11,101,105,.10)` (ink on it 5.9) | `#52C5C7` | 8.3 / 9.1 / 7.2 | `rgba(82,197,199,.16)` (fg on it 6.1) |
| Supply | Antistatic bag, deep | `#8C2760` | 8.2 | 5.8 | `#721D4D` (10.5) | 8.2 / 7.2 / 7.5 / 6.7 | `rgba(140,39,96,.10)` (6.9) | `#EB8FC0` | 7.6 / 8.2 / 6.6 | `rgba(235,143,192,.16)` (5.7) |
| Production | ESD smock | `#1F4FA8` | 7.7 | 5.5 | `#183F88` (10.0) | 7.7 / 6.8 / 7.1 / 6.3 | `rgba(31,79,168,.10)` (6.5) | `#86ADF7` | 7.6 / 8.3 / 6.6 | `rgba(134,173,247,.16)` (5.7) |
| Home, sign-in | Bench ink | light `#131B23`, dark `#1B242D` | 17.4 / 15.7 | 11.4 / 10.5 | light `#2A3540`, dark `#232E39` | 15.3 on bg | `rgba(16,23,30,.07)` | `#E9EEF2` | 14.7 / 16.0 / 12.8 | `rgba(233,238,242,.10)` |

Text placed on a dark-theme fg colour (current step square, text selection) is `#0D1318`: 9.1 / 8.2 / 8.3.

In the dark theme a line field against the dark ground is 2.3 to 2.7:1. The band is a region, not a control, and always carries its name in white, so this is acceptable; the selected rail tile, which is a control state, additionally takes a 1 px inset outline in the line's dark fg (8.6:1 or better on the rail).

### Secondary: lamp colours (state only)

| Token | Light | Use | Contrast (light) | Dark | Contrast (dark) |
|---|---|---|---|---|---|
| `--green` Run | `#16753A` | running, in stock, pass, verified | 5.8 on surface, 5.1 on bg, 5.3 on tray; white on it 5.8 | `#62CD88` | 8.7 on surface; `#0D1318` on it 9.4 |
| `--green-soft` | `rgba(22,117,58,.11)` | soft badge ground | green on it 4.9 (4.6 over tray) | `rgba(98,205,136,.16)` | 6.3 |
| `--warning`, `--warning-text` Hold | `#8A5200` | amber as text, icon and outline | 6.4 / 5.6 / 5.9 | `#F3BF4C` | 10.1 |
| `--lamp-amber` | `#F5B301` | solid Hold or Rework lamp fill, with `--on-lamp-amber` `#10171E` on it | text on it 9.7; the fill is only 1.9 against white, so the lamp always carries a 1 px `--warning` border | `#F3BF4C` with `#0D1318` | 11.0 |
| `--warning-soft` | `rgba(138,82,0,.10)` | soft badge ground | 5.5 (5.1 over tray) | `rgba(243,191,76,.16)` | 7.1 |
| `--red` Stop | `#BF2318` | stopped, short, failed, destructive | 6.1 / 5.3 / 5.6; white on it 6.1 | `#FF8D7D` | 7.7; `#0D1318` on it 8.3 |
| `--red-soft` | `rgba(191,35,24,.09)` | soft badge ground | 5.2 (4.8 over tray) | `rgba(255,141,125,.16)` | 5.8 |
| `--on-state` | `#FFFFFF` | text on a solid green or red lamp | see above | `#0D1318` | see above |

Blue is retired as a state colour because it is the Production ink. `--blue` is kept as an alias of `--accent-text` so the two rules that use it do not break.

### Neutral

| Token | Light | Role | Contrast (light) | Dark | Contrast (dark) |
|---|---|---|---|---|---|
| `--bg` Bench | `#EEF1F3` | page ground | | `#0D1318` | |
| `--surface` Silkscreen | `#FFFFFF` | panels, tables, inputs, dialogs | | `#151C23` | |
| `--surface-2` Tray | `#F4F6F8` | table headers, sub-strips, wells, read-only fields | | `#1B242D` | |
| `--sidebar` Rail | `#E4E9ED` | the line rail and bottom bar | | `#080C10` | |
| `--stage` Viewport | `#DCE2E7` | 2D and 3D backdrop | | `#080C10` | |
| `--float` | `#FFFFFF` | menus, popovers, tooltips | | `#1E2832` | |
| `--text` Ink | `#10171E` | body text, headings | 18.1 on surface, 15.9 on bg, 16.7 on tray, 14.8 on rail, 13.8 on stage | `#E9EEF2` | 14.7 on surface, 16.0 on bg, 13.5 on tray, 12.8 on float |
| `--t2` Ink 2 | `#3D4955` | secondary text, labels | 9.2 / 8.1 / 8.5 / 7.5 / 7.0 | `#B4BFC9` | 9.2 / 10.0 / 8.4 / 8.0 |
| `--t3` Ink 3 | `#586573` | tertiary text, placeholders, units | 6.0 / 5.3 / 5.5 / 4.9 / 4.6 | `#8E9BA7` | 6.1 / 6.6 / 5.5 / 5.3 |
| `--border` Control stroke | `#76828E` | input, select, button and chip outlines | 3.9 on surface, 3.5 on bg, 3.6 on tray | `#66737F` | 3.5 / 3.9 / 3.2 |
| `--rule` | `#CBD3DA` | panel outlines, section dividers | decorative | `#2D3843` | decorative |
| `--hair` | `#E2E7EB` | table row lines | decorative | `#222C36` | decorative |
| `--disabled` | `#8D98A3` | disabled labels only | 2.9 (exempt; never live text) | `#5F6B77` | 3.2 (exempt) |
| `--pill` / `--pill-hover` / `--on-pill` | `#131B23` / `#2A3540` / `#FFFFFF` | primary button, toast | 17.4 / 12.5 | `#E9EEF2` / `#FFFFFF` / `#0D1318` | 16.0 |

`--t2` and `--t3` are solid colours now. Today they are 72 % and 62 % alpha of the ink, which makes their contrast depend on whatever is underneath.

### On the band

The band is an ink field in both themes, so it re-declares the neutrals locally and every existing child control adapts without its own rewrite:

| Local token on `.topbar` | Value | Contrast on Engineering / Supply / Production field |
|---|---|---|
| `--text`, `--accent`, `--accent-text` | `#FFFFFF` | 6.8 / 8.2 / 7.7 |
| `--t2` | `rgba(255,255,255,.86)` | 5.5 / 6.4 / 6.1 |
| `--t3` | `rgba(255,255,255,.80)` | 5.0 / 5.8 / 5.5 |
| `--border`, `--rule` (control outlines) | `rgba(255,255,255,.60)` | 3.5 / 3.9 / 3.9 (white at 45 % fails 3:1; do not go lower) |
| `--hair` | `rgba(255,255,255,.18)` | decorative |
| `--surface` / `--surface-2` | `rgba(255,255,255,.10)` / `rgba(255,255,255,.16)` | fills |
| `--ink` | `255,255,255` | hover washes become white washes |
| `--on-accent` | `var(--line)` | ink on white: same figures as white on field |
| `--green`, `--warning`, `--warning-text` | `#FFFFFF` | the cloud badge reports state by icon and word on the band, never by lamp colour |

### Named Rules

**The Two Arcs Rule.** Line inks live on the cool arc, teal to plum (about 180° to 330°). Lamp colours live on the other arc, red to green (about 5° to 140°). Nothing borrows from the other arc: there is no green line and no blue state. The Production ink is blue on purpose: the pages densest with green, amber and red lamps sit under the ink furthest from all three.

**The Chrome and Content Rule.** Line identity lives in the chrome (rail tile, band) and in "where am I" marks (current tab, current step, selection, focus, links). State lives in the content (lamps, badges). A lamp colour never fills chrome; a line ink never marks a state; neither is ever the primary button.

**The Field Rule.** A line ink appears as a solid field with white text or as text on a neutral surface. Never as a stripe, a glow, a gradient or a tinted page ground.

### Where line identity appears (exactly here, nowhere else)

Four independent channels, so identity survives colour blindness, glare and a greyscale print: **position** (always Engineering, Supply, Production), **glyph**, **word** and **ink**.

| # | Place | What is shown |
|---|---|---|
| 1 | Rail tile | Glyph and name. Unselected: glyph in the line's fg ink, name in `--text`. Selected: solid field, white glyph and name. All three inks are therefore always on screen. |
| 2 | Band | The full-width top bar, including the mark cell above the rail, is the active line's field. It holds the line's name and its page tabs. |
| 3 | `--accent` inside the page | Current stepper step, selected row tint, checked controls, links, focus ring, caret, text selection. Set once per line by `data-line` on `<html>`. |
| 4 | Route chip | On every board, saved list and job: three nodes in fixed order, each in its line's ink, filled where the record exists in that line. |
| 5 | Hand-off buttons | Any control that leaves the current line carries the destination line's glyph before its label. |
| 6 | Browser chrome | `document.title` reads "Page · Line · Industriverse PCBA"; `meta[name=theme-color]` is the line's field ink, so the mobile status bar matches the band. |
| 7 | Command palette | Results grouped by line, each group headed by the line's glyph and name. |

What does not carry line identity: page grounds, panel borders, table headers, primary buttons, charts' first series, any lamp.

## 3. Typography

**UI face:** Anek Latin (Ek Type; SIL OFL; Google Fonts), variable, axes `wght` 100 to 800 and `wdth` 75 to 125. Weights used: 400, 500, 600, 700. Widths used: 75 %, 87.5 %, 100 %.
**Identifier face:** Sometype Mono (SIL OFL; Google Fonts), variable `wght` 400 to 700. Weights used: 400, 500, 600.

Verified by parsing the upstream font files (cmap, GSUB, fvar, glyf):

| Face | ₹ U+20B9 | µ U+00B5 | Ω | `tnum` | Zero | Arrow U+2192 | Verdict |
|---|---|---|---|---|---|---|---|
| Anek Latin | yes | yes | yes | yes | plain by default, slashed with `"zero" 1` | no | UI face |
| Sometype Mono | yes | yes | yes | n/a (mono) | dotted by default (three contours) | yes | identifier face |
| Atkinson Hyperlegible Next | yes | no | Greek only | yes | | no | rejected: no µ |
| Atkinson Hyperlegible Mono | no | no | Greek only | n/a | | no | rejected: no ₹, no µ |
| Spline Sans Mono | no | yes | no | n/a | | no | rejected: no ₹, no Ω |

A price column in ₹ and a value column in µF rule out most of the obvious choices. Anek Latin has the width axis that gives a condensed cut for dense table headers and floor numerals without a second family, and it has matched siblings for Devanagari, Tamil, Telugu, Kannada, Gujarati, Bangla and Malayalam, so a later shop-floor translation keeps the same design. Neither face has U+202F, so the space between a value and its unit is the ordinary no-break space U+00A0.

**Loading (decided: Google Fonts link, same mechanism as today).** In `index.html` replace the IBM Plex `<link>` with:

```html
<link href="https://fonts.googleapis.com/css2?family=Anek+Latin:wdth,wght@75..125,100..800&family=Sometype+Mono:wght@400..700&display=swap" rel="stylesheet"/>
```

Keep the two `preconnect` links. Self-hosting through `@fontsource-variable/anek-latin` (the file that includes the `wdth` axis) and `@fontsource-variable/sometype-mono` is a later hardening for floor PCs on a poor network; it changes no token.

**Stacks**

```css
--sans:'Anek Latin',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
--num:var(--sans);            /* always with font-variant-numeric:tabular-nums */
--mono:'Sometype Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace;
```

**Character:** a sturdy, open grotesque that stays legible at small sizes, with a condensed register (`font-stretch:87.5%`) for labels, column heads and big numerals; identifiers in a calm mono with a dotted zero, so an MPN can be read character by character.

### Hierarchy

Fixed px on the existing 14 px root, ratio about 1.15 to 1.3 between steps, no fluid type. Width is set with `font-stretch`, not `font-variation-settings`.

| Role | Size / line | Weight | `font-stretch` | Tracking | Use |
|---|---|---|---|---|---|
| Display | 28 / 32 | 700 | 87.5 % | -0.015em | Hub lane names at 1200 and up, sign-in product name, Production numerals in `.prod-stats` |
| Title (`h1`) | 22 / 28 | 700 | 100 % | -0.01em | Page title in `.page-heading` (size unchanged from today) |
| Heading (`h2`) | 16 / 22 | 600 | 100 % | 0 | Section headings, dialog titles; hub lane names below 1200 are 22 / 28 |
| Panel heading (`.panel-heading h2`), `h3` | 14 / 20 | 600 | 100 % | 0 | Panel titles, group headings |
| Body | 14 / 20 | 400 | 100 % | 0 | Default text, inputs; buttons and tabs at 500 |
| Table | 13 / 18 | 400 | 100 % | 0 | Table cells (14 / 20 in Production) |
| Label | 12 / 16 | 500 | 87.5 % | 0.01em | Column heads, field labels, badges, units, rail tile names. Sentence case. |
| Identifier | 13 / 18 | 500 | n/a | 0 | MPN, designator, serial, quotation number, file name, keyboard hint (Sometype Mono) |

Mechanical size normalisation for the existing stylesheet: `10px`, `10.5px`, `11px`, `11.5px` become `12px`; `12.5px` becomes `13px`; `13.5px` becomes `14px`. Nothing is set below 12 px. Display tracking never goes below -0.015em. Headings use `text-wrap:balance`; prose (notes, empty states, dialog copy) is capped at 68ch.

### Numerals

- `.numeric`, every `td` and `th` that holds a quantity, price, percentage, date or duration, totals, counts on tabs and the stepper numbers use `--num` with `font-variant-numeric:tabular-nums`. Right-aligned in tables.
- Money is set in the UI face with tabular figures, not in the mono: `₹1,24,500.00` is narrower and aligns on the decimal. The currency sign is in the same face.
- Identifiers use Sometype Mono with `font-variant-ligatures:none`. Where an identifier falls back to the UI face (the search field), add `font-feature-settings:"zero" 1`.
- Units follow the number in `--t3` at Label size after U+00A0.
- Quotation totals follow the accounting convention with ordinary table rows: a single 1 px `--rule` above a subtotal, `border-bottom:3px double var(--text)` under the grand total, grand total at weight 600.

### Named Rules

**The Identifier Rule.** The mono is for things a person copies or checks character by character: part numbers, designators, serials, quotation numbers, file names, G-code, keyboard hints. It is never used for headings, labels, navigation, prices or prose, and never as a "technical" texture.

**The No-Uppercase Rule.** No `text-transform:uppercase`, no tracked small caps, and no label above a heading. A heading carries its own weight.

## 4. Layout

**Spacing scale (4 px base):** 2, 4, 8, 12, 16, 24, 32, 48, 64. Inside a group 4 to 8; between groups 16; between sections 24 to 32; more space above a heading than below it (24 above, 8 below). Panel padding 16. Adopt the scale in rewritten blocks; do not sweep the untouched ones.

**Breakpoints for the shell (three):** 1200, 1024 and 768. Component-internal breakpoints already in the stylesheet (1250, 1100, 900, 767, 720, 640, 560, 520, 480 and others) are left alone unless they break.

### Density per line

Density is a token set on the line, not a class toggled in JSX.

| Token | Default (hub, Engineering, Supply) | Production | `(pointer:coarse)` | Production and `(pointer:coarse)` |
|---|---|---|---|---|
| `--ctl` control height | 36px | 44px | 44px | 56px |
| `--row-y` table cell padding | 8px | 12px | 12px | 14px |
| `--fs-table` | 13px | 14px | 13px | 15px |
| `--lamp-h` | 28px | 32px | 32px | 36px |

```css
:root{--ctl:36px;--row-y:8px;--fs-table:13px;--lamp-h:28px}
:root[data-line="production"]{--ctl:44px;--row-y:12px;--fs-table:14px;--lamp-h:32px}
@media (pointer:coarse){:root{--ctl:44px;--row-y:12px;--lamp-h:32px}
 :root[data-line="production"]{--ctl:56px;--row-y:14px;--fs-table:15px;--lamp-h:36px}}
```

`.button{min-height:var(--ctl)}`, `input,select,textarea{min-height:var(--ctl)}`, `.icon-button{width:var(--ctl);height:var(--ctl)}`, `td{padding:var(--row-y) 16px;font-size:var(--fs-table)}`. `.button.small` stays 28 px (36 px on coarse pointers).

### Shell and navigation

**Model: a line rail plus a line band.** The rail picks the line. The band says which line you are in and holds that line's pages as ordinary tabs. Two levels, both always visible on desktop. The old 224 px sidebar with ten flat items, the breadcrumb, the bell and the hamburger drawer are removed; tables gain 136 px at 1440.

Pages (label, and the leaf id `navigate()` keeps using):

| Line (`data-line`) | Glyph | Tabs in the band |
|---|---|---|
| Home (attribute absent) | the Route mark | none |
| Engineering (`engineering`) | lucide `Layers` | Board studio (`Board studio`) · Board types (`Board types`) |
| Supply (`supply`) | authored `ReelIcon` | BOM tool · Saved lists · Part master · Inventory · Purchases · Vendors |
| Production (`production`) | lucide `Factory` | Jobs (leaf id `Production`) · SMT line (`SMT line`, mounts `FactoryLine`) · Machines (`Machines`, mounts `FactorySetup`) · Dispatch (`Dispatch`, mounts `BoardFlow`) |

Every line page except Board studio carries the **Board picker** (`.board-select`) beside its title: the one selected board, shared by all three lines. A page found under another line's address (`#/engineering/smt-line`) opens where it lives now.

A rail tile opens the line's last-used page (first page on first visit). Counts ride on a tab as plain tabular figures after the name: "Inventory 4" (parts below minimum), "Jobs 3" (unfinished jobs). No coloured bubbles.

**Markup** (one return in `src/main.jsx`, today at line 305):

```
a.skip[href="#main"]
aside.sidebar                                   the rail; the bottom bar at 768 and below
  a.brand[aria-label="Industriverse PCBA home"](.selected on the hub) > svg.brand-mark + span "Home"
  nav[aria-label="Lines"]
    button.rail-tile[data-line=…](.selected)[aria-current="true"] > svg + span {name}
div.app-shell
  header.topbar                                 the band
    div.band-lead
      strong.band-line {line name, or "Industriverse PCBA" on the hub}
      nav.line-tabs[aria-label="{Line} pages"] > button(.selected)[aria-current="page"] {label} <b>{count}</b>
    div.topbar-right
      button.palette-open · span.demo-label · CloudBadge · div.segmented.currency-switch
      button.icon-button.theme-toggle · button.avatar[popovertarget="account-menu"]
  main#main > div.page-heading (h1 + div.heading-actions) …
div#account-menu[popover].menu                  outside .topbar so it does not inherit the band's tokens
```

`data-line` is set on `document.documentElement`, so native dialogs, popovers, the toast and the canvas panels that read tokens with `getComputedStyle` (`src/factory/pnpPanel.jsx`, `printerPanel.jsx`) all inherit the line.

**1440 px (1200 and up)**

```
+--------+--------------------------------------------------------------------------+
| [mark] | Supply   BOM tool  Saved lists  Part master  Inventory 4  Purchases  …   |  band 52px, field ink, white
|        |                      [Search or jump  Ctrl K] [Sample data] [cloud] [₹|$] [th] [AK]
+--------+--------------------------------------------------------------------------+
| Layers |  BOM tool                                   [Import BOM]  [Get prices]   |  .page-heading, h1 22px
|  Eng   |  ------------------------------------------------------------------------|
| [Reel] |  1 Bare PCB     2 Components     3 Analysis optional     4 Quotation     |
|  Sup   |  +----------------------------------------------------------------------+|
| Factry |  | table …                                                              ||
|  Prod  |  +----------------------------------------------------------------------+|
+--------+--------------------------------------------------------------------------+
  88px                              main: max-width 1480, padding 24 28 40 (unchanged)
```

- Rail: fixed, 88 px wide, `--sidebar` ground, 1 px `--rule` on its right edge, `z-index:30`. Top cell (`.brand`): 88 × 52, the band's field ink, white Route mark 28 px, "Home" visually hidden. Then three tiles, 72 × 64, 8 px apart, 12 px below the mark cell: glyph 24 px over the name at Label size. Selected tile: solid field of its ink, 5 px radius, white glyph and name. Hover on an unselected tile: `rgba(var(--ink),.06)`.
- Band: sticky, 52 px, `background:var(--line)`, padding 0 20 px, no bottom border in the light theme. Line name at 16 / 600. Tabs 20 px after the name: text buttons at 14 / 500, 52 px tall, padding 0 12 px, `--t3` (white at 80 %); hover white with `--surface` wash; current white at 600 with a 2 px white underline flush to the band's bottom edge (`box-shadow:inset 0 -2px 0 #fff`). Right group, 8 px gaps: `.palette-open` (220 px), `.demo-label`, `CloudBadge`, the currency `.segmented`, the theme toggle, the avatar button.
- The hub and sign-in use the Bench-ink band (`#131B23`; dark `#1B242D` with a 1 px `--rule` below).
- `.app-shell{margin-left:88px}`. Toast: `left:calc(50% + 44px)`.

**1024 px (769 to 1199)**

- Rail narrows to 64 px: mark cell 64 × 52; tiles 48 × 48, glyph only, the name kept for assistive technology and shown as a `title`. The selected tile keeps its field.
- Band: `.band-lead` takes the free width and `.line-tabs` scrolls horizontally inside it (`overflow-x:auto; scrollbar-width:none`; the current tab is scrolled into view; a partly visible label is the cue that more exists). `.palette-open` collapses to its icon (move the existing `max-width:900px` rule to 1199 px), `.cloud-badge` shows its icon only, `.demo-label` hides. Currency stays visible: it changes every figure on screen.
- `.app-shell{margin-left:64px}`; main padding 20 24 32; toast `left:calc(50% + 32px)`. Two-column page layouts (`.studio-layout`, `.prod-layout`) stack as they already do at `max-width:1024px`.

**768 px (768 and below)**

- The rail leaves the side and becomes a **bottom bar**: `position:fixed; inset:auto 0 0 0`, 60 px high plus `env(safe-area-inset-bottom)`, `--sidebar` ground with a 1 px `--rule` on top, four equal items in a row (Home, Engineering, Supply, Production), glyph 24 px over the name at 12 px with `font-stretch:75%`. Selected item: its ink field with white glyph and name (Home: `--pill` with `--on-pill`). Targets are 60 px, reachable with a gloved thumb.
- Band in two rows, both on the field ink: row one, 48 px, line name left and search icon, currency, theme toggle and avatar right; row two, 44 px, the scrolling tabs across the full width. `position:sticky; top:-48px`, so row one scrolls away and the tabs stay.
- `.app-shell{margin-left:0; padding-bottom:calc(60px + env(safe-area-inset-bottom))}`; main padding 16 16 32; toast `left:50%; bottom:calc(72px + env(safe-area-inset-bottom))`.
- `.page-heading` stacks title over actions; tables scroll inside `.table-scroll` with the first column sticky.
- The `.sidebar.open` drawer, `.menu-button` and the `mobile` state are deleted.

**375 px**

- Bottom bar and two-row band as at 768. Row one fits name, search, a compact currency switch ("₹" and "$"), theme toggle and avatar in 343 px; the cloud state moves into the account menu as a line of text.
- Tables use the existing `max-width:767px` rules (minimum table width with horizontal scroll); job rows are already stacked. The BOM stepper keeps its four numbered steps and wraps two by two.
- A page's single primary action is full width under the title (existing `.heading-actions .button{flex:1}` rule).
- Hub lanes stack with 16 px padding (section 7).

**Landmarks and keyboard.** `a.skip` stays first. `nav[aria-label="Lines"]` then `nav[aria-label="Supply pages"]` then `main`. `aria-current` on the selected tile and tab. Ctrl K opens the palette. The account menu is a native popover: Escape and outside click close it, focus returns to the avatar button.

## 5. Elevation & Depth

Flat. Under strong overhead light a soft shadow is invisible, so depth is carried by ground steps (Bench, Silkscreen, Tray) and 1 px rules. Shadows exist only for things that float above the page, and always have an offset and a blur.

### Shadow Vocabulary

| Token | Light | Dark | Use |
|---|---|---|---|
| `--shadow-1` | `none` | `none` | resting surfaces |
| `--shadow-2` | `0 1px 2px rgba(16,23,30,.08),0 6px 16px rgba(16,23,30,.10)` | `0 1px 2px rgba(0,0,0,.4),0 6px 16px rgba(0,0,0,.4)` | menus, popovers, tooltips, the toast |
| `--shadow-3` | `0 4px 10px rgba(16,23,30,.08),0 20px 48px rgba(16,23,30,.20)` | `0 4px 10px rgba(0,0,0,.4),0 20px 48px rgba(0,0,0,.55)` | dialogs, the account menu |

In the dark theme floating surfaces also step up to `--float` and take a 1 px `--rule` outline. The focus indicator is an outline, never a `box-shadow` halo: `input:focus{box-shadow:0 0 0 3px var(--accent-soft)}` is removed.

### Named Rules

**The Flat Bench Rule.** Nothing resting on the page has a shadow. If two regions need separating, change the ground or draw a rule.

## 6. Shapes

Machined, not soft. `--r-sm:3px` (badges, lamps, checkboxes, tags, Route nodes at 2 px), `--r:5px` and `--r-md:5px` (buttons, inputs, tabs, tiles), `--r-lg:8px` (panels, dialogs), `--radius:8px`, `--radius-s:5px`. Lamps and badges are rectangles with 3 px corners, never pills. The only circles are the 6 px status dot inside a badge, radio buttons and the reel glyph. Borders are 1 px; 2 px is reserved for the focus ring, the current-tab underline and the stepper's baseline. The 2D and 3D viewports have no radius inside their panel.

## 7. Components

Every interactive component has default, hover, focus-visible, active, disabled and, where it applies, loading and error.

### Buttons

Height `var(--ctl)`, radius 5 px, 14 / 500, icon 16 px with an 8 px gap, padding 0 14 px.

- **Primary (`.button.primary`):** `--pill` ground, `--on-pill` text, in every line. Hover `--pill-hover`. Active: the hover colour with a 1 px inset line of `rgba(var(--shade),.4)`; no brightness filter. One primary per view.
- **Secondary (`.button`):** `--surface` ground, 1 px `--border`, `--text`. Hover: ground `--surface-2`, border `--t3`. Active `rgba(var(--ink),.08)`.
- **Quiet (`.text-button`, `.icon-button`, `.link-button`):** no ground. Text buttons in `--accent-text`, underlined on hover. Icon buttons `var(--ctl)` square, hover `rgba(var(--ink),.07)`, always with `aria-label` and `title`.
- **Hand-off (`.button.handoff`):** a primary or secondary button whose leading icon is the destination line's glyph ("Continue to production" with the factory glyph, "Open its BOM" with the reel, "Open in Board studio" with layers). On a secondary button the glyph takes the destination's fg ink.
- **Destructive:** `--red` text on a secondary button (`.text-button.danger` already uses `var(--red)`); solid `--red` with `--on-state` only inside the confirming dialog.
- **Disabled:** ground `--surface-2`, text `--disabled`, border `--rule`, `cursor:not-allowed`, no opacity trick, and a `title` saying why when it is not obvious ("Continue needs the bare PCB price").
- **Loading:** the label stays, a 14 px spinner (`.spin`) replaces the icon, the width does not change, `aria-busy="true"`.

### Inputs / Fields

`input`, `select`, `textarea`, `.search-box`: height `var(--ctl)`, `--surface` ground, 1 px `--border`, 5 px radius, padding 0 10 px, Body size. Label above at 13 / 500 in `--t2`, always visible. Placeholder `--t3` with `opacity:1` (6.0:1). Hover: border `--t3`. Focus: border `--accent` plus the global focus ring. Error: border `--red`, message below in `--red` at Label size with an alert icon and `aria-describedby`, starting with the problem ("Quantity must be a whole number"). Read-only and disabled: `--surface-2` ground. Number inputs right-aligned with tabular figures; unit suffix (`.input-suffix em`) in `--t3`. File drop zones (`.upload-zone`, `.pcb-gerber`): 1 px dashed `--border` on `--surface-2`, with the accepted formats written out in the identifier face.

**Segmented control (`.segmented`, `.filter-tabs`):** unchanged in structure: a `rgba(var(--ink),.06)` well with 1 px `--hair`; the selected segment is `--surface` with `--text` at 600 and `0 0 0 1px var(--rule)`. Not ink and not the line colour, so a filter never looks like the primary action. Segment height `calc(var(--ctl) - 8px)`. On the band the selected segment is solid white with the line's ink as text.

### Navigation

Rail tiles, band tabs and the bottom bar are specified in section 4. The command palette (`.palette-open`, Ctrl K, `CommandPalette.jsx`) is kept; its groups are Lines, then one group per line, then Parts, Saved lists and Boards, with `.palette-group` headings in sentence case at Label size. The account menu (`#account-menu.menu`): `--float`, 8 px radius, `--shadow-3`, 240 px wide, fixed at `top:56px; right:12px`; rows 40 px; holds the user's name and email, cloud state (at 375), Team (admins) and Sign out.

### Tables

The main working surface. Panel-bound: `.panel` > `.table-scroll` > `table`.

- Header (`th`): sticky, `--surface-2`, Label style in `--t2`, 1 px `--rule` below, never wraps. Sortable headers are buttons with a 12 px arrow and `aria-sort`.
- Rows (`td`): `padding:var(--row-y) 16px`, `font-size:var(--fs-table)`, `--hair` between rows, `--text` for the primary column and `--t2` for the rest, no zebra. Hover `rgba(var(--ink),.04)`. Selected: `--accent-soft` ground and a checked checkbox, never a side stripe.
- Numbers right-aligned and tabular. Identifier cell: MPN in the identifier face in `--text`; manufacturer on a second line at 12 px in `--t3`.
- **Price cell.** Figure right-aligned; under it one caption line at 12 px in `--t3` (`.price-note` exists): provenance word and age, for example "Authorised · DigiKey · fetched 2 h ago". "Open market · unverified" and any age above 24 h are in `--warning-text`, with a refresh icon button for the stale case. A price cell without a provenance caption is a bug.
- "Not available" is written out in `--t3` (class `.na`), never a dash alone. DNP rows: text in `--t3`, a neutral "DNP" badge, figures blank rather than zero.
- Problem rows (short, no price): a badge in the status column and, where the whole row is affected, a `--warning-soft` or `--red-soft` ground.
- Totals row: `--surface-2` ground, weight 600, 1 px `--rule` above.
- Loading: skeleton rows of `rgba(var(--ink),.07)` bars at the real row height, no shimmer and no centred spinner. A price being fetched reads "Asking DigiKey…" in `--t3`.
- Footer (`.table-footer`, `.pagination`): count on the left ("128 lines, 4 without an offer"), pagination on the right.

### Stepper (BOM tool)

`nav[aria-label="BOM workflow"].bom-workflow`, four buttons: Bare PCB, Components, Analysis (with its `.opt-tag` "optional"), Quotation. The numbers stay because the order is enforced. The buttons lose their button chrome and sit on one 2 px baseline.

- Each step: a 24 px square (3 px radius) with the tabular step number, the name at 14 / 500, and the state line already in the page ("12 of 14 lines priced") in `--t3`.
- Done: square `--surface` with a 1 px `--accent` border and a check icon in `--accent`; baseline under it `--accent`.
- Current (`[aria-current="step"]`): square solid `--accent` with `--on-accent` number; name `--text` at 600; baseline `--accent`.
- Upcoming: square `--surface-2` with `--t3` number; baseline `--rule`.
- Blocked (the step's requirement is not met, for example no bare PCB price): a 6 px `--lamp-amber` dot with a `--warning` outline on the square and the reason as the state line. The step stays clickable so the user can see what is missing.

### Stage track (Production)

`.stage-groups` > `.stage-group` > `.stage-track`, twelve stages in five groups (`STAGES` and `STAGE_GROUPS` in `src/production.js`). Equal segments, 12 px high (16 px in Production density), 2 px gaps, 2 px radius.

- Done (`li.done i`): `--series-1`, solid.
- Current (`li.active i`): solid in the lamp colour of the job's state through `--stage-state` (default `--green`; `--lamp-amber` with a `--warning` outline for hold or rework; `--red` for stopped). The `linear-gradient` that fakes 40 % progress is removed: a job is at a stage, not at a percentage.
- Upcoming: `--hair` ground with a 1 px `--rule` outline.
- Quality gates (stages with `gate:true`: QA incoming, QA line, Testing, Final QC): the segment has pointed ends (`clip-path:polygon(6px 0,calc(100% - 6px) 0,100% 50%,calc(100% - 6px) 100%,6px 100%,0 50%)`), so a gate is recognisable without colour.
- Under the track (`.stage-now`): the current stage name at 14 / 600 and "Stage 5 of 12" in `--t3`. Group names (`.stage-group>small`) at Label size, sentence case.

### Status: lamps and badges

- **Lamp (new `.lamp`):** the glance-distance state for jobs, machines and SMT lines. Height `var(--lamp-h)`, 3 px radius, 1 px border, padding 0 10 px, a 14 px filled shape and the word at 13 / 600.
  - Running: `--green` fill and border, `--on-state` text, triangle.
  - Hold, Rework: `--lamp-amber` fill, `--on-lamp-amber` text, 1 px `--warning` border, two bars.
  - Stopped, Short: `--red` fill and border, `--on-state` text, square.
  - Queued: `--surface` fill, 1 px `--border`, `--t2` text, hollow circle.
  - Done: `--surface` fill, 1 px `--text` border, `--text`, check.
- **Badge (`.badge.green|amber|red|neutral`, new `.badge.line`):** the reading-distance state in tables. 22 px high, 3 px radius, soft ground, solid text, 6 px dot, word at Label size. `.badge.line` is `--accent-soft` with `--accent-text`. Mapping: saved list Draft neutral, Quoted line, Ordered green, Archived neutral in `--t3`; offer trust Own stock neutral, Authorised green, Registered vendor line, Open market · unverified amber; stock In stock green, Low amber, Short red; board part Part number neutral, Value only amber, Designator only amber.
- A lamp or badge always contains its word. `.subtle-tag` (revision, source) keeps the identifier face at 12 px on `rgba(var(--ink),.06)`; `.count-bubble` and `.chip` become plain tabular counts on the same wash.

### Cards / Containers

`.panel` is the one bounded container: `--surface`, 1 px `--rule`, 8 px radius, no shadow; `.panel-heading` 48 px with `h2` and actions and a 1 px `--hair` below. Panels never nest; inner grouping uses a `--surface-2` strip or a rule. A page is not built from a grid of equal cards: where the old UI uses card grids as structure (`.btype-grid`, `.vendor-card`, `.machine-cards`, `.supplier-grid`, `.money-card`) use a table or a list with a thumbnail column and keep the class names the tests select. Stat rows (`.stats-grid`, `.stat-value`, `.factory-stats`, `.sourcing-metrics`, `.market-summary`) become one compact `dl` strip: Label over a tabular value at 16 / 600, separated by `--hair`, no icons, no accent colour. `.prod-stats` is the one exception: its values are Display size, because they are read from across the floor.

**Notices** (`.notice`, `.start-panel`, `.step-guide`, `.best-get`, `.dir-found`, `.md-found`, `.factory-step`, `.board-bottom .grip-status`, `.studio-note`): a full 1 px border of the role colour mixed at 40 % into `--rule`, the role's soft ground (`--accent-soft` for information, `--warning-soft`, `--red-soft`, `--green-soft`), a 16 px leading icon in the role colour, text in `--text`. The 3 px left edge is removed everywhere.

**Empty states** (`.empty`, `.offer-empty`, `.inspector-empty`, `.board-placeholder`): left-aligned inside the region they belong to, padding 24 px, no centred icon tower. One sentence saying what belongs here and where it comes from, then the action that creates it. Saved lists: "No saved lists yet. A list is saved from the Quotation step of the BOM tool." [Open BOM tool]. Jobs: "No jobs yet. A job starts when a quoted list is continued to production." [Open saved lists, with the reel glyph]. Board studio: "No board loaded. Add a Gerber ZIP, a .kicad_pcb, a .pos file or a .glb." [Add files]. A filter with no result says so and offers "Clear filters".

**Dialogs:** native `<dialog>` (kept). 580 px (`.wide` 840 px), `--r-lg`, `--surface`, 1 px `--rule`, `--shadow-3`, backdrop `rgba(16,23,30,.45)` with no blur. Title `h2`, close icon button top right, actions right-aligned with the primary last. Reserved for add or edit a record, file import, destructive or cross-line confirmation. Under 768 px a dialog is a bottom sheet with 16 px padding and full-width buttons. Long detail (part, vendor, machine) belongs in the existing `.inspector` side panel or its own page.

**Toast:** `--pill` ground, `--on-pill` text, 5 px radius, `--shadow-2`, one at a time, with its action as a quiet button ("Undo", "Open job").

**Viewports** (`.board-view`, `.canvas-host`, `.bom-board-3d-view`, `FactoryLine`): ground `--stage`; the 24 px grid keeps its `rgba(var(--ink),.055)` lines and turns cool by itself. The three.js scenes in `FactoryLine.jsx` hard-code warm greys (`0xd5d6d1` scene and fog, `0xcfd0cb` inner view); read `--stage` from the document element and re-apply it when the theme changes. Material colours of boards, parts and machines (`Board.jsx`, `partModels.js`, `factoryModels.js`, `PartImage.jsx`) depict real objects and stay.

**Quotation preview** (`.quote-preview`): the sheet stays white with dark ink in both themes, because it is a picture of the paper. Totals take the single and double rules from section 3. `quotePdf.js` `INK`, `MUTED`, `RULE` take `16,23,30` and matching tints.

### Signature component: the Route

One element in three sizes.

- **Route chip** (`.route`, inline, 20 px high): three 10 px squares (2 px radius) in fixed order joined by 8 px hairlines in `--border`. A node is solid in its line's fg ink when the record exists there, and a hollow 1 px `--border` square when it does not. The node for the line you are in is 14 px. Hover or focus on a solid node shows the record's existing name (board name; list name and revision; job customer, board and quantity); activating it opens that record in that line. No invented record prefixes. Accessible name, for example: "Route: board CTRL-01 in Engineering, list CTRL-01 rev B in Supply, no job yet". It sits in `.page-heading` beside the title of a board, saved list or job, in the last column of the Saved lists table, and in each `.job-head`. The existing `.job-link` button stays.
- **Route line** (in the hand-off toast and confirming dialog, 32 px): the chip with names under the nodes; the node the hand-off just filled is the last one solid.
- **Route map**: the home hub.
- **Product mark** (`.brand-mark`, 28 px, `viewBox="0 0 28 28"`): three 6 px squares (`rx 1.5`) at x 2, 11 and 20, y 11, joined by a 1.5 px line at y 14, `fill:currentColor`. White on the band. Favicon: the same on a `#131B23` rounded square (`rx 6`) with the squares in `#52C5C7`, `#EB8FC0`, `#86ADF7`. One static favicon.

### Home hub: the Route map

One screen, reached from the mark. `data-line` is absent, the band is Bench ink and reads "Industriverse PCBA", no rail tile is selected. The page answers three questions in order: what is on each line now, what is waiting to cross to the next line, and where did I leave off. `h1` is "Home".

```
[mark] Industriverse PCBA                  [Search or jump] [Sample data] [cloud] [₹|$] [?] [th] [AK]
+------+------------------------------------------------------------------------------------------+
|      |  Home                                                                                     |
| Eng  |  ---------------------------------------------------------------------------------------- |
| Sup  |  [E]  Engineering                                                                         |
| Prod |       7 boards in the studio, 5 with Gerber files.                                        |
|      |       Last open: PSU-CTRL rev C, Board studio                         [Resume board]      |
|      |  --o------------------------------------------------------------------------------------- |
|      |    |  2 boards have no priced list: PSU-CTRL rev C, LED-DRV-12     [Start a BOM]          |  joint
|      |  --o------------------------------------------------------------------------------------- |
|      |  [S]  Supply                                                                              |
|      |       9 saved lists: 3 draft, 4 quoted, 2 ordered. 1,248 parts in stock, 4 below minimum. |
|      |       Open list: LED-DRV-12 rev B, Components, 12 of 14 lines priced   [Resume list]      |
|      |  --o------------------------------------------------------------------------------------- |
|      |    |  1 quoted list is ready for production: MTR-IO rev A, 500 boards  [Continue to production]
|      |  --o------------------------------------------------------------------------------------- |
|      |  [P]  Production                                                                          |
|      |       3 jobs running, 1 in rework, 2 queued. 3 SMT lines, 14 machines. 2 shifts of 8 h.  |
|      |       Orion · CTRL-01 × 250   [Running]  SMT, stage 5 of 12   ▬▬▬▬▮▭▭▭▭▭▭▭                |
|      |       Vega · MTR-IO × 500     [Rework]   QA line, stage 9 of 12                           |
+------+------------------------------------------------------------------------------------------+
```

Sample figures above are illustrative; the build shows real counts only.

**Lane anatomy (rows, not cards).** Classes `.hub`, `.hub-lane[data-line]`, `.lane-head`, `.lane-facts`, `.lane-resume`, `.hub-joint`. Content column max 1200 px. Lanes are separated by 1 px `--rule`, 24 px padding above and below, no boxes.

- Lane head: a 40 px square (5 px radius) in the line's field ink with its white glyph, then the lane name as an `h2` at Display size in `--text`. Nothing sits above the name. The whole head is a link to the line.
- One sentence of real counts at Body size in `--text`, numbers at weight 600 with tabular figures. Each number is a link to the page it counts (the Inventory "Needs attention" filter for "4 below minimum", which is what replaces the Alerts page). Zero is written as a word ("No jobs running").
- One resume row: the last record touched in that line, its name in the identifier face where it is an identifier, where it stands, and one secondary button. If nothing was ever opened, the row is the line's empty-state sentence and its creating action.
- The Production lane additionally lists up to three active jobs as one-line rows: customer, board and quantity, lamp, stage name, the stage track at 12 px. This is the only place the hub shows a lamp, and it is the first thing readable from across the room.
- No panel, no icon beside the counts, no percentage rings, no sparklines, no large numerals.

**Joints (the flow between lines).** A joint is a 44 px strip on `--surface` between two lanes. At its left, under the lane heads, two Route nodes (the upstream ink above, the downstream ink below) joined by a 2 px vertical hairline: the Route drawn vertically. Then one sentence saying what is waiting to cross and for which records, and the single hand-off button that performs it. A joint with nothing waiting collapses to "Nothing waiting" in `--t3`.

**First run.** With no boards and no parts, the Engineering lane's resume row is "No board loaded. Add a Gerber ZIP, a .kicad_pcb, a .pos file or a .glb." with [Add files] as the page's one primary button and "Load sample data" as a quiet text button beside it (the existing `loadSamples`; keep `aria-label="Get started"` on that row). The other two lanes read "Starts when a board has a BOM." and "Starts when a quoted list is continued to production." in `--t3`. While counts load, the lane names render at once and each number is a 24 × 12 px skeleton bar.

**Counts and their sources (all already in the client; nothing invented).**

| Sentence part | Source |
|---|---|
| Boards in the studio, with Gerber files | `boards` state (`semicobot-boards-v1`), `activeBoardId`; the built-in `referenceBoard` is labelled sample and not counted |
| SMT lines, machines | `production.machines` (`m.kind==='SMT line'`), `floorSummary` and `stationsOf` in `src/production.js` |
| Boards without a priced list | boards with no entry in `loadLists()` (`src/savedLists.js`) |
| Saved lists by status | `loadLists()` grouped by `status` (draft, quoted, ordered, archived) |
| Open list and its step | `semicobot-bom-tool-v1`, step index against `STEPS` in `src/BomTool.jsx` |
| Parts in stock, below minimum | `parts` state (`semicobot-parts-v1`) and the existing `alerts` derivation in `main.jsx` |
| Quoted lists ready for production | lists with status `quoted` and no `jobId` |
| Jobs running, rework, queued; the job rows | `production.jobs` with `stageInfo(job)`, `job.rework`, `STAGES` |
| Shifts | `calendarOf(production)`, `calendarText` |

**Responsive.** 1024: the same; lane names at 22 px. 768: the same with the bottom bar. 375: lanes stack with 16 px padding; the sentence wraps to three or four lines; the resume action is a full-width secondary button; the Production lane shows one job row; a joint is two lines of text and a full-width button.

**Checked against the refusals.** No label above any heading. No grid of same-size icon cards: three unequal text lanes with joints between them, no boxes. No hero metric: counts are inside sentences at body size. No gradient text, no glass. No thick coloured side border: ink appears only as the 40 px lane head and the Route nodes.

### Help sheet

Opened by the `?` icon button in the band (`.help-open`, after the currency switch), the `?` key anywhere outside a field, or Help in Search and jump. A native `<dialog>` docked to the right edge (`dialog.help-panel`): full height, `min(440px,100vw)` wide, `--surface` (`--float` in dark), a 1 px `--rule` on its left edge, no radius; it slides 24 px in over `--dur-3`. Focus starts in the search field; Esc or the backdrop closes it and focus returns to the opener.

Order, top to bottom: the search field (`Search help: Gerber, quotation, stock, dispatch…`); **On this page** (the open page's name, its one-sentence purpose and its how-to lines, on the line's soft ink with a 3 px line-ink rule on the left); **Tours** (one row each: a 32 px line-ink square with the line glyph, or the Bench-ink square with a play glyph for the whole-flow tour, the title, the purpose and the step count, then `Done` with a check when finished and a Start or Again button); **Every page** (grouped under each line's 20 px glyph square, each page a disclosure row with its purpose, opening to the how-to lines and `Open <page>`); **Keyboard**; **Sample data** (Load or Remove). Searching filters Every page by page name, line name, purpose and how-to words and hides the other sections.

### Tour

Four tours, three to seven steps each (impeccable onboarding): *From board to shipped job* and one per line. Content in `src/help.js`, behaviour in `src/Help.jsx`.

- A step opens its page, waits for its control (up to 4 s, pages load on demand), scrolls it into view and lights it: `.tour-spot` is a box at the control's rectangle plus 6 px, 8 px radius, a 2 px ring in the line's fg ink and a `200vmax` spread shadow at `rgba(16,23,30,.42)` (`rgba(0,0,0,.58)` dark) that dims the rest. Nothing blocks the pointer: the page stays usable during a tour.
- The card (`.tour-card`, 360 px, `--float`, 3 px top rule in the line's fg ink, `--shadow-3`) sits below, above, right or left of the control, whichever fits inside a 16 px margin, else docks bottom-centre; under 640 px it always docks, above the bottom bar. It carries the tour name and `Step 2 of 7` (live region), a segment track (past `--rule`, current line ink), the step title (focused on every step) and one or two sentences, then `Skip tour` (text button) and `Back` / `Next` or `Done`.
- Keys: Esc ends the tour, the right and left arrow keys move. Reduced motion removes the spotlight's glide.
- Home shows a one-line offer above the lanes until the first tour is taken or set aside (`New here? … [Take the tour] Not now`), once per account. Finished and closed tours are kept per account (`semicobot-tours-v1:<account>`).

### Sign-in surface

One screen, replacing the marketing page in `Intro.jsx` (video, veil, hero, feature list, counters, animated line art all go). `data-line` absent. Bench ground; Bench-ink band, 52 px, holding only the Route mark and "Industriverse PCBA".

- At 1024 and up, two columns centred in a 960 px row, 64 px apart. Left: `section.intro-admin[aria-label="Admin"]`, a `--surface` panel 400 px wide, 1 px `--rule`, 8 px radius, padding 24 px, no top stripe and no shadow. Heading `h1` at Title size: "Sign in", or "Create the admin account" on first run. `.intro-form`: Email, Password (and Name on first run), labels above; one primary button in ink; the server's message in `.intro-error` using the standard error pattern; when the server is down, the notice pattern with "The server did not answer. Try again." When sign-in is not enabled (`auth.enabled` false), the panel holds the heading "Open the workspace" and one primary button "Open", wired to `onOpen`.
- Right: the Route drawn static and large. "Industriverse PCBA" at Display size, then three rows, each a 40 px ink square with its glyph, the line name at 16 / 600 and one plain sentence in `--t2`: "Boards, Gerber files, part models and the 3D SMT line." / "Bare PCB, components, prices, stock and vendors." / "Jobs, stages, shifts and kitting." The squares are joined by a 2 px vertical hairline. This is the product's real structure, not a claim.
- Under 1024 the form comes first and the three rows follow. At 375 the panel is full width with 16 px page padding.
- `.intro-loading` keeps the Bench ground. Focus ring on this screen is Bench ink (light) or `#E9EEF2` (dark).

### Motion

Tokens: `--ease:cubic-bezier(.16,1,.3,1)` (exponential ease-out), `--dur-1:120ms` (hover, press), `--dur-2:180ms` (menus, tabs, disclosure, the band on a plain line switch), `--dur-3:320ms` (the band on a hand-off). No page-load choreography, no entrance animation on lists or panels, no looping animation except the spinner, the cloud-sync pulse and the 3D simulation itself. Dialog `dlg-in` is shortened to 140 ms.

**The one authored moment: the band changes ink.** When the line changes, the new ink wipes across the band from the rail side to the right edge while the old ink stays visible underneath. Before changing `data-line`, the shell stores the current ink in `--line-prev` on the document element.

```css
.topbar{background:var(--line-prev,var(--line))}
.topbar::before{content:'';position:absolute;inset:0;background:var(--line);animation:band-a var(--band-dur,var(--dur-2)) var(--ease)}
.topbar>*{position:relative}
:root[data-line="engineering"] .topbar::before{animation-name:band-e}
:root[data-line="supply"] .topbar::before{animation-name:band-s}
:root[data-line="production"] .topbar::before{animation-name:band-p}
@keyframes band-a{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}   /* band-e, band-s, band-p are identical; the name change restarts it */
```

`.topbar` is already `position:sticky`, so the pseudo-element needs no new positioning context. The mark cell above the rail changes ink with a plain `background-color` transition of the same duration, so the wipe reads as starting at the rail.

On a hand-off ("Continue to production", "Start a BOM" from the hub, "Open its BOM") the same wipe runs at `--dur-3` (the shell sets `--band-dur:var(--dur-3)` on the document element for that navigation and clears it afterwards) and the toast names the result with the Route line: "Job created from CTRL-01 rev B". Everything starts from a visible state; nothing fades in from nothing. The existing global `prefers-reduced-motion:reduce` block makes it an instant colour change.

### Browser surfaces

```css
:root{accent-color:var(--accent);caret-color:var(--accent);scrollbar-color:var(--border) transparent}
::selection{background:var(--accent);color:var(--on-accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:inherit}
.lamp:focus-visible,.rail-tile.selected:focus-visible{outline-color:var(--text)}
.table-scroll,.palette-list,.line-tabs,dialog{scrollbar-width:thin}
.line-tabs{scrollbar-width:none}
a,.text-button{text-decoration-thickness:1px;text-underline-offset:3px}
td,th,input[type=number],.numeric{font-variant-numeric:tabular-nums}
input::placeholder{color:var(--t3);opacity:1}
input:-webkit-autofill{-webkit-text-fill-color:var(--text);box-shadow:inset 0 0 0 40px var(--surface)}
kbd{font:500 12px var(--mono);border:1px solid var(--rule);border-radius:var(--r-sm);padding:0 4px}
```

- Focus ring: 2 px in the line's accent, 2 px offset (6.0:1 or better against Bench in every line; white on the band because `--accent` is white there).
- Scrollbars use only the standard `scrollbar-color` and `scrollbar-width`; no `::-webkit-scrollbar` restyling. The page scrollbar stays at platform width so a gloved finger or a cheap mouse can grab it.
- `color-scheme:light` and `dark` stay on the two theme blocks so native date pickers, selects and checkboxes follow the theme; `accent-color` paints native checkboxes, radios and range inputs (the simulation scrubber `.factory-scrub`) in the line's ink.
- `meta[name=theme-color]`: the active line's field ink; hub and sign-in `#131B23` (light) and `#1B242D` (dark). The static tags in `index.html` take those two values, and the setter at `main.jsx` line 73 (today `#f3f4f1` / `#000000`) writes the line ink.
- Theme default: the inline script in `index.html` uses the saved value, else dark only when the OS asks for it (`matchMedia('(prefers-color-scheme: dark)').matches`), else light, and light on error. `main.jsx` line 72 falls back to `'light'`.
- `document.title`: "BOM tool · Supply · Industriverse PCBA"; on the hub "Industriverse PCBA".
- Print (quotation preview): white ground, black text, line inks kept only on the Route.

### Iconography

`lucide-react` stays, default 2 px stroke with round caps and joins. Sizes normalised to 16 px in buttons, tabs and tables, 20 px in the band's icon buttons, 24 px in rail tiles and lane heads (today's mixed 15, 17, 18, 19 px sizes go). One authored glyph in the same grammar, `ReelIcon` (24 px grid, 2 px stroke, round caps: circle r 9, hub circle r 2.5, three r 1.25 circles at 120° on a 5.5 px radius), plus the product mark. Lamp shapes are filled glyphs: triangle (running), two bars (hold), square (stopped), hollow circle (queued), check (done). No emoji and no Unicode arrows or bullets standing in for icons: the 13 literal `→` characters left in JSX after the deletions (`FactoryLine.jsx` 3, `SavedLists.jsx` 3, `main.jsx` 3, `Board.jsx`, `BoardFlow.jsx`, `BomAnalysis.jsx`, `Purchases.jsx` 1 each; the 4 in `Help.jsx` and `ProcessFlow.jsx` go with those files) become `ArrowRight` icons or the word "to".

## 8. Do's and Don'ts

### Do:

- Do keep the band and the selected rail tile in the same ink on every screen of a line.
- Do make every primary button Bench ink, in every line.
- Do write the state word in every lamp and badge.
- Do right-align numbers and use tabular figures in every column of quantities, prices and dates.
- Do show source and age under every price.
- Do set every identifier whole, in the identifier face.
- Do use `--accent` for exactly: current tab on the page, current step, selection, links, focus, checked controls.
- Do put the destination line's glyph on any control that leaves the current line.
- Do test every screen in the light theme first, at arm's length and at three metres.

### Don't:

- Don't use a line ink for a state or a lamp colour for navigation.
- Don't put a label in uppercase or with letter-spacing above a heading; `.eyebrow` and `.nav-label` are gone.
- Don't use a coloured left or top edge thicker than 1 px on panels, notices, rows or the sign-in panel.
- Don't build a page from a grid of equal icon cards, or lead with a big number and a small label.
- Don't add resting shadows, gradients, blur or glass.
- Don't set text below 12 px, and don't use the mono for prices, counts, labels or headings.
- Don't draw navigation as anything but tabs and tiles: no station rings, no drafting line types, no title blocks.
- Don't show a percentage where a stage name is known.
- Don't bring back the warm paper ground, the copper accent or IBM Plex.
- Don't print "semi-cobot", "enclosure", "box" or "mould" anywhere.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, Vite, three.js, lucide-react, jsPDF. One global stylesheet, `src/style.css`, driven by custom properties on `:root` and `:root[data-theme="dark"]`, plus seven small panel stylesheets in `src/factory/*.css` that use the same tokens. No CSS framework. A local Node server (`server.mjs`, `api.mjs`) or the hosted worker (`hosted.mjs`) holds sign-in, caches and every supplier key. Secrets are read server-side from `.env` only and never reach client code.

## Users

One small or mid-size Indian electronics manufacturer (EMS / PCB assembly shop, 10 to 200 people). Three roles, often the same person wearing two hats.

- **Design or process engineer** (Engineering). At a desk with a large monitor and a mouse. Opens a customer's Gerber package, checks the board in 2D and 3D, attaches part models. Long sessions, sometimes in the evening with the dark theme.
- **Buyer or estimator** (Supply), often the owner. At a desk under office tube light with a spreadsheet, vendor quotes and a phone beside the keyboard. Turns a board into a priced bill of materials and a quotation, chases prices, keeps stock, purchases and vendors current. Thinks in ₹, quotes some customers in $.
- **Production supervisor or line lead** (Production). Standing on the floor under bright 5000 K LED light, at a wall screen, a shared PC or a tablet on a trolley, sometimes in ESD gloves, interrupted constantly. Reads a job's stage from one to three metres away, ticks a stage, moves a job to another line or shift, runs the 3D SMT line simulation before a job is released and keeps the machines list current.
- **Admin** (any of the above). Signs people in, manages the team, reads the home hub.

Use scenes:

1. 10:40, engineer's desk. A customer mails a Gerber ZIP. She drops it on Board studio, flips to 3D, checks the bottom side, reads "47 components, 39 with part numbers", and sends the board to the BOM tool.
2. 14:15, buyer's desk. He opens the BOM tool at Components, gets prices, moves two lines to own stock, asks one authorised distributor for a quote, sets the margin, prints the quotation in ₹ and switches to $ for an export customer.
3. 07:55, line side, tablet in a gloved hand. The supervisor opens Production, sees a job held at the QA incoming gate, passes the gate, ticks masking done, and moves a second job to line 2 for the afternoon shift.

## Product Purpose

Industriverse PCBA takes one customer board from files to shipped assemblies inside one site with exactly three lines:

1. **Engineering**: the board. Board studio (2D and 3D board, Gerber reading and rendering, part 3D models as GLB) and the board types library.
2. **Supply**: the BOM tool for the bare PCB and its components only (Bare PCB, Components, Analysis, Quotation), saved lists with revisions, part master, inventory and purchases, vendors.
3. **Production**: production jobs, the twelve factory stages with their quality gates, shifts, kitting, masking, moving a job; the 3D SMT line simulation; the factory floor (SMT lines, their stations and the other machines); dispatch.

One board is selected at a time, and it is the same board on every line.

Success: a board uploaded in Engineering becomes a priced list in Supply and a running job in Production without anything being typed twice; a buyer can answer "what does this board cost, from whom, and how sure are we"; and anyone can tell from across the room which job is running, held or stopped.

## Positioning

The thin, exact layer between the EDA tool and the ERP for a small manufacturer: what the files say, what it costs today, where the job stands. Part data and prices are real or absent. A part number, value, price or stock figure is shown only when a file, a supplier or the user supplied it; everything else reads "Not available". Every price carries its source and its age. Prices are checked in a fixed order: own stock, authorised distributors, registered vendors, open market.

## Operating Context

- Files in: Gerber ZIP (X2/X3 attributes), `.kicad_pcb`, pick-and-place `.pos`, `ibom.html`, BOM as Excel or CSV, GLB part and board models.
- Documents out: quotation PDF (`src/quotePdf.js`), request-for-quotation mail (`src/rfq.js`), Excel exports.
- Prices are looked up in this order: own stock, authorised distributors, registered vendors, open market. Distributor keys are set on the server only; no page lists or configures them.
- Money in INR or USD, switchable at any time from the band (`CurrencyProvider` in `src/currency.jsx`); INR uses Indian digit grouping (`en-IN`).
- Records live in the browser (localStorage keys use the `semicobot-*` prefix) with optional cloud sync; the server holds keys, sign-in and caches.
- Floor conditions: 5000 K LED light, glare on the glass, viewing distance up to three metres, gloved or hurried touches, shared machines, unreliable Wi-Fi.
- Light and dark themes both ship. Light is the default.
- Shop vocabulary that stays as it is: BOM, MPN, DNP, Gerber, bare PCB, SMT, THT, AOI, SPI, reflow, stencil, kitting, MOQ, RoHS, date code.

## Capabilities and Constraints

The only pages that exist:

| Line | Pages (tabs, in order) |
|---|---|
| Home | the three-line hub |
| Engineering | Board studio · Board types |
| Supply | BOM tool · Saved lists · Part master · Inventory · Purchases · Vendors |
| Production | Jobs · SMT line · Machines · Dispatch |
| (no line) | Sign-in; the account menu (Team for admins, Sign out); Help (side sheet) and the tours |

- The BOM tool has four steps: Bare PCB (required), Components (required), Analysis (optional), Quotation.
- Shifts, kitting, masking, group by setup and move job live inside Jobs. Part models are attached in the Board studio inspector.
- Vendor kinds: Semiconductor, Distributor, Passive, PCB, Test lab, Logistics.
- Removed entirely: the enclosure ("the box") and the mould. Not shown, not priced, not fetched, no enclosure or mould vendor kinds, no enclosure line in a quotation or a saved list.
- Parts below minimum are a count on the Inventory tab, a filter inside Inventory and a sentence on the hub; there is no separate alerts page and no dashboard.
- Help is a side sheet, not a page: the page you are on first, the tours, every page with what it is for and how to use it, keyboard shortcuts, sample data. Opened with the ? button, the ? key or Search and jump.
- Tours (following the impeccable onboarding rules): *From board to shipped job* and one per line, three to seven steps each. A step opens its page and lights the real control; the page stays usable; Skip tour and Esc always work; Home offers the first tour once per account; every tour can be taken again from Help.
- Layouts work at 1440, 1024, 768 and 375 px.

## Brand Commitments

- Name: "Industriverse PCBA". The old name "semi-cobot" appears nowhere a user can read.
- Line names are fixed and always in this order: Engineering, Supply, Production. Each has one ink (teal, plum, blue) and one glyph (layers, reel, factory); the three never change places.
- Real data only; unknown is written "Not available".
- All secrets stay server-side.
- No logo asset exists. The mark is the Route (three joined squares) and the name is set in type.

## Evidence on Hand

- Real workspace counts: boards, saved lists by status, parts and parts below minimum, vendors, jobs by stage.
- Sample boards and data under `public/samples` and `public/data`, always shown with the "Sample data" label (`.demo-label`).
- Real distributor responses when keys are set in `.env`.
- No customer names, logos, testimonials or performance claims exist; none may be invented.

## Product Principles

1. The line you are in is never in doubt.
2. State is readable from three metres; detail from sixty centimetres.
3. Real data or "Not available". Say where a number came from, and when.
4. Position, not percentage. A job is "at Reflow" or "held at QA incoming", never "62 %".
5. A record crosses lines by one explicit hand-off, and both sides show it.
6. Ink acts, line colour locates, lamp colour reports. The three never swap jobs.
7. Dense where people read, large where people touch.
8. Nothing on screen that is not one of the three lines.

## Accessibility & Inclusion

WCAG 2.2 AA in both themes. Body and placeholder text at least 4.5:1; control boundaries and focus rings at least 3:1. Line identity is never colour alone (position, glyph and name always accompany the ink). State is never colour alone (every lamp and badge carries its word and a shape). Visible keyboard focus everywhere; native `<dialog>` focus trapping; `prefers-reduced-motion` removes the one authored motion. Pointer targets at least 44 px on coarse pointers and 56 px in Production on coarse pointers. Minimum text size 12 px. Identifiers are set in a face with a dotted zero so `0` and `O` cannot be confused.

## Voice and copy rules

- Plain workshop English, sentence case everywhere (headings, buttons, table headers). No uppercase labels, no exclamation marks, no marketing adjectives, no "Welcome", no emoji.
- A control names its action and its object: "Get prices", "Save list", "Ask quote", "Continue to production", "Move job", "Pass gate", "Add part model". Never "Submit", "OK", "Go", "Proceed".
- Status is always a word beside its colour: Queued, Running, Hold, Rework, Stopped, Done; In stock, Low, Short; Draft, Quoted, Ordered, Archived.
- Price provenance words are fixed: "Own stock", "Authorised", "Registered vendor", "Open market · unverified". The age of a price reads "fetched 2 h ago".
- Unknown data: "Not available", never a dash alone, never zero. Missing input says what is missing and where to add it: "No part number in the files. Add the BOM or the .kicad_pcb in Board studio."
- Errors name the problem and the recovery: "Mouser did not answer. Prices from the other sources are shown. Retry".
- Numbers: INR as `₹1,24,500.00` (Indian grouping), USD as `$1,245.00`, two decimals for totals and up to four for unit prices below ₹10. Never two currencies in one column; the column header carries the currency. A no-break space (U+00A0) between a value and its unit: `100 nF`, `1.6 mm`, `245 °C`, `14 days`. Dates as `12 Nov 2026`.
- Identifiers are never reworded or truncated in the middle: part numbers, designators, serials, quotation numbers and file names are shown whole in the identifier face.
- No arrow characters in interface text (the UI face has no arrow glyph). A hand-off is written "Engineering to Supply" or drawn with an icon.
- One name per thing: "Bare PCB" (not blank board, not fab), "Saved list" (not project), "Job" (not order, not work order), "Line" for the three sections, "SMT line" for a machine line.
- Words that never appear in the interface: enclosure, box, mould, dashboard, overview, alerts, semi-cobot.

## What the product is not

- Not an enclosure, mould or mechanical-BOM tool.
- Not an ERP, MES or accounting system: no invoices, payroll, GST filing or machine telemetry.
- Not an EDA editor: it reads and shows boards, it does not route or edit copper.
- Not a marketplace or checkout: it compares offers and writes quote-request mails; it never places an order.
- Not a guesser: no invented part numbers, prices, lead times or stock.
- Not a marketing site and not a wall of KPIs: no intro page, no feature grid, no bento. The hub is three lines and the flow between them. Tours teach the real product; there is no separate demo mode.

# Industriverse PCBA

A workspace for a small or mid-size PCB assembly shop. It takes one customer board from files to shipped assemblies in exactly three lines: **Engineering**, **Supply** and **Production**. Built with React 19, Vite, three.js, lucide-react and jsPDF; a small Node server (or one Vercel Function) holds sign-in, caches and every supplier key.

- Product scope, users and copy rules: [`PRODUCT.md`](PRODUCT.md)
- Design system ("Benchlight": tokens, shell, components): [`DESIGN.md`](DESIGN.md)

## The three lines

| Line | Pages (tabs, in order) | What happens there |
|---|---|---|
| Home | Hub | The three lines and the flow between them, with real counts from the workspace. |
| Engineering | Board studio · Board types | Open a Gerber ZIP, `.kicad_pcb`, pick-and-place `.pos` or `ibom.html`; check the board in 2D and 3D; attach part models (GLB) in the inspector; keep the board types library. |
| Supply | BOM tool · Saved lists · Part master · Inventory · Purchases · Vendors | Turn a board into a priced bill of materials and a quotation; keep saved lists with revisions; maintain the part master, stock, purchase orders and vendors. |
| Production | Jobs · SMT line · Machines · Dispatch | Production jobs through the twelve factory stages and their quality gates, with shifts, kitting, masking, group by setup and move job; the 3D SMT line simulation of the selected board; the factory floor (SMT lines with their stations, other machines and their details); dispatch of finished boards. |

Sign-in sits in front of all of it when the server asks for it; the account menu holds Team (admins) and Sign out.

**Help and tours.** The ? button in the top bar (or the ? key) opens Help: the page you are on first, then four tours, every page of every line with what it is for and how to use it (searchable), the keyboard shortcuts and the sample data switch. The tours are *From board to shipped job* (seven steps across the three lines) and one per line (Engineering, Supply, Production). Each step opens its page and lights the real control; the page stays usable, Esc or Skip tour ends it, the arrow keys move. Home offers the first tour once per account; finished and closed tours are remembered per account in `semicobot-tours-v1:<account>`. Search and jump (Ctrl K) also lists Help and every tour. The content lives in `src/help.js`, the panel and the tour in `src/Help.jsx`.

**One selected board for all three lines.** The board you add (a Gerber in Board studio or in BOM step 1) or pick (in Board studio, or in the "Board" picker in the heading of every line page) is the selected board everywhere: Board studio and the SMT line show it, the BOM tool opens its BOM, and Production's new request is filled with it (Jobs can show only that board's jobs). The BOM tool keeps one BOM per board: switching boards puts the open BOM aside as that board's draft (`semicobot-bom-drafts-v1`) and shows the new board's draft, else its newest saved list, else a new BOM built from the board. Selecting the first board again brings its work back. Opening a saved list selects the board it was made from.

**BOM tool steps:** Bare PCB (required), Components (required), Analysis (optional), Quotation. The quotation covers the bare PCB and its components; it is printed as a PDF in INR or USD and the list can be sent on to Production.

**Prices** are checked in a fixed order: own stock, authorised distributors (DigiKey, Mouser, Nexar, TME, Master Electronics), registered vendors, open market. Every price carries its source and its age. A part number, value, price or stock figure is shown only when a file, a supplier or the user supplied it; otherwise the app says "Not available".

**Records** (boards, saved lists, inventory, purchases, vendors, jobs) live in the browser, with optional shared storage in Supabase. Browser storage keys keep their original `semicobot-*` prefix so existing workspaces carry over; older saved records that still hold fields the product no longer uses are cleaned when they load.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run server      # API on http://127.0.0.1:5174 (reads .env)
# in a second terminal
npm run dev         # UI on http://127.0.0.1:5173, proxies /api to the API
```

Open http://127.0.0.1:5173. Both servers bind to `127.0.0.1` only.

Ports (all optional, plain environment variables, never `VITE_`):

- `PORT` (or `API_PORT`): where `npm run server` listens. Default 5174.
- `API_PORT`: where the Vite dev proxy sends `/api`. Default 5174. Set it in the shell for both commands when you move the API.
- `DEV_PORT`: the Vite dev server port. Default 5173. Vite stops with an error if the port is taken instead of silently moving onto the API port.

```sh
API_PORT=6174 npm run server
API_PORT=6174 DEV_PORT=6173 npm run dev
```

On a first run there are no accounts: the sign-in screen creates the first (admin) account. Local accounts are kept in `data/auth.json` (or the file named by `AUTH_FILE`), and part details looked up online in `data/part-info.json`. Both are git-ignored.

## Configuration

Copy `.env.example` to `.env` in the project root and fill in what you have. `.env` is git-ignored and is read only by server code (`server.mjs`, `api.mjs`, `hosted.mjs`, the scripts). Nothing in `src/` reads the environment, and no variable is ever prefixed with `VITE_`, so no key can reach the browser. `/api/status` reports only whether each source is configured (as true or false, never a value); the app uses it to say when prices cannot be fetched.

Variable names:

| Purpose | Variables |
|---|---|
| Authorised distributors | `DIGIKEY_CLIENT_ID`, `DIGIKEY_CLIENT_SECRET`, `MOUSER_API_KEY`, `NEXAR_CLIENT_ID`, `NEXAR_CLIENT_SECRET`, `TME_TOKEN`, `TME_APP_SECRET` (optional `TME_COUNTRY`, `TME_CURRENCY`), `MASTER_SEARCH_API_KEY`, `MASTER_SEARCH_URL` |
| Open market and part details | `SERPAPI_KEY`, `SERPAPI_KEYS` (extra keys, comma-separated, used in turn), optional `SERPAPI_GL` |
| AI helpers (machine and part lookups, board pictures) | `GEMINI_API_KEYS` (or `GEMINI_API_KEY`), optional `GEMINI_MODEL`; `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` |
| Exchange rates | optional `FX_LIVE`, `FX_RATES` |
| Sign-in | `ADMIN_EMAIL` (the only address that can create the first account), `SIGNUP_ALLOW` (addresses, `@domains`, `*` or `none`), `REQUIRE_SIGNIN`, optional `SESSION_SECRET`, `AUTH_FILE` |
| Hosted storage | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`), `SUPABASE_PUBLISHABLE_KEY` (checks only); or Upstash `KV_REST_API_URL`, `KV_REST_API_TOKEN`; optional `KV_PREFIX` |
| Local ports | `PORT`, `API_PORT`, `DEV_PORT` |

Restart `npm run server` after changing `.env`. A source counts as configured when its keys are present; the first successful search is the real check. Automated tests use fixtures and never call a supplier.

## Tests

```sh
npm test                                   # every unit test: node --test tests/*.test.mjs
node --test tests/api.test.mjs             # one file
npm run build                              # production build into dist/
node tests/browser.mjs                     # browser checks (needs both servers running)
```

`tests/browser.mjs` drives the running app with Playwright and the system Chrome (`CHROME_PATH` overrides the macOS default path; screenshots go to `WORK_DIR`). It expects the dev server on 5173 and the API on 5174.

## Scripts

All run from the project root.

| Script | What it does |
|---|---|
| `scripts/make-templates.mjs` | Writes the placement CSV and picture blueprint PDF templates in `public/samples/`. |
| `scripts/make-gerber-sample.mjs`, `scripts/make-gerber-100.mjs` | Write the sample Gerber packages in `public/samples/`. |
| `scripts/make-glb-samples.mjs` | Writes the sample GLB part and board models. |
| `scripts/make-board-types.mjs` | Builds `public/data/board-types.json`. |
| `scripts/make-part-master.mjs` | Builds the bundled part master catalogue in `public/data/`. |
| `scripts/check-supabase.mjs` | Checks hosted storage: writes, reads, counts and deletes one throwaway row, and confirms the publishable key can do none of that. Run with `node --env-file=.env`. |
| `scripts/push-accounts.mjs` | Copies local accounts to hosted storage (`--replace` to overwrite). Prints counts only. |
| `scripts/push-part-master.mjs` | Loads the part master catalogue into Supabase (updates by part number, never doubles rows). |

## Deploy on Vercel

`api/index.js` is the only function (`vercel.json` rewrites `/api/*` to it); the site itself is the static `dist/` build. `.vercelignore` keeps `.env`, `data/`, tests and scripts out of the upload.

1. In Supabase, run `supabase/schema.sql` once in the SQL editor (safe to repeat). It creates the key-value table and counter used for accounts, sign-in lockouts and the part cache, and the shared inventory and part master tables, all with row level security and no rights for the public roles. Table and function names keep their original `semicobot_` prefix; do not rename them.
2. Put `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env`, then run `node --env-file=.env scripts/check-supabase.mjs`.
3. Optional: `node --env-file=.env scripts/push-accounts.mjs` and `node --env-file=.env scripts/push-part-master.mjs`.
4. Add the variables in the Vercel project settings (mark keys as sensitive), with `REQUIRE_SIGNIN=1` and `ADMIN_EMAIL`, then deploy:

```sh
npx vercel link
npx vercel --prod
```

Notes:

- After the admin, nobody can sign up online until `SIGNUP_ALLOW` lists addresses or `@domains`. Sign in soon after the first deploy so nobody else claims the admin address.
- Wrong passwords are counted per account (5 per 15 minutes, shared by every function instance).
- With Supabase connected, everyone who signs in works on one shared stock: parts, purchase orders, the stock-move log and boards used by jobs. Changes travel as deltas through `/api/inventory`, applied server-side in one transaction; the browser never holds a Supabase key.
- Limits: request bodies up to 4.5 MB online (8 MB locally), 300 s per API call. Free Supabase projects pause after 7 quiet days; the app then says so until the project is restored.

## Limits of this version

- Part data and prices are real or absent: sample boards and data under `public/samples` and `public/data` are always labelled "Sample data".
- Board files are read and shown, not edited. No routing, electrical simulation or design-rule checking.
- It compares offers and writes quote-request mails; it never places an order. It is not an ERP or MES: no invoices, payroll, GST filing or machine telemetry.
# industriverse-pcba

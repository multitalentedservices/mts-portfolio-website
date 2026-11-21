# Build Notes — MTS Portfolio Website (Queue #1) — REBUILD

**Built:** 2026-11-21 · **Builders:** AICOS-105 (build) · AICOS-112 (MTS Core design system) · AICOS-115 (QA)
**Trigger:** Asad Ali rejected the pre-pipeline v1 build and ordered a full rebuild from scratch to the queue standard (Gift Basket #2 = 81, Restaurant #3 = 84 — this flagship had to beat both).
**Stack:** hand-coded HTML/CSS/vanilla JS, zero third-party packages/CDN libraries except Google Fonts. No build step.

## Design record (Gate 2)

**Identity — "MTS Core v2": the index as interface.** The site is designed like a printed index crossed with a spec sheet: black ground, white grotesque type at poster scale, one lime signal colour, numbered everything (services 01–08, process 01–05, work #02–#14). Typography is not decoration here — it is the layout. The layout could not belong to another industry: an agency whose product is websites presents itself as a piece of typography-led web craft, and its portfolio section is a numbered production queue, not a gallery of stock mockups.

**References researched (opened 2026-11-21):**
1. **Basement Studio** (basement.studio, Argentina — Awwwards SOTD/Developer Award) — dark, high-tech identity built on a bespoke bold grotesque; proof that a small studio's own type voice can carry an entire site. Studied: dark ground, contrasting grotesque weights, type-as-identity. Not copied: their 3D/WebGL layer (out of scope and out of palette discipline here).
2. **Locomotive** (locomotive.ca, Montreal) — oversized grotesque typography anchored to a modular responsive grid; the presentation itself demonstrates creative implementation. Studied: type scale against a strict grid, numbered/systematic badge language. Not copied: their red/cyan palette and custom icon-typeface.
Plus the internal Design Inspiration Library corporate entries C1 (Stripe — restraint, one idea per screen) and C2 (Linear — dark minimalism, editing discipline).

**Tokens:**
- `--ink #0A0A0B` (ground) · `--ink-2 #121214` (panels) · `--ink-3 #1A1A1D` · `--line #2A2A2E`
- `--paper #F4F4EF` · `--paper-dim #C9C9C2` · `--mut #9A9A93`
- `--lime #A4D65E` (the one accent) · `--lime-deep #7FB53A` (shade) · `--lime-ink #0D1405` (text on lime)
- `--err #FF6F61` — semantic error red, the ONLY extra hue (ladder rule 4)
- Radius: buttons 6px, cards/panels 14px. Buttons 52px min-height; fields 52px / 16px font.

**Type pairing:** Archivo (600/800/900, uppercase, tight tracking, `clamp()` poster scale up to ~9.6rem) for display; Inter (400/600/700) for body and UI. Two families, both via Google Fonts.

**ONE conversion goal:** a submitted lead form (present on Home and Contact). Secondary: WhatsApp click.

**Pages (5):** `index.html` (hero, services index, selected work, process, founder, lead form) · `work.html` (all 13 queue demos, filterable) · `services.html` (8 anchored service sections + full process) · `about.html` (company facts, official logo, founder) · `contact.html` (WhatsApp/email routes + lead form). A flagship agency site is multi-page by nature: each service gets an indexable page-section, and the work queue gets room to grow to 13 entries without bloating the home page.

## Truth rules applied
- No invented clients, revenue, partnerships, statistics, achievements, testimonials or team members — enforced by a test-battery scan (tests.js §9).
- Real facts only: MTS, tagline "Your Partner In Success", Gujranwala Pakistan; founder & CEO Asad Ali (official photo, caption exactly that); primary service Website Development; the other seven services presented as offered services, never as departments with fake proof.
- Work section links ONLY the 13 real queue repos; exactly 2 labelled "Live demo" (the built ones), 11 labelled "In production".
- Contact details are MTS's own published ones (carried from the v1 build record, sourced from serviceshub.netlify.app): talentedservices.official@gmail.com · +92 345 6481855. No BalanceBit names/links anywhere (test-verified).
- Header uses a typographic wordmark (MTS Core is typography-first); the OFFICIAL logo photo (`assets/mts-logo.jpg`, from `~/workspace/user/brand/mts-logo.png`) is featured on About with a caption saying exactly that. No invented logo mark; favicon kept from v1 (on-palette diamond/bars mark).

## Integrations — PRE-WIRED DEMO STUBS (nothing transmits data anywhere)
All integration logic lives in `js/logic.js` (pure, shared with the Node test battery):
- **Lead form → Google Sheet:** `ANALYTICS_CONFIG.sheetTarget` names the pre-wired target (`DEMO Google Sheet: "MTS Leads" (pre-wired, not connected)`). On a valid submit, `appendSheetRow()` appends the row to a localStorage log (`mts-demo-sheet`) that represents the Sheet row, and the success state shows a demo reference (`MTS-DEMO-####`) plus the plain statement that the submission is stored locally only. Validation: name ≥2 chars; contact must be a valid email OR phone; service must be one of the 8 real services; message 10–1000 chars. Errors clear LIVE per-field as the visitor fixes them (logic-level tested).
- **WhatsApp click + tracking:** every WhatsApp link uses the real MTS number pattern `https://wa.me/923456481855?text=…` (the number shown on the page; the build is a labelled demo). Clicks call `track('whatsapp_click', …)`.
- **GA4 / GSC + Meta Pixel:** `ANALYTICS_CONFIG` holds clearly-marked DEMO placeholder IDs (`G-DEMO-PLACEHOLDER`, `DEMO-PIXEL-PLACEHOLDER`). `track()` records `pageview` / `lead_submit` / `whatsapp_click` events to a localStorage log (`mts-demo-analytics`) and the console ONLY. **No request is ever made to Google or Meta** — the test battery asserts the absence of live analytics endpoints (`google-analytics.com`, `googletagmanager.com`, `connect.facebook.net`, `facebook.com/tr`) anywhere in the source.
- **Demo log access:** footer on every page — "View demo log" renders the sheet rows + analytics events; "Reset demo log" clears both. Console handle: `MTS_DEMO.logs()` / `MTS_DEMO.reset()`.

## Ladder mechanics (Portfolio-Queue-Progress lessons 1–13)
Reveal-by-default (hidden state applied by JS only) + IntersectionObserver with 18% rootMargin pre-reveal + unconditional ~2s fallback + reduced-motion instant-visible. Pure logic split (`js/logic.js`) from DOM (`js/main.js`). One component system across all 5 pages. `min-width:0` on grid children; no inline styles anywhere in the HTML (verified by grep); 320px-safe header (wordmark sub-line drops ≤380px). Ken Burns hero motion + marquee, both disabled under `prefers-reduced-motion`. No video attempted (region-blocked 403 — settled, lesson 8).

## Defects found by screenshot QA and fixed (evidence-first)
1. **Footer email overflow (tablet, all pages):** the long mailto link's text spilled out of its footer grid cell (found by the clip-aware audit, confirmed via live rect dump). Fixed with `overflow-wrap:anywhere` + `min-width:0` on footer items.
2. **PRIMARY tag overflow (phone, home):** the tag inside the first service-row name pushed past the row. Fixed by making the tag a block under the name.
3. **Form success state showed form + success together:** CSS `display:grid` on `.lead-form` overrode the `hidden` attribute. Fixed with a global `[hidden]{display:none!important}`. Caught by READING `flow-lead-success.png`, not by any metric.
4. **Mobile-menu CTA lost its button styling:** `.mobile-menu a` (specificity 0,1,1) overrode `.btn` (0,1,0), stripping padding/centering. Fixed with an explicit `.mobile-menu a.btn` rule; verified by computed-style dump (padding-left 0px → 28px).
5. **Service rows broken at phone width (the serious one):** `.svc-arrow{grid-row:1}` made the grid placement algorithm seat the arrow in column 1 FIRST, pushing the number into column 2 and the name into the 30px column, where its text spilled and clipped. The box-based audit reported 0 overflow because the name's BOX stayed inside the viewport while its TEXT overflowed. Fixed by pinning `grid-column:3;grid-row:1` on the arrow — AND the audit was hardened with a leaf-element text-overflow check (`scrollWidth > clientWidth`) so this class can never pass silently again. Before/after evidence: `screenshots/index-phone.png` (broken rows visible in the first pass) vs `screenshots/crop-svc-fixed.png`.

## Media
Generated in the MTS Core look (black/white + lime only), compressed ≤ ~120 KB each, 394 KB total:
`assets/hero-studio.jpg` (98 KB) · `assets/abstract-geometry.jpg` (107 KB) · `assets/process-sketch.jpg` (87 KB) · `assets/asad-ali.jpg` (73 KB, from the official founder photo) · `assets/mts-logo.jpg` (29 KB, from the official logo). One further generated image (abstract work-grid render) failed in the media pipeline and was not retried; typography carries the work section instead — no gap in the design.
**Repo note (owner rule, 2026-11-21 ~20:13 PKT — "Sb Files Complete hon"):** the connector push carries text files only, so the 5 images above are PENDING WEB-UPLOAD to the repo (listed exactly in the delivery report); the repo is "code pushed — images pending web-upload", not complete, until that step runs.

## QA summary
- Tests: `tests.js` → **270 PASS / 0 FAIL** (`tests-output.log`): link/anchor integrity (270 checks incl. per-ref), validation incl. live-clear semantics, stub locality + no-live-endpoint assertions, WhatsApp construction, portfolio data integrity (13 real repos, exactly 2 live), truth guardrails, weights (code 91.9 KB < 400 KB; media 394 KB ≤ 1.6 MB), SEO artefacts.
- Screenshots (`screenshots/`): 5 pages × 390/768/1440 + 320px probe + JS-disabled + reduced-motion runs — final audits: **0 overflow, 0 text-overflow, 0 hidden reveals, 0 broken images** in every run (`audit.json` per folder). Flow captures: mobile menu open, work filter → "2 projects", lead errors, lead success (ref MTS-DEMO-7552), demo-log viewer.
- Keyboard walk: `screenshots/keyboard-walk.md` — Tab order through Contact (16 stops) and Home (8 stops), visible lime focus at every stop; Escape closes the mobile menu.
- All phone screenshots read by eye, page by page, including full-page reads of Home at desktop and phone widths.

**Test-battery disclosure:** NO assertion was amended after the fact. Two QA-harness hardenings were made mid-pass and are disclosed here (they made QA stricter, not looser): (a) the text-overflow audit check added after defect 5; (b) flow + keyboard scripts written fresh for this build.

# janitorialservicesyoungtown.com

Static HTML microsite for Youngtown Janitorial Services (West Valley, AZ). No build step, no framework — plain HTML/CSS plus vanilla JS and one Vercel serverless function.

## Structure

- Every page is `<dir>/index.html` (clean URLs). Root `index.html` is the homepage.
- `styles.css` — single shared stylesheet, including the `/* Quote wizard */` block and generic `.btn`/`.data-table` styles used by blog posts.
- `js/quote-form.js` — loaded on every page. UTM-capture only (`captureUtm()` into `localStorage`).
- `assets/js/quote-wizard.js` — loaded only on `/request-a-quote/`. Drives the multi-step CRM quote wizard (`[data-quote-wizard]` scaffold): qualifying questions, appointment booking, review/confirm, then POSTs to `/api/submit-lead`.
- `api/submit-lead.js` — Vercel Node serverless function. Validates and proxies the wizard's CRM-QM `push_lead` payload with the Bearer token held server-side (`CRM_API_TOKEN` env var). Prepends a `SITE_SOURCE_TAG` (`Site: janitorialservicesyoungtown.com`) into every lead's notes, since `CRM_API_TOKEN` is shared across a larger portfolio of sites and the CRM has no dedicated site-id field.
- `blog/` — 25 posts + `blog/index.html` hub, static HTML matching the same header/nav/footer/JSON-LD contract as every other page (`LocalBusiness` only — no `Article`/`BlogPosting` schema, no byline/date).
- `sitemap.xml`, `robots.txt` — kept in sync manually; add new pages to both.

## Quote flow

- Home hero is a short teaser form (`[data-lead-teaser]`, name/phone/sqft) that GET-submits to `/request-a-quote/`, which prefills the wizard via query params.
- `/request-a-quote/` runs the full wizard. `/contact/` links to `/request-a-quote/` rather than embedding a form.
- The old one-step `.quote-form-box` submit flow has been retired; do not reintroduce a `data-lead-form`-style handler in `js/quote-form.js`.

## Conventions

- Every page shares the same header/nav/footer markup — copy an existing page in the same section rather than building markup from scratch.
- Every page must include `<script src="/js/quote-form.js"></script>` before `</body>`. `/request-a-quote/` additionally loads `<script src="/assets/js/quote-wizard.js" defer></script>`.
- Phone number `(866) 958-8773` and email `ops@thequotemasters.com` appear on every page — do not change without updating all pages (44 core pages + 26 blog pages = 70 total).
- Footer `.footer-bottom` ends with a "Built and Maintained by Infin8Content" credit linking to `https://infin8content.com/` (`target="_blank" rel="noopener"`) — keep this on every page, including new ones.
- No testimonials, star ratings, or Review/AggregateRating schema (FTC compliance — see `QA.md`).
- No street address anywhere (service-area model, not a storefront).
- No fabricated pricing figures or named-study citations anywhere, including blog posts — `/pricing/` uses "contact for quote" language only.

## CRM integration

Leads submitted through the quote wizard go to CRM-QM via `/api/submit-lead.js`, never directly from the browser. The Bearer token must never appear in client-side code, HTML, or be committed to this repo — it lives only in the Vercel `CRM_API_TOKEN` environment variable. See `.env.example` and `HANDOFF.md` for details.

## Deploy

Vercel project is connected to this repo's `main` branch — push to deploy, no CLI needed.

## Docs

- `HANDOFF.md` — current project status and what's been done.
- `QA.md` — content/copy/schema QA checklist from the initial 43-page build.

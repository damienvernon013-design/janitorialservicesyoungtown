# janitorialservicesyoungtown.com

Static HTML microsite for Youngtown Janitorial Services (West Valley, AZ). No build step, no framework — plain HTML/CSS plus a small amount of vanilla JS and one Vercel serverless function.

## Structure

- Every page is `<dir>/index.html` (clean URLs). Root `index.html` is the homepage.
- `styles.css` — single shared stylesheet.
- `js/quote-form.js` — loaded on every page. Captures UTM params into `localStorage`; wires up `.quote-form-box` submit buttons to POST to `/api/submit-lead`.
- `api/submit-lead.js` — Vercel Node serverless function. Proxies quote-form submissions to the CRM-QM `push_lead` API with the Bearer token held server-side (`CRM_API_TOKEN` env var).
- `sitemap.xml`, `robots.txt` — kept in sync manually; add new pages to both.

## Conventions

- Every page shares the same header/nav/footer markup — copy an existing page in the same section rather than building markup from scratch.
- Every page must include `<script src="/js/quote-form.js"></script>` before `</body>`.
- Phone number `(866) 958-8773` and email `ops@thequotemasters.com` appear on every page — do not change without updating all 44 pages.
- No testimonials, star ratings, or Review/AggregateRating schema (FTC compliance — see `QA.md`).
- No street address anywhere (service-area model, not a storefront).

## CRM integration

Leads submitted through the quote form go to CRM-QM via `/api/submit-lead.js`, never directly from the browser. The Bearer token must never appear in client-side code, HTML, or be committed to this repo — it lives only in the Vercel `CRM_API_TOKEN` environment variable. See `.env.example` and `HANDOFF.md` for details.

## Deploy

Vercel project is connected to this repo's `main` branch — push to deploy, no CLI needed.

## Docs

- `HANDOFF.md` — current project status and what's been done.
- `QA.md` — content/copy/schema QA checklist from the initial 43-page build.

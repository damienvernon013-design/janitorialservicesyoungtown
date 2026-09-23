# Handoff — janitorialservicesyoungtown.com

**Status: READY TO LAUNCH — pending one manual browser test (see below)**

Static HTML microsite for Youngtown Janitorial Services (West Valley, AZ). Deploys to Vercel from this git repo (project already connected — no CLI/manual deploy step needed).

## What's in this repo

- 70 static HTML pages: 44 core pages (43 content pages + `/privacy-policy/`) plus `blog/` (25 posts + hub). Plain CSS (`styles.css`), no build step, no framework.
- `/api/submit-lead.js` — Vercel serverless function (Node). Validates and forwards the quote wizard's submission to the CRM-QM `push_lead` endpoint with the Bearer token attached server-side.
- `/assets/js/quote-wizard.js` — client script loaded only on `/request-a-quote/`. Multi-step quote wizard: qualifying questions, appointment-slot booking (CRM-enforced weekday/lead-time rules), review/confirm, then POST to `/api/submit-lead`.
- `/js/quote-form.js` — client script loaded on every page. UTM-capture only.

## Quote wizard / CRM integration

The original one-step quote form (`onclick="alert(...)"` stub, later a simple name/phone/email POST) has been replaced with a full multi-step CRM-integrated wizard, matching the pattern used on other sites in this portfolio:

1. Home hero is a short teaser form (name, phone, approx sq ft) that GET-submits to `/request-a-quote/`, which prefills the wizard from the query string.
2. `/request-a-quote/` runs the wizard: cleaning frequency, current situation, service-quality questions, number of companies to meet, appointment slot(s), then company/contact details (company name, position, address, phone, email).
3. On confirm, the wizard POSTs a CRM-shaped payload to `/api/submit-lead`, which validates it server-side (phone/email format, appointment date rules, same-day slot spacing) and forwards it to `https://thequotemasters.com/crm_api/api.php?action=push_lead` with `Authorization: Bearer <CRM_API_TOKEN>`.
4. `api/submit-lead.js` prepends `SITE_SOURCE_TAG` (`Site: janitorialservicesyoungtown.com`) into `customer.notes` on every submission. `CRM_API_TOKEN` is shared across multiple sites in this portfolio and the CRM's `push_lead` schema has no dedicated site-id field, so this tag is the only way a lead traces back to this domain — do not remove it.
5. Token lives only in the Vercel environment variable `CRM_API_TOKEN` — never shipped to the browser, never committed to the repo.

**Action required before go-live (if not already done):** confirm `CRM_API_TOKEN` is set in Vercel → Project Settings → Environment Variables (Production + Preview). See `.env.example` for the variable name.

**Still needed — real browser test:** the wizard has been verified structurally (all `data-wizard-*` hooks present, both JS files pass `node --check`, no leftover values from the reference site this was adapted from) but has not been clicked through end-to-end in an actual browser, and no real submission has been confirmed landing in CRM-QM. Do this on a Vercel preview deploy before relying on it in production.

## Blog section

`blog/` contains 25 posts + a `blog/index.html` hub, covering contracts, pricing guidance (no dollar figures — this site uses "contact for quote" language only), scheduling, compliance, and facility-type-specific guides. Linked from the nav (`Blog`, between FAQ and About) on all 44 core pages, and included in `sitemap.xml` with `changefreq weekly`. Header/nav/footer/JSON-LD (`LocalBusiness` only, no byline or publish date) are identical across every post, generated from a shared template to avoid drift.

## UTM tracking

`js/quote-form.js` captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from the query string into `localStorage` under `qjs_utm`. `assets/js/quote-wizard.js` separately captures UTM params into `sessionStorage` for its own submission (`utmSource` field, resolved from `utm_source`, referrer domain, or `direct`).

## Site content

- Full QA checklist for content/copy/schema is in `QA.md` (43-page build, all items passed as of 2026-08-17). The blog build re-ran the same checks (no fabricated pricing/credentials, no testimonials/reviews, no street address, zero cross-portfolio links) — all passed.
- `/privacy-policy/` was referenced in every page footer but did not exist — added in the initial build.
- Footer credit line — every page's `.footer-bottom` ends with "Built and Maintained by Infin8Content" linking to `https://infin8content.com/`.

## Deploy

Vercel project is already connected to this repo. Pushing to `main` triggers a deploy — no manual/CLI deploy step needed. Confirm `CRM_API_TOKEN` is set in Vercel env vars, and complete the real-browser wizard test above, before relying on the quote flow in production.

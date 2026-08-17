# Handoff — janitorialservicesyoungtown.com

**Status: READY TO LAUNCH**

Static HTML microsite for Youngtown Janitorial Services (West Valley, AZ). Deploys to Vercel from this git repo (project already connected — no CLI/manual deploy step needed).

## What's in this repo

- 44 static HTML pages (43 content pages + `/privacy-policy/`), plain CSS (`styles.css`), no build step, no framework.
- `/api/submit-lead.js` — Vercel serverless function (Node). Receives quote-form submissions from the browser and forwards them to the CRM-QM `push_lead` endpoint with the Bearer token attached server-side.
- `/js/quote-form.js` — client script, loaded on every page. Captures UTM params from the URL into `localStorage` on first touch, and wires up the `.quote-form-box` submit button (present on the homepage and `/request-a-quote/`) to POST to `/api/submit-lead`.

## Contact form / CRM integration

The homepage and `/request-a-quote/` both had a quote form that was previously a UI stub (`onclick="alert(...)"`, no real submission). This is now wired end-to-end:

1. Browser collects: name, phone, email, zip, facility type, approx sq ft, notes, plus `utm_source` recovered from `localStorage`.
2. POSTs JSON to same-origin `/api/submit-lead`.
3. The serverless function builds the CRM-QM `push_lead` payload (splits name into first/last, folds facility type + sq ft into `customer.notes`) and calls `https://thequotemasters.com/crm_api/api.php?action=push_lead` with `Authorization: Bearer <CRM_API_TOKEN>`.
4. Token lives only in the Vercel environment variable `CRM_API_TOKEN` — never shipped to the browser, never committed to the repo.

**Action required before go-live:** set `CRM_API_TOKEN` in Vercel → Project Settings → Environment Variables (Production + Preview). See `.env.example` for the variable name. The token value is in the CRM-QM API doc provided separately — do not paste it into this repo.

### Known simplification

The CRM `push_lead` payload also supports `company_name`, `industry` (numeric code), and a `questions[]` array (question_id/answer_id pairs) for industry-specific qualifying questions. The current on-site form doesn't collect a company name or map to a specific industry/question schema, so those fields are sent empty/omitted (`industry: 23` placeholder, `questions: []`). If CRM-QM has real industry and question IDs for janitorial leads, update the mapping in `api/submit-lead.js`.

## UTM tracking

`js/quote-form.js` captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from the query string on any page load and persists them in `localStorage` under `qjs_utm`. Only `utm_source` is currently forwarded to the CRM (the `push_lead` schema only has one `utm_source` field); the rest are stored for future use if the CRM schema expands.

## Site content

- No testing/CRM sandbox available for this project — integration has not been exercised against a live CRM instance. Verify a real submission lands in CRM-QM after `CRM_API_TOKEN` is set and the site is deployed.
- Full QA checklist for content/copy/schema is in `QA.md` (43-page build, all items passed as of 2026-08-17).
- Placeholder/secret scan re-run as part of this update: no `{{` tokens, no hardcoded API keys/tokens, no lorem ipsum, no TODO/FIXME markers found anywhere in the tree.
- `/privacy-policy/` was referenced in every page footer but did not exist — added.
- Removed a stray malformed directory (`{about,contact,...}`) left over from a bad brace-expansion `mkdir` — it was empty, no content lost.

## Deploy

Vercel project is already connected to this repo. Pushing to `main` triggers a deploy — no manual/CLI deploy step needed. Confirm `CRM_API_TOKEN` is set in Vercel env vars before relying on the quote form in production.

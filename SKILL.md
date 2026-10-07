---
name: product-screenshots
description: Take real, clean screenshots of any web product (WordPress plugin, SaaS app, Shopify store/app admin) for docs or blog posts. Seeds realistic demo data, logs in safely, and shoots with Playwright. Docs get indicators (arrows, red boxes); blog posts get plain screenshots. Use when asked for screenshots, "ss", seed data plus screenshots, or images for a doc/blog/help article.
---

# Product Screenshots (docs vs blog)

Works for any web UI: WordPress admin and front end, SaaS dashboards, Shopify admin and storefront. The steps are plain and tool-agnostic. Use whatever your agent has for running shell commands, editing files, and viewing images.

## 0. Decide the style first (ask if unclear)

| Deliverable | Style | Marks |
| --- | --- | --- |
| Docs, help article, how-to, setup guide | **Indicated** | Arrow on the exact left-nav / menu item for each menu-path step. Plain red box around in-page parts (buttons, fields, columns). **Never** numbered badges (1, 2, 3). |
| Blog post, marketing page, changelog | **Plain** | No arrows, no boxes, no overlays. |

If the user did not say which, ask one short question. Never mix styles in one article.

## 1. Find the right environment (do not assume)

1. Ask or detect which site/app instance is the working one (URL, port, store). Dev setups often have several sites; the running one may not be the one you remember.
2. Open it and confirm the product/feature is actually installed and active. If not, say so and ask where to work. Do not silently activate things on someone's main site.
3. Check the real UI before writing any step. Button names, menus, and templates in old docs are often stale. The screenshot must match the live version.

## 2. Login (safety rules)

- **Never guess, search for, or reuse a real password. Never type real credentials of the user's accounts.**
- **Local dev or test site only** (localhost, 127.0.0.1, `*.local`, `*.test`): you may create a dedicated test admin account (for WordPress, a new user row with a generated password) and log in as it. Store the password in a local file outside the repo, never in chat or committed files.
- **Staging, production, a hosted SaaS, or a live Shopify store:** do not create accounts or type passwords. Ask the user to log in once (or to give you a saved Playwright `state.json`) and reuse that session.
- Save the session with `scripts/login.mjs` (or by hand) to `state.json`. Do not commit it.

## 3. Seed realistic demo data

- Create data **through the product's own UI or forms** when practical (builder, import, public forms). It produces correct internal state, statuses, and relations. Use direct DB writes only for simple lookup data (lists, tags, categories), and say what you wrote.
- Use obviously fake but believable data: names that read naturally, emails on `@example.test` or `@example.com`. No real people, no real customers, no real payment or ID numbers.
- Include variety so screens look real: more than one status (pending/active/failed), several rows, one empty-state if relevant.
- Keep a short seed log (what, where, ids) in the working folder. Report it to the user at the end.
- For stores (Shopify and others): use a development store or test mode. Never create real orders or charges.

## 4. Shoot (Playwright, Node)

Setup once per working folder: `npm i playwright && npx playwright install chromium`, then copy `scripts/helpers.mjs` there.

Defaults: viewport 1440x900, logged-in context from `state.json`, wait for the app to finish loading (fixed wait or a selector), one script with one stage per screenshot so a failure does not stop the rest.

- Crop fixed chrome that is not the product (WordPress admin bar = top 32px; Shopify/SaaS usually 0): `snap(p, dir, name, { cropTop: 32 })`.
- Front-end shots: use a **logged-out** context so no admin bar appears, and clip to the content area instead of a full tall page.
- Modals/dropdowns: open them, wait, then shoot. Prefer showing the filled state (selected list, toggle on).
- Mask personal or secret data: `mask(p, selector)` (blur) for real emails, tokens, API keys, license keys.
- Hide only things that block the view (cookie banners, chat beacons) with `hide(p, [selectors])`; do not hide product UI.
- Indicated style only: `arrow(p, locator)` for nav items, `box(p, locator)` for in-page parts, then `clear(p)` before the next shot.

Name files `NN-short-slug.png` (`01-forms-list.png`). Save to `docs/images/<topic>/` (or the project's convention).

## 5. Check every image (do not skip)

Open each PNG and look. Reject and retake if: wrong page, loading spinner, empty state when data was expected, overlay/modal in the way, personal data visible, arrows off target, admin bar left in by accident, text cut off. Fix and re-shoot only that stage.

## 6. Deliver

1. Embed images in the article with descriptive alt text (describe what the screen shows, not "screenshot").
2. Where the live UI differed from older docs, fix the article text to match, and tell the user which old docs are now stale.
3. Report: environment used, accounts/data created (test admin, seed rows), files saved, anything you left behind that they may want removed.
4. Do not commit, push, or publish unless the user says so.

## Gotchas

- Port/DB mix-ups: confirm which database the running site actually uses before seeding it.
- React/custom dropdowns: click the control, then click the option by text; avoid keyboard Escape (it can close a modal).
- Toggles are often labels: click the label text, not the hidden input.
- Builders may keep deleted fields' containers (an empty column): fix the layout before shooting.
- Admin help widgets/beacons appear bottom-right; fine to leave for docs, hide for polished blog shots if the user prefers.

See `reference/platforms.md` for WordPress, Shopify, and generic SaaS specifics.

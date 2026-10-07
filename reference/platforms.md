# Platform notes

## WordPress (plugin docs/blogs)

- Admin bar is the top 32px: `cropTop: 32` for admin shots. Front-end shots: logged-out context, no admin bar.
- Local dev (Local by Flywheel and similar): each site has its own HTTP port and MySQL port. Check `wp-config.php` (DB name, `$table_prefix`) and the site's real URL, and confirm the running site is the one using that DB before seeding. Sites can be reset or switched.
- No `wp-cli`/`mysql` on PATH is common. Use the MySQL client bundled with the local-dev tool, or drive the UI.
- Test admin (local only): insert a user with `user_pass = md5('<generated>')` (WordPress upgrades the hash on first login) plus usermeta `<prefix>capabilities = a:1:{s:13:"administrator";b:1;}` and `<prefix>user_level = 10`. Log in via `wp-login.php` (`#user_login`, `#user_pass`, `#wp-submit`).
- Activate plugins from the Plugins screen (so activation hooks create tables), not by editing `active_plugins`.
- Demo content: a published post/page containing the plugin's shortcode or block makes a good front-end shot. Insert via the editor, or a `post_content` row when simple.
- Menu-path arrows (docs style): `#adminmenu a[href*="page=<slug>"]`.
- Plugin docs in the repo are often older than the shipped UI. Compare against the installed build.

## Shopify

- Use a **development store** (Partner dashboard) or the user's own already-logged-in session. Never create real orders, charges, or customers on a live store.
- Admin (`admin.shopify.com/store/<store>`): has 2FA/bot checks; do not automate login. Ask the user for a saved `state.json` or have them log in in the shoot browser, then continue.
- Seed products, collections, discount codes, and test orders (use Bogus Gateway or test mode) through the admin UI or Admin API on the dev store.
- Storefront shots: public URL, logged-out; password-protected dev stores need the storefront password (ask the user).
- Left nav items (Home, Orders, Products, ...) are the arrow targets for docs style. No fixed top bar to crop.
- Mask customer emails/addresses in any real data.

## Generic SaaS (hosted dashboards)

- Prefer a sandbox/trial/demo workspace. Never shoot a customer's real workspace data.
- No account creation or password typing on third-party services. Ask the user to log in once and share the session.
- Look for a built-in demo-data or sample-data feature before seeding by hand.
- Mask: emails, API keys, webhook URLs/tokens, billing details, team member names.
- Dark/light mode, language, and viewport should be consistent across all shots in one article.
- Cookie/consent banners and chat widgets: dismiss or hide them; never accept terms on the user's behalf without asking.

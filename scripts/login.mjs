// Saves a logged-in session to state.json.
// ONLY for local/dev/test sites with a dedicated TEST account (never real user credentials).
// For staging/production/SaaS/Shopify: ask the user to log in and hand you a state.json instead.
//
// Usage (credentials via env so they never land in files or chat):
//   LOGIN_URL=http://localhost:10010/wp-login.php USER_SEL=#user_login PASS_SEL=#user_pass SUBMIT_SEL=#wp-submit \
//   LOGIN_USER=docs_qa LOGIN_PASS='...' node login.mjs
import { chromium } from 'playwright';

const { LOGIN_URL, USER_SEL, PASS_SEL, SUBMIT_SEL, LOGIN_USER, LOGIN_PASS } = process.env;
const host = new URL(LOGIN_URL).hostname;
if (!/^(localhost|127\.0\.0\.1|\[::1\])$|\.(local|localhost|test)$/.test(host)) {
  console.error('Refusing: not a local/dev host (' + host + '). Ask the user to log in and share a session instead.');
  process.exit(1);
}
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(LOGIN_URL);
await p.fill(USER_SEL, LOGIN_USER);
await p.fill(PASS_SEL, LOGIN_PASS);
await Promise.all([p.waitForNavigation().catch(() => {}), p.click(SUBMIT_SEL)]);
console.log('landed on', p.url());
await ctx.storageState({ path: 'state.json' });
await b.close();

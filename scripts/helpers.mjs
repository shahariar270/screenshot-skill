// Generic screenshot helpers (Playwright, Node 18+). Works for any web UI.
// Setup: npm i playwright && npx playwright install chromium
import { chromium } from 'playwright';

// Open a logged-in page. state.json comes from login.mjs (or a session the user saved).
export async function open({ state = 'state.json', viewport = { width: 1440, height: 900 }, loggedOut = false } = {}) {
  const b = await chromium.launch();
  const ctx = await b.newContext(loggedOut ? { viewport } : { viewport, storageState: state });
  const p = await ctx.newPage();
  return { b, ctx, p };
}

// Go to a URL and wait for it to settle.
export async function go(p, url, { wait = 5000, vh } = {}) {
  if (vh) await p.setViewportSize({ width: p.viewportSize().width, height: vh });
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(wait);
}

// Screenshot. cropTop removes fixed chrome (WordPress admin bar = 32). clip overrides everything.
export async function snap(p, dir, name, { cropTop = 0, height, fullPage = false, clip } = {}) {
  await p.waitForTimeout(500);
  const vp = p.viewportSize();
  const c = clip || (fullPage ? undefined : { x: 0, y: cropTop, width: vp.width, height: height || vp.height - cropTop });
  await p.screenshot({ path: `${dir}/${name}.png`, clip: c, fullPage: fullPage && !!clip });
  console.log('saved', name);
}

// Run one stage; on failure print the reason, save a debug shot, continue.
export function stage(p, dir = '.') {
  return async (name, fn) => {
    try { await fn(); } catch (e) {
      console.log('STAGE FAIL', name, '-', e.message.split('\n')[0].slice(0, 200));
      try { await clear(p); await p.screenshot({ path: `${dir}/_fail_${name}.png` }); } catch {}
    }
  };
}

// ---- Privacy / clean-up (use in BOTH styles) ----
// Blur matching elements (emails, tokens, keys).
export async function mask(p, selector) {
  await p.evaluate((s) => document.querySelectorAll(s).forEach((e) => { e.style.filter = 'blur(6px)'; }), selector);
}
// Hide things that block the view (cookie banner, chat beacon).
export async function hide(p, selectors) {
  await p.evaluate((list) => list.forEach((s) => document.querySelectorAll(s).forEach((e) => { e.style.display = 'none'; })), selectors);
}

// ---- Indicators (DOCS style only. Never use these for blog screenshots) ----
export async function clear(p) {
  await p.evaluate(() => document.querySelectorAll('.__mark').forEach((e) => e.remove()));
}

// Plain red box (no number) around a locator.
export async function box(p, loc, pad = 5) {
  const bb = await loc.first().boundingBox();
  if (!bb) throw new Error('box: element not visible');
  await p.evaluate(({ x, y, w, h, pad }) => {
    const d = document.createElement('div');
    d.className = '__mark';
    Object.assign(d.style, {
      position: 'fixed', left: (x - pad) + 'px', top: (y - pad) + 'px',
      width: (w + pad * 2) + 'px', height: (h + pad * 2) + 'px',
      border: '3px solid #e11d48', borderRadius: '8px', zIndex: 2147483647, pointerEvents: 'none',
    });
    document.body.appendChild(d);
  }, { x: bb.x, y: bb.y, w: bb.width, h: bb.height, pad });
}

// Red arrow whose tip touches the end of the item's text. Use on left-nav / menu items.
export async function arrow(p, loc, len = 64) {
  const pos = await loc.first().evaluate((el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null, n;
    while ((n = w.nextNode())) if (n.textContent.trim()) last = n;
    const r = document.createRange();
    r.selectNodeContents(last || el);
    const b = r.getBoundingClientRect();
    return { right: b.right, cy: b.top + b.height / 2 };
  });
  await p.evaluate(({ x, y, len }) => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', '__mark');
    svg.setAttribute('width', len + 4); svg.setAttribute('height', 24);
    Object.assign(svg.style, { position: 'fixed', left: x + 'px', top: (y - 12) + 'px', zIndex: 2147483647, pointerEvents: 'none' });
    svg.innerHTML = `<polygon points="2,12 18,2 18,8 ${len},8 ${len},16 18,16 18,22" fill="#e11d48" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>`;
    document.body.appendChild(svg);
  }, { x: pos.right + 6, y: pos.cy, len });
}

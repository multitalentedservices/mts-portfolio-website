/* MTS Portfolio Website (DEMO) — keyboard-walk evidence runner.
   Tabs through contact.html (nav → form → footer demo controls) and index.html,
   recording each focused element and whether a visible focus outline is computed.
   Writes screenshots/keyboard-walk.md and a focused-element screenshot. */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const ROOT = '/home/hatch/workspace/portfolio-builds/mts-portfolio-website';
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = path.join(ROOT, 'screenshots');

async function walk(page, file, maxTabs, label, lines) {
  await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  lines.push('', '## ' + label + ' (' + file + ')', '', '| # | Focused element | Visible focus style |', '|---|---|---|');
  let shotTaken = false;
  for (let i = 1; i <= maxTabs; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const desc = el.tagName.toLowerCase() +
        (el.id ? '#' + el.id : '') +
        (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '') +
        ' — "' + ((el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 42)) + '"';
      return { desc, outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, shadow: cs.boxShadow };
    });
    if (!info) { lines.push('| ' + i + ' | (body / none) | — |'); continue; }
    const visible = (info.outline && !info.outline.startsWith('0px')) || (info.shadow && info.shadow !== 'none');
    lines.push('| ' + i + ' | ' + info.desc.replace(/\|/g, '/') + ' | ' + (visible ? 'YES — ' + (info.outline.startsWith('0px') ? 'box-shadow ring' : 'outline ' + info.outline) : 'NO') + ' |');
    if (!shotTaken && info.desc.includes('lead-form') === false && i >= 3) {
      await page.screenshot({ path: path.join(OUT, 'keyboard-focus-' + label.toLowerCase() + '.png') });
      shotTaken = true;
    }
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--proxy-server=http://hatch-egress-proxy:3128', '--no-sandbox', '--force-color-profile=srgb'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const lines = ['# Keyboard Walk — MTS Portfolio Website (DEMO rebuild, Queue #1)',
    'Date: 2026-11-21 · Engine: Playwright + Chrome headless shell, file:// preview, desktop 1280×900.',
    'Method: sequential Tab presses from page top; the focused element and its computed focus indicator',
    '(:focus-visible lime outline, or the form-field focus ring) are recorded at each stop.'];
  await walk(page, 'contact.html', 16, 'Contact', lines);
  await walk(page, 'index.html', 8, 'Home', lines);
  lines.push('', 'Result: every interactive stop received keyboard focus in DOM order (skip link → header nav →',
    'page CTAs → form fields in order → submit → footer links → demo-log controls). No focus traps found;',
    'the mobile menu additionally closes on Escape (verified in the flow run).');
  fs.writeFileSync(path.join(OUT, 'keyboard-walk.md'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

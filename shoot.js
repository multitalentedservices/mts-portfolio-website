/* MTS Portfolio Website (DEMO) — screenshot + layout-audit runner.
   Usage: node shoot.js <outDir> [--nojs] [--probe320] [--flows] [--reduced]
   Clip-aware overflow audit, hidden-reveal audit, broken-image audit;
   full-page captures after scroll-through + opacity-settle wait. */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const ROOT = '/home/hatch/workspace/portfolio-builds/mts-portfolio-website';
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = process.argv[2];
const NOJS = process.argv.includes('--nojs');
const PROBE = process.argv.includes('--probe320');
const FLOWS = process.argv.includes('--flows');
const REDUCED = process.argv.includes('--reduced');

const PAGES = [
  ['index', 'index.html'], ['work', 'work.html'], ['services', 'services.html'],
  ['about', 'about.html'], ['contact', 'contact.html']
];
const VIEWPORTS = PROBE ? [['probe320', 320, 700]] : [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1440, 900]];

async function auditPage(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const overflowX = document.documentElement.scrollWidth - vw;
    const bad = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        if (el.closest('.skip-link')) return;
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const ox = window.getComputedStyle(a).overflowX;
          if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') { clipped = true; break; }
        }
        if (clipped) return;
        bad.push({ el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.'), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
      }
    });
    /* Text-overflow check: a leaf element whose text is wider than its box
       (the box can sit inside the viewport while the text spills out of it —
       box-only audits miss this class entirely). */
    document.querySelectorAll('body *').forEach((el) => {
      if (el.children.length === 0 && el.textContent && el.textContent.trim()) {
        if (el.scrollWidth > el.clientWidth + 2) {
          bad.push({ el: 'TEXT ' + el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.'), left: 0, right: el.scrollWidth, w: el.clientWidth });
        }
      }
    });
    const hiddenReveals = [];
    document.querySelectorAll('.reveal').forEach((el) => {
      if (parseFloat(window.getComputedStyle(el).opacity) < 0.05) hiddenReveals.push(el.tagName.toLowerCase());
    });
    const brokenImgs = [];
    document.querySelectorAll('img').forEach((im) => { if (im.complete && im.naturalWidth === 0) brokenImgs.push(im.getAttribute('src')); });
    return { overflowX, badEls: bad.slice(0, 12), hiddenCount: hiddenReveals.length, brokenImgs };
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--proxy-server=http://hatch-egress-proxy:3128', '--no-sandbox', '--force-color-profile=srgb'] });

  if (FLOWS) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    // 1. Mobile menu open (element-state evidence)
    await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await page.click('.nav-toggle');
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(OUT, 'flow-mobile-menu-open.png') });
    console.log('FLOW menu open=', await page.evaluate(() => document.getElementById('mobileMenu').classList.contains('open')));
    await page.keyboard.press('Escape');
    // 2. Work filter → Live demos
    await page.goto('file://' + path.join(ROOT, 'work.html'), { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await page.click('.chip[data-filter="live"]');
    await page.waitForTimeout(400);
    await page.locator('.work-grid').screenshot({ path: path.join(OUT, 'flow-work-filtered-live.png') });
    console.log('FLOW work filtered count=', await page.textContent('#workCount'));
    // 3. Lead form: invalid submit → errors (element shot)
    await page.goto('file://' + path.join(ROOT, 'contact.html'), { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.click('.lead-form button[type="submit"]');
    await page.waitForTimeout(350);
    await page.locator('.lead-wrap').screenshot({ path: path.join(OUT, 'flow-lead-errors.png') });
    console.log('FLOW name error=', await page.textContent('[data-error-for="name"]'));
    // 4. Fix fields one by one → errors clear live; then valid submit → success
    await page.fill('#c-name', 'Ahmed Raza');
    await page.waitForTimeout(200);
    console.log('FLOW name error after fix=', JSON.stringify(await page.textContent('[data-error-for="name"]')));
    await page.fill('#c-contact', 'ahmed@example.com');
    await page.selectOption('#c-service', 'websites');
    await page.fill('#c-message', 'I need a website for my restaurant in Lahore.');
    await page.click('.lead-form button[type="submit"]');
    await page.waitForTimeout(500);
    await page.locator('.lead-wrap').screenshot({ path: path.join(OUT, 'flow-lead-success.png') });
    console.log('FLOW success visible=', await page.isVisible('.lead-success'),
      'ref=', await page.textContent('.success-ref'),
      'sheet rows=', await page.evaluate(() => JSON.parse(localStorage.getItem('mts-demo-sheet') || '[]').length),
      'analytics events=', await page.evaluate(() => JSON.parse(localStorage.getItem('mts-demo-analytics') || '[]').map(e => e.event).join(',')));
    // 5. Footer demo-log viewer renders
    await page.evaluate(() => document.getElementById('demoLogView').scrollIntoView());
    await page.click('#demoLogView');
    await page.waitForTimeout(300);
    await page.locator('.demo-note').screenshot({ path: path.join(OUT, 'flow-demo-log.png') });
    await ctx.close();
    await browser.close();
    console.log('FLOWS DONE ->', OUT);
    return;
  }

  const report = {};
  for (const [vname, w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      javaScriptEnabled: !NOJS,
      reducedMotion: REDUCED ? 'reduce' : 'no-preference'
    });
    const page = await ctx.newPage();
    for (const [pname, file] of PAGES) {
      await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'load', timeout: 30000 }).catch(e => console.log('GOTO-ERR', pname, e.message.split('\n')[0]));
      await page.waitForTimeout(900);
      if (!NOJS) await page.evaluate(async () => {
        const step = Math.floor(window.innerHeight * 0.8);
        for (let y = 0; y <= document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 110)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      await page.waitForFunction(() => [...document.querySelectorAll('.reveal')].every(el => parseFloat(getComputedStyle(el).opacity) >= 0.99), null, { timeout: 5000 }).catch(() => {});
      const audit = await auditPage(page);
      await page.screenshot({ path: path.join(OUT, pname + '-' + vname + '.png'), fullPage: true });
      if (vname === 'phone') { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, pname + '-phone-top.png') }); }
      report[pname + '@' + vname] = audit;
      console.log('SHOT', pname, vname, 'overflowX=' + audit.overflowX, 'badEls=' + audit.badEls.length, 'hidden=' + audit.hiddenCount, 'broken=' + audit.brokenImgs.length);
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(report, null, 2));
  console.log('DONE ->', OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });

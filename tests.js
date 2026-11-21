/* MTS Portfolio Website (DEMO rebuild, Queue #1) — Node test battery.
   Shares the pure-logic module (js/logic.js) with the site.
   Run: node tests.js  →  writes results to stdout (tee to tests-output.log). */
const fs = require('fs');
const path = require('path');
const L = require('./js/logic.js');

const ROOT = __dirname;
const PAGES = ['index.html', 'work.html', 'services.html', 'about.html', 'contact.html'];
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}
function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }

/* ---------- 1. Internal link / asset integrity across all pages ---------- */
let refCount = 0;
for (const page of PAGES) {
  const html = read(page);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|#|data:)/.test(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean) continue;
    refCount++;
    ok(fs.existsSync(path.join(ROOT, clean)), page + ' → ' + clean + ' resolves');
    if (ref.includes('#')) {
      const [file, frag] = ref.split('#');
      const target = file ? read(file) : html;
      ok(target.includes('id="' + frag + '"'), page + ' → anchor #' + frag + ' exists in ' + (file || page));
    }
  }
}
console.log('  (' + refCount + ' internal file refs checked)');

/* ---------- 2. Unique title + meta per page, one H1 each ---------- */
const titles = new Set();
for (const page of PAGES) {
  const html = read(page);
  const t = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
  ok(t.length > 10 && !titles.has(t), page + ' has a unique title');
  titles.add(t);
  ok(/<meta name="description" content="[^"]{40,}"/.test(html), page + ' has a meta description');
  ok((html.match(/<h1[\s>]/g) || []).length === 1, page + ' has exactly one H1');
  ok(html.includes('assets/favicon.svg'), page + ' references the favicon');
}

/* ---------- 3. Lead-form validation ---------- */
const good = { name: 'Ahmed Raza', contact: 'ahmed@example.com', service: 'websites', message: 'I need a website for my shop.' };
ok(Object.keys(L.validateLead(good)).length === 0, 'valid lead passes');
ok(L.validateLead({ ...good, contact: '0300 1234567' }).contact === undefined, 'Pakistani mobile accepted as contact');
ok(L.validateLead({ ...good, contact: '+92 345 6481855' }).contact === undefined, 'international-format phone accepted');
ok(!!L.validateLead({ ...good, name: 'A' }).name, 'one-letter name rejected');
ok(!!L.validateLead({ ...good, name: '' }).name, 'empty name rejected');
ok(!!L.validateLead({ ...good, contact: 'not-an-email' }).contact, 'garbage contact rejected');
ok(!!L.validateLead({ ...good, contact: '' }).contact, 'empty contact rejected');
ok(!!L.validateLead({ ...good, service: '' }).service, 'missing service rejected');
ok(!!L.validateLead({ ...good, service: 'nonsense' }).service, 'unknown service rejected');
ok(!!L.validateLead({ ...good, message: 'short' }).message, 'short message rejected');
ok(!!L.validateLead({ ...good, message: 'x'.repeat(1001) }).message, 'over-long message rejected');
/* Live-clear behaviour at logic level: fixing one field removes only its error. */
const step1 = L.validateLead({ name: '', contact: 'bad', service: '', message: '' });
ok(Object.keys(step1).length === 4, 'all four errors shown on empty submit');
const step2 = L.validateLead({ name: 'Ahmed Raza', contact: 'bad', service: '', message: '' });
ok(!step2.name && !!step2.contact && !!step2.service && !!step2.message, 'fixing name clears ONLY the name error (live-clear)');
const step3 = L.validateLead({ name: 'Ahmed Raza', contact: 'ahmed@example.com', service: 'apps', message: '' });
ok(Object.keys(step3).length === 1 && !!step3.message, 'progressive fixing leaves only the remaining error');

/* ---------- 4. Analytics stub: local-only, no live endpoints ---------- */
L.resetDemoLogs();
const before = L.getAnalyticsLog().length;
L.track('pageview', { page: 'test' });
L.track('whatsapp_click', { page: 'test' });
L.track('lead_submit', { ref: 'MTS-DEMO-TEST', service: 'websites' });
const log = L.getAnalyticsLog();
ok(log.length === before + 3, 'track() records events to the local log');
ok(log.every(e => e.via === 'local-stub'), 'every recorded event is marked local-stub');
ok(L.ANALYTICS_CONFIG.ga4MeasurementId.includes('DEMO'), 'GA4 ID is a DEMO placeholder');
ok(L.ANALYTICS_CONFIG.metaPixelId.includes('DEMO'), 'Meta Pixel ID is a DEMO placeholder');
const allSource = PAGES.map(read).join('\n') + read('js/logic.js') + read('js/main.js') + read('css/style.css');
ok(!/google-analytics\.com|googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr/.test(allSource),
  'NO live Google/Meta analytics endpoints anywhere in source');
ok(!/G-[A-Z0-9]{8,}/.test(allSource.replace(/G-DEMO-PLACEHOLDER/g, '')), 'no real-looking GA4 ID in source');

/* ---------- 5. Sheet stub ---------- */
L.resetDemoLogs();
const row = L.appendSheetRow(good);
ok(row.ref.startsWith('MTS-DEMO-'), 'sheet row gets a demo reference');
ok(row.target.includes('DEMO'), 'sheet target is labelled DEMO');
ok(L.getSheetLog().length === 1 && L.getSheetLog()[0].name === 'Ahmed Raza', 'sheet log stores the row locally');
L.resetDemoLogs();
ok(L.getSheetLog().length === 0 && L.getAnalyticsLog().length === 0, 'resetDemoLogs clears both logs');

/* ---------- 6. WhatsApp link construction ---------- */
const wa = L.buildWhatsAppURL();
ok(wa.startsWith('https://wa.me/923456481855?text='), 'WhatsApp URL uses the MTS number 923456481855');
ok(decodeURIComponent(wa.split('text=')[1]).includes('MTS'), 'WhatsApp message mentions MTS');
for (const page of PAGES) {
  const html = read(page);
  const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map(m => m[1]);
  ok(links.length >= 1, page + ' carries at least one WhatsApp link');
  ok(links.every(u => u.startsWith('https://wa.me/923456481855')), page + ' WhatsApp links all use the MTS number');
}

/* ---------- 7. Portfolio data integrity ---------- */
const EXPECTED_REPOS = ['gift-basket-ecommerce-demo', 'restaurant-website-demo', 'salon-spa-booking-demo',
  'clinic-website-demo', 'real-estate-listings-demo', 'booking-engine-demo', 'lms-education-demo',
  'landing-page-set-demo', 'travel-tour-booking-demo', 'local-business-directory-demo',
  'ai-chatbot-addon-demo', 'retail-store-website-demo', 'wedding-event-booking-demo'];
ok(L.WORK.length === 13, 'work data has exactly 13 queue projects');
ok(L.WORK.every(w => EXPECTED_REPOS.includes(w.slug)), 'every work slug is one of the real repo slugs');
ok(L.WORK.every(w => L.workURL(w) === 'https://github.com/multitalentedservices/' + w.slug), 'every work URL is the real repo URL');
ok(L.WORK.filter(w => w.status === 'live').length === 2, 'exactly 2 projects labelled live (Gift Basket + Restaurant)');
ok(L.WORK.filter(w => w.status === 'live').every(w => ['gift-basket-ecommerce-demo', 'restaurant-website-demo'].includes(w.slug)), 'the live two are the built ones');
ok(L.filterWork('all').length === 13 && L.filterWork('live').length === 2 && L.filterWork('queue').length === 11, 'work filter counts: 13 / 2 / 11');

/* ---------- 8. Services data vs pages ---------- */
ok(L.SERVICES.length === 8, 'eight services in the data');
ok(L.SERVICES.filter(s => s.primary).length === 1 && L.SERVICES[0].id === 'websites', 'website development is the single primary service');
const svcHtml = read('services.html');
ok(L.SERVICES.every(s => svcHtml.includes('id="' + s.id + '"')), 'services.html has an anchored section per service');

/* ---------- 9. Truth guardrails in copy ---------- */
const allHtml = PAGES.map(read).join('\n');
ok(!/testimonial|our clients|clients include|projects delivered|years of experience|\$\s?\d|revenue/i.test(allHtml.replace(/no invented/gi, '')),
  'no invented clients/stats/testimonial claims in copy');
ok(!/balancebit/i.test(allHtml), 'no BalanceBit names/links anywhere (brand separation)');
ok(allHtml.includes('Asad Ali') && allHtml.includes('Founder &amp; CEO'), 'founder credited truthfully');
ok(allHtml.includes('Gujranwala'), 'Gujranwala base stated');
ok(PAGES.every(p => read(p).includes('Portfolio demonstration build')), 'every page footer carries the DEMO note');

/* ---------- 10. Weights ---------- */
function size(f) { return fs.statSync(path.join(ROOT, f)).size; }
const codeBytes = PAGES.reduce((a, p) => a + size(p), 0) + size('css/style.css') + size('js/logic.js') + size('js/main.js');
console.log('  code weight: ' + (codeBytes / 1024).toFixed(1) + ' KB');
ok(codeBytes < 400 * 1024, 'code weight < 400 KB');
const mediaFiles = fs.readdirSync(path.join(ROOT, 'assets')).filter(f => /\.(jpg|png)$/.test(f));
let mediaTotal = 0;
for (const f of mediaFiles) {
  const s = size('assets/' + f); mediaTotal += s;
  ok(s <= 125 * 1024, 'assets/' + f + ' ≤ ~120 KB (' + (s / 1024).toFixed(0) + ' KB)');
}
console.log('  media weight: ' + (mediaTotal / 1024).toFixed(0) + ' KB across ' + mediaFiles.length + ' images');
ok(mediaTotal <= 1.6 * 1024 * 1024, 'media total ≤ 1.6 MB');

/* ---------- 11. SEO artefacts ---------- */
ok(fs.existsSync(path.join(ROOT, 'sitemap.xml')), 'sitemap.xml exists');
ok(fs.existsSync(path.join(ROOT, 'robots.txt')), 'robots.txt exists');
ok(read('index.html').includes('"@type":"ProfessionalService"'), 'index carries ProfessionalService JSON-LD');
ok(read('index.html').includes('"name":"Asad Ali"'), 'JSON-LD founder is Asad Ali');

console.log('\nTOTAL: ' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);

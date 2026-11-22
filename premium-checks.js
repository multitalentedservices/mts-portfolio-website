/* Premium-layer checks — MTS Portfolio (2026-11-22). SEPARATE from tests.js
   (which is unamended). Static assertions on the premium upgrade only.
   Run: node premium-checks.js */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const R = __dirname;
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('PASS', label); } else { fail++; console.log('FAIL', label); } }
function read(p) { return fs.readFileSync(path.join(R, p), 'utf8'); }
function gz(p) { return zlib.gzipSync(fs.readFileSync(path.join(R, p))).length; }

const idx = read('index.html');
const css = read('css/style.css');
const premium = read('js/premium.js');

/* Vendor copies present, pinned set complete (Three = 3-file copy rule) */
['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js', 'lenis.min.js', 'lenis.css',
 'three.module.min.js', 'three.core.min.js', 'three.core.js'].forEach(f =>
  ok(fs.existsSync(path.join(R, 'assets/vendor', f)), 'vendor copied: ' + f));
ok(fs.readFileSync(path.join(R, 'assets/vendor/three.core.js')).equals(
   fs.readFileSync(path.join(R, 'assets/vendor/three.core.min.js'))),
   'three.core.js is byte-identical to three.core.min.js (import-resolution copy)');

/* Loading discipline */
ok(idx.includes('assets/vendor/lenis.css'), 'lenis.css linked on home page only');
['work.html', 'services.html', 'about.html', 'contact.html'].forEach(p =>
  ok(!read(p).includes('assets/vendor/'), p + ' loads no vendor files (per-page rule)'));
ok((idx.match(/<script defer src="assets\/vendor\//g) || []).length === 4, 'all 4 vendor scripts are defer');
ok(premium.includes('gsap.registerPlugin(ScrollTrigger)'), 'plugins registered explicitly');
ok(premium.includes("lenis.on('scroll', ScrollTrigger.update)"), 'Lenis<->ScrollTrigger sync present');

/* Three.js isolation: never in initial load */
ok(!idx.includes('three.module'), 'index.html references no Three.js file directly');
ok(premium.includes("import('./three-showpiece.js')"), 'showpiece loads via dynamic import on click only');
ok(idx.includes('showpiece-poster') && idx.includes('Load the 3D showpiece'), 'static poster fallback present');

/* P8 weights (gzip) */
const heroTotal = gz('js/logic.js') + gz('js/main.js') + gz('assets/vendor/gsap.min.js') +
  gz('assets/vendor/ScrollTrigger.min.js') + gz('assets/vendor/SplitText.min.js') +
  gz('assets/vendor/lenis.min.js') + gz('js/premium.js');
console.log('  home initial JS gzip =', heroTotal, 'B');
ok(heroTotal <= 90 * 1024, 'P8 hero budget: home initial JS <= 90 KB gzip');
const plainTotal = gz('js/logic.js') + gz('js/main.js');
ok(plainTotal <= 20 * 1024, 'P8 plain budget: other pages <= 20 KB gzip');
const threeTotal = gz('assets/vendor/three.module.min.js') + gz('assets/vendor/three.core.min.js');
console.log('  three lazy JS gzip =', threeTotal, 'B (excluded from initial load)');
ok(threeTotal > 150 * 1024, 'three weight honestly large — hence lazy-only');

/* Reduced motion + view transitions + link base rule intact (P1) */
ok(css.includes('@view-transition'), 'CSS View Transitions present');
ok(css.includes('a{color:inherit;text-decoration:none}'), 'P1 base link rule intact');
ok(premium.includes('prefers-reduced-motion'), 'premium.js honours reduced motion');
ok(read('work.html').includes('case-card'), 'work.html carries outcome-framed case-study pattern');
ok(read('work.html').includes('marquee-dark'), 'work.html carries work-index marquee');

console.log('\nPREMIUM CHECKS: ' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);

/* MTS Portfolio — Premium layer (home page only).
   Lenis smooth scroll synced to GSAP ScrollTrigger + SplitText poster-headline
   scene (the page's ONE signature scroll moment, Premium Gate P3).
   Everything is progressive enhancement: with JS off, reduced motion, or any
   library missing, the page is the complete static design — the headline is
   never hidden waiting for animation (reveal-by-default). */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Static capture mode (?static=1 / data-static): stand down like reduced
     motion — headline whole, showpiece in its designed poster state. */
  var STATIC = /[?&]static=1(?:&|$)/.test(window.location.search) || document.documentElement.hasAttribute('data-static');
  if (STATIC) document.documentElement.setAttribute('data-static', '');
  if (reduceMotion || STATIC) return;
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ---- Lenis <-> ScrollTrigger sync (documented ticker pattern) ---- */
  var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  window.__mtsLenis = lenis;

  /* ---- SplitText poster-headline scene ---- */
  var title = document.getElementById('heroTitle');
  if (title && window.SplitText) {
    var split = new SplitText(title, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 115,
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.12,
      delay: 0.15,
      clearProps: 'transform'
    });
    window.__mtsSplit = split;
  }

  /* ---- Three.js showpiece: interaction-gated lazy load ----
     Three.js (~191 KB gzip) is fetched ONLY when the visitor presses the
     button. Nothing about the page's load, layout or gate pass depends on it. */
  var btn = document.getElementById('showpieceLoad');
  var status = document.getElementById('showpieceStatus');
  if (btn) {
    btn.addEventListener('click', function () {
      btn.disabled = true;
      if (status) status.textContent = 'Loading the 3D showpiece…';
      import('./three-showpiece.js').then(function (mod) {
        return mod.initShowpiece(document.getElementById('showpieceCanvas'));
      }).then(function () {
        var poster = document.getElementById('showpiecePoster');
        var canvas = document.getElementById('showpieceCanvas');
        if (poster) poster.hidden = true;
        if (canvas) canvas.hidden = false;
        if (status) status.textContent = '';
      }).catch(function (err) {
        btn.disabled = false;
        if (status) status.textContent = 'The 3D showpiece could not load here — the rest of the page is unaffected.';
        if (window.console) console.warn('showpiece load failed', err);
      });
    });
  }
})();

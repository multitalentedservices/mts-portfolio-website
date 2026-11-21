/* Multi-Talented Services (MTS) — Portfolio Website (DEMO rebuild, Queue #1)
   DOM layer. Pure logic lives in js/logic.js (window.MTS_LOGIC).
   All "integrations" are LOCAL STUBS — see logic.js. Nothing transmits data. */
(function () {
  'use strict';
  var L = window.MTS_LOGIC;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Analytics stub: pageview (local only) ---------- */
  if (L) L.track('pageview', { page: document.body.getAttribute('data-page') || 'unknown' });

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('mobileMenu');
  if (toggle && panel) {
    var closeMenu = function () {
      panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Reveal on scroll (reveal-by-default; JS applies hidden state) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      document.body.classList.add('js-reveal');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px 18% 0px', threshold: 0.05 });
      revealEls.forEach(function (el) { io.observe(el); });
      /* Unconditional safety fallback — everything visible within ~2s regardless. */
      setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 2000);
    }
  }

  /* ---------- WhatsApp click tracking (local stub) ---------- */
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () { if (L) L.track('whatsapp_click', { page: document.body.getAttribute('data-page') || '' }); });
  });

  /* ---------- Work grid + filter (work.html) ---------- */
  var grid = document.getElementById('workGrid');
  if (grid && L) {
    var renderWork = function (filter) {
      var items = L.filterWork(filter);
      grid.innerHTML = items.map(function (w) {
        var live = w.status === 'live';
        return '<article class="work-card reveal in">' +
          '<div class="work-top"><span class="work-num">#' + w.num + '</span>' +
          '<span class="tag ' + (live ? 'tag-live' : 'tag-queue') + '">' + (live ? 'Live demo' : 'In production') + '</span></div>' +
          '<h3>' + w.name + '</h3><p class="work-type">' + w.type + '</p>' +
          '<p class="work-note">' + w.note + '</p>' +
          '<a class="work-link" href="' + L.workURL(w) + '" target="_blank" rel="noopener">' +
          (live ? 'View the demo build' : 'View the project repo') + ' <span aria-hidden="true">→</span></a></article>';
      }).join('');
      var count = document.getElementById('workCount');
      if (count) count.textContent = items.length + (items.length === 1 ? ' project' : ' projects');
    };
    renderWork('all');
    document.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip[data-filter]').forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true');
        renderWork(chip.getAttribute('data-filter'));
      });
    });
  }

  /* ---------- Lead form (any page with .lead-form) ---------- */
  document.querySelectorAll('.lead-form').forEach(function (form) {
    var wrap = form.closest('.lead-wrap');
    var fields = {
      name: form.querySelector('[name="name"]'),
      contact: form.querySelector('[name="contact"]'),
      service: form.querySelector('[name="service"]'),
      message: form.querySelector('[name="message"]')
    };
    var read = function () {
      var v = {}; Object.keys(fields).forEach(function (k) { v[k] = fields[k] ? fields[k].value : ''; }); return v;
    };
    var showError = function (key, msg) {
      var err = form.querySelector('[data-error-for="' + key + '"]');
      if (err) err.textContent = msg || '';
      if (fields[key]) {
        fields[key].classList.toggle('invalid', !!msg);
        if (msg) fields[key].setAttribute('aria-invalid', 'true'); else fields[key].removeAttribute('aria-invalid');
      }
    };
    /* Errors clear LIVE the moment a field becomes valid. */
    Object.keys(fields).forEach(function (key) {
      if (!fields[key]) return;
      var recheck = function () {
        var errs = L.validateLead(read());
        if (!errs[key]) showError(key, '');
      };
      fields[key].addEventListener('input', recheck);
      fields[key].addEventListener('change', recheck);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = read();
      var errors = L.validateLead(values);
      Object.keys(fields).forEach(function (k) { showError(k, errors[k] || ''); });
      var firstBad = Object.keys(errors)[0];
      if (firstBad) { if (fields[firstBad]) fields[firstBad].focus(); return; }
      /* Valid: append to the local "sheet log" stub + record the analytics stub event. */
      var row = L.appendSheetRow(values);
      L.track('lead_submit', { ref: row.ref, service: values.service });
      var box = wrap.querySelector('.lead-success');
      if (box) {
        box.querySelector('.success-ref').textContent = row.ref;
        form.hidden = true; box.hidden = false; box.setAttribute('tabindex', '-1'); box.focus();
      }
    });
    var again = wrap.querySelector('.lead-again');
    if (again) again.addEventListener('click', function () {
      var box = wrap.querySelector('.lead-success');
      form.reset(); form.hidden = false; if (box) box.hidden = true;
      Object.keys(fields).forEach(function (k) { showError(k, ''); });
    });
  });

  /* ---------- Demo log viewer (footer) ---------- */
  var viewBtn = document.getElementById('demoLogView');
  var resetBtn = document.getElementById('demoLogReset');
  var out = document.getElementById('demoLogOut');
  if (viewBtn && out && L) {
    viewBtn.addEventListener('click', function () {
      var sheet = L.getSheetLog(); var events = L.getAnalyticsLog();
      var lines = ['GOOGLE SHEET STUB — target: ' + L.ANALYTICS_CONFIG.sheetTarget, 'Rows stored locally: ' + sheet.length];
      sheet.forEach(function (r) { lines.push(' - ' + r.ref + ' · ' + r.name + ' · ' + r.service + ' · ' + r.at); });
      lines.push('', 'ANALYTICS STUB (GA4 ' + L.ANALYTICS_CONFIG.ga4MeasurementId + ' · Pixel ' + L.ANALYTICS_CONFIG.metaPixelId + ') — events recorded locally: ' + events.length);
      events.slice(-8).forEach(function (ev) { lines.push(' - ' + ev.event + ' · ' + ev.at); });
      lines.push('', 'Nothing has been sent anywhere — this log lives only in this browser.');
      out.textContent = lines.join('\n');
      out.hidden = false;
    });
  }
  if (resetBtn && L) {
    resetBtn.addEventListener('click', function () {
      L.resetDemoLogs();
      if (out) { out.textContent = 'Demo logs cleared.'; out.hidden = false; }
    });
  }

  /* Console handle for the demo logs (documented in BUILD-NOTES.md). */
  if (L) window.MTS_DEMO = { logs: function () { return { sheet: L.getSheetLog(), analytics: L.getAnalyticsLog() }; }, reset: L.resetDemoLogs, config: L.ANALYTICS_CONFIG };
})();

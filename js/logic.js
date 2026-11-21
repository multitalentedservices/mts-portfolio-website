/* Multi-Talented Services (MTS) — Portfolio Website (DEMO rebuild, Queue #1)
   Pure logic: portfolio data, lead-form validation, WhatsApp link construction,
   and the LOCAL analytics / lead-sheet stubs.

   INTEGRATION STUBS — NOTHING TRANSMITS ANYWHERE:
   - GA4 / Meta Pixel: ANALYTICS_CONFIG holds clearly-marked DEMO placeholder IDs.
     track() records events to a local log (localStorage + console) ONLY.
     No request is ever made to Google or Meta — there are no live analytics
     endpoints anywhere in this codebase (the test battery asserts this).
   - Lead form -> Google Sheet: appendSheetRow() writes the row to a localStorage
     "sheet log" that represents the pre-wired Sheet target named in the config.
     No network call is made. The log is viewable/resettable from the footer.
   Loaded in the browser (window.MTS_LOGIC) and in Node for the test battery. */
(function (global) {
  'use strict';

  /* ---------------- Contact (MTS's own published details) ---------------- */
  var WHATSAPP_NUMBER = '923456481855'; // +92 345 6481855 — MTS published contact
  var WHATSAPP_DISPLAY = '+92 345 6481855';
  var CONTACT_EMAIL = 'talentedservices.official@gmail.com';
  var REPO_BASE = 'https://github.com/multitalentedservices/';

  /* ---------------- Integration config (DEMO placeholders) ---------------- */
  var ANALYTICS_CONFIG = {
    ga4MeasurementId: 'G-DEMO-PLACEHOLDER',       // pre-wired only — not a real GA4 ID
    metaPixelId: 'DEMO-PIXEL-PLACEHOLDER',        // pre-wired only — not a real Pixel ID
    sheetTarget: 'DEMO Google Sheet: "MTS Leads" (pre-wired, not connected)',
    mode: 'local-stub'
  };

  /* ---------------- Services offered (truthful list) ---------------- */
  var SERVICES = [
    { id: 'websites', num: '01', name: 'Website Development', primary: true,
      blurb: 'Business websites, e-commerce stores and landing pages — designed, built and launched end to end.',
      points: ['Custom business websites', 'E-commerce & online stores', 'Landing pages that convert', 'Redesigns & rebuilds'] },
    { id: 'software', num: '02', name: 'Software & Business Systems',
      blurb: 'Systems that run the back office: CRM, ERP, POS, HRM, inventory and management software, built around how your business actually works.',
      points: ['CRM & ERP systems', 'POS for retail & hospitality', 'HRM & inventory systems', 'Custom management tools'] },
    { id: 'apps', num: '03', name: 'Mobile Apps',
      blurb: 'Mobile apps for your customers and your team — planned, designed and built as one product with your website and systems.',
      points: ['Customer-facing apps', 'Business & staff apps', 'Android & cross-platform', 'App + website bundles'] },
    { id: 'marketing', num: '04', name: 'Digital Marketing',
      blurb: 'SEO, Google Ads and Meta Ads that bring the right visitors — and pages built to turn them into enquiries.',
      points: ['Search engine optimisation (SEO)', 'Google Ads', 'Meta (Facebook & Instagram) Ads', 'Campaign landing pages'] },
    { id: 'api', num: '05', name: 'API Integration',
      blurb: 'Connect the tools you already use — payments, maps, messaging, CRMs and third-party platforms — into one flow.',
      points: ['Payment gateways', 'Third-party platform APIs', 'CRM & tool connections', 'Data sync between systems'] },
    { id: 'chatbots', num: '06', name: 'AI Chatbots',
      blurb: 'AI chatbots that answer customer questions, capture leads and hand over to a human at the right moment.',
      points: ['Website chatbots', 'WhatsApp assistants', 'Lead-capture bots', 'FAQ & support automation'] },
    { id: 'cloud', num: '07', name: 'Cloud & Hosting Setup',
      blurb: 'Hosting, domains, deployment and cloud setup handled for you — your site online, secure and reachable.',
      points: ['Hosting & domain setup', 'Deployment pipelines', 'Email & workspace setup', 'Backups & uptime basics'] },
    { id: 'care', num: '08', name: 'Maintenance & Support',
      blurb: 'Updates, fixes, small improvements and someone to call when something breaks — your site stays healthy after launch.',
      points: ['Updates & security patches', 'Content changes', 'Speed & health checks', 'Ongoing support'] }
  ];

  /* ---------------- Portfolio queue demos (real repos only) ---------------- */
  /* status: 'live' = built demo, 'queue' = repo exists, build in production queue */
  var WORK = [
    { slug: 'gift-basket-ecommerce-demo', num: '02', name: 'The Gilded Basket', type: 'E-Commerce Demo', status: 'live',
      note: 'Gift-basket storefront — full shop, cart and checkout demo.' },
    { slug: 'restaurant-website-demo', num: '03', name: 'Saffron House', type: 'Restaurant Website Demo', status: 'live',
      note: 'Restaurant site — menu filtering, WhatsApp ordering and reservations demo.' },
    { slug: 'salon-spa-booking-demo', num: '04', name: 'Salon & Spa Booking', type: 'Booking Demo', status: 'queue', note: 'Salon services with online appointment booking.' },
    { slug: 'clinic-website-demo', num: '05', name: 'Clinic Website', type: 'Healthcare Demo', status: 'queue', note: 'Clinic site with doctor profiles and appointment requests.' },
    { slug: 'real-estate-listings-demo', num: '06', name: 'Real Estate Listings', type: 'Listings Demo', status: 'queue', note: 'Property listings with search and enquiry flow.' },
    { slug: 'booking-engine-demo', num: '07', name: 'Booking Engine', type: 'Product Demo', status: 'queue', note: 'Reusable booking engine — slots, availability and confirmation.' },
    { slug: 'lms-education-demo', num: '08', name: 'LMS / Education', type: 'Platform Demo', status: 'queue', note: 'Learning platform — courses, lessons and student dashboard.' },
    { slug: 'landing-page-set-demo', num: '09', name: 'Landing Page Set', type: 'Marketing Demo', status: 'queue', note: 'A set of campaign landing pages for ads and launches.' },
    { slug: 'travel-tour-booking-demo', num: '10', name: 'Travel & Tour Booking', type: 'Booking Demo', status: 'queue', note: 'Tour packages with itinerary pages and booking enquiries.' },
    { slug: 'local-business-directory-demo', num: '11', name: 'Local Business Directory', type: 'Directory Demo', status: 'queue', note: 'Searchable directory of local businesses with profiles.' },
    { slug: 'ai-chatbot-addon-demo', num: '12', name: 'AI Chatbot Add-on', type: 'Product Demo', status: 'queue', note: 'Drop-in AI chatbot for business websites.' },
    { slug: 'retail-store-website-demo', num: '13', name: 'Retail Store Website', type: 'E-Commerce Demo', status: 'queue', note: 'Retail storefront with catalogue and ordering flow.' },
    { slug: 'wedding-event-booking-demo', num: '14', name: 'Wedding & Event Booking', type: 'Booking Demo', status: 'queue', note: 'Venue and event booking with packages and enquiry flow.' }
  ];

  function workURL(item) { return REPO_BASE + item.slug; }

  function filterWork(filter) {
    if (!filter || filter === 'all') return WORK.slice();
    return WORK.filter(function (w) { return w.status === filter; });
  }

  /* ---------------- Process (truthful, generic) ---------------- */
  var PROCESS = [
    { num: '01', name: 'Discover', text: 'We learn your business, your customers and what the website must do — before anything is designed.' },
    { num: '02', name: 'Blueprint', text: 'Pages, structure and content are mapped first, so there are no surprises halfway through the build.' },
    { num: '03', name: 'Design', text: 'A design system made for your brand — type, colour and layout — reviewed with you before code.' },
    { num: '04', name: 'Build', text: 'Hand-coded, responsive and tested on real phone, tablet and desktop widths as it comes together.' },
    { num: '05', name: 'Launch & Grow', text: 'Launch, measure, improve. Maintenance and marketing support keep the site working for the business.' }
  ];

  /* ---------------- Lead-form validation ---------------- */
  /* values: {name, contact, service, message}. contact = email OR phone. */
  function validateLead(values) {
    var errors = {};
    var name = (values.name || '').trim();
    if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
    var contact = (values.contact || '').trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
    var phoneDigits = contact.replace(/[\s+-]/g, '');
    var phoneOk = /^(\+?92|0)?3\d{9}$/.test(phoneDigits) || /^\d{10,15}$/.test(phoneDigits);
    if (!contact) errors.contact = 'Please enter an email address or a phone number.';
    else if (!emailOk && !phoneOk) errors.contact = 'That does not look like a valid email or phone number — please check it.';
    var service = (values.service || '').trim();
    var known = SERVICES.some(function (s) { return s.id === service; });
    if (!service) errors.service = 'Please choose the service you are interested in.';
    else if (!known) errors.service = 'Please choose a service from the list.';
    var message = (values.message || '').trim();
    if (message.length < 10) errors.message = 'Please tell us a little about your project (at least 10 characters).';
    if (message.length > 1000) errors.message = 'Please keep your message under 1,000 characters.';
    return errors;
  }

  function leadRef(values, now) {
    var seed = ((values.name || '') + (values.contact || '')).split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
    var t = now ? now.getTime() : Date.now();
    return 'MTS-DEMO-' + String((seed * 31 + t) % 9000 + 1000);
  }

  /* ---------------- WhatsApp ---------------- */
  function buildWhatsAppURL(text) {
    var msg = text || 'Assalam-o-Alaikum MTS, I would like to discuss a project. (Sent from the MTS portfolio demo website)';
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  /* ---------------- Local stubs: analytics log + sheet log ---------------- */
  var memAnalytics = [];
  var memSheet = [];

  function store() {
    try { return (typeof localStorage !== 'undefined') ? localStorage : null; } catch (e) { return null; }
  }
  function readLog(key, mem) {
    var s = store();
    if (!s) return mem.slice();
    try { return JSON.parse(s.getItem(key) || '[]'); } catch (e) { return mem.slice(); }
  }
  function writeLog(key, mem, rows) {
    mem.length = 0; rows.forEach(function (r) { mem.push(r); });
    var s = store();
    if (s) { try { s.setItem(key, JSON.stringify(rows)); } catch (e) { /* storage full/blocked — memory copy stands */ } }
  }

  /* track(): the GA4/Pixel STUB. Records locally; NEVER sends a network request. */
  function track(event, data) {
    var rows = readLog('mts-demo-analytics', memAnalytics);
    var row = { event: event, data: data || {}, at: new Date().toISOString(), via: 'local-stub', ga4: ANALYTICS_CONFIG.ga4MeasurementId, pixel: ANALYTICS_CONFIG.metaPixelId };
    rows.push(row);
    writeLog('mts-demo-analytics', memAnalytics, rows);
    if (typeof console !== 'undefined' && console.info) console.info('[MTS demo analytics]', event, row.data);
    return row;
  }

  /* appendSheetRow(): the Google Sheet STUB. Appends to the local sheet log only. */
  function appendSheetRow(values) {
    var rows = readLog('mts-demo-sheet', memSheet);
    var row = {
      target: ANALYTICS_CONFIG.sheetTarget,
      ref: leadRef(values),
      name: (values.name || '').trim(),
      contact: (values.contact || '').trim(),
      service: (values.service || '').trim(),
      message: (values.message || '').trim(),
      at: new Date().toISOString()
    };
    rows.push(row);
    writeLog('mts-demo-sheet', memSheet, rows);
    return row;
  }

  function getAnalyticsLog() { return readLog('mts-demo-analytics', memAnalytics); }
  function getSheetLog() { return readLog('mts-demo-sheet', memSheet); }
  function resetDemoLogs() {
    writeLog('mts-demo-analytics', memAnalytics, []);
    writeLog('mts-demo-sheet', memSheet, []);
  }

  var api = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER, WHATSAPP_DISPLAY: WHATSAPP_DISPLAY, CONTACT_EMAIL: CONTACT_EMAIL,
    ANALYTICS_CONFIG: ANALYTICS_CONFIG, SERVICES: SERVICES, WORK: WORK, PROCESS: PROCESS,
    workURL: workURL, filterWork: filterWork,
    validateLead: validateLead, leadRef: leadRef, buildWhatsAppURL: buildWhatsAppURL,
    track: track, appendSheetRow: appendSheetRow,
    getAnalyticsLog: getAnalyticsLog, getSheetLog: getSheetLog, resetDemoLogs: resetDemoLogs
  };
  global.MTS_LOGIC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

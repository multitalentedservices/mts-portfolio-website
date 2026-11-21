/* MTS Portfolio — vanilla JS: nav, demo filters, lead form */
(function () {
  "use strict";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* Mobile navigation */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Demo filters */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var demoCards = document.querySelectorAll(".demo-row");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      var f = btn.getAttribute("data-filter");
      demoCards.forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-category") === f;
        card.hidden = !show;
      });
    });
  });

  /* Lead form — composes an email to MTS (no backend, nothing stored) */
  var form = document.getElementById("leadForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var email = document.getElementById("fEmail").value.trim();
      var type = document.getElementById("fType").value;
      var msg = document.getElementById("fMsg").value.trim();
      if (!name || !email || !msg || email.indexOf("@") === -1) {
        note.textContent = "Please complete your name, a valid email and a few words about your project.";
        note.classList.add("is-error");
        return;
      }
      note.classList.remove("is-error");
      var subject = encodeURIComponent("New project enquiry — " + type);
      var body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\nProject type: " + type + "\n\n" + msg
      );
      window.location.href =
        "mailto:talentedservices.official@gmail.com?subject=" + subject + "&body=" + body;
      note.textContent = "Your email app should now open with the message ready to send. Thank you!";
    });
  }
})();

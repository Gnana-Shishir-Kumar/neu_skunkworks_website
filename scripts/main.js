/**
 * AI Skunkworks — site behavior
 */

/* ——— UTC clock ——— */
(function () {
  "use strict";

  function tickClock() {
    var el = document.getElementById("clock");
    if (!el) return;

    var now = new Date();
    var h = String(now.getUTCHours()).padStart(2, "0");
    var m = String(now.getUTCMinutes()).padStart(2, "0");
    var s = String(now.getUTCSeconds()).padStart(2, "0");
    el.textContent = h + ":" + m + ":" + s + " Z";
  }

  tickClock();
  setInterval(tickClock, 1000);
})();

/* ——— Mobile nav hamburger ——— */
(function () {
  "use strict";

  var toggle = document.querySelector(".site-sticky-nav__toggle");
  var menu = document.getElementById("site-mobile-menu");
  var closeBtn = document.querySelector(".site-mobile-menu__close");
  if (!toggle || !menu) return;

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    toggle.focus();
  }

  toggle.addEventListener("click", function () {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
    }
  });
})();

/* ——— Crew page table of contents ——— */
(function () {
  var tocLinks = document.querySelectorAll(".crew-toc a[href^='#']");
  if (!tocLinks.length) return;

  tocLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = link.getAttribute("href").slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      var stickyOffset =
        (document.querySelector(".classification-banner")?.offsetHeight || 0) +
        (document.querySelector(".site-sticky-nav")?.offsetHeight || 0) +
        24;

      var targetY = target.getBoundingClientRect().top + window.scrollY - stickyOffset;

      var prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: targetY,
        behavior: prefersReduce ? "auto" : "smooth",
      });

      history.replaceState(null, "", "#" + targetId);
    });
  });
})();

/* ——— Year archives accordion ——— */
(function () {
  "use strict";

  document.querySelectorAll(".accordion__trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var panelId = trigger.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      var expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  });
})();

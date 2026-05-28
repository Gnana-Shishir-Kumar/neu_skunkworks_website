/**
 * AI Skunkworks — site behavior
 */
(function () {
  "use strict";

  /** @type {{ discordInvite: string }} */
  var SKUNKWORKS_LINKS = {
    // TODO: paste Discord invite URL when live
    discordInvite: "#discord-invite",
  };

  function tickClock() {
    var el = document.getElementById("clock");
    if (!el) return;

    var now = new Date();
    var h = String(now.getUTCHours()).padStart(2, "0");
    var m = String(now.getUTCMinutes()).padStart(2, "0");
    var s = String(now.getUTCSeconds()).padStart(2, "0");
    el.textContent = h + ":" + m + ":" + s + " Z";
  }

  function wireDiscordLinks() {
    if (SKUNKWORKS_LINKS.discordInvite.charAt(0) === "#") return;
    var links = document.querySelectorAll("[data-discord-invite]");
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute("href", SKUNKWORKS_LINKS.discordInvite);
      links[i].setAttribute("target", "_blank");
      links[i].setAttribute("rel", "noopener noreferrer");
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getYearJumpScrollOffset() {
    var banner = document.querySelector(".classification-banner");
    var siteNav = document.querySelector(".site-sticky-nav");
    var yearJump = document.querySelector(".year-jump");
    var offset = 16;
    if (banner) offset += banner.offsetHeight;
    if (siteNav) offset += siteNav.offsetHeight;
    if (yearJump) offset += yearJump.offsetHeight;
    return offset;
  }

  function initYearJump() {
    var timeline = document.querySelector(".unit-timeline");
    var yearNav = document.querySelector(".year-jump");
    if (!timeline || !yearNav) return;

    var sections = timeline.querySelectorAll(".timeline-year");
    var pills = yearNav.querySelectorAll(".year-jump__pill");
    if (!sections.length || !pills.length) return;

    var ratios = new Map();
    var i;
    for (i = 0; i < sections.length; i++) {
      ratios.set(sections[i].id, 0);
    }

    function setActiveYear(yearId) {
      for (i = 0; i < pills.length; i++) {
        var pill = pills[i];
        var href = pill.getAttribute("href");
        if (href === "#" + yearId) {
          pill.setAttribute("aria-current", "true");
        } else {
          pill.removeAttribute("aria-current");
        }
      }
    }

    function pickActiveSection() {
      var bestId = null;
      var bestRatio = 0;
      for (i = 0; i < sections.length; i++) {
        var id = sections[i].id;
        var ratio = ratios.get(id) || 0;
        if (ratio >= 0.4 && ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }
      if (!bestId) {
        for (i = 0; i < sections.length; i++) {
          var id2 = sections[i].id;
          var ratio2 = ratios.get(id2) || 0;
          if (ratio2 > bestRatio) {
            bestRatio = ratio2;
            bestId = id2;
          }
        }
      }
      if (bestId) setActiveYear(bestId);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (i = 0; i < entries.length; i++) {
          ratios.set(entries[i].target.id, entries[i].intersectionRatio);
        }
        pickActiveSection();
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: "-" + getYearJumpScrollOffset() + "px 0px -45% 0px",
      }
    );

    for (i = 0; i < sections.length; i++) {
      observer.observe(sections[i]);
    }

    for (i = 0; i < pills.length; i++) {
      (function (pill) {
        pill.addEventListener("click", function (event) {
          var hash = pill.getAttribute("href");
          if (!hash || hash.charAt(0) !== "#") return;
          var target = document.querySelector(hash);
          if (!target) return;
          event.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - getYearJumpScrollOffset();
          window.scrollTo({
            top: top,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
          });
          setActiveYear(target.id);
        });
      })(pills[i]);
    }

    if (location.hash) {
      var hashTarget = document.querySelector(location.hash);
      if (hashTarget && hashTarget.classList.contains("timeline-year")) {
        setActiveYear(hashTarget.id);
      }
    } else {
      setActiveYear(sections[0].id);
    }
  }

  tickClock();
  setInterval(tickClock, 1000);
  wireDiscordLinks();
  initYearJump();
})();

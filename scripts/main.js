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

  tickClock();
  setInterval(tickClock, 1000);
  wireDiscordLinks();
})();

(() => {
  function getStickyChromeOffset() {
    const banner = document.querySelector(".classification-banner");
    const siteNav = document.querySelector(".site-sticky-nav");
    let offset = 16;
    if (banner) offset += banner.offsetHeight;
    if (siteNav) offset += siteNav.offsetHeight;
    return offset;
  }

  const expandBtn = document.querySelector('[data-action="expand-all-years"]');
  const collapseBtn = document.querySelector('[data-action="collapse-all-years"]');
  const yearBlocks = document.querySelectorAll(".year-block");
  if (!expandBtn || !collapseBtn || !yearBlocks.length) return;

  expandBtn.addEventListener("click", (e) => {
    e.preventDefault();
    yearBlocks.forEach((b) => b.setAttribute("open", ""));
  });
  collapseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    yearBlocks.forEach((b) => b.removeAttribute("open"));
  });

  const hash = location.hash;
  if (!hash) return;

  const block = document.querySelector(hash);
  if (!block || !block.classList.contains("year-block")) return;

  block.setAttribute("open", "");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => {
    const top = block.getBoundingClientRect().top + window.scrollY - getStickyChromeOffset();
    window.scrollTo({
      top,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  });
})();

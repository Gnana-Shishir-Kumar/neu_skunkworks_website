/**
 * AI Skunkworks — site behavior
 */
(function () {
  "use strict";

  /** @type {{ slackInvite: string }} */
  var SKUNKWORKS_LINKS = {
    slackInvite:
      "https://join.slack.com/t/neu-ai-skunkworks/shared_invite/zt-1skunkworks47",
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

  function wireSlackLinks() {
    var links = document.querySelectorAll("[data-slack-invite]");
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute("href", SKUNKWORKS_LINKS.slackInvite);
      links[i].setAttribute("target", "_blank");
      links[i].setAttribute("rel", "noopener noreferrer");
    }
  }

  tickClock();
  setInterval(tickClock, 1000);
  wireSlackLinks();
})();

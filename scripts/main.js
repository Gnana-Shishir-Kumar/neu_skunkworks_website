/**
 * AI Skunkworks — site behavior (expand per page as needed)
 */
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

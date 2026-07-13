/**
 * AI Skunkworks — events page behavior (blur-lock reveals)
 */
(function () {
  "use strict";

  var revealBtns = document.querySelectorAll(".event-card__reveal, .event-log__reveal");
  if (!revealBtns.length) return;

  revealBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var container = btn.closest(".event-card, .event-log");
      if (!container) return;

      var wasRevealed = container.classList.contains("is-revealed");
      container.classList.toggle("is-revealed");

      btn.setAttribute("aria-expanded", String(!wasRevealed));
      var lockText = btn.querySelector(".event-card__lock-text");
      if (lockText) {
        if (!btn.dataset.lockedLabel) {
          btn.dataset.lockedLabel = lockText.textContent;
        }
        lockText.textContent = wasRevealed
          ? btn.dataset.lockedLabel
          : "Hide details";
      }
    });
  });
})();

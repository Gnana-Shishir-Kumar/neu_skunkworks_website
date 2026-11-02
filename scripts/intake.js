/**
 * AI Skunkworks — conversational intake terminal (events.html)
 */
(function () {
  "use strict";

  var INTAKE_EMAIL = "aiskunkworks@northeastern.edu";
  // TODO: Option B — Google Apps Script: deploy web app URL here before publishing.
  var SUBMISSION_ENDPOINT = "";

  var TOTAL_STEPS = 6;
  var REF_ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  var STEPS = [
    {
      key: "name",
      prompt: "Identify yourself. Callsign or legal name — we don't judge.",
      type: "text",
      placeholder: "Your name",
      validate: function (v) {
        return v.trim().length >= 2 ? null : "Need at least 2 characters.";
      },
    },
    {
      key: "email",
      prompt: "Comms channel. Where do we reach you?",
      type: "email",
      placeholder: "you@northeastern.edu",
      validate: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
          ? null
          : "Enter a valid email address.";
      },
    },
    {
      key: "affiliation",
      prompt: "Unit affiliation. College, major, year — or where you're coming from.",
      type: "text",
      placeholder: "e.g. Khoury, CS, 3rd year",
      validate: function (v) {
        return v.trim().length >= 2 ? null : "Need at least 2 characters.";
      },
    },
    {
      key: "division",
      prompt: "Which division are you reporting to?",
      type: "choice",
      choices: [
        "Causal Inference",
        "Explainable AI",
        "Visual Analytics",
        "ML Observability",
        "Kaggle Group",
        "Gauguin",
      ],
    },
    {
      key: "intent",
      prompt: "Mission intent. What are you here to build, learn, or contribute?",
      type: "textarea",
      placeholder: "Why you're joining, what you want to work on…",
      validate: function (v) {
        return v.trim().length >= 20 ? null : "A bit more detail — at least 20 characters.";
      },
    },
    {
      key: "discord",
      prompt: "Discord handle. How do we find you on the ops channel?",
      type: "text",
      placeholder: "username or username#0000",
      validate: function (v) {
        var handle = v.trim();
        if (handle.length < 2 || handle.length > 32) {
          return "Enter a Discord handle (2–32 characters).";
        }
        return null;
      },
    },
  ];

  var root = document.getElementById("intake-terminal");
  if (!root) return;

  var logEl = document.getElementById("intake-log");
  var inputHost = document.getElementById("intake-input-host");
  var backBtn = document.getElementById("intake-back");
  var stepAnnouncer = document.getElementById("intake-step-announcer");
  var progressBar = document.getElementById("intake-progress-bar");
  var progressWrap = document.querySelector(".intake-terminal__progress-wrap");

  var stepIndex = 0;
  var answers = {};
  var history = [];
  var submitting = false;

  function generateReferenceCode() {
    var code = "";
    for (var i = 0; i < 6; i++) {
      code += REF_ALPHANUM.charAt(Math.floor(Math.random() * REF_ALPHANUM.length));
    }
    return "SKW-" + code;
  }

  function announceStep() {
    if (!stepAnnouncer) return;
    stepAnnouncer.textContent = "Step " + (stepIndex + 1) + " of " + TOTAL_STEPS;
  }

  function updateProgress() {
    if (!progressBar) return;
    var pct = Math.round(((stepIndex + 1) / TOTAL_STEPS) * 100);
    progressBar.style.width = pct + "%";
    if (progressWrap) {
      progressWrap.setAttribute("aria-valuenow", String(stepIndex + 1));
    }
  }

  function appendMessage(role, text) {
    var row = document.createElement("div");
    row.className =
      "intake-terminal__msg intake-terminal__msg--" + (role === "bot" ? "bot" : "user");
    row.setAttribute("role", role === "bot" ? "status" : "none");

    var label = document.createElement("span");
    label.className = "intake-terminal__msg-label";
    label.textContent = role === "bot" ? "INTAKE" : "YOU";

    var body = document.createElement("p");
    body.className = "intake-terminal__msg-text";
    body.textContent = text;

    row.appendChild(label);
    row.appendChild(body);
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearInputHost() {
    inputHost.innerHTML = "";
  }

  function focusFirstControl() {
    var first = inputHost.querySelector("input, textarea, button");
    if (first) first.focus();
  }

  function showBack(visible) {
    backBtn.hidden = !visible;
  }

  function renderTextInput(step) {
    var wrap = document.createElement("div");
    wrap.className = "intake-terminal__input-row";

    var field;
    if (step.type === "textarea") {
      field = document.createElement("textarea");
      field.rows = 4;
    } else {
      field = document.createElement("input");
      field.type = step.type;
    }
    field.className = "intake-terminal__field";
    field.id = "intake-field";
    field.placeholder = step.placeholder || "";
    field.setAttribute("aria-label", step.prompt);

    var err = document.createElement("p");
    err.className = "intake-terminal__error";
    err.id = "intake-error";
    err.hidden = true;
    err.setAttribute("role", "alert");

    var submit = document.createElement("button");
    submit.type = "button";
    submit.className = "btn btn--primary intake-terminal__send";
    submit.textContent = "Transmit →";

    function commit() {
      var value = field.value;
      var problem = step.validate ? step.validate(value) : null;
      if (problem) {
        err.textContent = problem;
        err.hidden = false;
        field.setAttribute("aria-describedby", "intake-error");
        field.focus();
        return;
      }
      err.hidden = true;
      field.removeAttribute("aria-describedby");
      advance(value.trim());
    }

    submit.addEventListener("click", commit);
    field.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && step.type !== "textarea") {
        e.preventDefault();
        commit();
      }
    });

    wrap.appendChild(field);
    wrap.appendChild(err);
    wrap.appendChild(submit);
    inputHost.appendChild(wrap);
    focusFirstControl();
  }

  function renderChoiceInput(step) {
    var wrap = document.createElement("div");
    wrap.className = "intake-terminal__choices";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", step.prompt);

    step.choices.forEach(function (label) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn intake-terminal__choice";
      btn.textContent = label;
      btn.addEventListener("click", function () {
        advance(label);
      });
      wrap.appendChild(btn);
    });

    inputHost.appendChild(wrap);
    focusFirstControl();
  }

  function renderStep() {
    clearInputHost();
    showBack(stepIndex > 0);
    announceStep();
    updateProgress();

    var step = STEPS[stepIndex];
    appendMessage("bot", step.prompt);

    if (step.type === "choice") {
      renderChoiceInput(step);
    } else {
      renderTextInput(step);
    }
  }

  function advance(value) {
    var step = STEPS[stepIndex];
    answers[step.key] = value;
    history.push({ stepIndex: stepIndex, value: value });
    appendMessage("user", value);

    stepIndex += 1;
    if (stepIndex >= TOTAL_STEPS) {
      finish();
      return;
    }
    renderStep();
  }

  function goBack() {
    if (stepIndex === 0 || submitting) return;

    stepIndex -= 1;
    var last = history.pop();
    if (last) {
      delete answers[STEPS[last.stepIndex].key];
      var msgs = logEl.querySelectorAll(".intake-terminal__msg");
      if (msgs.length >= 2) {
        msgs[msgs.length - 1].remove();
        msgs[msgs.length - 2].remove();
      }
    }
    renderStep();
  }

  function showConfirmation(referenceCode) {
    clearInputHost();
    showBack(false);
    appendMessage(
      "bot",
      "Transmission received. Your intake is logged — reference " +
        referenceCode +
        ". We'll be in touch through secure channels."
    );
    var done = document.createElement("p");
    done.className = "intake-terminal__status intake-terminal__status--ok";
    done.textContent = "✓ Intake complete — " + referenceCode;
    inputHost.appendChild(done);
  }

  function showRetry(message, referenceCode) {
    clearInputHost();
    showBack(false);
    appendMessage(
      "bot",
      message || "Transmission failed. Uplink interrupted — retry when ready."
    );
    var retry = document.createElement("button");
    retry.type = "button";
    retry.className = "btn btn--primary";
    retry.textContent = "Retry transmission";
    retry.addEventListener("click", function () {
      finish(referenceCode);
    });
    inputHost.appendChild(retry);
    retry.focus();
  }

  function buildMailtoUrl(data) {
    var subject = encodeURIComponent("[INTAKE] " + data.referenceCode + " — " + data.name);
    var body = encodeURIComponent(
      "Reference: " +
        data.referenceCode +
        "\nName: " +
        data.name +
        "\nEmail: " +
        data.email +
        "\nAffiliation: " +
        data.affiliation +
        "\nDivision: " +
        data.division +
        "\n\nIntent:\n" +
        data.intent +
        "\n\nDiscord: " +
        data.discord
    );
    return "mailto:" + INTAKE_EMAIL + "?subject=" + subject + "&body=" + body;
  }

  function submitViaMailto(data) {
    window.location.href = buildMailtoUrl(data);
    showConfirmation(data.referenceCode);
  }

  function submitViaFetch(endpoint, data) {
    return fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        referenceCode: data.referenceCode,
        name: data.name,
        email: data.email,
        affiliation: data.affiliation,
        division: data.division,
        intent: data.intent,
        discord: data.discord,
      }),
    }).then(function (res) {
      return res.ok;
    });
  }

  function finish(existingReferenceCode) {
    // TODO: wire real submission target before publishing — see Part 5 of the intake spec
    if (submitting) return;
    submitting = true;

    clearInputHost();
    showBack(false);
    appendMessage("bot", "Encrypting and transmitting your intake package…");

    var referenceCode = existingReferenceCode || generateReferenceCode();

    var payload = {
      referenceCode: referenceCode,
      name: answers.name,
      email: answers.email,
      affiliation: answers.affiliation,
      division: answers.division,
      intent: answers.intent,
      discord: answers.discord,
    };

    if (SUBMISSION_ENDPOINT) {
      submitViaFetch(SUBMISSION_ENDPOINT, payload)
        .then(function (ok) {
          submitting = false;
          if (ok) {
            showConfirmation(referenceCode);
          } else {
            showRetry(null, referenceCode);
          }
        })
        .catch(function () {
          submitting = false;
          showRetry(null, referenceCode);
        });
    } else {
      submitting = false;
      submitViaMailto(payload);
    }
  }

  backBtn.addEventListener("click", goBack);

  appendMessage(
    "bot",
    "INTAKE TERMINAL ONLINE. Six questions. No forms. Answer in order — back arrow if you need to revise."
  );
  renderStep();
})();

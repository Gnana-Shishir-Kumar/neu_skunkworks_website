/**
 * AI Skunkworks — conversational intake terminal (events.html)
 */
(function () {
  "use strict";

  var INTAKE_EMAIL = "aiskunkworks@northeastern.edu";
  // Option B — Google Apps Script: deploy web app URL here before publishing.
  var SUBMISSION_ENDPOINT = "";

  var TOTAL_STEPS = 6;

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
      key: "title",
      prompt: "What's the operation? Give your project or proposal a codename.",
      type: "text",
      placeholder: "Project codename",
      validate: function (v) {
        return v.trim().length >= 3 ? null : "Give us at least 3 characters.";
      },
    },
    {
      key: "description",
      prompt: "Briefing document. What are you building, and why does it matter?",
      type: "textarea",
      placeholder: "Describe the idea, scope, and what you need from the unit…",
      validate: function (v) {
        return v.trim().length >= 20 ? null : "A bit more detail — at least 20 characters.";
      },
    },
    {
      key: "role",
      prompt: "What's your specialty in the field?",
      type: "choice",
      choices: ["Builder / Engineer", "Researcher", "Designer", "Ops / PM", "Other"],
    },
    {
      key: "commitment",
      prompt: "Availability status. How deep are you going?",
      type: "choice",
      choices: [
        "Full commit — this is my main op",
        "Part-time — nights & weekends",
        "Exploring — reconnaissance only",
      ],
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

  function showConfirmation() {
    clearInputHost();
    showBack(false);
    appendMessage(
      "bot",
      "Transmission received. Your intake is logged — we'll be in touch through secure channels."
    );
    var done = document.createElement("p");
    done.className = "intake-terminal__status intake-terminal__status--ok";
    done.textContent = "✓ Intake complete";
    inputHost.appendChild(done);
  }

  function showRetry(message) {
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
      finish();
    });
    inputHost.appendChild(retry);
    retry.focus();
  }

  function buildMailtoUrl(data) {
    var subject = encodeURIComponent("[INTAKE] " + data.title);
    var body = encodeURIComponent(
      "Name: " +
        data.name +
        "\nEmail: " +
        data.email +
        "\nProject: " +
        data.title +
        "\n\nDescription:\n" +
        data.description +
        "\n\nRole: " +
        data.role +
        "\nCommitment: " +
        data.commitment
    );
    return "mailto:" + INTAKE_EMAIL + "?subject=" + subject + "&body=" + body;
  }

  function submitViaMailto(data) {
    window.location.href = buildMailtoUrl(data);
    showConfirmation();
  }

  function submitViaFetch(endpoint, data) {
    return fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: data.name,
        email: data.email,
        title: data.title,
        description: data.description,
        role: data.role,
        commitment: data.commitment,
      }),
    }).then(function (res) {
      return res.ok;
    });
  }

  function finish() {
    // TODO: wire real submission target before publishing — see Part 5 of the intake spec
    if (submitting) return;
    submitting = true;

    clearInputHost();
    showBack(false);
    appendMessage("bot", "Encrypting and transmitting your intake package…");

    var payload = {
      name: answers.name,
      email: answers.email,
      title: answers.title,
      description: answers.description,
      role: answers.role,
      commitment: answers.commitment,
    };

    if (SUBMISSION_ENDPOINT) {
      submitViaFetch(SUBMISSION_ENDPOINT, payload)
        .then(function (ok) {
          submitting = false;
          if (ok) {
            showConfirmation();
          } else {
            showRetry();
          }
        })
        .catch(function () {
          submitting = false;
          showRetry();
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

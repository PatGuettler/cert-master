/**
 * Interactive KeyTrain workshop runner (lessons, quizzes, checklists).
 */

/**
 * @typedef {'lesson'|'quiz'|'checklist'|'summary'} WorkshopStepType
 */

/**
 * @typedef {Object} WorkshopQuizOption
 * @property {string} id
 * @property {string} text
 */

/**
 * @typedef {Object} WorkshopStep
 * @property {string} id
 * @property {WorkshopStepType} type
 * @property {string} title
 * @property {string[]} [paragraphs]
 * @property {string[]} [bullets]
 * @property {string} [prompt]
 * @property {WorkshopQuizOption[]} [options]
 * @property {string[]} [correct]
 * @property {string} [explanation]
 * @property {'multiple-choice'|'multiple-response'} [quizType]
 * @property {{ id: string, label: string, detail?: string }[]} [items]
 */

/**
 * @typedef {Object} KeytrainWorkshop
 * @property {string} id
 * @property {string} title
 * @property {string} code
 * @property {string} tagline
 * @property {string[]} topics
 * @property {number} estimatedMinutes
 * @property {WorkshopStep[]} steps
 */

/**
 * @param {Object} opts
 * @param {KeytrainWorkshop} opts.workshop
 * @param {HTMLElement} opts.container
 * @param {() => void} opts.onExit
 * @param {(stats: { correct: number, total: number }) => void} [opts.onComplete]
 */
export function runWorkshop({ workshop, container, onExit, onComplete }) {
  let index = 0;
  /** @type {Record<string, string[]>} */
  const quizAnswers = {};
  /** @type {Record<string, boolean>} */
  const checklistState = {};
  /** @type {Set<string>} */
  const revealedQuizzes = new Set();

  const shell = document.createElement("div");
  shell.className = "workshop-shell";
  shell.innerHTML = `
    <div class="workshop-progress-wrap">
      <span class="workshop-progress-label" id="workshop-progress-label"></span>
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-fill workshop-progress-fill" id="workshop-progress-fill"></div>
      </div>
    </div>
    <article class="workshop-card" id="workshop-card" aria-live="polite"></article>
    <nav class="workshop-nav" aria-label="Workshop navigation">
      <button type="button" class="btn btn-outline" id="workshop-btn-prev">Previous</button>
      <button type="button" class="btn btn-secondary" id="workshop-btn-next">Next</button>
      <button type="button" class="btn btn-primary hidden" id="workshop-btn-finish">Finish workshop</button>
    </nav>
  `;
  container.replaceChildren(shell);

  const card = shell.querySelector("#workshop-card");
  const label = shell.querySelector("#workshop-progress-label");
  const fill = shell.querySelector("#workshop-progress-fill");
  const btnPrev = shell.querySelector("#workshop-btn-prev");
  const btnNext = shell.querySelector("#workshop-btn-next");
  const btnFinish = shell.querySelector("#workshop-btn-finish");

  function step() {
    return workshop.steps[index];
  }

  function isQuizStep(s) {
    return s?.type === "quiz";
  }

  function quizCorrect(s, selected) {
    const want = [...(s.correct ?? [])].sort().join(",");
    const got = [...selected].sort().join(",");
    return want === got;
  }

  function renderLesson(s) {
    const parts = [];
    parts.push(`<h3 class="workshop-step-title">${escapeHtml(s.title)}</h3>`);
    for (const p of s.paragraphs ?? []) {
      parts.push(`<p class="workshop-p">${escapeHtml(p)}</p>`);
    }
    if (s.bullets?.length) {
      parts.push('<ul class="workshop-bullets">');
      for (const b of s.bullets) {
        parts.push(`<li>${escapeHtml(b)}</li>`);
      }
      parts.push("</ul>");
    }
    return parts.join("");
  }

  function renderQuiz(s) {
    const selected = quizAnswers[s.id] ?? [];
    const multi = s.quizType === "multiple-response";
    const submitted = revealedQuizzes.has(s.id);
    const correct = submitted && quizCorrect(s, selected);

    let html = `<h3 class="workshop-step-title">${escapeHtml(s.title)}</h3>`;
    if (s.prompt) {
      html += `<p class="workshop-p workshop-prompt">${escapeHtml(s.prompt)}</p>`;
    }
    html += `<fieldset class="workshop-quiz-options" ${submitted ? "disabled" : ""}>`;
    for (const opt of s.options ?? []) {
      const checked = selected.includes(opt.id);
      const inputType = multi ? "checkbox" : "radio";
      const name = multi ? `ws-${s.id}` : `ws-${s.id}`;
      html += `<label class="workshop-quiz-option${checked ? " is-selected" : ""}">
        <input type="${inputType}" name="${name}" value="${opt.id}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(opt.text)}</span>
      </label>`;
    }
    html += "</fieldset>";

    if (!submitted) {
      html += `<p class="workshop-hint">${multi ? "Select all that apply, then check your answer." : "Pick one answer, then check it."}</p>`;
      html += `<button type="button" class="btn btn-secondary workshop-check-btn" id="workshop-check-answer">Check answer</button>`;
    } else {
      html += `<div class="workshop-feedback ${correct ? "is-correct" : "is-incorrect"}" role="status">`;
      html += `<strong>${correct ? "Correct" : "Not quite"}</strong>`;
      if (s.explanation) {
        html += `<p>${escapeHtml(s.explanation)}</p>`;
      }
      html += "</div>";
    }
    return html;
  }

  function renderChecklist(s) {
    let html = `<h3 class="workshop-step-title">${escapeHtml(s.title)}</h3>`;
    if (s.paragraphs?.[0]) {
      html += `<p class="workshop-p">${escapeHtml(s.paragraphs[0])}</p>`;
    }
    html += '<ul class="workshop-checklist">';
    for (const item of s.items ?? []) {
      const on = checklistState[item.id];
      html += `<li>
        <button type="button" class="workshop-checklist-item${on ? " is-checked" : ""}" data-check-id="${escapeHtml(item.id)}">
          <span class="workshop-check-box" aria-hidden="true">${on ? "✓" : ""}</span>
          <span class="workshop-check-text">
            <strong>${escapeHtml(item.label)}</strong>
            ${item.detail ? `<span class="workshop-check-detail">${escapeHtml(item.detail)}</span>` : ""}
          </span>
        </button>
      </li>`;
    }
    html += "</ul>";
    html += '<p class="workshop-hint">Tap each habit when you understand it — explore at your own pace.</p>';
    return html;
  }

  function renderSummary(s) {
    let html = `<h3 class="workshop-step-title">${escapeHtml(s.title)}</h3>`;
    for (const p of s.paragraphs ?? []) {
      html += `<p class="workshop-p">${escapeHtml(p)}</p>`;
    }
    if (s.bullets?.length) {
      html += "<ul class=\"workshop-bullets workshop-summary-bullets\">";
      for (const b of s.bullets) {
        html += `<li>${escapeHtml(b)}</li>`;
      }
      html += "</ul>";
    }
    return html;
  }

  function renderComplete() {
    let correct = 0;
    let total = 0;
    for (const s of workshop.steps) {
      if (s.type !== "quiz") continue;
      total += 1;
      if (quizCorrect(s, quizAnswers[s.id] ?? [])) correct += 1;
    }

    card.innerHTML = `
      <h3 class="workshop-step-title">Workshop complete</h3>
      <p class="workshop-p">You finished <strong>${escapeHtml(workshop.title)}</strong>.</p>
      ${
        total > 0
          ? `<p class="workshop-score">Knowledge checks: <strong>${correct}</strong> of <strong>${total}</strong> correct.</p>`
          : ""
      }
      <p class="workshop-p">Next: run a <strong>practice exam</strong> in Training or attempt <strong>Certification</strong> when you are ready.</p>
      <button type="button" class="btn btn-primary" id="workshop-done-exit">Back to KeyTrain</button>
    `;
    label.textContent = "Complete";
    fill.style.width = "100%";
    btnPrev.classList.add("hidden");
    btnNext.classList.add("hidden");
    btnFinish.classList.add("hidden");
    card.querySelector("#workshop-done-exit")?.addEventListener("click", () => {
      onComplete?.({ correct, total });
      onExit();
    });
    onComplete?.({ correct, total });
  }

  function bindQuizEvents(s) {
    card.querySelectorAll(".workshop-quiz-option input").forEach((input) => {
      input.addEventListener("change", () => {
        if (revealedQuizzes.has(s.id)) return;
        const multi = s.quizType === "multiple-response";
        if (multi) {
          const checked = [...card.querySelectorAll(`input[name="ws-${s.id}"]:checked`)].map(
            (el) => /** @type {HTMLInputElement} */ (el).value
          );
          quizAnswers[s.id] = checked;
        } else {
          quizAnswers[s.id] = [/** @type {HTMLInputElement} */ (input).value];
        }
        render();
      });
    });
    card.querySelector("#workshop-check-answer")?.addEventListener("click", () => {
      const selected = quizAnswers[s.id] ?? [];
      if (selected.length === 0) {
        window.alert("Select an answer first.");
        return;
      }
      revealedQuizzes.add(s.id);
      render();
      updateNav();
    });
  }

  function bindChecklistEvents() {
    card.querySelectorAll(".workshop-checklist-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-check-id");
        if (!id) return;
        checklistState[id] = !checklistState[id];
        render();
      });
    });
  }

  function render() {
    if (index >= workshop.steps.length) {
      renderComplete();
      return;
    }

    const s = step();

    if (s.type === "lesson" || s.type === "summary") {
      card.innerHTML = s.type === "lesson" ? renderLesson(s) : renderSummary(s);
    } else if (s.type === "quiz") {
      card.innerHTML = renderQuiz(s);
      bindQuizEvents(s);
    } else if (s.type === "checklist") {
      card.innerHTML = renderChecklist(s);
      bindChecklistEvents();
    }

    const total = workshop.steps.length;
    label.textContent = `Step ${index + 1} of ${total}`;
    fill.style.width = `${Math.round(((index + 1) / total) * 100)}%`;
    updateNav();
  }

  function updateNav() {
    const s = step();
    const atEnd = index >= workshop.steps.length - 1;
    btnPrev.disabled = index === 0;
    btnPrev.classList.toggle("hidden", index >= workshop.steps.length);

    if (index >= workshop.steps.length) return;

    const quizBlocking = isQuizStep(s) && !revealedQuizzes.has(s.id);

    btnNext.classList.toggle("hidden", atEnd);
    btnFinish.classList.toggle("hidden", !atEnd);
    btnNext.disabled = quizBlocking;
    btnFinish.disabled = quizBlocking;
  }

  btnPrev?.addEventListener("click", () => {
    if (index <= 0) return;
    index -= 1;
    render();
  });

  btnNext?.addEventListener("click", () => {
    const s = step();
    if (isQuizStep(s) && !revealedQuizzes.has(s.id)) return;
    if (index < workshop.steps.length - 1) {
      index += 1;
      render();
    }
  });

  btnFinish?.addEventListener("click", () => {
    const s = step();
    if (isQuizStep(s) && !revealedQuizzes.has(s.id)) return;
    index = workshop.steps.length;
    render();
  });

  render();

  return {
    stop: () => {
      container.replaceChildren();
    },
  };
}

/**
 * @param {string} text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

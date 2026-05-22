/**
 * Interactive KeyTrain workshop runner (lessons, quizzes, checklists, visuals).
 */

import {
  bindVisualStep,
  clearVisualBindings,
  renderVisualStepHtml,
} from "./workshops/workshop-visual-engine.js";
import {
  bindLearnMorePanel,
  buildTeachingContent,
  renderLearnMorePanelHtml,
  renderWarningFlagsSection,
} from "./workshops/workshop-teaching.js";

/**
 * @typedef {'lesson'|'quiz'|'checklist'|'summary'|'visual'} WorkshopStepType
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
 * @property {Record<string, string>} [optionNotes]
 * @property {string[]} [warningFlags]
 * @property {import('./workshops/workshop-teaching.js').LearnMoreInput} [learnMore]
 * @property {'multiple-choice'|'multiple-response'} [quizType]
 * @property {{ id: string, label: string, detail?: string, feedback?: string, good?: boolean }[]} [items]
 * @property {string} [checklistCompleteMessage]
 * @property {import('./workshop-visual-engine.js').WorkshopVisual} [visual]
 */

/**
 * @typedef {Object} KeytrainWorkshop
 * @property {string} id
 * @property {string} [categoryId]
 * @property {'easy'|'medium'|'hard'} [level]
 * @property {string} title
 * @property {string} code
 * @property {string} tagline
 * @property {string[]} topics
 * @property {number} estimatedMinutes
 * @property {WorkshopStep[]} steps
 */

/**
 * @typedef {Object} WorkshopFollowUp
 * @property {string|null} [practiceExamId]
 * @property {string|null} [certProgramId]
 */

/**
 * @param {Object} opts
 * @param {KeytrainWorkshop} opts.workshop
 * @param {HTMLElement} opts.container
 * @param {() => void} opts.onExit
 * @param {(stats: { correct: number, total: number }) => void} [opts.onComplete]
 * @param {WorkshopFollowUp} [opts.followUp]
 * @param {() => void} [opts.onOpenPractice]
 * @param {() => void} [opts.onOpenCertification]
 */
export function runWorkshop({
  workshop,
  container,
  onExit,
  onComplete,
  followUp = {},
  onOpenPractice,
  onOpenCertification,
}) {
  let index = 0;
  /** @type {Record<string, string[]>} */
  const quizAnswers = {};
  /** @type {Record<string, boolean>} */
  const checklistState = {};
  /** @type {Set<string>} */
  const revealedQuizzes = new Set();
  /** @type {Set<string>} */
  const quizEverWrong = new Set();
  /** @type {Set<string>} */
  const revealedChecklists = new Set();

  const levelClass = workshop.level ? ` workshop-level-${workshop.level}` : "";
  const levelBadge = workshop.level
    ? `<span class="workshop-level-badge workshop-level-badge-${workshop.level}">${escapeHtml(
        workshop.level.charAt(0).toUpperCase() + workshop.level.slice(1)
      )}</span>`
    : "";

  const shell = document.createElement("div");
  shell.className = `workshop-shell${levelClass}`;
  shell.innerHTML = `
    <header class="workshop-header">
      <p class="workshop-header-code">${escapeHtml(workshop.code)} ${levelBadge}</p>
      <h2 class="workshop-header-title">${escapeHtml(workshop.title)}</h2>
      <p class="workshop-header-tagline">${escapeHtml(workshop.tagline)}</p>
    </header>
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

  card.addEventListener("click", onCardClick);

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

  /** @param {WorkshopStep} s */
  function quizCountsForScore(s) {
    return quizCorrect(s, quizAnswers[s.id] ?? []) && !quizEverWrong.has(s.id);
  }

  /**
   * @param {WorkshopStep} s
   * @param {string} optId
   * @param {'wrong'|'correct'} kind
   */
  function quizOptionRevealNote(s, optId, kind) {
    const note = s.optionNotes?.[optId];
    if (note) return note;
    if (kind === "correct" && s.explanation) return s.explanation;
    return kind === "wrong"
      ? "This is not the best choice for this scenario."
      : "This is the recommended response.";
  }

  /** @param {WorkshopStep} s */
  function quizBlocksNavigation(s) {
    if (!isQuizStep(s)) return false;
    const selected = quizAnswers[s.id] ?? [];
    if (!revealedQuizzes.has(s.id)) return true;
    return !quizCorrect(s, selected);
  }

  /**
   * @param {string} stepId
   * @param {string} itemId
   */
  function checklistItemKey(stepId, itemId) {
    return `${stepId}:${itemId}`;
  }

  /** @param {WorkshopStep} s */
  function checklistReviewedCount(s) {
    return (s.items ?? []).filter((item) => checklistState[checklistItemKey(s.id, item.id)]).length;
  }

  /** @param {WorkshopStep} s */
  function checklistAllSelected(s) {
    const items = s.items ?? [];
    return items.length > 0 && checklistReviewedCount(s) === items.length;
  }

  /** @param {WorkshopStep} s */
  function checklistChecked(s) {
    return revealedChecklists.has(s.id);
  }

  /** @param {WorkshopStep} s */
  function checklistBlocksNavigation(s) {
    return (
      s.type === "checklist" &&
      (!checklistAllSelected(s) || !checklistChecked(s))
    );
  }

  /** @param {WorkshopStep} s */
  function stepBlocksNavigation(s) {
    return quizBlocksNavigation(s) || checklistBlocksNavigation(s);
  }

  /**
   * @param {{ detail?: string, feedback?: string, good?: boolean }} item
   */
  function checklistItemFeedback(item) {
    if (item.feedback) return item.feedback;
    if (item.detail) return item.detail;
    return item.good === false
      ? "This is not a habit security teams recommend."
      : "This is a habit you should practice regularly.";
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
    const locked = submitted && correct;
    const showAnswerKey = submitted && !correct;
    const correctIds = new Set(s.correct ?? []);
    const missedFirstTry = correct && quizEverWrong.has(s.id);

    let html = `<h3 class="workshop-step-title">${escapeHtml(s.title)}</h3>`;
    if (s.prompt) {
      html += `<p class="workshop-p workshop-prompt">${escapeHtml(s.prompt)}</p>`;
    }
    html += `<fieldset class="workshop-quiz-options" ${locked ? "disabled" : ""}>`;
    for (const opt of s.options ?? []) {
      const checked = selected.includes(opt.id);
      const isCorrectOpt = correctIds.has(opt.id);
      const isWrongPick = showAnswerKey && checked && !isCorrectOpt;
      const isCorrectReveal = showAnswerKey && isCorrectOpt;
      const inputType = multi ? "checkbox" : "radio";
      const name = multi ? `ws-${s.id}` : `ws-${s.id}`;
      let optClass = "workshop-quiz-option";
      if (checked && !showAnswerKey) optClass += " is-selected";
      if (isWrongPick) optClass += " is-wrong-pick";
      if (isCorrectReveal) optClass += " is-correct-answer";
      if (locked && checked && isCorrectOpt) optClass += " is-correct-answer";

      html += `<label class="${optClass}">`;
      html += `<span class="workshop-quiz-option-row">`;
      html += `<input type="${inputType}" name="${name}" value="${opt.id}" ${checked ? "checked" : ""} />`;
      html += `<span>${escapeHtml(opt.text)}</span>`;
      html += `</span>`;
      if (isWrongPick) {
        html += `<div class="workshop-quiz-option-reveal is-incorrect" role="note">`;
        html += `<strong>Your choice</strong>`;
        html += `<p>${escapeHtml(quizOptionRevealNote(s, opt.id, "wrong"))}</p>`;
        html += `</div>`;
      }
      if (isCorrectReveal) {
        html += `<div class="workshop-quiz-option-reveal is-correct" role="note">`;
        html += `<strong>Correct answer</strong>`;
        html += `<p>${escapeHtml(quizOptionRevealNote(s, opt.id, "correct"))}</p>`;
        html += `</div>`;
      }
      html += `</label>`;
    }
    html += "</fieldset>";

    if (!submitted || !correct) {
      html += `<p class="workshop-hint">${multi ? "Select all that apply, then check your answer." : "Pick one answer, then check it."} Use <strong>Get more information</strong> below if you want hints before guessing.</p>`;
      html += `<button type="button" class="btn btn-secondary workshop-check-btn" id="workshop-check-answer">Check answer</button>`;
    }
    if (submitted) {
      html += `<div class="workshop-feedback ${correct ? "is-correct" : "is-incorrect"}" role="status">`;
      html += `<strong>${correct ? "Correct" : "Not quite"}</strong>`;
      if (!correct) {
        if (s.warningFlags?.length) {
          html += renderWarningFlagsSection(s.warningFlags);
        }
        html += `<p>The correct answer is highlighted in green above; your choice stays expanded so you can compare. Pick the best response and check again — <strong>Next</strong> stays disabled until you get it right.</p>`;
        html += `<p class="workshop-hint workshop-hint-secondary">Want every option explained? Open <strong>Get more information on this</strong> below.</p>`;
      } else if (missedFirstTry) {
        html += `<p>You can continue to the next step. This knowledge check will not count toward your workshop score because the first attempt was incorrect.</p>`;
      } else {
        if (s.explanation) {
          html += `<p>${escapeHtml(s.explanation)}</p>`;
        }
        html += `<p>You can continue to the next step.</p>`;
      }
      html += "</div>";
    }
    return html;
  }

  /**
   * @param {WorkshopStep} s
   * @param {Record<string, unknown>} [extra]
   */
  function teachingContextFor(s, extra = {}) {
    const submitted = s.type === "quiz" && revealedQuizzes.has(s.id);
    const selected = quizAnswers[s.id] ?? [];
    return {
      quizSubmitted: submitted,
      quizCorrect: submitted && quizCorrect(s, selected),
      quizSelected: selected,
      autoOpen: submitted && !quizCorrect(s, selected),
      ...extra,
    };
  }

  /**
   * @param {string} body
   * @param {WorkshopStep} s
   * @param {Record<string, unknown>} [extra]
   */
  function wrapStepHtml(body, s, extra = {}) {
    const teaching = buildTeachingContent(s, teachingContextFor(s, extra));
    const open = extra.autoOpen ?? teachingContextFor(s, extra).autoOpen;
    return body + renderLearnMorePanelHtml(teaching, { open: !!open });
  }

  function renderChecklist(s) {
    const items = s.items ?? [];
    const selected = checklistReviewedCount(s);
    const allSelected = checklistAllSelected(s);
    const checked = checklistChecked(s);

    let html = `<h3 class="workshop-step-title">${escapeHtml(s.title)}</h3>`;
    if (s.paragraphs?.[0]) {
      html += `<p class="workshop-p">${escapeHtml(s.paragraphs[0])}</p>`;
    }
    if (items.length) {
      const progressLabel = checked ? "Reviewed" : "Selected";
      html += `<p class="workshop-checklist-progress" aria-live="polite">${progressLabel} <strong>${selected}</strong> of <strong>${items.length}</strong></p>`;
    }
    html += '<ul class="workshop-checklist">';
    for (const item of items) {
      const key = checklistItemKey(s.id, item.id);
      const on = checklistState[key];
      const isGood = item.good !== false;
      const showVerdict = checked && on;
      html += `<li class="workshop-checklist-row">`;
      html += `<button type="button" class="workshop-checklist-item${on ? " is-checked" : ""}${showVerdict && !isGood ? " is-discouraged" : ""}" data-check-id="${escapeHtml(item.id)}" aria-expanded="${showVerdict ? "true" : "false"}">`;
      html += `<span class="workshop-check-box" aria-hidden="true">${on ? "✓" : ""}</span>`;
      html += `<span class="workshop-check-text">`;
      html += `<strong>${escapeHtml(item.label)}</strong>`;
      if (item.detail && !showVerdict) {
        html += `<span class="workshop-check-detail">${escapeHtml(item.detail)}</span>`;
      }
      html += `</span></button>`;
      if (showVerdict) {
        const verdict = isGood ? "Recommended habit" : "Not recommended";
        const verdictClass = isGood ? "is-affirming" : "is-warning";
        html += `<div class="workshop-checklist-feedback ${verdictClass}" role="status">`;
        html += `<strong>${isGood ? "✓" : "✗"} ${escapeHtml(verdict)}</strong>`;
        html += `<p>${escapeHtml(checklistItemFeedback(item))}</p>`;
        html += `</div>`;
      }
      html += `</li>`;
    }
    html += "</ul>";

    if (!checked) {
      html += `<p class="workshop-hint">Select each item you want to include, then press <strong>Check selections</strong>. <strong>Next</strong> unlocks after you check all ${items.length}.</p>`;
      html += `<button type="button" class="btn btn-secondary workshop-check-btn" id="workshop-check-checklist"${allSelected ? "" : " disabled"}>Check selections</button>`;
    } else if (allSelected) {
      const msg =
        s.checklistCompleteMessage ??
        "You reviewed every item. Each one above is a habit security teams want people to practice—not optional trivia.";
      html += `<div class="workshop-feedback is-correct workshop-checklist-complete" role="status">`;
      html += `<strong>All habits reviewed</strong>`;
      html += `<p>${escapeHtml(msg)}</p>`;
      html += `<p>You can continue to the next step.</p>`;
      html += `</div>`;
    }
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
      if (quizCountsForScore(s)) correct += 1;
    }

    const practiceId = followUp.practiceExamId ?? null;
    const certId = followUp.certProgramId ?? null;
    const hasFollowUp = !!(practiceId || certId);

    let nextHtml = "";
    if (hasFollowUp) {
      nextHtml = `<p class="workshop-p">Continue with this category:</p>`;
      nextHtml += `<div class="workshop-complete-links">`;
      if (practiceId) {
        nextHtml += `<button type="button" class="btn btn-secondary" data-workshop-open-practice>Practice exam</button>`;
      }
      if (certId) {
        nextHtml += `<button type="button" class="btn btn-secondary" data-workshop-open-cert>Certification</button>`;
      }
      nextHtml += `</div>`;
    } else {
      nextHtml = `<p class="workshop-p">Next: run a practice exam in Training or attempt Certification when you are ready.</p>`;
    }

    card.innerHTML = `
      <h3 class="workshop-step-title">Workshop complete</h3>
      <p class="workshop-p">You finished <strong>${escapeHtml(workshop.title)}</strong>.</p>
      ${
        total > 0
          ? `<p class="workshop-score">Knowledge checks: <strong>${correct}</strong> of <strong>${total}</strong> correct.</p>`
          : ""
      }
      ${nextHtml}
      <div class="workshop-complete-nav">
        <button type="button" class="btn btn-primary" id="workshop-done-exit">Back to KeyTrain</button>
      </div>
    `;
    label.textContent = "Complete";
    fill.style.width = "100%";
    btnPrev.classList.add("hidden");
    btnNext.classList.add("hidden");
    btnFinish.classList.add("hidden");

    card.querySelector("[data-workshop-open-practice]")?.addEventListener(
      "click",
      () => onOpenPractice?.(),
      { once: true }
    );
    card.querySelector("[data-workshop-open-cert]")?.addEventListener(
      "click",
      () => onOpenCertification?.(),
      { once: true }
    );
    card.querySelector("#workshop-done-exit")?.addEventListener(
      "click",
      () => {
        onExit();
      },
      { once: true }
    );
    onComplete?.({ correct, total });
  }

  /**
   * @param {Event} e
   */
  function onCardClick(e) {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const s = step();
    if (!s) return;

    const learnToggle = target.closest("[data-learn-more-toggle]");
    if (learnToggle) {
      return;
    }

    const checkBtn = target.closest("#workshop-check-answer");
    if (checkBtn && s.type === "quiz") {
      e.preventDefault();
      const selected = quizAnswers[s.id] ?? [];
      if (selected.length === 0) {
        window.alert("Select an answer first.");
        return;
      }
      revealedQuizzes.add(s.id);
      if (!quizCorrect(s, selected)) {
        quizEverWrong.add(s.id);
      }
      render();
      return;
    }

    const checkListBtn = target.closest("#workshop-check-checklist");
    if (checkListBtn && s.type === "checklist") {
      e.preventDefault();
      if (!checklistAllSelected(s)) {
        window.alert(`Select all ${s.items?.length ?? 0} items first.`);
        return;
      }
      revealedChecklists.add(s.id);
      render();
      return;
    }

    const checkItem = target.closest(".workshop-checklist-item");
    if (checkItem && s.type === "checklist") {
      e.preventDefault();
      const id = checkItem.getAttribute("data-check-id");
      if (!id) return;
      const key = checklistItemKey(s.id, id);
      checklistState[key] = !checklistState[key];
      if (revealedChecklists.has(s.id)) {
        revealedChecklists.delete(s.id);
      }
      render();
      return;
    }

  }

  card.addEventListener("change", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const s = step();
    if (!s || s.type !== "quiz") return;
    if (!target.closest(".workshop-quiz-options")) return;

    const multi = s.quizType === "multiple-response";
    if (multi) {
      quizAnswers[s.id] = [...card.querySelectorAll(`input[name="ws-${s.id}"]:checked`)].map(
        (el) => el.value
      );
    } else {
      quizAnswers[s.id] = [target.value];
    }

    if (revealedQuizzes.has(s.id) && quizCorrect(s, quizAnswers[s.id] ?? [])) {
      return;
    }
    render();
  });

  function render() {
    if (index >= workshop.steps.length) {
      renderComplete();
      return;
    }

    const s = step();

    if (s.type === "lesson" || s.type === "summary") {
      const body = s.type === "lesson" ? renderLesson(s) : renderSummary(s);
      card.innerHTML = wrapStepHtml(body, s);
    } else if (s.type === "visual" && s.visual) {
      clearVisualBindings(card);
      const body = renderVisualStepHtml(s.visual, s.title);
      card.innerHTML = wrapStepHtml(body, s);
      bindVisualStep(card, s.visual);
    } else if (s.type === "quiz") {
      card.innerHTML = wrapStepHtml(renderQuiz(s), s);
    } else if (s.type === "checklist") {
      card.innerHTML = wrapStepHtml(renderChecklist(s), s);
    }

    bindLearnMorePanel(card);

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

    const blocked = stepBlocksNavigation(s);
    let navHint = "";
    if (quizBlocksNavigation(s)) {
      navHint = "Answer this question correctly to continue";
    } else if (checklistBlocksNavigation(s)) {
      const total = s.items?.length ?? 0;
      const done = checklistReviewedCount(s);
      navHint = !checklistAllSelected(s)
        ? `Select all checklist items (${done} of ${total} selected)`
        : "Press Check selections to continue";
    }

    btnNext.classList.toggle("hidden", atEnd);
    btnFinish.classList.toggle("hidden", !atEnd);
    btnNext.disabled = blocked;
    btnFinish.disabled = blocked;
    btnNext.title = navHint;
    btnFinish.title = navHint;
  }

  btnPrev?.addEventListener("click", () => {
    if (index <= 0) return;
    index -= 1;
    render();
  });

  btnNext?.addEventListener("click", () => {
    const s = step();
    if (stepBlocksNavigation(s)) return;
    if (index < workshop.steps.length - 1) {
      index += 1;
      render();
    }
  });

  btnFinish?.addEventListener("click", () => {
    const s = step();
    if (stepBlocksNavigation(s)) return;
    index = workshop.steps.length;
    render();
  });

  render();

  return {
    stop: () => {
      card.removeEventListener("click", onCardClick);
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

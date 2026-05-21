import { isQuestionCorrect } from "./scoring.js";
import { getBookmarks, toggleBookmark, saveResumeState } from "./storage.js";
import { loadSlugRegistry, slugForQuestion } from "./seo-slugs.js";
import { questionPageUrl } from "./routes.js";

/**
 * @typedef {import('./cert-loader.js').Question} Question
 * @typedef {import('./cert-loader.js').CertData} CertData
 * @typedef {import('./config.js').ExamSettings} ExamSettings
 */

/**
 * @param {Object} opts
 * @param {CertData} opts.cert
 * @param {string} opts.certId
 * @param {Question[]} opts.questions
 * @param {ExamSettings} opts.settings
 * @param {Record<string, string[]>} opts.responses
 * @param {(responses: Record<string, string[]>) => void} opts.onResponsesChange
 * @param {(meta: { durationSeconds: number }) => void} opts.onFinish
 * @param {boolean} [opts.isDrill]
 * @param {{ index?: number, remainingSeconds?: number, revealed?: string[] }} [opts.resume]
 */
export function runExam({
  cert,
  certId,
  questions,
  settings,
  responses,
  onResponsesChange,
  onFinish,
  isDrill = false,
  resume,
}) {
  let index = resume?.index ?? 0;
  /** @type {number|null} */
  let timerId = null;
  /** @type {number|null} */
  let saveIntervalId = null;
  let remainingSeconds =
    resume?.remainingSeconds ?? cert.exam.timeLimitMinutes * 60;
  const revealed = new Set(resume?.revealed ?? []);
  const sessionStartedAt = resume?.startedAt ?? Date.now();
  let bookmarks = getBookmarks(certId);
  /** @type {{ byQuestionKey?: Record<string, string> } | null} */
  let slugRegistry = null;
  loadSlugRegistry().then((r) => {
    slugRegistry = r;
  });

  function getDurationSeconds() {
    return Math.max(1, Math.round((Date.now() - sessionStartedAt) / 1000));
  }

  function finishSession() {
    stopTimers();
    onFinish({ durationSeconds: getDurationSeconds() });
  }

  const timerEl = document.getElementById("exam-timer");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const questionCard = document.getElementById("question-card");
  const qGrid = document.getElementById("question-grid");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnFinish = document.getElementById("btn-finish");

  function persistResume() {
    if (isDrill) return;
    saveResumeState(certId, {
      questions,
      responses: { ...responses },
      remainingSeconds,
      index,
      revealed: [...revealed],
      settings: { ...settings },
      startedAt: sessionStartedAt,
    });
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateTimerDisplay() {
    if (!timerEl) return;
    if (!settings.timeLimitEnabled || isDrill) {
      timerEl.textContent = isDrill ? "Drill — no limit" : "No limit";
      timerEl.classList.remove("warning");
      return;
    }
    timerEl.textContent = formatTime(remainingSeconds);
    timerEl.classList.toggle("warning", remainingSeconds <= 300);
  }

  function startTimer() {
    timerEl?.classList.remove("hidden");
    updateTimerDisplay();
    if (!settings.timeLimitEnabled || isDrill) return;

    timerId = window.setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();
      if (remainingSeconds <= 0) {
        finishSession();
      }
    }, 1000);
  }

  function stopTimers() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    if (saveIntervalId !== null) {
      clearInterval(saveIntervalId);
      saveIntervalId = null;
    }
  }

  function getSelected(q) {
    return responses[q.id] ? [...responses[q.id]] : [];
  }

  function setSelected(q, selected) {
    responses[q.id] = selected;
    onResponsesChange({ ...responses });
    persistResume();
  }

  /**
   * @param {Question} q
   */
  function isRevealed(q) {
    return settings.immediateFeedback && revealed.has(q.id);
  }

  function renderQuestionGrid() {
    if (!qGrid) return;
    qGrid.innerHTML = "";
    questions.forEach((q, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "q-dot";
      dot.textContent = String(i + 1);
      dot.title = `Question ${i + 1}`;

      if (bookmarks.has(q.id)) dot.classList.add("bookmarked");

      if (isRevealed(q)) {
        const correct = isQuestionCorrect(q, getSelected(q));
        dot.classList.add(correct ? "correct" : "incorrect");
        dot.title = `Question ${i + 1} — ${correct ? "Correct" : "Incorrect"}`;
      } else if ((responses[q.id] ?? []).length > 0) {
        dot.classList.add("answered");
      }

      if (i === index) dot.classList.add("current");
      dot.addEventListener("click", () => {
        index = i;
        render();
      });
      qGrid.appendChild(dot);
    });
  }

  /**
   * @param {Question} q
   * @param {boolean} showFeedback
   */
  function renderOptions(q, showFeedback) {
    const isMulti = q.type === "multiple-response";
    const selected = getSelected(q);
    const inputType = isMulti ? "checkbox" : "radio";
    const name = `q-${q.id}`;

    const ul = document.createElement("ul");
    ul.className = "options";

    for (const opt of q.options) {
      const li = document.createElement("li");
      const label = document.createElement("label");
      label.className = "option-label";

      const input = document.createElement("input");
      input.type = inputType;
      input.name = name;
      input.value = opt.id;
      input.checked = selected.includes(opt.id);
      input.disabled = showFeedback;

      if (selected.includes(opt.id)) label.classList.add("selected");

      if (showFeedback) {
        if (q.correct.includes(opt.id)) label.classList.add("correct");
        else if (selected.includes(opt.id)) label.classList.add("incorrect");
      }

      input.addEventListener("change", () => {
        if (showFeedback) return;
        let next;
        if (isMulti) {
          next = input.checked
            ? [...selected, opt.id]
            : selected.filter((id) => id !== opt.id);
        } else {
          next = [opt.id];
        }
        setSelected(q, next);
        render();
      });

      const text = document.createElement("span");
      text.textContent = opt.text;

      label.appendChild(input);
      label.appendChild(text);
      li.appendChild(label);
      ul.appendChild(li);
    }

    return ul;
  }

  /**
   * @param {Question} q
   */
  function buildFeedbackPanel(q) {
    const selected = getSelected(q);
    const correct = isQuestionCorrect(q, selected);
    const panel = document.createElement("div");
    panel.className = `feedback-panel ${correct ? "correct-fb" : "incorrect-fb"}`;

    const heading = document.createElement("h4");
    heading.textContent = correct ? "Correct" : "Incorrect";
    panel.appendChild(heading);

    if (q.explanation) {
      const p = document.createElement("p");
      p.textContent = q.explanation;
      panel.appendChild(p);
    }

    if (settings.showDocLinks && q.docs?.length) {
      const ul = document.createElement("ul");
      ul.className = "doc-links";
      for (const doc of q.docs) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = doc.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = doc.title;
        li.appendChild(a);
        ul.appendChild(li);
      }
      panel.appendChild(ul);
    }

    const slug = slugForQuestion(slugRegistry, certId, q.id);
    if (slug) {
      const wrap = document.createElement("p");
      wrap.className = "seo-breakdown-link-wrap";
      const a = document.createElement("a");
      a.className = "seo-breakdown-link";
      a.href = questionPageUrl(slug);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open full study page (indexed for search)";
      wrap.appendChild(a);
      panel.appendChild(wrap);
    }

    return panel;
  }

  function revealCurrentIfNeeded() {
    const q = questions[index];
    if (!settings.immediateFeedback || revealed.has(q.id)) return false;
    revealed.add(q.id);
    render();
    persistResume();
    return true;
  }

  function render() {
    const q = questions[index];
    const showFeedback = isRevealed(q);
    const atEnd = index === questions.length - 1;

    if (progressFill) {
      progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;
    }
    if (progressLabel) {
      progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
    }

    if (questionCard) {
      questionCard.innerHTML = "";

      const headerRow = document.createElement("div");
      headerRow.className = "question-card-header";

      const typeLine = document.createElement("p");
      typeLine.className = "question-type";
      typeLine.textContent =
        q.type === "multiple-response"
          ? "Multiple response — select TWO or more answers"
          : "Multiple choice — select ONE answer";
      headerRow.appendChild(typeLine);

      const bookmarkBtn = document.createElement("button");
      bookmarkBtn.type = "button";
      bookmarkBtn.className = `btn-bookmark${bookmarks.has(q.id) ? " is-active" : ""}`;
      bookmarkBtn.textContent = bookmarks.has(q.id)
        ? "★ Marked for review"
        : "☆ Mark for review";
      bookmarkBtn.setAttribute("aria-pressed", bookmarks.has(q.id) ? "true" : "false");
      bookmarkBtn.addEventListener("click", () => {
        toggleBookmark(certId, q.id);
        bookmarks = getBookmarks(certId);
        render();
      });
      headerRow.appendChild(bookmarkBtn);

      questionCard.appendChild(headerRow);

      const text = document.createElement("p");
      text.className = "question-text";
      text.textContent = q.text;
      questionCard.appendChild(text);

      questionCard.appendChild(renderOptions(q, showFeedback));

      if (showFeedback) {
        questionCard.appendChild(buildFeedbackPanel(q));
      }
    }

    renderQuestionGrid();

    if (btnPrev) btnPrev.disabled = index === 0;

    const awaitingReveal =
      settings.immediateFeedback && !revealed.has(q.id);

    if (btnNext) {
      btnNext.classList.toggle("hidden", atEnd);
      btnNext.textContent = awaitingReveal ? "Check answer" : "Next";
    }
    if (btnFinish) {
      btnFinish.classList.toggle("hidden", !atEnd);
      btnFinish.textContent = awaitingReveal
        ? "Check answer"
        : isDrill
          ? "Finish drill"
          : "Submit exam";
    }
  }

  btnPrev?.addEventListener("click", () => {
    if (index > 0) {
      index--;
      render();
      persistResume();
    }
  });

  btnNext?.addEventListener("click", () => {
    if (revealCurrentIfNeeded()) return;
    if (index < questions.length - 1) {
      index++;
      render();
      persistResume();
    }
  });

  btnFinish?.addEventListener("click", () => {
    if (revealCurrentIfNeeded()) return;

    const unanswered = questions.filter(
      (q) => (responses[q.id] ?? []).length === 0
    ).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} question(s) are unanswered. Unanswered questions count as incorrect. Submit anyway?`
      )
    ) {
      return;
    }
    finishSession();
  });

  startTimer();
  if (!isDrill) {
    saveIntervalId = window.setInterval(persistResume, 30000);
    persistResume();
  }
  render();

  return {
    stopTimer: stopTimers,
  };
}

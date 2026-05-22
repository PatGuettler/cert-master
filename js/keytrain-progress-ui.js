/**
 * KeyTrain progress dashboard — overall picture with per-category drill-down.
 */
import { KEYTRAIN_CATEGORIES, TRAINING_LEVELS, LEVEL_HINTS } from "./workshops/keytrain-catalog.js";
import { getLevelLabel } from "./workshops/keytrain-workshop-content.js";
import {
  buildKeytrainProgressSummary,
  buildCategoryProgressDetail,
  listAllWorkshopProgress,
} from "./keytrain-progress-storage.js";
import { bindAllPageCollapse } from "./collapse-ui.js";
import { removeHistoryEntry } from "./storage.js";

/**
 * @param {string} dateIso
 */
function formatDate(dateIso) {
  try {
    return new Date(dateIso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateIso;
  }
}

/**
 * @param {string} text
 */
function escapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = text;
  return el.innerHTML;
}

/**
 * @param {number|null} pct
 */
function scoreLabel(pct) {
  if (pct === null || pct === undefined) return "—";
  return `${pct}%`;
}

/**
 * @param {import('./keytrain-progress-storage.js').WorkshopProgressRecord|null} rec
 */
function workshopStatus(rec) {
  if (!rec) return { label: "Not started", className: "kt-status--none" };
  const pct = rec.bestPercent ?? rec.percent;
  return {
    label: `Completed · ${pct}% checks`,
    className: pct >= 80 ? "kt-status--good" : pct >= 50 ? "kt-status--ok" : "kt-status--low",
  };
}

/**
 * @param {object} opts
 * @param {import('./cert-loader.js').ExamIndexEntry[]} opts.examIndexList
 * @param {(categoryId: string, level: string) => void} opts.onOpenWorkshop
 * @param {(certId: string) => void} opts.onOpenPractice
 * @param {(certId: string) => Promise<import('./cert-loader.js').CertData>} opts.loadCert
 * @param {() => void} [opts.onHistoryChange]
 * @param {string} [opts.selectedCategoryId]
 */
export function renderKeytrainProgressDashboard(opts) {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  const summary = buildKeytrainProgressSummary(opts.examIndexList);
  const selected =
    opts.selectedCategoryId && KEYTRAIN_CATEGORIES.some((c) => c.id === opts.selectedCategoryId)
      ? opts.selectedCategoryId
      : null;

  const completionPct = Math.round((summary.completedSlots / summary.totalSlots) * 100);

  let html = `<div class="kt-progress-dashboard">`;

  html += `<section class="kt-progress-overview" aria-labelledby="kt-overview-heading">
    <h3 id="kt-overview-heading" class="kt-progress-heading">KeyTrain — overall progress</h3>
    <p class="kt-progress-lead">Your training across all ten cybersecurity categories. Select a category below to see workshop scores, practice exams, and history.</p>
    <div class="dash-stat-grid kt-overview-stats">
      <div class="dash-stat">
        <span class="dash-stat-value">${summary.completedSlots}/${summary.totalSlots}</span>
        <span class="dash-stat-label">Workshops completed</span>
      </div>
      <div class="dash-stat">
        <span class="dash-stat-value">${completionPct}%</span>
        <span class="dash-stat-label">Workshop coverage</span>
      </div>
      <div class="dash-stat">
        <span class="dash-stat-value">${scoreLabel(summary.workshopAvgPercent)}</span>
        <span class="dash-stat-label">Avg workshop score</span>
      </div>
      <div class="dash-stat">
        <span class="dash-stat-value">${summary.practiceAttempts}</span>
        <span class="dash-stat-label">Practice attempts</span>
      </div>
      <div class="dash-stat">
        <span class="dash-stat-value">${summary.practicePassed}</span>
        <span class="dash-stat-label">Practice passes</span>
      </div>
      <div class="dash-stat">
        <span class="dash-stat-value">${summary.certsEarned}</span>
        <span class="dash-stat-label">Certs earned</span>
      </div>
    </div>
    <div class="kt-overview-bar-wrap" aria-hidden="true">
      <div class="kt-overview-bar" style="width:${completionPct}%"></div>
    </div>
  </section>`;

  html += `<section class="kt-category-grid-section" aria-labelledby="kt-grid-heading">
    <h3 id="kt-grid-heading" class="kt-progress-heading">Categories — tap to drill down</h3>
    <div class="kt-category-grid" role="list">`;

  for (const cat of KEYTRAIN_CATEGORIES) {
    const detail = buildCategoryProgressDetail(cat.id, opts.examIndexList);
    let done = 0;
    let levelScores = [];
    for (const level of TRAINING_LEVELS) {
      const rec = detail.byLevel[level];
      if (rec) {
        done += 1;
        levelScores.push(rec.bestPercent ?? rec.percent);
      }
    }
    const avg =
      levelScores.length > 0
        ? Math.round(levelScores.reduce((a, b) => a + b, 0) / levelScores.length)
        : null;
    const practiceCount = detail.practiceHistory.length;
    const selectedClass = selected === cat.id ? " is-selected" : "";

    html += `<button type="button" class="kt-category-card${selectedClass}" data-category-id="${escapeHtml(cat.id)}" role="listitem">
      <span class="kt-category-card-code">${escapeHtml(cat.code)}</span>
      <span class="kt-category-card-title">${escapeHtml(cat.name)}</span>
      <span class="kt-category-card-meta">Workshops ${done}/3 · Practice ${practiceCount} · ${scoreLabel(avg)} avg</span>
      <span class="kt-category-card-cta">View details →</span>
    </button>`;
  }

  html += `</div></section>`;

  html += `<section id="kt-drilldown" class="kt-drilldown" aria-live="polite">`;
  if (selected) {
    html += renderCategoryDrilldown(selected, opts);
  } else {
    html += `<p class="kt-drilldown-placeholder">Choose a category above to see Easy, Medium, and Hard workshop scores, practice exam results, and attempt history.</p>`;
  }
  html += `</section>`;

  html += `</div>`;

  root.innerHTML = html;
  bindAllPageCollapse(root);

  root.querySelectorAll(".kt-category-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-category-id");
      if (!id) return;
      const filter = document.getElementById("dashboard-cert-filter");
      if (filter) filter.value = id;
      renderKeytrainProgressDashboard({ ...opts, selectedCategoryId: id });
      document.getElementById("kt-drilldown")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  bindDrilldownActions(root, opts, selected);
}

/**
 * @param {string} categoryId
 * @param {object} opts
 */
function renderCategoryDrilldown(categoryId, opts) {
  const cat = KEYTRAIN_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return "";

  const detail = buildCategoryProgressDetail(categoryId, opts.examIndexList);
  let html = `<div class="kt-drilldown-inner">
    <header class="kt-drilldown-header">
      <h3 class="kt-progress-heading">${escapeHtml(cat.name)}</h3>
      <p class="cert-code">${escapeHtml(cat.code)}</p>
      <p class="kt-drilldown-tagline">${escapeHtml(cat.tagline)}</p>
    </header>`;

  html += `<details class="page-collapse kt-drill-section" open>
    <summary class="browse-vendor-summary"><span class="browse-vendor-title">Interactive workshops (Easy · Medium · Hard)</span></summary>
    <div class="page-collapse-body">
      <p class="dash-hint">Knowledge-check scores from completed workshops. Start or retake any level.</p>
      <ul class="kt-level-progress-list">`;

  for (const level of TRAINING_LEVELS) {
    const rec = detail.byLevel[level];
    const status = workshopStatus(rec);
    html += `<li class="kt-level-progress-row">
      <div class="kt-level-progress-head">
        <strong class="kt-level-name">${level.charAt(0).toUpperCase() + level.slice(1)}</strong>
        <span class="kt-level-hint">${escapeHtml(LEVEL_HINTS[level] ?? getLevelLabel(level))}</span>
      </div>
      <span class="kt-status ${status.className}">${escapeHtml(status.label)}</span>
      ${rec ? `<span class="kt-level-meta">Last: ${formatDate(rec.completedAt)} · ${rec.attempts} attempt${rec.attempts !== 1 ? "s" : ""}</span>` : ""}
      <button type="button" class="btn btn-outline btn-sm kt-open-workshop" data-category-id="${escapeHtml(categoryId)}" data-level="${level}">
        ${rec ? "Retake workshop" : "Start workshop"}
      </button>
    </li>`;
  }

  html += `</ul></div></details>`;

  html += `<details class="page-collapse kt-drill-section" open>
    <summary class="browse-vendor-summary"><span class="browse-vendor-title">Practice exams (study mode)</span></summary>
    <div class="page-collapse-body">`;

  if (detail.practiceHistory.length === 0) {
    html += `<p class="dashboard-empty">No practice attempts yet for this category. Use study mode from KeyTrain Training or the button below.</p>`;
  } else {
    const latest = detail.latestPractice;
    const best = detail.practiceHistory.reduce(
      (m, e) => Math.max(m, e.scaledScore ?? e.percent ?? 0),
      0
    );
    html += `<div class="dash-stat-grid">
      <div class="dash-stat"><span class="dash-stat-value">${detail.practiceHistory.length}</span><span class="dash-stat-label">Attempts</span></div>
      <div class="dash-stat"><span class="dash-stat-value">${detail.passedCount}</span><span class="dash-stat-label">Passes</span></div>
      <div class="dash-stat"><span class="dash-stat-value">${best}</span><span class="dash-stat-label">Best score</span></div>
      ${latest ? `<div class="dash-stat"><span class="dash-stat-value">${latest.scaledScore ?? latest.percent}%</span><span class="dash-stat-label">Latest</span></div>` : ""}
    </div>`;
    if (latest?.domainBreakdown?.length) {
      html += `<ul class="dash-list kt-domain-list">`;
      for (const d of latest.domainBreakdown) {
        html += `<li>${escapeHtml(d.name.replace(/^Domain \d+: /, ""))} <strong>${d.percent}%</strong> (${d.correct}/${d.total})</li>`;
      }
      html += `</ul><p class="dash-hint">Domain scores from your latest practice attempt.</p>`;
    }
  }

  html += `<button type="button" class="btn btn-secondary btn-sm kt-open-practice" data-cert-id="${escapeHtml(categoryId)}">Open practice exam</button>
    </div></details>`;

  if (detail.cert?.passed) {
    html += `<p class="kt-cert-banner">Formal certification passed${detail.cert.recipientName ? ` — ${escapeHtml(detail.cert.recipientName)}` : ""}.</p>`;
  }

  html += renderHistorySection(detail, categoryId);

  html += `</div>`;
  return html;
}

/**
 * @param {ReturnType<typeof buildCategoryProgressDetail>} detail
 * @param {string} categoryId
 */
function renderHistorySection(detail, categoryId) {
  const rows = [
    ...detail.practiceHistory.map((e) => ({
      date: e.date,
      type: "Practice",
      score: `${e.scaledScore ?? e.percent}%`,
      result: e.passed ? "Pass" : "Fail",
    })),
    ...detail.workshopsHistory.map((e) => ({
      date: e.date,
      type: "Workshop (legacy)",
      score: `${e.percent}%`,
      result: "—",
    })),
    ...detail.drills.map((e) => ({
      date: e.date,
      type: "Drill",
      score: `${e.percent}%`,
      result: "—",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let body = "";
  if (rows.length === 0) {
    body = `<p class="dash-hint">No recorded attempts yet for this category.</p>`;
  } else {
    body = `<table class="history-table dash-history-table"><thead><tr>
      <th>Date</th><th>Type</th><th>Score</th><th>Result</th><th></th>
    </tr></thead><tbody>`;
    for (const row of rows.slice(0, 20)) {
      body += `<tr>
        <td>${formatDate(row.date)}</td>
        <td>${escapeHtml(row.type)}</td>
        <td>${escapeHtml(row.score)}</td>
        <td>${escapeHtml(row.result)}</td>
        <td><button type="button" class="history-delete" data-date="${escapeHtml(row.date)}" aria-label="Delete">×</button></td>
      </tr>`;
    }
    body += `</tbody></table>`;
    if (rows.length > 20) {
      body += `<p class="dash-hint">Showing 20 most recent of ${rows.length} entries.</p>`;
    }
  }

  return `<details class="page-collapse kt-drill-section">
    <summary class="browse-vendor-summary"><span class="browse-vendor-title">Attempt history (this category)</span></summary>
    <div class="page-collapse-body" data-kt-history-cert="${escapeHtml(categoryId)}">${body}</div>
  </details>`;
}

/**
 * @param {HTMLElement} root
 * @param {object} opts
 * @param {string|null} selected
 */
function bindDrilldownActions(root, opts, selected) {
  root.querySelectorAll(".kt-open-workshop").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.getAttribute("data-category-id");
      const level = btn.getAttribute("data-level");
      if (categoryId && level) opts.onOpenWorkshop(categoryId, level);
    });
  });

  root.querySelectorAll(".kt-open-practice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const certId = btn.getAttribute("data-cert-id");
      if (certId) opts.onOpenPractice(certId);
    });
  });

  const historyCert = root.querySelector("[data-kt-history-cert]")?.getAttribute("data-kt-history-cert");
  if (historyCert) {
    root.querySelectorAll(".history-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = btn.getAttribute("data-date");
        if (!date || !window.confirm("Delete this attempt from your history?")) return;
        removeHistoryEntry(historyCert, date);
        renderKeytrainProgressDashboard({ ...opts, selectedCategoryId: selected ?? historyCert });
        opts.onHistoryChange?.();
      });
    });
  }
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} examIndexList
 * @returns {boolean}
 */
export function hasKeytrainProgressData(examIndexList) {
  const summary = buildKeytrainProgressSummary(examIndexList);
  return (
    summary.completedSlots > 0 ||
    summary.practiceAttempts > 0 ||
    listAllWorkshopProgress().length > 0
  );
}


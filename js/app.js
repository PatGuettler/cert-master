import {
  loadExamIndex,
  loadCert,
  selectExamQuestions,
  selectDrillQuestions,
  getDomainPoolStatus,
  getDomainAccuracySummary,
  clearExamCaches,
} from "./cert-loader.js";
import {
  loadSettings,
  appendHistory,
  updateWeakQuestions,
  getWeakQuestions,
  getResumeState,
  clearResumeState,
  getBookmarks,
  purgeStaleResumeStates,
} from "./storage.js";
import { initMenu } from "./menu.js";
import { runExam } from "./exam-engine.js";
import { scoreExam } from "./scoring.js";
import { buildStudyPlan } from "./study-plan.js";
import { initAds, updateAdVisibility } from "./ads.js";
import { initStorageNotice } from "./storage-notice.js";
import { buildTrendLine } from "./history-ui.js";
import { renderDashboard, renderProgressTeaser } from "./dashboard-ui.js";
import { renderLanding } from "./landing-ui.js";

const LAST_CERT_KEY = "aws-cert-master:lastCert";
import { initDataPanel } from "./data-panel.js";
import { renderBookmarkReview } from "./review-ui.js";

let activeCertId = "";
/** @type {import('./cert-loader.js').ExamIndexEntry[]} */
let examIndexList = [];
/** @type {ReturnType<typeof initMenu>|null} */
let menuApi = null;

/** @type {import('./cert-loader.js').CertData|null} */
let currentCert = null;
/** @type {import('./config.js').ExamSettings} */
let settings = {
  timeLimitEnabled: true,
  immediateFeedback: false,
  showDocLinks: true,
};
/** @type {import('./cert-loader.js').Question[]} */
let examQuestions = [];
/** @type {Record<string, string[]>} */
let responses = {};
/** @type {ReturnType<typeof scoreExam>|null} */
let lastResult = null;
/** @type {{ stopTimer: () => void }|null} */
let examController = null;
/** @type {'exam'|'drill'} */
let sessionMode = "exam";

const views = {
  landing: document.getElementById("view-landing"),
  cert: document.getElementById("view-cert"),
  dashboard: document.getElementById("view-dashboard"),
  exam: document.getElementById("view-exam"),
  results: document.getElementById("view-results"),
  study: document.getElementById("view-study"),
  review: document.getElementById("view-review"),
};

const headerTitle = document.getElementById("header-title");
const examTimer = document.getElementById("exam-timer");

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el?.classList.toggle("hidden", key !== name);
  });
  examTimer?.classList.toggle("hidden", name !== "exam");
  updateAdVisibility(name !== "exam");
}

function setHeaderTitle(text) {
  if (headerTitle) headerTitle.textContent = text;
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @returns {{ type: 'landing' } | { type: 'cert', certId: string }}
 */
function parseRoute(exams) {
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw) return { type: "landing" };

  let certId = "";
  if (raw.startsWith("cert/")) {
    certId = raw.slice(5);
  } else {
    certId = raw;
  }

  if (certId && exams.some((e) => e.id === certId)) {
    return { type: "cert", certId };
  }
  return { type: "landing" };
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 */
function getDefaultCertId(exams) {
  const last = localStorage.getItem(LAST_CERT_KEY);
  if (last && exams.some((e) => e.id === last)) return last;
  const preferred = exams.find((e) => e.id === "cloud-practitioner");
  if (preferred) return preferred.id;
  return exams[0]?.id ?? "";
}

function setCertHash(certId) {
  const base = window.location.pathname + window.location.search;
  window.location.hash = `cert/${certId}`;
}

function clearAppHash() {
  const base = window.location.pathname + window.location.search;
  history.replaceState(null, "", base);
}

function saveLastCert(certId) {
  if (certId) localStorage.setItem(LAST_CERT_KEY, certId);
}

function showLanding() {
  showView("landing");
  setHeaderTitle("AWS Cert Master");
  renderLanding(examIndexList, openCert);
}

function showCertView() {
  if (!currentCert) return;
  showView("cert");
  populateCert();
  setHeaderTitle(currentCert.name);
}

/**
 * @param {string} certId
 */
async function openCert(certId) {
  await switchCert(certId);
}

/**
 * @param {HTMLSelectElement|null} select
 * @param {string} selectedId
 */
function syncCertFilterOptions(select, selectedId) {
  if (!select) return;
  const awsExams = examIndexList
    .filter((e) => (e.vendor ?? "aws") === "aws")
    .sort((a, b) => a.name.localeCompare(b.name));

  const prev = select.value || selectedId;
  select.innerHTML = "";
  for (const exam of awsExams) {
    const opt = document.createElement("option");
    opt.value = exam.id;
    opt.textContent = exam.code ? `${exam.name} (${exam.code})` : exam.name;
    select.appendChild(opt);
  }
  if (awsExams.some((e) => e.id === prev)) select.value = prev;
  else if (awsExams.some((e) => e.id === selectedId)) select.value = selectedId;
  else if (awsExams[0]) select.value = awsExams[0].id;
}

/**
 * @param {import('./cert-loader.js').CertData} cert
 */
function buildCertDescription(cert) {
  const weights = cert.domains.map((d) => `${d.weight}%`).join(" / ");
  const e = cert.exam;
  return `Each attempt draws <strong>${e.totalQuestions} random questions</strong> from the bank using official <strong>${cert.code}</strong> domain weights (${weights}), with shuffled order and answer choices. Mirrors the real exam format: ${e.scoredQuestions} scored questions, ${e.timeLimitMinutes} minutes, pass/fail at ${e.passingScore}. Unofficial practice — not actual exam content.`;
}

async function renderDashboardForFilter() {
  const select = document.getElementById("dashboard-cert-filter");
  const certId = select?.value || activeCertId;
  if (!certId) return;

  const cert =
    certId === activeCertId && currentCert
      ? currentCert
      : await loadCert(certId);

  renderDashboard(certId, cert, { onHistoryChange: refreshDataViews });
}

function minutesSince(iso) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000);
}

function getActiveView() {
  for (const [key, el] of Object.entries(views)) {
    if (el && !el.classList.contains("hidden")) return key;
  }
  return "landing";
}

function refreshDataViews() {
  const active = getActiveView();
  if (active === "dashboard") {
    renderDashboardForFilter();
    return;
  }
  if (active === "landing") {
    renderLanding(examIndexList, openCert);
    return;
  }
  if (!currentCert || !activeCertId) return;
  if (active === "cert") {
    populateCert();
    return;
  }
  if (active === "results" && lastResult) {
    renderResults();
  }
}

/**
 * @param {object} resume
 */
function restoreExam(resume) {
  if (!currentCert) return;
  sessionMode = "exam";
  examQuestions = resume.questions;
  responses = { ...resume.responses };
  settings = resume.settings
    ? { ...settings, ...resume.settings }
    : loadSettings(activeCertId);

  showView("exam");
  setHeaderTitle(`${currentCert.code} — Practice Exam (resumed)`);
  examController?.stopTimer?.();

  examController = runExam({
    cert: currentCert,
    certId: activeCertId,
    questions: examQuestions,
    settings,
    responses,
    onResponsesChange: (r) => {
      responses = r;
    },
    onFinish: finishExam,
    resume: {
      index: resume.index,
      remainingSeconds: resume.remainingSeconds,
      revealed: resume.revealed,
      startedAt: resume.startedAt,
    },
  });
}

async function tryResumePrompt() {
  const resume = getResumeState(activeCertId);
  if (!resume || !currentCert) return;

  const mins = minutesSince(resume.savedAt);
  const timeLeft = Math.floor((resume.remainingSeconds ?? 0) / 60);
  const ok = window.confirm(
    `You have an exam in progress from ${mins} minute(s) ago (${timeLeft} minute(s) remaining on the timer). Resume?`
  );
  if (ok) restoreExam(resume);
  else clearResumeState(activeCertId);
}

async function init() {
  purgeStaleResumeStates();
  clearExamCaches();
  const exams = await loadExamIndex({ reload: true });
  examIndexList = exams;

  if (exams.length === 0) {
    setHeaderTitle("AWS Cert Master");
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `<p role="alert">No exams found. Add a JSON file under <code>data/exams/</code> and run <code>python3 scripts/build-exams-index.py</code>.</p>`;
    }
    menuApi = initMenu({
      exams: [],
      getActiveCertId: () => "",
      settings,
      onExamChange: () => {},
      onSettingsChange: (next) => {
        settings = next;
      },
      onNavigateHome: goLanding,
      onNavigateDashboard: () => {},
    });
    initDataPanel({
      getScopeCertId: () => "",
      getActiveCertId: () => "",
      getCertIds: () => [],
      onDataChange: refreshDataViews,
    });
    return;
  }

  activeCertId = getDefaultCertId(exams);
  settings = loadSettings(activeCertId);

  const route = parseRoute(exams);
  if (route.type === "cert") {
    await switchCert(route.certId, { fromRoute: true });
    if (!window.location.hash.includes("cert/")) {
      setCertHash(route.certId);
    }
    await tryResumePrompt();
  } else {
    clearAppHash();
    currentCert = null;
    showLanding();
    setHeaderTitle("AWS Cert Master");
  }

  menuApi = initMenu({
    exams,
    getActiveCertId: () => activeCertId,
    settings,
    onExamChange: switchCert,
    onSettingsChange: (next) => {
      settings = next;
    },
    onNavigateHome: goLanding,
    onNavigateDashboard: showDashboard,
  });

  window.addEventListener("hashchange", () => {
    const route = parseRoute(examIndexList);
    if (route.type === "landing") {
      showLanding();
      return;
    }
    if (route.type === "cert" && route.certId !== activeCertId) {
      switchCert(route.certId, { fromRoute: true });
    }
  });

  initDataPanel({
    getScopeCertId: () => {
      const sel = document.getElementById("data-cert-filter");
      return sel?.value || activeCertId;
    },
    getActiveCertId: () => activeCertId,
    getCertIds: () => examIndexList.map((e) => e.id),
    onDataChange: refreshDataViews,
  });

  syncCertFilterOptions(
    document.getElementById("data-cert-filter"),
    activeCertId
  );
  document.getElementById("dashboard-cert-filter")?.addEventListener(
    "change",
    () => {
      renderDashboardForFilter();
    }
  );
}

/**
 * @param {string} certId
 * @param {{ fromRoute?: boolean }} [opts]
 */
async function switchCert(certId, opts = {}) {
  const exams = await loadExamIndex({ reload: true });
  examIndexList = exams;
  menuApi?.updateExamList(exams);

  if (!exams.some((e) => e.id === certId)) {
    certId = getDefaultCertId(exams);
  }

  activeCertId = certId;
  saveLastCert(certId);
  if (!opts.fromRoute) {
    setCertHash(certId);
  }

  currentCert = await loadCert(certId);
  settings = loadSettings(certId);
  menuApi?.setActiveCert(certId);
  menuApi?.refreshSettings(settings);
  syncCertFilterOptions(
    document.getElementById("data-cert-filter"),
    activeCertId
  );
  const dashFilter = document.getElementById("dashboard-cert-filter");
  if (dashFilter && !views.dashboard?.classList.contains("hidden")) {
    dashFilter.value = certId;
  }
  showCertView();
}

function populateCert() {
  if (!currentCert) return;

  const cert = currentCert;
  document.getElementById("home-cert-name").textContent = cert.name;
  document.getElementById("home-cert-code").textContent = cert.code;

  const desc = document.getElementById("home-cert-description");
  if (desc) desc.innerHTML = buildCertDescription(cert);

  const poolWarning = document.getElementById("pool-warning");
  const poolStatus = getDomainPoolStatus(cert);
  const shortDomains = poolStatus.filter((d) => d.available < d.required);
  const bankSize = cert.questions.length;
  const examSize = cert.exam.totalQuestions;

  if (shortDomains.length > 0) {
    poolWarning?.classList.remove("hidden");
    if (poolWarning) {
      poolWarning.textContent = `Some exam domains need more questions in the JSON bank: ${shortDomains.map((d) => `${d.name} (${d.available}/${d.required})`).join("; ")}.`;
    }
  } else if (bankSize < examSize) {
    poolWarning?.classList.remove("hidden");
    if (poolWarning) {
      poolWarning.textContent = `Question bank has ${bankSize} questions; add more for greater variety across attempts.`;
    }
  } else {
    poolWarning?.classList.add("hidden");
  }

  document.getElementById("meta-questions").textContent = String(examSize);
  document.getElementById("meta-bank").textContent = String(bankSize);
  document.getElementById("meta-time").textContent = String(
    cert.exam.timeLimitMinutes
  );
  document.getElementById("meta-pass").textContent = String(
    cert.exam.passingScore
  );

  const weakMap = getWeakQuestions(activeCertId);
  const domainAcc = getDomainAccuracySummary(cert, weakMap);

  const domainList = document.getElementById("domain-list");
  if (domainList) {
    domainList.innerHTML = "";
    for (const d of domainAcc) {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = d.name;
      const right = document.createElement("strong");
      if (d.accuracy !== null) {
        right.textContent = `${d.weight}% · ${d.accuracy}% acc`;
        if (d.isWeakest) {
          const warn = document.createElement("span");
          warn.className = "domain-weak-badge";
          warn.textContent = " ⚠ Weakest";
          right.appendChild(warn);
        }
      } else {
        right.textContent = `${d.weight}%`;
      }
      li.append(label, right);
      domainList.appendChild(li);
    }
  }

  document.getElementById("domain-heading").textContent =
    `Exam domains (${cert.code})`;

  renderProgressTeaser(activeCertId, cert);
}

async function showDashboard() {
  if (!examIndexList.length) return;
  if (!activeCertId) {
    activeCertId = getDefaultCertId(examIndexList);
  }
  if (!currentCert && activeCertId) {
    currentCert = await loadCert(activeCertId);
    settings = loadSettings(activeCertId);
    menuApi?.setActiveCert(activeCertId);
  }
  showView("dashboard");
  setHeaderTitle("Your progress");
  syncCertFilterOptions(
    document.getElementById("dashboard-cert-filter"),
    activeCertId
  );
  await renderDashboardForFilter();
}

function launchExamSession(questions, mode) {
  if (!currentCert) return;

  sessionMode = mode;
  examQuestions = questions;
  responses = {};

  showView("exam");
  setHeaderTitle(
    mode === "drill"
      ? `${currentCert.code} — Drill`
      : `${currentCert.code} — Practice Exam`
  );

  examController?.stopTimer?.();

  examController = runExam({
    cert: currentCert,
    certId: activeCertId,
    questions: examQuestions,
    settings:
      mode === "drill"
        ? { ...settings, timeLimitEnabled: false }
        : settings,
    responses,
    onResponsesChange: (r) => {
      responses = r;
    },
    onFinish: finishExam,
    isDrill: mode === "drill",
  });
}

function startExam() {
  if (!currentCert) return;
  clearResumeState(activeCertId);
  const weakMap = getWeakQuestions(activeCertId);
  const questions = selectExamQuestions(currentCert, { certId: activeCertId, weakMap });
  launchExamSession(questions, "exam");
}

function startDrill() {
  if (!currentCert || !lastResult) return;
  clearResumeState(activeCertId);
  const weakMap = getWeakQuestions(activeCertId);
  const questions = selectDrillQuestions(
    currentCert,
    lastResult.missedQuestions,
    weakMap
  );
  if (questions.length === 0) {
    window.alert("No questions available for drill mode.");
    return;
  }
  launchExamSession(questions, "drill");
}

/**
 * @param {{ durationSeconds?: number }} [meta]
 */
function finishExam(meta = {}) {
  if (!currentCert) return;
  examController?.stopTimer?.();
  clearResumeState(activeCertId);

  lastResult = scoreExam(currentCert, examQuestions, responses);

  const entry = {
    date: new Date().toISOString(),
    scaledScore: lastResult.scaledScore,
    passed: lastResult.passed,
    percent: lastResult.percent,
    correctCount: lastResult.correctCount,
    totalScored: lastResult.totalScored,
    domainBreakdown: lastResult.domainBreakdown,
    missedQuestions: lastResult.missedQuestions,
    durationSeconds: meta.durationSeconds ?? 0,
    type: sessionMode === "drill" ? "drill" : "exam",
  };

  appendHistory(activeCertId, entry);

  if (sessionMode === "exam") {
    updateWeakQuestions(
      activeCertId,
      lastResult.missedQuestions,
      examQuestions.map((q) => q.id)
    );
  }

  renderResults();
  showView("results");
  setHeaderTitle(
    sessionMode === "drill" ? "Drill Results" : "Exam Results"
  );
}

function renderResults() {
  if (!currentCert || !lastResult) return;

  const header = document.getElementById("results-header");
  const title = document.getElementById("results-title");
  const scoreEl = document.getElementById("results-score");
  const detail = document.getElementById("results-detail");
  const trendEl = document.getElementById("results-trend");

  const pass = lastResult.passed;
  const isDrill = sessionMode === "drill";

  header?.classList.toggle("pass", pass && !isDrill);
  header?.classList.toggle("fail", !pass && !isDrill);

  if (title) {
    title.textContent = isDrill
      ? "Drill complete"
      : pass
        ? "Pass"
        : "Fail";
  }
  if (scoreEl) {
    scoreEl.textContent = isDrill
      ? `${lastResult.percent}% correct`
      : `${lastResult.scaledScore} / ${currentCert.exam.maxScore}`;
  }
  if (detail) {
    detail.textContent = `${lastResult.correctCount} of ${lastResult.totalScored} scored questions correct (${lastResult.percent}%).${
      isDrill
        ? ""
        : ` Passing score: ${currentCert.exam.passingScore}.`
    }`;
  }

  if (trendEl) {
    if (isDrill) {
      trendEl.textContent =
        "Drill sessions are saved separately and do not affect your main exam score trend.";
      trendEl.classList.remove("hidden");
    } else {
      const line = buildTrendLine(activeCertId, currentCert, lastResult);
      trendEl.textContent = line;
      trendEl.classList.toggle("hidden", !line);
    }
  }

  const domainBody = document.getElementById("domain-results-body");
  if (domainBody) {
    domainBody.innerHTML = "";
    for (const d of lastResult.domainBreakdown) {
      const row = document.createElement("div");
      row.className = "domain-bar-row";

      const headerRow = document.createElement("header");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = d.name;
      const statSpan = document.createElement("span");
      statSpan.textContent = `${d.correct}/${d.total} (${d.percent}%)`;
      headerRow.append(nameSpan, statSpan);

      const bar = document.createElement("div");
      bar.className = "domain-bar";
      const fill = document.createElement("div");
      fill.className = `domain-bar-fill${d.weak ? " weak" : ""}`;
      fill.style.width = `${d.percent}%`;
      bar.appendChild(fill);
      row.append(headerRow, bar);
      domainBody.appendChild(row);
    }
  }

  const drillBtn = document.getElementById("btn-drill");
  drillBtn?.classList.toggle("hidden", isDrill);

  const bookmarkBtn = document.getElementById("btn-review-bookmarks");
  const bookmarks = getBookmarks(activeCertId);
  const flagged = examQuestions.filter((q) => bookmarks.has(q.id));
  bookmarkBtn?.classList.toggle("hidden", flagged.length === 0);
}

function openBookmarkReview() {
  if (!currentCert) return;
  const bookmarks = getBookmarks(activeCertId);
  const flagged = examQuestions.filter((q) => bookmarks.has(q.id));
  renderBookmarkReview(flagged, responses, settings);
  showView("review");
  setHeaderTitle("Flagged questions");
}

function renderStudyPlan() {
  if (!currentCert || !lastResult) return;
  showView("study");
  setHeaderTitle("Study Plan");

  const plan = buildStudyPlan(currentCert, lastResult);
  const container = document.getElementById("study-plan-content");

  if (!container) return;

  if (plan.length === 0) {
    container.innerHTML =
      "<p>Great job — no weak domains detected. Review the official exam guide if you want extra preparation.</p>";
    return;
  }

  container.innerHTML = "";
  for (const section of plan) {
    const block = document.createElement("section");
    block.className = "study-domain";

    const h4 = document.createElement("h4");
    h4.textContent = `${section.name} — ${section.scorePercent}% on this attempt`;
    block.appendChild(h4);

    const intro = document.createElement("p");
    intro.textContent =
      "Focus on these official AWS resources for this domain:";
    block.appendChild(intro);

    const ul = document.createElement("ul");
    ul.className = "resource-list";
    for (const r of section.resources) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = r.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = r.title;
      li.appendChild(a);
      ul.appendChild(li);
    }
    block.appendChild(ul);
    container.appendChild(block);
  }
}

function goLanding() {
  examController?.stopTimer?.();
  clearAppHash();
  showLanding();
}

document.getElementById("btn-start")?.addEventListener("click", startExam);
document.getElementById("btn-open-dashboard")?.addEventListener("click", showDashboard);
document.getElementById("btn-back-landing")?.addEventListener("click", goLanding);
document.getElementById("btn-dashboard-home")?.addEventListener("click", goLanding);
document.getElementById("landing-tile-dashboard")?.addEventListener("click", showDashboard);
document.getElementById("landing-tile-browse")?.addEventListener("click", () => {
  document.getElementById("landing-cert-grid")?.scrollIntoView({ behavior: "smooth" });
});
document.getElementById("landing-tile-clf")?.addEventListener("click", () => {
  openCert("cloud-practitioner");
});
document.getElementById("btn-dashboard-start")?.addEventListener("click", async () => {
  const certId =
    document.getElementById("dashboard-cert-filter")?.value || activeCertId;
  if (certId && certId !== activeCertId) await switchCert(certId);
  startExam();
});
document.getElementById("btn-view-dashboard")?.addEventListener("click", showDashboard);
document.getElementById("btn-home")?.addEventListener("click", goLanding);
document.getElementById("btn-retake")?.addEventListener("click", startExam);
document.getElementById("btn-drill")?.addEventListener("click", startDrill);
document.getElementById("btn-study-plan")?.addEventListener("click", renderStudyPlan);
document.getElementById("btn-review-bookmarks")?.addEventListener("click", openBookmarkReview);
document.getElementById("btn-back-results")?.addEventListener("click", () => {
  showView("results");
  setHeaderTitle(sessionMode === "drill" ? "Drill Results" : "Exam Results");
});
document.getElementById("btn-back-results-from-review")?.addEventListener("click", () => {
  showView("results");
  setHeaderTitle(sessionMode === "drill" ? "Drill Results" : "Exam Results");
});

document.getElementById("btn-retake-study")?.addEventListener("click", startExam);

initStorageNotice();
initAds();

init().catch((err) => {
  console.error(err);
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = `<p role="alert">Failed to load application: ${err.message}</p>`;
  }
});

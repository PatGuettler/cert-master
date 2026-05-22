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
import { initAds } from "./ads.js";
import { initStorageNotice } from "./storage-notice.js";
import { buildTrendLine } from "./history-ui.js";
import { renderDashboard, renderProgressTeaser } from "./dashboard-ui.js";
import { renderBrowse, bindBrowseSearch, bindBrowseCollapse } from "./browse-ui.js";
import { bindAllPageCollapse } from "./collapse-ui.js";
import { runAcronymQuiz } from "./acronym-engine.js";

import { initDataPanel } from "./data-panel.js";
import { renderBookmarkReview } from "./review-ui.js";
import { getSiteRoot } from "./paths.js";
import {
  parseRoute,
  normalizeLegacyRoutes,
  navigateHome,
  navigateBrowse,
  navigateCert,
  navigateKeytrainHub,
  navigateKeytrainCert,
  navigateKeytrainWorkshops,
  navigateKeytrainWorkshop,
  isBrowsePathActive,
  isKeytrainHubPathActive,
  isKeytrainWorkshopsPathActive,
  appPathUrl,
} from "./routes.js";
import { APP_NAME, APP_SLUG } from "./config.js";
import { loadKeytrainCatalog, loadKeytrainProgram } from "./keytrain-loader.js";
import {
  renderKeytrainCertPage,
  renderKeytrainResults,
  bindKeytrainResultsActions,
  renderKeytrainCertificateForm,
} from "./keytrain-ui.js";
import {
  getKeytrainIssuance,
  saveKeytrainIssuance,
  makeCertificateId,
} from "./keytrain-storage.js";
import { renderKeytrainHub, renderKeytrainWorkshops } from "./key-training-ui.js";
import { getKeytrainWorkshop } from "./workshops/keytrain-workshop-content.js";
import { runWorkshop } from "./workshop-runner.js";
import { recordWorkshopCompletion } from "./keytrain-progress-storage.js";
import { renderKeytrainProgressDashboard } from "./keytrain-progress-ui.js";

/** Dashboard filter value for KeyTrain overview (all categories). */
const KEYTRAIN_OVERVIEW_ID = "__keytrain_overview__";

const LAST_CERT_KEY = `${APP_SLUG}:lastCert`;

let activeCertId = "";
let appReady = false;
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
/** @type {{ stop: () => void }|null} */
let workshopController = null;
/** @type {'exam'|'drill'|'keytrain'|'workshop'} */
let sessionMode = "exam";

/** @type {import('./keytrain-loader.js').KeytrainCertSummary[]} */
let keytrainCatalog = [];
/** @type {string} */
let activeKeytrainId = "";
/** @type {Awaited<ReturnType<typeof loadKeytrainProgram>>|null} */
let keytrainProgram = null;
/** @type {ReturnType<typeof scoreExam>|null} */
let keytrainResult = null;

const views = {
  error: document.getElementById("view-error"),
  landing: document.getElementById("view-landing"),
  browse: document.getElementById("view-browse"),
  cert: document.getElementById("view-cert"),
  acronyms: document.getElementById("view-acronyms"),
  dashboard: document.getElementById("view-dashboard"),
  exam: document.getElementById("view-exam"),
  results: document.getElementById("view-results"),
  study: document.getElementById("view-study"),
  review: document.getElementById("view-review"),
  keytrainHub: document.getElementById("view-keytrain-hub"),
  keytrainCert: document.getElementById("view-keytrain-cert"),
  keytrainResults: document.getElementById("view-keytrain-results"),
  keytrainCertificate: document.getElementById("view-keytrain-certificate"),
  keytrainWorkshops: document.getElementById("view-keytrain-workshops"),
  keytrainWorkshop: document.getElementById("view-keytrain-workshop"),
};

/** @type {{ stop: () => void }|null} */
let acronymController = null;

/** @type {Record<string, unknown>|null} */

const headerTitle = document.getElementById("header-title");
const examTimer = document.getElementById("exam-timer");

function hideAllViews() {
  Object.values(views).forEach((el) => el?.classList.add("hidden"));
  examTimer?.classList.add("hidden");
}

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el?.classList.toggle("hidden", key !== name);
  });
  examTimer?.classList.toggle("hidden", name !== "exam");
  window.scrollTo(0, 0);
}

function setHeaderTitle(text) {
  if (headerTitle) headerTitle.textContent = text;
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

function setCertHash(certId, sub = "") {
  navigateCert(certId, sub);
}

function saveLastCert(certId) {
  if (certId) localStorage.setItem(LAST_CERT_KEY, certId);
}

function setBrowseHash() {
  if (!isBrowsePathActive()) {
    navigateBrowse();
  }
}

function showLanding() {
  showView("landing");
  setHeaderTitle(APP_NAME);
}

/**
 * @param {{ fromRoute?: boolean }} [opts]
 */
function showBrowse(opts = {}) {
  showView("browse");
  setHeaderTitle("Browse certifications");
  renderBrowse(examIndexList, openCert);
  if (!opts.fromRoute) {
    setBrowseHash();
  }
  document.getElementById("browse-search")?.focus();
}

function goBrowse() {
  if (!appReady) return;
  applyRoute({ type: "browse" });
}

function showKeytrainWorkshopsView() {
  showView("keytrainWorkshops");
  setHeaderTitle("KeyTrain · Workshops");
  renderKeytrainWorkshops(startWorkshop);
  const panel = document.getElementById("view-keytrain-workshops");
  if (panel) bindAllPageCollapse(panel);
}

function goKeytrainWorkshops() {
  if (!appReady) return;
  applyRoute({ type: "keytrain-workshops" });
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
  const allExams = [...examIndexList].sort((a, b) => {
    const order = { keytraining: -1, aws: 0, azure: 1, google: 2, comptia: 3 };
    const va = order[a.vendor ?? "aws"] ?? 9;
    const vb = order[b.vendor ?? "aws"] ?? 9;
    if (va !== vb) return va - vb;
    return a.name.localeCompare(b.name);
  });

  const prev = select.value || selectedId;
  select.innerHTML = "";
  for (const exam of allExams) {
    const opt = document.createElement("option");
    opt.value = exam.id;
    const vendorLabels = {
      keytraining: "Key Training",
      aws: "AWS",
      azure: "Azure",
      google: "Google",
      comptia: "CompTIA",
    };
    const vendor = vendorLabels[exam.vendor ?? "aws"] ?? exam.vendor ?? "Cert";
    opt.textContent = exam.code
      ? `[${vendor}] ${exam.name} (${exam.code})`
      : `[${vendor}] ${exam.name}`;
    select.appendChild(opt);
  }
  if (allExams.some((e) => e.id === prev)) select.value = prev;
  else if (allExams.some((e) => e.id === selectedId)) select.value = selectedId;
  else if (allExams[0]) select.value = allExams[0].id;
}

/**
 * @param {import('./cert-loader.js').CertData} cert
 */
function buildCertDescription(cert) {
  const weights = cert.domains.map((d) => `${d.weight}%`).join(" / ");
  const e = cert.exam;
  const vendor = cert.vendor ?? "aws";
  if (vendor === "keytraining") {
    return `Each attempt draws <strong>${e.totalQuestions} random questions</strong> across <strong>${cert.code}</strong> topic areas (${weights}). Scenarios cover the sub-topics in this Key Training domain—study mode with optional feedback and pause/resume. Formal pass/fail certification is available from the KeyTrain's Key Training hub.`;
  }
  const vendorName =
    vendor === "azure"
      ? "Microsoft"
      : vendor === "google"
        ? "Google Cloud"
        : vendor === "comptia"
          ? "CompTIA"
          : "AWS";
  return `Each attempt draws <strong>${e.totalQuestions} random questions</strong> from the bank using official <strong>${cert.code}</strong> domain weights (${weights}), with shuffled order and answer choices. Mirrors the real exam format: ${e.scoredQuestions} scored questions, ${e.timeLimitMinutes} minutes, pass/fail at ${e.passingScore}. Original practice aligned to ${vendorName} exam guides—with reference links to official documentation, not copied exam items.`;
}

/**
 * @param {HTMLSelectElement|null} select
 * @param {string} selectedId
 */
function syncDashboardCertFilter(select, selectedId) {
  if (!select) return;
  const keytrain = examIndexList
    .filter((e) => e.vendor === "keytraining")
    .sort((a, b) => a.name.localeCompare(b.name));
  const other = examIndexList
    .filter((e) => e.vendor !== "keytraining")
    .sort((a, b) => a.name.localeCompare(b.name));

  const prev = select.value || selectedId;
  select.innerHTML = "";

  if (keytrain.length > 0) {
    const overview = document.createElement("option");
    overview.value = KEYTRAIN_OVERVIEW_ID;
    overview.textContent = "KeyTrain — all categories (overview)";
    select.appendChild(overview);

    const ktGroup = document.createElement("optgroup");
    ktGroup.label = "KeyTrain — drill down by category";
    for (const exam of keytrain) {
      const opt = document.createElement("option");
      opt.value = exam.id;
      opt.textContent = `${exam.name.replace(/^KeyTrain's Key Training — /, "")} (${exam.code || exam.id})`;
      ktGroup.appendChild(opt);
    }
    select.appendChild(ktGroup);
  }

  if (other.length > 0) {
    const og = document.createElement("optgroup");
    og.label = "Other certifications";
    for (const exam of other) {
      const opt = document.createElement("option");
      opt.value = exam.id;
      const vendor = exam.vendor ?? "aws";
      opt.textContent = exam.code
        ? `[${vendor}] ${exam.name} (${exam.code})`
        : `[${vendor}] ${exam.name}`;
      og.appendChild(opt);
    }
    select.appendChild(og);
  }

  if (prev === KEYTRAIN_OVERVIEW_ID) select.value = KEYTRAIN_OVERVIEW_ID;
  else if (examIndexList.some((e) => e.id === prev)) select.value = prev;
  else if (keytrain.length > 0) select.value = KEYTRAIN_OVERVIEW_ID;
  else if (examIndexList.some((e) => e.id === selectedId)) select.value = selectedId;
  else if (examIndexList[0]) select.value = examIndexList[0].id;
}

async function renderDashboardForFilter() {
  const select = document.getElementById("dashboard-cert-filter");
  const certId = select?.value || activeCertId;
  const nameEl = document.getElementById("dashboard-cert-name");
  const codeEl = document.getElementById("dashboard-cert-code");
  const startBtn = document.getElementById("btn-dashboard-start");

  const examMeta = examIndexList.find((e) => e.id === certId);
  const showKeytrainView =
    certId === KEYTRAIN_OVERVIEW_ID ||
    examMeta?.vendor === "keytraining";

  if (showKeytrainView && examIndexList.some((e) => e.vendor === "keytraining")) {
    if (nameEl) nameEl.textContent = "KeyTrain progress";
    if (codeEl) {
      codeEl.textContent =
        certId === KEYTRAIN_OVERVIEW_ID
          ? "All categories · workshops & practice"
          : examMeta?.code ?? certId;
    }
    startBtn?.classList.add("hidden");
    renderKeytrainProgressDashboard({
      examIndexList,
      selectedCategoryId:
        certId === KEYTRAIN_OVERVIEW_ID ? null : certId,
      onOpenWorkshop: (categoryId, level) => startWorkshop(categoryId, level),
      onOpenPractice: (id) => openCert(id),
      loadCert,
      onHistoryChange: refreshDataViews,
    });
    return;
  }

  startBtn?.classList.remove("hidden");
  if (!certId) return;

  const cert =
    certId === activeCertId && currentCert
      ? currentCert
      : await loadCert(certId);

  if (nameEl) nameEl.textContent = cert.name;
  if (codeEl) codeEl.textContent = cert.code;

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
  if (active === "browse") {
    renderBrowse(examIndexList, openCert);
    return;
  }
  if (!currentCert || !activeCertId) return;
  if (active === "cert") {
    populateCert();
    return;
  }
  if (active === "acronyms" && currentCert) {
    showAcronyms({ fromRoute: true });
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

function showBootstrapError(err) {
  appReady = true;
  hideAllViews();
  const errView = document.getElementById("view-error");
  if (errView) {
    errView.classList.remove("hidden");
    errView.innerHTML = `
      <div class="init-error" role="alert">
        <h2>Could not load exams</h2>
        <p>${err.message}</p>
        <p class="init-error-hint">Tried loading from: <code>${getSiteRoot()}data/exams-index.json</code></p>
        <p>After pushing updates, wait for GitHub Pages to finish deploying, then hard-refresh (Ctrl+Shift+R).</p>
        <button type="button" class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>`;
  }
  setHeaderTitle(APP_NAME);
}

/**
 * @param {{ type: string, certId?: string }} route
 */
async function applyRoute(route) {
  if (route.type === "landing") {
    acronymController?.stop();
    examController?.stopTimer?.();
    currentCert = null;
    navigateHome();
    showLanding();
    return;
  }

  if (route.type === "browse") {
    acronymController?.stop();
    examController?.stopTimer?.();
    currentCert = null;
    if (!isBrowsePathActive()) navigateBrowse();
    showBrowse({ fromRoute: true });
    return;
  }

  if (route.type === "acronyms") {
    await switchCert(route.certId, { fromRoute: true });
    showAcronyms({ fromRoute: true });
    return;
  }

  if (route.type === "cert") {
    await switchCert(route.certId, { fromRoute: true });
    await tryResumePrompt();
    return;
  }

  if (route.type === "keytrain-workshops") {
    acronymController?.stop();
    examController?.stopTimer?.();
    currentCert = null;
    if (!isKeytrainWorkshopsPathActive()) {
      navigateKeytrainWorkshops();
    }
    showKeytrainWorkshopsView();
    return;
  }

  if (route.type === "keytrain-workshop" && route.certId) {
    acronymController?.stop();
    examController?.stopTimer?.();
    startWorkshop(route.certId, route.workshopLevel ?? "medium", { fromRoute: true });
    return;
  }

  if (route.type === "keytrain-hub") {
    acronymController?.stop();
    examController?.stopTimer?.();
    currentCert = null;
    keytrainProgram = null;
    if (!isKeytrainHubPathActive()) navigateKeytrainHub();
    showKeytrainHubView();
    return;
  }

  if (route.type === "keytrain-cert" && route.keytrainId) {
    await openKeytrainCert(route.keytrainId, { fromRoute: true });
    return;
  }

  if (route.type === "keytrain-certificate" && route.keytrainId) {
    await showKeytrainCertificateView(route.keytrainId, { fromRoute: true });
  }
}

function getKeytrainIds() {
  return keytrainCatalog.map((c) => c.id);
}

function showKeytrainHubView() {
  showView("keytrainHub");
  setHeaderTitle("KeyTrain");
  renderKeytrainHub(
    examIndexList,
    openCert,
    startWorkshop,
    openKeytrainCert,
    keytrainCatalog
  );
  const hub = document.getElementById("view-keytrain-hub");
  if (hub) bindAllPageCollapse(hub);
}

function goKeytrain() {
  if (!appReady) return;
  applyRoute({ type: "keytrain-hub" });
}

/**
 * @param {string} keytrainId
 * @param {{ fromRoute?: boolean }} [opts]
 */
async function openKeytrainCert(keytrainId, opts = {}) {
  activeKeytrainId = keytrainId;
  keytrainProgram = await loadKeytrainProgram(keytrainId, examIndexList);
  currentCert = keytrainProgram.cert;
  if (!opts.fromRoute) navigateKeytrainCert(keytrainId);
  showView("keytrainCert");
  setHeaderTitle("KeyTrain Certification");
  renderKeytrainCertPage(keytrainProgram, keytrainCatalog.find((c) => c.id === keytrainId));
}

function startKeytrainExam() {
  if (!keytrainProgram) return;
  const cert = keytrainProgram.cert;
  sessionMode = "keytrain";
  clearResumeState(cert.id);
  const questions = selectExamQuestions(cert, { certId: cert.id, weakMap: new Map() });
  launchExamSession(questions, "keytrain");
}

function finishKeytrainExam(meta = {}) {
  if (!keytrainProgram) return;
  examController?.stopTimer?.();
  const cert = keytrainProgram.cert;
  keytrainResult = scoreExam(cert, examQuestions, responses);
  const passed = keytrainResult.passed;

  if (passed) {
    const existing = getKeytrainIssuance(activeKeytrainId);
    saveKeytrainIssuance(activeKeytrainId, {
      recipientName: existing?.recipientName ?? "",
      certificateId: existing?.certificateId ?? makeCertificateId(),
      issuedAt: new Date().toISOString(),
      scaledScore: keytrainResult.scaledScore,
      passingScore: cert.exam.passingScore,
      passed: true,
      durationSeconds: meta.durationSeconds ?? 0,
    });
  }

  appendHistory(cert.id, {
    date: new Date().toISOString(),
    scaledScore: keytrainResult.scaledScore,
    passed,
    percent: keytrainResult.percent,
    correctCount: keytrainResult.correctCount,
    totalScored: keytrainResult.totalScored,
    domainBreakdown: keytrainResult.domainBreakdown,
    missedQuestions: keytrainResult.missedQuestions,
    durationSeconds: meta.durationSeconds ?? 0,
    type: "keytrain",
  });

  showKeytrainResultsView();
}

function showKeytrainResultsView() {
  if (!keytrainProgram || !keytrainResult) return;
  showView("keytrainResults");
  setHeaderTitle("KeyTrain Results");
  renderKeytrainResults({
    passed: keytrainResult.passed,
    scaledScore: keytrainResult.scaledScore,
    cert: keytrainProgram.cert,
    keytrain: keytrainProgram.keytrain,
  });
  const panel = document.getElementById("view-keytrain-results");
  if (panel?.dataset.actionsBound !== "1") {
    panel.dataset.actionsBound = "1";
    bindKeytrainResultsActions({
      onCertificate: () => showKeytrainCertificateView(activeKeytrainId),
      onRetake: startKeytrainExam,
      onHub: goKeytrain,
    });
  }
}

/**
 * @param {string} keytrainId
 * @param {{ fromRoute?: boolean }} [opts]
 */
async function showKeytrainCertificateView(keytrainId, opts = {}) {
  if (!keytrainProgram || keytrainProgram.keytrain.id !== keytrainId) {
    keytrainProgram = await loadKeytrainProgram(keytrainId, examIndexList);
  }
  const issued = getKeytrainIssuance(keytrainId);
  if (!issued?.passed) {
    goKeytrain();
    return;
  }
  if (!opts.fromRoute) navigateKeytrainCert(keytrainId, "certificate");
  showView("keytrainCertificate");
  setHeaderTitle("Your certificate");
  const score = keytrainResult?.scaledScore ?? issued.scaledScore;
  const certForm = document.getElementById("view-keytrain-certificate");
  if (certForm) certForm.dataset.certFormBound = "";
  renderKeytrainCertificateForm({
    keytrain: keytrainProgram.keytrain,
    cert: keytrainProgram.cert,
    scaledScore: score,
    existing: issued,
    onNameSaved: (name, certificateId) => {
      saveKeytrainIssuance(keytrainId, {
        ...issued,
        recipientName: name,
        certificateId,
      });
    },
  });
}

async function init() {
  purgeStaleResumeStates();
  clearExamCaches();

  hideAllViews();

  let exams;
  try {
    exams = await loadExamIndex({ reload: true });
  } catch (err) {
    console.error(err);
    showBootstrapError(err);
    return;
  }

  examIndexList = exams;

  try {
    keytrainCatalog = await loadKeytrainCatalog(exams);
  } catch (err) {
    console.warn("KeyTrain catalog not loaded:", err);
    keytrainCatalog = [];
  }

  if (exams.length === 0) {
    setHeaderTitle(APP_NAME);
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `<p role="alert">No exams found. Add a JSON file under <code>data/exams/</code> and run <code>python3 scripts/build-exams-index.py</code>.</p>`;
    }
    menuApi = initMenu({
      getActiveCertId: () => "",
      settings,
      onSettingsChange: (next) => {
        settings = next;
      },
      onNavigateHome: goLanding,
      onNavigateBrowse: () => {},
      onNavigateKeytrain: goKeytrain,
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

  normalizeLegacyRoutes(exams);
  activeCertId = getDefaultCertId(exams);
  settings = loadSettings(activeCertId);

  menuApi = initMenu({
    getActiveCertId: () => activeCertId,
    settings,
    onSettingsChange: (next) => {
      settings = next;
    },
    onNavigateHome: goLanding,
    onNavigateBrowse: goBrowse,
    onNavigateKeytrain: goKeytrain,
    onNavigateDashboard: showDashboard,
  });

  bindBrowseSearch(examIndexList, openCert);
  bindBrowseCollapse();
  bindAllPageCollapse();

  window.addEventListener("hashchange", () => {
    if (!appReady) return;
    normalizeLegacyRoutes(examIndexList);
    applyRoute(parseRoute(examIndexList, getKeytrainIds()));
  });

  window.addEventListener("popstate", () => {
    if (!appReady) return;
    applyRoute(parseRoute(examIndexList, getKeytrainIds()));
  });

  appReady = true;
  await applyRoute(parseRoute(exams, getKeytrainIds()));

  try {
    const autoStart = sessionStorage.getItem(`${APP_SLUG}:autoStart`);
    if (autoStart && exams.some((e) => e.id === autoStart)) {
      sessionStorage.removeItem(`${APP_SLUG}:autoStart`);
      await switchCert(autoStart, { fromRoute: true });
      navigateCert(autoStart);
      startExam();
    }
  } catch {
    /* ignore */
  }

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
  updateResumeBanner();

  const isComptia = cert.vendor === "comptia";
  const hasAcronyms = (cert.acronyms?.length ?? 0) > 0;
  const showAcr = isComptia && hasAcronyms;

  document.getElementById("cert-acronym-collapse")?.classList.toggle("hidden", !showAcr);
  document.getElementById("btn-study-acronyms")?.classList.toggle("hidden", !showAcr);
  document.getElementById("btn-study-acronyms-inline")?.classList.toggle(
    "hidden",
    !showAcr
  );

  const isKeyTraining = cert.vendor === "keytraining";
  document.getElementById("btn-start-workshop")?.classList.toggle("hidden", !isKeyTraining);
  const backBtn = document.getElementById("btn-back-browse");
  if (backBtn) {
    backBtn.textContent = isKeyTraining ? "← KeyTrain" : "← All certifications";
  }
}

/**
 * @param {{ fromRoute?: boolean }} [opts]
 */
function showAcronyms(opts = {}) {
  if (!currentCert) return;
  const acronyms = currentCert.acronyms ?? [];
  if (acronyms.length === 0) {
    window.alert("No acronyms available for this certification.");
    return;
  }

  if (!opts.fromRoute) {
    setCertHash(activeCertId, "acronyms");
  }

  showView("acronyms");
  setHeaderTitle(`${currentCert.code} — Acronyms`);

  document.getElementById("acronym-view-title").textContent =
    `Acronym study — ${currentCert.name}`;
  document.getElementById("acronym-view-code").textContent = currentCert.code;

  const root = document.getElementById("acronym-root");
  if (!root) return;

  acronymController?.stop();
  acronymController = runAcronymQuiz({
    cert: currentCert,
    container: root,
    onExit: () => {
      acronymController?.stop();
      showCertView();
      setCertHash(activeCertId);
    },
  });
}

async function showDashboard() {
  if (!examIndexList.length) return;
  if (!activeCertId) {
    activeCertId = getDefaultCertId(examIndexList);
  }
  if (!currentCert && activeCertId) {
    currentCert = await loadCert(activeCertId);
    settings = loadSettings(activeCertId);
  }
  navigateHome();
  showView("dashboard");
  setHeaderTitle("Your progress");
  syncDashboardCertFilter(
    document.getElementById("dashboard-cert-filter"),
    activeCertId
  );
  await renderDashboardForFilter();
}

/**
 * @param {import('./cert-loader.js').Question[]} questions
 * @param {'exam'|'drill'|'keytrain'|'workshop'} mode
 * @param {object} [resume]
 */
function launchExamSession(questions, mode, resume) {
  if (!currentCert) return;

  sessionMode = mode;
  examQuestions = questions;
  responses = resume?.responses ? { ...resume.responses } : {};

  showView("exam");
  const title =
    mode === "keytrain"
      ? `KeyTrain — ${currentCert.code}`
      : mode === "workshop"
        ? `${currentCert.code} — Workshop`
        : mode === "drill"
          ? `${currentCert.code} — Drill`
          : `${currentCert.code} — Practice Exam`;
  setHeaderTitle(title);

  examController?.stopTimer?.();

  const examSettings =
    mode === "keytrain"
      ? {
          timeLimitEnabled: true,
          immediateFeedback: false,
          showDocLinks: false,
        }
      : mode === "workshop"
        ? {
            timeLimitEnabled: false,
            immediateFeedback: true,
            showDocLinks: true,
          }
        : mode === "drill"
          ? { ...settings, timeLimitEnabled: false }
          : resume?.settings
            ? { ...settings, ...resume.settings }
            : settings;

  const certId =
    mode === "keytrain" && keytrainProgram ? keytrainProgram.cert.id : activeCertId;

  examController = runExam({
    cert: currentCert,
    certId,
    questions: examQuestions,
    settings: examSettings,
    responses,
    onResponsesChange: (r) => {
      responses = r;
    },
    onFinish: mode === "keytrain" ? finishKeytrainExam : finishExam,
    isDrill: mode === "drill",
    isWorkshop: mode === "workshop",
    isKeytrain: mode === "keytrain",
    resume: resume
      ? {
          index: resume.index,
          remainingSeconds: resume.remainingSeconds,
          revealed: resume.revealed,
          startedAt: resume.startedAt,
        }
      : undefined,
  });
}

function formatResumeTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function updateResumeBanner() {
  const banner = document.getElementById("exam-resume-banner");
  const summary = document.getElementById("exam-resume-summary");
  const btnStart = document.getElementById("btn-start");
  if (!banner || !summary) return;

  const state = getResumeState(activeCertId);
  if (!state?.questions?.length || state.mode === "drill") {
    banner.classList.add("hidden");
    if (btnStart) btnStart.textContent = "Start practice exam";
    return;
  }

  const idx = (state.index ?? 0) + 1;
  const total = state.questions.length;
  const timePart =
    state.settings?.timeLimitEnabled !== false && state.remainingSeconds != null
      ? ` · ${formatResumeTime(state.remainingSeconds)} remaining`
      : "";
  const saved = state.savedAt
    ? new Date(state.savedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  summary.textContent = `Paused exam — question ${idx} of ${total}${timePart}. Saved ${saved}.`;
  banner.classList.remove("hidden");
  if (btnStart) btnStart.textContent = "Start new exam";
}

function resumeExam() {
  if (!currentCert) return;
  const state = getResumeState(activeCertId);
  if (!state?.questions?.length) return;

  const bankById = new Map(currentCert.questions.map((q) => [q.id, q]));
  const questions = state.questions
    .map((q) => bankById.get(q.id))
    .filter(Boolean);

  if (questions.length !== state.questions.length) {
    clearResumeState(activeCertId);
    updateResumeBanner();
    window.alert(
      "Your saved session no longer matches this question bank. Start a new exam."
    );
    return;
  }

  launchExamSession(questions, "exam", state);
}

function pauseAndExitExam() {
  if (sessionMode !== "exam") return;
  examController?.pauseAndExit?.();
  showCertView();
  setHeaderTitle(currentCert?.name ?? "Cert Master");
  updateResumeBanner();
}

function startExam() {
  if (!currentCert) return;
  if (getResumeState(activeCertId)) {
    const discard = window.confirm(
      "Starting a new exam will discard your paused session. Continue?"
    );
    if (!discard) return;
  }
  clearResumeState(activeCertId);
  updateResumeBanner();
  const weakMap = getWeakQuestions(activeCertId);
  const questions = selectExamQuestions(currentCert, { certId: activeCertId, weakMap });
  launchExamSession(questions, "exam");
}

function discardResume() {
  clearResumeState(activeCertId);
  updateResumeBanner();
}

/**
 * @param {string} [categoryId]
 * @param {string} [level]
 * @param {{ fromRoute?: boolean }} [opts]
 */
function startWorkshop(categoryId, level = "medium", opts = {}) {
  if (typeof level === "object" && level !== null) {
    opts = /** @type {{ fromRoute?: boolean }} */ (level);
    level = "medium";
  }
  if (typeof categoryId === "object" && categoryId !== null) {
    opts = /** @type {{ fromRoute?: boolean }} */ (categoryId);
    categoryId = activeCertId;
    level = "medium";
  }
  const id = String(categoryId || "");
  const lv = String(level || "medium");
  const workshop = getKeytrainWorkshop(id, lv);
  if (!workshop) {
    window.alert("Workshop not found for this category and level.");
    return;
  }
  if (!opts.fromRoute) navigateKeytrainWorkshop(id, lv);
  examController?.stopTimer?.();
  workshopController?.stop();
  showView("keytrainWorkshop");
  const levelName = lv.charAt(0).toUpperCase() + lv.slice(1);
  setHeaderTitle(`${workshop.code} — ${levelName} workshop`);
  const root = document.getElementById("workshop-root");
  if (!root) return;
  workshopController = runWorkshop({
    workshop,
    container: root,
    onExit: () => {
      workshopController = null;
      goKeytrain();
    },
    onComplete: (stats) => {
      recordWorkshopCompletion(id, lv, stats);
      refreshDataViews();
    },
  });
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
  if (sessionMode === "keytrain") {
    finishKeytrainExam(meta);
    return;
  }
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
    type:
      sessionMode === "drill"
        ? "drill"
        : sessionMode === "workshop"
          ? "workshop"
          : "exam",
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
    sessionMode === "workshop"
      ? "Workshop Results"
      : sessionMode === "drill"
        ? "Drill Results"
        : "Exam Results"
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
  const isWorkshop = sessionMode === "workshop";
  const isInformal = isDrill || isWorkshop;

  header?.classList.toggle("pass", pass && !isInformal);
  header?.classList.toggle("fail", !pass && !isInformal);

  if (title) {
    title.textContent = isWorkshop
      ? "Workshop complete"
      : isDrill
        ? "Drill complete"
        : pass
          ? "Pass"
          : "Fail";
  }
  if (scoreEl) {
    scoreEl.textContent = isInformal
      ? `${lastResult.percent}% correct`
      : `${lastResult.scaledScore} / ${currentCert.exam.maxScore}`;
  }
  if (detail) {
    detail.textContent = `${lastResult.correctCount} of ${lastResult.totalScored} scored questions correct (${lastResult.percent}%).${
      isWorkshop
        ? " Workshops sample one scenario per topic area with immediate feedback."
        : isDrill
        ? ""
        : ` Passing score: ${currentCert.exam.passingScore}.`
    }`;
  }

  if (trendEl) {
    if (isInformal) {
      trendEl.textContent = isWorkshop
        ? "Workshop sessions are saved in your history for review."
        : "Drill sessions are saved separately and do not affect your main exam score trend.";
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
  drillBtn?.classList.toggle("hidden", isInformal);

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
  if (!appReady) return;
  applyRoute({ type: "landing" });
}

document.getElementById("btn-start")?.addEventListener("click", startExam);
document.getElementById("btn-resume-exam")?.addEventListener("click", resumeExam);
document.getElementById("btn-discard-resume")?.addEventListener("click", discardResume);
document.getElementById("btn-pause-exam")?.addEventListener("click", pauseAndExitExam);
document.getElementById("btn-open-dashboard")?.addEventListener("click", showDashboard);
function goBackFromCertPage() {
  if (currentCert?.vendor === "keytraining") goKeytrain();
  else goBrowse();
}

document.getElementById("btn-back-browse")?.addEventListener("click", goBackFromCertPage);
document.getElementById("btn-browse-home")?.addEventListener("click", goLanding);
document.getElementById("btn-dashboard-home")?.addEventListener("click", goLanding);
document.getElementById("landing-tile-dashboard")?.addEventListener("click", showDashboard);
document.getElementById("landing-tile-browse")?.addEventListener("click", goBrowse);
document.getElementById("landing-tile-keytrain")?.addEventListener("click", goKeytrain);
document.getElementById("btn-keytrain-view-progress")?.addEventListener("click", () => {
  const select = document.getElementById("dashboard-cert-filter");
  if (select) select.value = KEYTRAIN_OVERVIEW_ID;
  showDashboard();
});
document.getElementById("btn-keytrain-workshops-back")?.addEventListener("click", goKeytrain);
document.getElementById("btn-keytrain-all-workshops")?.addEventListener("click", goKeytrainWorkshops);
document.getElementById("btn-start-workshop")?.addEventListener("click", () => {
  if (activeCertId) startWorkshop(activeCertId);
});
document.getElementById("btn-workshop-exit")?.addEventListener("click", () => {
  workshopController?.stop();
  workshopController = null;
  goKeytrain();
});
document.getElementById("btn-keytrain-hub-home")?.addEventListener("click", goLanding);
document.getElementById("btn-keytrain-back-hub")?.addEventListener("click", goKeytrain);
document.getElementById("btn-keytrain-start")?.addEventListener("click", startKeytrainExam);
document.getElementById("btn-keytrain-view-cert")?.addEventListener("click", () => {
  showKeytrainCertificateView(activeKeytrainId);
});
document.getElementById("btn-keytrain-cert-back")?.addEventListener("click", () => {
  if (keytrainResult) showKeytrainResultsView();
  else goKeytrain();
});
document.getElementById("btn-keytrain-cert-hub")?.addEventListener("click", goKeytrain);
document.getElementById("btn-keytrain-practice")?.addEventListener("click", () => {
  if (keytrainProgram) openCert(keytrainProgram.cert.id);
});
document.getElementById("landing-tile-clf")?.addEventListener("click", () => {
  openCert("cloud-practitioner");
});
document.getElementById("landing-tile-secplus")?.addEventListener("click", () => {
  openCert("comptia-security-plus");
});
document.getElementById("btn-study-acronyms")?.addEventListener("click", showAcronyms);
document.getElementById("btn-study-acronyms-inline")?.addEventListener("click", showAcronyms);
document.getElementById("btn-acronyms-back-cert")?.addEventListener("click", () => {
  acronymController?.stop();
  showCertView();
  setCertHash(activeCertId);
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
function resultsHeaderTitle() {
  return sessionMode === "workshop"
    ? "Workshop Results"
    : sessionMode === "drill"
      ? "Drill Results"
      : "Exam Results";
}

document.getElementById("btn-back-results")?.addEventListener("click", () => {
  showView("results");
  setHeaderTitle(resultsHeaderTitle());
});
document.getElementById("btn-back-results-from-review")?.addEventListener("click", () => {
  showView("results");
  setHeaderTitle(resultsHeaderTitle());
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

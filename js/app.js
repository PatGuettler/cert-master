import {
  loadRegistry,
  loadCert,
  selectExamQuestions,
  getDomainPoolStatus,
} from "./cert-loader.js";
import { loadSettings } from "./storage.js";
import { initMenu } from "./menu.js";
import { runExam } from "./exam-engine.js";
import { scoreExam } from "./scoring.js";
import { buildStudyPlan } from "./study-plan.js";

const DEFAULT_CERT_ID = "cloud-practitioner";
let activeCertId = DEFAULT_CERT_ID;
/** @type {ReturnType<typeof initMenu>|null} */
let menuApi = null;

/** @type {import('./cert-loader.js').CertData|null} */
let currentCert = null;
/** @type {import('./config.js').ExamSettings} */
let settings = loadSettings(DEFAULT_CERT_ID);
/** @type {import('./cert-loader.js').Question[]} */
let examQuestions = [];
/** @type {Record<string, string[]>} */
let responses = {};
/** @type {ReturnType<typeof scoreExam>|null} */
let lastResult = null;
/** @type {{ stopTimer: () => void }|null} */
let examController = null;

const views = {
  home: document.getElementById("view-home"),
  exam: document.getElementById("view-exam"),
  results: document.getElementById("view-results"),
  study: document.getElementById("view-study"),
};

const headerTitle = document.getElementById("header-title");
const examTimer = document.getElementById("exam-timer");

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el?.classList.toggle("hidden", key !== name);
  });
  examTimer?.classList.toggle("hidden", name !== "exam");
}

function setHeaderTitle(text) {
  if (headerTitle) headerTitle.textContent = text;
}

async function init() {
  const registry = await loadRegistry();
  await switchCert(DEFAULT_CERT_ID, registry);
  menuApi = initMenu({
    registry,
    getActiveCertId: () => activeCertId,
    settings,
    onCertChange: (id) => switchCert(id, registry),
    onSettingsChange: (next) => {
      settings = next;
    },
  });
}

/**
 * @param {string} certId
 * @param {import('./cert-loader.js').CertRegistryEntry[]} registry
 */
async function switchCert(certId, registry) {
  activeCertId = certId;
  currentCert = await loadCert(certId);
  settings = loadSettings(certId);
  menuApi?.setActiveCert(certId);
  menuApi?.refreshSettings(settings);
  renderHome();
  setHeaderTitle(currentCert.name);
}

function renderHome() {
  if (!currentCert) return;
  showView("home");

  const cert = currentCert;
  document.getElementById("home-cert-name").textContent = cert.name;
  document.getElementById("home-cert-code").textContent = cert.code;

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

  const metaQuestions = document.getElementById("meta-questions");
  if (metaQuestions) {
    metaQuestions.textContent = String(examSize);
  }
  const metaBank = document.getElementById("meta-bank");
  if (metaBank) {
    metaBank.textContent = String(bankSize);
  }
  document.getElementById("meta-time").textContent = String(
    cert.exam.timeLimitMinutes
  );
  document.getElementById("meta-pass").textContent = String(
    cert.exam.passingScore
  );

  const domainList = document.getElementById("domain-list");
  if (domainList) {
    domainList.innerHTML = "";
    for (const d of cert.domains) {
      const li = document.createElement("li");
      li.innerHTML = `<span>${d.name}</span><strong>${d.weight}%</strong>`;
      domainList.appendChild(li);
    }
  }
}

function startExam() {
  if (!currentCert) return;

  responses = {};
  examQuestions = selectExamQuestions(currentCert);

  showView("exam");
  setHeaderTitle(`${currentCert.code} — Practice Exam`);

  if (examController?.stopTimer) examController.stopTimer();

  examController = runExam({
    cert: currentCert,
    questions: examQuestions,
    settings,
    responses,
    onResponsesChange: (r) => {
      responses = r;
    },
    onFinish: finishExam,
  });
}

function finishExam() {
  if (!currentCert) return;
  examController?.stopTimer();
  lastResult = scoreExam(currentCert, examQuestions, responses);
  renderResults();
  showView("results");
  setHeaderTitle("Exam Results");
}

function renderResults() {
  if (!currentCert || !lastResult) return;

  const header = document.getElementById("results-header");
  const title = document.getElementById("results-title");
  const scoreEl = document.getElementById("results-score");
  const detail = document.getElementById("results-detail");

  const pass = lastResult.passed;
  header?.classList.toggle("pass", pass);
  header?.classList.toggle("fail", !pass);

  if (title) {
    title.textContent = pass ? "Pass" : "Fail";
  }
  if (scoreEl) {
    scoreEl.textContent = `${lastResult.scaledScore} / ${currentCert.exam.maxScore}`;
  }
  if (detail) {
    detail.textContent = `${lastResult.correctCount} of ${lastResult.totalScored} scored questions correct (${lastResult.percent}%). Passing score: ${currentCert.exam.passingScore}.`;
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

document.getElementById("btn-start")?.addEventListener("click", startExam);
document.getElementById("btn-home")?.addEventListener("click", () => {
  examController?.stopTimer();
  renderHome();
});
document.getElementById("btn-retake")?.addEventListener("click", startExam);
document.getElementById("btn-study-plan")?.addEventListener("click", renderStudyPlan);
document.getElementById("btn-back-results")?.addEventListener("click", () => {
  showView("results");
  setHeaderTitle("Exam Results");
});

init().catch((err) => {
  console.error(err);
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = `<p role="alert">Failed to load application: ${err.message}</p>`;
  }
});

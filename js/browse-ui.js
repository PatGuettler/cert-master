/** @type {Record<string, number>} */
const AWS_CERT_SORT = {
  "cloud-practitioner": 10,
  "ai-practitioner": 20,
  "solutions-architect-associate": 30,
  "developer-associate": 40,
  "machine-learning-engineer-associate": 50,
  "data-engineer-associate": 60,
  "cloudops-engineer-associate": 70,
  "solutions-architect-professional": 80,
  "devops-engineer-professional": 90,
  "generative-ai-developer-professional": 100,
  "advanced-networking-specialty": 110,
  "security-specialty": 120,
};

/** @type {Record<string, number>} */
const COMPTIA_CERT_SORT = {
  "comptia-a-plus": 10,
  "comptia-network-plus": 20,
  "comptia-security-plus": 30,
  "comptia-cysa-plus": 40,
  "comptia-linux-plus": 50,
};

/** @type {Record<string, string>} */
const AWS_LEVEL_LABEL = {
  "cloud-practitioner": "Foundational",
  "ai-practitioner": "Foundational",
  "solutions-architect-associate": "Associate",
  "developer-associate": "Associate",
  "machine-learning-engineer-associate": "Associate",
  "data-engineer-associate": "Associate",
  "cloudops-engineer-associate": "Associate",
  "solutions-architect-professional": "Professional",
  "devops-engineer-professional": "Professional",
  "generative-ai-developer-professional": "Professional",
  "advanced-networking-specialty": "Specialty",
  "security-specialty": "Specialty",
};

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {Record<string, number>} sortMap
 * @param {string} vendor
 */
function filterAndSort(exams, sortMap, vendor) {
  return exams
    .filter((e) => (e.vendor ?? "aws") === vendor)
    .sort((a, b) => {
      const oa = sortMap[a.id] ?? 500;
      const ob = sortMap[b.id] ?? 500;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name);
    });
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry} exam
 * @param {string} query
 */
function matchesSearch(exam, query) {
  if (!query) return true;
  const vendorLabel = (exam.vendor ?? "aws") === "comptia" ? "comptia" : "aws";
  const level =
    vendorLabel === "aws" ? (AWS_LEVEL_LABEL[exam.id] ?? "") : "comptia";
  const hay = [
    exam.name,
    exam.code,
    exam.id,
    vendorLabel,
    level,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}

/**
 * @param {HTMLElement|null} grid
 * @param {import('./cert-loader.js').ExamIndexEntry[]} items
 * @param {string} levelDefault
 * @param {string} metaSuffix
 * @param {(certId: string) => void} onSelectCert
 */
function renderGrid(grid, items, levelDefault, metaSuffix, onSelectCert) {
  if (!grid) return;
  grid.innerHTML = "";
  for (const exam of items) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "landing-cert-tile";
    tile.dataset.certId = exam.id;

    const level = document.createElement("span");
    level.className = "landing-cert-tile-level";
    level.textContent =
      levelDefault === "AWS"
        ? (AWS_LEVEL_LABEL[exam.id] ?? "AWS")
        : levelDefault;

    const title = document.createElement("span");
    title.className = "landing-cert-tile-title";
    title.textContent = exam.name;

    const code = document.createElement("span");
    code.className = "landing-cert-tile-code";
    code.textContent = exam.code || exam.id;

    const meta = document.createElement("span");
    meta.className = "landing-cert-tile-meta";
    meta.textContent = `${exam.questionCount ?? "—"} questions${metaSuffix}`;

    tile.append(level, title, code, meta);
    tile.addEventListener("click", () => onSelectCert(exam.id));
    grid.appendChild(tile);
  }
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onSelectCert
 */
export function renderBrowse(exams, onSelectCert) {
  const searchInput = document.getElementById("browse-search");
  const query = (searchInput?.value ?? "").trim().toLowerCase();

  const awsAll = filterAndSort(exams, AWS_CERT_SORT, "aws");
  const comptiaAll = filterAndSort(exams, COMPTIA_CERT_SORT, "comptia");
  const awsExams = awsAll.filter((e) => matchesSearch(e, query));
  const comptiaExams = comptiaAll.filter((e) => matchesSearch(e, query));

  const awsCount = document.getElementById("browse-aws-count");
  const comptiaCount = document.getElementById("browse-comptia-count");
  const awsSection = document.getElementById("browse-aws-section");
  const comptiaSection = document.getElementById("browse-comptia-section");
  const noResults = document.getElementById("browse-no-results");

  if (awsCount) awsCount.textContent = String(awsExams.length);
  if (comptiaCount) comptiaCount.textContent = String(comptiaExams.length);

  awsSection?.classList.toggle("hidden", awsExams.length === 0);
  comptiaSection?.classList.toggle("hidden", comptiaExams.length === 0);
  noResults?.classList.toggle(
    "hidden",
    awsExams.length > 0 || comptiaExams.length > 0
  );

  renderGrid(
    document.getElementById("browse-cert-grid-aws"),
    awsExams,
    "AWS",
    " in bank",
    onSelectCert
  );
  renderGrid(
    document.getElementById("browse-cert-grid-comptia"),
    comptiaExams,
    "CompTIA",
    " · includes acronym drill",
    onSelectCert
  );
}

/**
 * @param {import('./cert-loader.js').ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onSelectCert
 */
export function bindBrowseSearch(exams, onSelectCert) {
  const searchInput = document.getElementById("browse-search");
  if (!searchInput || searchInput.dataset.bound === "1") return;
  searchInput.dataset.bound = "1";
  searchInput.addEventListener("input", () => {
    renderBrowse(exams, onSelectCert);
  });
}

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

/** @type {Record<string, string>} */
const LEVEL_LABEL = {
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
 * @param {(certId: string) => void} onSelectCert
 */
export function renderLanding(exams, onSelectCert) {
  const grid = document.getElementById("landing-cert-grid");
  const countEl = document.getElementById("landing-exam-count");
  if (!grid) return;

  const awsExams = exams
    .filter((e) => (e.vendor ?? "aws") === "aws")
    .sort((a, b) => {
      const oa = AWS_CERT_SORT[a.id] ?? 500;
      const ob = AWS_CERT_SORT[b.id] ?? 500;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name);
    });

  if (countEl) {
    countEl.textContent = String(awsExams.length);
  }

  grid.innerHTML = "";

  for (const exam of awsExams) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "landing-cert-tile";
    tile.dataset.certId = exam.id;

    const level = document.createElement("span");
    level.className = "landing-cert-tile-level";
    level.textContent = LEVEL_LABEL[exam.id] ?? "AWS";

    const title = document.createElement("span");
    title.className = "landing-cert-tile-title";
    title.textContent = exam.name;

    const code = document.createElement("span");
    code.className = "landing-cert-tile-code";
    code.textContent = exam.code || exam.id;

    const meta = document.createElement("span");
    meta.className = "landing-cert-tile-meta";
    meta.textContent = `${exam.questionCount ?? "—"} questions in bank`;

    tile.append(level, title, code, meta);
    tile.addEventListener("click", () => onSelectCert(exam.id));
    grid.appendChild(tile);
  }
}

/**
 * KeyTrain's Key Training — practice hub, workshops, and links to formal certs.
 */

/** @typedef {import('./cert-loader.js').ExamIndexEntry} ExamIndexEntry */

const KEY_TRAINING_VENDOR = "keytraining";

/**
 * @param {ExamIndexEntry[]} exams
 */
export function filterKeyTrainingExams(exams) {
  return exams
    .filter((e) => e.vendor === KEY_TRAINING_VENDOR)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * @param {HTMLElement|null} grid
 * @param {ExamIndexEntry[]} items
 * @param {(certId: string) => void} onSelect
 * @param {string} [metaSuffix]
 */
function renderExamGrid(grid, items, onSelect, metaSuffix = " in bank") {
  if (!grid) return;
  grid.innerHTML = "";
  for (const exam of items) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "landing-cert-tile keytraining-tile";
    tile.dataset.certId = exam.id;

    const level = document.createElement("span");
    level.className = "landing-cert-tile-level";
    level.textContent = "Key Training";

    const title = document.createElement("span");
    title.className = "landing-cert-tile-title";
    const shortName = exam.name.replace(/^KeyTrain's Key Training — /, "");
    title.textContent = shortName;

    const code = document.createElement("span");
    code.className = "landing-cert-tile-code";
    code.textContent = exam.code || exam.id;

    const meta = document.createElement("span");
    meta.className = "landing-cert-tile-meta";
    meta.textContent = `${exam.questionCount ?? "—"} questions${metaSuffix}`;

    tile.append(level, title, code, meta);
    tile.addEventListener("click", () => onSelect(exam.id));
    grid.appendChild(tile);
  }
}

/**
 * @param {ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onPractice
 * @param {(certId: string) => void} onWorkshop
 * @param {(keytrainId: string) => void} onKeytrainCert
 * @param {import('./keytrain-loader.js').KeytrainCertSummary[]} keytrainCatalog
 */
export function renderKeyTrainingHub(
  exams,
  onPractice,
  onWorkshop,
  onKeytrainCert,
  keytrainCatalog
) {
  const practice = filterKeyTrainingExams(exams);
  renderExamGrid(
    document.getElementById("keytraining-practice-grid"),
    practice,
    onPractice,
    " · study mode"
  );

  renderExamGrid(
    document.getElementById("keytraining-workshop-preview-grid"),
    practice,
    onWorkshop,
    " · workshop (~1 per topic)"
  );

  const ktGrid = document.getElementById("keytraining-formal-grid");
  if (!ktGrid) return;
  ktGrid.innerHTML = "";
  const formal = keytrainCatalog.filter((c) => c.group === "key-training");
  for (const item of formal) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "landing-cert-tile keytrain-tile";
    const level = document.createElement("span");
    level.className = "landing-cert-tile-level";
    level.textContent = item.level || "Certification";
    const title = document.createElement("span");
    title.className = "landing-cert-tile-title";
    title.textContent = item.certificateTitle.replace(/^KeyTrain Certified /, "");
    const code = document.createElement("span");
    code.className = "landing-cert-tile-code";
    code.textContent = item.code;
    const meta = document.createElement("span");
    meta.className = "landing-cert-tile-meta";
    meta.textContent = "Pass/fail · PDF certificate";
    tile.append(level, title, code, meta);
    tile.addEventListener("click", () => onKeytrainCert(item.id));
    ktGrid.appendChild(tile);
  }
}

/**
 * @param {ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onStartWorkshop
 */
export function renderKeyTrainingWorkshops(exams, onStartWorkshop) {
  const practice = filterKeyTrainingExams(exams);
  renderExamGrid(
    document.getElementById("keytraining-workshop-grid"),
    practice,
    onStartWorkshop,
    " · guided workshop"
  );
}

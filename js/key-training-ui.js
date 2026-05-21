/**
 * KeyTrain hub — training, workshops, and certification.
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
 * @param {import('./keytrain-loader.js').KeytrainCertSummary[]} items
 * @param {HTMLElement|null} grid
 * @param {(keytrainId: string) => void} onSelect
 */
function renderKeytrainCertTiles(items, grid, onSelect) {
  if (!grid) return;
  grid.innerHTML = "";
  for (const item of items) {
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
    tile.addEventListener("click", () => onSelect(item.id));
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
export function renderKeytrainHub(
  exams,
  onPractice,
  onWorkshop,
  onKeytrainCert,
  keytrainCatalog
) {
  const practice = filterKeyTrainingExams(exams);

  renderExamGrid(
    document.getElementById("keytrain-training-grid"),
    practice,
    onPractice,
    " · study mode"
  );

  renderExamGrid(
    document.getElementById("keytrain-workshop-preview-grid"),
    practice,
    onWorkshop,
    " · workshop (~1 per topic)"
  );

  const cyber = keytrainCatalog.filter((c) => c.group === "key-training");
  const vendor = keytrainCatalog.filter((c) => c.group !== "key-training");

  const cyberGrid = document.getElementById("keytrain-cert-grid-keytraining");
  const vendorGrid = document.getElementById("keytrain-cert-grid-vendor");
  const cyberHead = document.querySelector(".keytrain-cert-subhead:not(.keytrain-cert-subhead-vendor)");
  const vendorHead = document.querySelector(".keytrain-cert-subhead-vendor");

  cyberHead?.classList.toggle("hidden", cyber.length === 0);
  vendorHead?.classList.toggle("hidden", vendor.length === 0);
  cyberGrid?.classList.toggle("hidden", cyber.length === 0);
  vendorGrid?.classList.toggle("hidden", vendor.length === 0);

  renderKeytrainCertTiles(cyber, cyberGrid, onKeytrainCert);
  renderKeytrainCertTiles(vendor, vendorGrid, onKeytrainCert);
}

/**
 * @param {ExamIndexEntry[]} exams
 * @param {(certId: string) => void} onStartWorkshop
 */
export function renderKeytrainWorkshops(exams, onStartWorkshop) {
  const practice = filterKeyTrainingExams(exams);
  renderExamGrid(
    document.getElementById("keytrain-workshop-grid"),
    practice,
    onStartWorkshop,
    " · workshop"
  );
}

/** @deprecated Use renderKeytrainHub */
export const renderKeyTrainingHub = renderKeytrainHub;

/** @deprecated Use renderKeytrainWorkshops */
export const renderKeyTrainingWorkshops = renderKeytrainWorkshops;

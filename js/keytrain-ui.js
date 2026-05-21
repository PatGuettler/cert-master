import { getKeytrainIssuance } from "./keytrain-storage.js";
import { downloadKeytrainCertificatePdf } from "./keytrain-certificate.js";

/**
 * @param {import('./keytrain-loader.js').KeytrainCertSummary[]} catalog
 * @param {(keytrainId: string) => void} onSelect
 */
/**
 * @param {import('./keytrain-loader.js').KeytrainCertSummary[]} items
 * @param {HTMLElement|null} grid
 * @param {(keytrainId: string) => void} onSelect
 */
function renderKeytrainGrid(items, grid, onSelect) {
  if (!grid) return;
  grid.innerHTML = "";
  for (const item of items) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "landing-cert-tile keytrain-tile";
    const issued = getKeytrainIssuance(item.id);

    const level = document.createElement("span");
    level.className = "landing-cert-tile-level";
    level.textContent = item.level || "Certification";

    const title = document.createElement("span");
    title.className = "landing-cert-tile-title";
    title.textContent = item.certificateTitle;

    const code = document.createElement("span");
    code.className = "landing-cert-tile-code";
    code.textContent = item.code;

    const meta = document.createElement("span");
    meta.className = "landing-cert-tile-meta";
    meta.textContent = issued?.passed
      ? `Certified · ${issued.recipientName}`
      : "Pass/fail assessment · PDF certificate";

    tile.append(level, title, code, meta);
    tile.addEventListener("click", () => onSelect(item.id));
    grid.appendChild(tile);
  }
}

/** @deprecated Certification grids render via renderKeytrainHub in key-training-ui.js */
export function renderKeytrainHub(_catalog, _onSelect) {
  /* unified hub in key-training-ui.js */
}

/**
 * @param {object} program
 * @param {import('./keytrain-loader.js').KeytrainCertSummary} summary
 */
export function renderKeytrainCertPage(program, summary) {
  const { keytrain, cert, examMeta, brand, tagline } = program;
  const issued = getKeytrainIssuance(keytrain.id);

  document.getElementById("keytrain-cert-title")?.replaceChildren(
    document.createTextNode(keytrain.certificateTitle)
  );
  const codeEl = document.getElementById("keytrain-cert-code");
  if (codeEl) codeEl.textContent = `${examMeta.code} · ${brand}`;

  const desc = document.getElementById("keytrain-cert-description");
  if (desc) {
    desc.textContent =
      `${tagline} This is a formal timed assessment: no feedback until you submit, ` +
      `then a clear pass or fail. If you pass, you can enter your name and download a PDF certificate.`;
  }

  document.getElementById("kt-meta-questions")?.replaceChildren(
    document.createTextNode(String(cert.exam.totalQuestions))
  );
  document.getElementById("kt-meta-time")?.replaceChildren(
    document.createTextNode(String(cert.exam.timeLimitMinutes))
  );
  document.getElementById("kt-meta-pass")?.replaceChildren(
    document.createTextNode(String(cert.exam.passingScore))
  );
  document.getElementById("kt-meta-max")?.replaceChildren(
    document.createTextNode(String(cert.exam.maxScore))
  );

  const issuedBanner = document.getElementById("keytrain-issued-banner");
  const issuedText = document.getElementById("keytrain-issued-text");
  if (issued?.passed && issuedBanner && issuedText) {
    issuedText.textContent = `You passed on ${new Date(issued.issuedAt).toLocaleDateString()} as ${issued.recipientName}. Certificate ID: ${issued.certificateId}.`;
    issuedBanner.classList.remove("hidden");
  } else {
    issuedBanner?.classList.add("hidden");
  }

  const rules = document.getElementById("keytrain-rules-list");
  if (rules) {
    rules.innerHTML = "";
    const items = [
      `Timed exam (${cert.exam.timeLimitMinutes} minutes)`,
      `${cert.exam.totalQuestions} scored questions drawn from the official-weighted bank`,
      `Passing score: ${cert.exam.passingScore} of ${cert.exam.maxScore}`,
      "No answer feedback until you submit the full exam",
      "Pause & exit is disabled during KeyTrain assessments",
      "Certificate PDF available only after a passing score",
    ];
    for (const text of items) {
      const li = document.createElement("li");
      li.textContent = text;
      rules.appendChild(li);
    }
  }
}

/**
 * @param {object} opts
 * @param {boolean} opts.passed
 * @param {number} opts.scaledScore
 * @param {import('./cert-loader.js').CertData} opts.cert
 * @param {object} opts.keytrain
 * @param {() => void} opts.onCertificate
 * @param {() => void} opts.onRetake
 * @param {() => void} opts.onHub
 */
export function renderKeytrainResults(opts) {
  const header = document.getElementById("keytrain-results-header");
  const title = document.getElementById("keytrain-results-title");
  const score = document.getElementById("keytrain-results-score");
  const detail = document.getElementById("keytrain-results-detail");
  const passActions = document.getElementById("keytrain-pass-actions");
  const failActions = document.getElementById("keytrain-fail-actions");

  header?.classList.toggle("pass", opts.passed);
  header?.classList.toggle("fail", !opts.passed);

  if (title) {
    title.textContent = opts.passed ? "Certification passed" : "Certification not passed";
  }
  if (score) {
    score.textContent = `${opts.scaledScore} / ${opts.cert.exam.maxScore}`;
  }
  if (detail) {
    detail.textContent = opts.passed
      ? `You met the passing score of ${opts.cert.exam.passingScore}. Download your KeyTrain certificate below.`
      : `You need ${opts.cert.exam.passingScore} or higher to pass. Review weak domains in practice mode, then try again.`;
  }

  passActions?.classList.toggle("hidden", !opts.passed);
  failActions?.classList.toggle("hidden", opts.passed);
}

/**
 * @param {object} handlers
 * @param {() => void} [handlers.onCertificate]
 * @param {() => void} [handlers.onRetake]
 * @param {() => void} [handlers.onHub]
 */
export function bindKeytrainResultsActions(handlers) {
  const pairs = [
    ["btn-keytrain-get-cert", handlers.onCertificate],
    ["btn-keytrain-retake-pass", handlers.onRetake],
    ["btn-keytrain-retake-fail", handlers.onRetake],
    ["btn-keytrain-hub-pass", handlers.onHub],
    ["btn-keytrain-hub-fail", handlers.onHub],
  ];
  for (const [id, fn] of pairs) {
    document.getElementById(id)?.addEventListener("click", () => fn?.());
  }
}

/**
 * @param {object} opts
 * @param {object} opts.keytrain
 * @param {import('./cert-loader.js').CertData} opts.cert
 * @param {number} opts.scaledScore
 * @param {object} [opts.existing]
 */
export function renderKeytrainCertificateForm(opts) {
  const nameInput = /** @type {HTMLInputElement|null} */ (
    document.getElementById("keytrain-recipient-name")
  );
  const preview = document.getElementById("keytrain-cert-preview");
  const err = document.getElementById("keytrain-cert-error");

  if (nameInput && opts.existing?.recipientName) {
    nameInput.value = opts.existing.recipientName;
  }

  function updatePreview() {
    const name = nameInput?.value?.trim() || "Your name";
    if (preview) {
      preview.innerHTML = `
        <p class="keytrain-preview-brand">KeyTrain</p>
        <p class="keytrain-preview-label">Certificate of achievement</p>
        <p class="keytrain-preview-name">${escapeHtml(name)}</p>
        <p class="keytrain-preview-title">${escapeHtml(opts.keytrain.certificateTitle)}</p>
      `;
    }
  }

  updatePreview();
  nameInput?.addEventListener("input", updatePreview);

  const downloadBtn = document.getElementById("btn-keytrain-download-pdf");
  const formRoot = document.getElementById("view-keytrain-certificate");
  if (!downloadBtn || formRoot?.dataset.certFormBound === "1") return;
  if (formRoot) formRoot.dataset.certFormBound = "1";
  downloadBtn.addEventListener("click", async () => {
    const name = nameInput?.value?.trim();
    if (!name || name.length < 2) {
      if (err) {
        err.textContent = "Enter your full name (at least 2 characters).";
        err.classList.remove("hidden");
      }
      nameInput?.focus();
      return;
    }
    err?.classList.add("hidden");
    const btn = document.getElementById("btn-keytrain-download-pdf");
    if (btn) btn.disabled = true;
    try {
      const record = opts.existing ?? {};
      const certificateId = record.certificateId ?? null;
      const issuedAt = record.issuedAt ?? new Date().toISOString();
      const certId = certificateId || opts.existing?.certificateId || "KT-PENDING";
      await downloadKeytrainCertificatePdf({
        recipientName: name,
        certificateTitle: opts.keytrain.certificateTitle,
        certificateId: certId,
        issuedAt,
        scaledScore: opts.scaledScore,
        passingScore: opts.cert.exam.passingScore,
        examCode: opts.cert.code,
      });
      if (opts.onNameSaved) {
        opts.onNameSaved(name, certId);
      }
    } catch (e) {
      if (err) {
        err.textContent = e instanceof Error ? e.message : "PDF download failed.";
        err.classList.remove("hidden");
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

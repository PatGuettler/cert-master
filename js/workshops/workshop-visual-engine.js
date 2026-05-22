/**
 * Renders interactive workshop visuals (SVG diagrams, flows, compare, hotspots, ordering).
 */

import { buildTeachingContent, updateLearnMorePanel } from "./workshop-teaching.js";

/**
 * @typedef {'flow'|'compare'|'hotspot'|'order'} VisualKind
 */

/**
 * @typedef {Object} VisualFrame
 * @property {string} label
 * @property {string} [detail]
 * @property {string} why
 * @property {string} [svg]
 */

/**
 * @typedef {Object} VisualHotspot
 * @property {string} id
 * @property {string} label
 * @property {string} why
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} WorkshopVisual
 * @property {VisualKind} kind
 * @property {string} [subtitle]
 * @property {string} [baseSvg]
 * @property {string} [leftSvg]
 * @property {string} [rightSvg]
 * @property {VisualFrame[]} [frames]
 * @property {{ title: string, body: string, bad?: boolean }} [left]
 * @property {{ title: string, body: string, good?: boolean }} [right]
 * @property {VisualHotspot[]} [hotspots]
 * @property {{ id: string, label: string }[]} [orderItems]
 * @property {string[]} [correctOrder]
 * @property {string} [orderSuccess]
 * @property {string} [orderPrompt]
 * @property {import('./workshop-teaching.js').LearnMoreInput} [learnMore]
 * @property {Record<string, string>} [orderStepNotes]
 * @property {Record<string, string>} [orderDistractorNotes]
 */

/** Shown on every ordering visual unless a step overrides `orderPrompt`. */
const ORDER_PROMPT_DEFAULT =
  "Click each action in the order you would do them. First click = step 1, second click = step 2, and so on.";

const ORDER_SLOTS_EMPTY =
  "Your numbered list appears here as you click — start with what you would do first.";

/** @type {WeakMap<HTMLElement, object>} */
const visualState = new WeakMap();

/**
 * @param {string} html
 * @returns {string}
 */
function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {HTMLElement} root
 * @returns {HTMLElement|null}
 */
function visualScope(root) {
  return root.querySelector(".workshop-visual[data-visual-kind]");
}

/** @param {WorkshopVisual} visual @param {string} title */
export function renderVisualStepHtml(visual, title) {
  const kind = visual.kind;
  let inner = "";
  if (kind === "flow") inner = renderFlowShell(visual);
  else if (kind === "compare") inner = renderCompareShell(visual);
  else if (kind === "hotspot") inner = renderHotspotShell(visual);
  else if (kind === "order") inner = renderOrderShell(visual);

  return `
    <h3 class="workshop-step-title">${escapeHtml(title)}</h3>
    ${visual.subtitle ? `<p class="workshop-visual-subtitle">${escapeHtml(visual.subtitle)}</p>` : ""}
    <div class="workshop-visual" data-visual-kind="${kind}">
      ${inner}
    </div>
    <p class="workshop-hint workshop-visual-hint" data-visual-hint></p>
  `;
}

/**
 * @param {HTMLElement} root
 * @param {WorkshopVisual} visual
 */
export function bindVisualStep(root, visual) {
  const scope = visualScope(root);
  const hint = root.querySelector("[data-visual-hint]");
  if (!scope || !visual?.kind) return;

  if (visualState.has(scope)) return;
  visualState.set(scope, { visual, hint, cardRoot: root });

  scope.addEventListener("click", onVisualScopeClick);

  if (visual.kind === "flow") initFlow(scope, visual, hint);
  else if (visual.kind === "compare") initCompare(scope, hint);
  else if (visual.kind === "hotspot") initHotspot(scope, visual, hint);
  else if (visual.kind === "order") initOrder(scope, visual, hint);
}

/**
 * @param {Event} e
 */
function onVisualScopeClick(e) {
  const scope = /** @type {HTMLElement|null} */ (e.currentTarget);
  if (!scope) return;
  const state = visualState.get(scope);
  if (!state) return;

  const { visual, hint } = state;

  if (visual.kind === "flow") {
    handleFlowClick(scope, visual, hint, e);
    return;
  }
  if (visual.kind === "compare") {
    const tab = /** @type {HTMLElement|null} */ (
      e.target instanceof Element ? e.target.closest(".workshop-compare-tab") : null
    );
    if (tab) {
      e.preventDefault();
      activateCompareTab(scope, tab);
    }
    return;
  }
  if (visual.kind === "hotspot") {
    const marker = /** @type {HTMLElement|null} */ (
      e.target instanceof Element ? e.target.closest(".workshop-hotspot-marker") : null
    );
    if (marker) {
      e.preventDefault();
      activateHotspot(scope, visual, marker);
    }
    return;
  }
  if (visual.kind === "order") {
    handleOrderClick(scope, visual, hint, e);
  }
}

function renderFlowShell(visual) {
  const frames = visual.frames ?? [];
  const first = frames[0];
  return `
    <div class="workshop-flow" data-flow-root>
      <div class="workshop-visual-stage" data-flow-stage>
        ${first?.svg ?? ""}
      </div>
      <p class="workshop-flow-caption" data-flow-caption>${escapeHtml(first?.label ?? "")}</p>
      <div class="workshop-flow-why" data-flow-why>
        <span class="workshop-flow-why-label">Why</span>
        <p>${escapeHtml(first?.why ?? "")}</p>
      </div>
      <div class="workshop-flow-dots" data-flow-dots role="tablist" aria-label="Flow steps">
        ${frames
          .map(
            (_, i) =>
              `<button type="button" class="workshop-flow-dot${i === 0 ? " is-active" : ""}" data-flow-dot="${i}" role="tab" aria-selected="${i === 0 ? "true" : "false"}" aria-label="Step ${i + 1}"></button>`
          )
          .join("")}
      </div>
      <div class="workshop-visual-controls">
        <button type="button" class="btn btn-outline btn-sm" data-flow-prev disabled>Previous step</button>
        <button type="button" class="btn btn-secondary btn-sm" data-flow-next>${frames.length > 1 ? "Next step" : "Done"}</button>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement|null} hint
 */
function initFlow(scope, visual, hint) {
  const frames = visual.frames ?? [];
  scope.dataset.flowIndex = "0";
  scope.dataset.flowCount = String(frames.length);
  showFlowFrame(scope, visual, hint, 0);
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement|null} hint
 * @param {number} index
 */
function showFlowFrame(scope, visual, hint, index) {
  const frames = visual.frames ?? [];
  if (frames.length === 0) {
    if (hint) hint.textContent = "This diagram has no steps configured.";
    return;
  }

  const i = Math.max(0, Math.min(index, frames.length - 1));
  scope.dataset.flowIndex = String(i);
  const f = frames[i];

  const stage = scope.querySelector("[data-flow-stage]");
  const caption = scope.querySelector("[data-flow-caption]");
  const whyBox = scope.querySelector("[data-flow-why] p");
  const btnPrev = scope.querySelector("[data-flow-prev]");
  const btnNext = scope.querySelector("[data-flow-next]");
  const dots = scope.querySelectorAll("[data-flow-dot]");

  if (stage) stage.innerHTML = f?.svg ?? "";
  if (caption) caption.textContent = f?.label ?? "";
  if (whyBox) whyBox.textContent = f?.why ?? "";

  dots.forEach((dot, di) => {
    dot.classList.toggle("is-active", di === i);
    dot.setAttribute("aria-selected", di === i ? "true" : "false");
  });

  if (btnPrev) btnPrev.disabled = i === 0;
  if (btnNext) {
    btnNext.textContent = i >= frames.length - 1 ? "Finished exploring" : "Next step";
  }
  if (hint) {
    hint.textContent =
      i >= frames.length - 1
        ? "You explored the full flow. Continue when ready."
        : "Tap Next or a dot to see how the process continues — read Why at each step.";
  }
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement|null} hint
 * @param {Event} e
 */
function handleFlowClick(scope, visual, hint, e) {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const next = target.closest("[data-flow-next]");
  const prev = target.closest("[data-flow-prev]");
  const dot = target.closest("[data-flow-dot]");

  const frames = visual.frames ?? [];
  let index = parseInt(scope.dataset.flowIndex ?? "0", 10);
  if (Number.isNaN(index)) index = 0;

  if (next) {
    e.preventDefault();
    if (index < frames.length - 1) showFlowFrame(scope, visual, hint, index + 1);
    else if (hint) hint.textContent = "Flow complete — press Next below to continue the workshop.";
    return;
  }
  if (prev) {
    e.preventDefault();
    showFlowFrame(scope, visual, hint, Math.max(0, index - 1));
    return;
  }
  if (dot) {
    e.preventDefault();
    const di = parseInt(dot.getAttribute("data-flow-dot") ?? "", 10);
    if (!Number.isNaN(di)) showFlowFrame(scope, visual, hint, di);
  }
}

function renderCompareShell(visual) {
  const left = visual.left ?? { title: "Without protection", body: "" };
  const right = visual.right ?? { title: "With protection", body: "" };
  const leftSvg = visual.leftSvg ?? visual.baseSvg ?? "";
  const rightSvg = visual.rightSvg ?? visual.baseSvg ?? "";
  return `
    <div class="workshop-compare">
      <div class="workshop-compare-toggle" role="tablist">
        <button type="button" class="workshop-compare-tab is-active is-risk" data-side="left" role="tab" aria-selected="true">${escapeHtml(left.title)}</button>
        <button type="button" class="workshop-compare-tab is-safe" data-side="right" role="tab" aria-selected="false">${escapeHtml(right.title)}</button>
      </div>
      <div class="workshop-visual-stage workshop-compare-panel is-active" data-compare-panel="left">
        ${leftSvg}
        <p class="workshop-compare-body">${escapeHtml(left.body)}</p>
      </div>
      <div class="workshop-visual-stage workshop-compare-panel" data-compare-panel="right" hidden>
        ${rightSvg}
        <p class="workshop-compare-body">${escapeHtml(right.body)}</p>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} scope
 * @param {HTMLElement|null} hint
 */
function initCompare(scope, hint) {
  if (hint) hint.textContent = "Toggle both sides — understand what goes wrong and what good practice fixes.";
}

/**
 * @param {HTMLElement} scope
 * @param {HTMLElement} tab
 */
function activateCompareTab(scope, tab) {
  const side = tab.getAttribute("data-side");
  const tabs = scope.querySelectorAll(".workshop-compare-tab");
  const panels = scope.querySelectorAll("[data-compare-panel]");

  tabs.forEach((t) => {
    const active = t.getAttribute("data-side") === side;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  panels.forEach((p) => {
    const show = p.getAttribute("data-compare-panel") === side;
    p.classList.toggle("is-active", show);
    if (show) p.removeAttribute("hidden");
    else p.setAttribute("hidden", "");
  });
}

function renderHotspotShell(visual) {
  const spots = visual.hotspots ?? [];
  const markers = spots
    .map(
      (s) =>
        `<button type="button" class="workshop-hotspot-marker" style="left:${s.x}%;top:${s.y}%" data-hotspot-id="${escapeHtml(s.id)}" aria-label="${escapeHtml(s.label)}"><span>${escapeHtml(s.id)}</span></button>`
    )
    .join("");
  return `
    <div class="workshop-hotspot">
      <div class="workshop-visual-stage workshop-hotspot-stage">
        ${visual.baseSvg ?? ""}
        ${markers}
      </div>
      <div class="workshop-hotspot-detail" data-hotspot-detail>
        <p class="workshop-hotspot-placeholder">Tap a numbered point on the diagram to learn why it matters.</p>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement|null} hint
 */
function initHotspot(scope, visual, hint) {
  if (hint) hint.textContent = "Explore every numbered point before moving on.";
  scope.dataset.hotspotIds = (visual.hotspots ?? []).map((s) => s.id).join(",");
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement} marker
 */
function activateHotspot(scope, visual, marker) {
  const id = marker.getAttribute("data-hotspot-id");
  const spot = (visual.hotspots ?? []).find((s) => s.id === id);
  const detail = scope.querySelector("[data-hotspot-detail]");
  if (!spot || !detail) return;

  scope.querySelectorAll(".workshop-hotspot-marker").forEach((m) => m.classList.remove("is-active"));
  marker.classList.add("is-active");
  detail.innerHTML = `
    <h4 class="workshop-hotspot-title">${escapeHtml(spot.label)}</h4>
    <p class="workshop-hotspot-why"><strong>Why:</strong> ${escapeHtml(spot.why)}</p>
  `;
}

function renderOrderShell(visual) {
  const items = visual.orderItems ?? [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const chips = shuffled
    .map(
      (it) =>
        `<button type="button" class="workshop-order-chip" data-order-id="${escapeHtml(it.id)}">${escapeHtml(it.label)}</button>`
    )
    .join("");
  const prompt = visual.orderPrompt ?? ORDER_PROMPT_DEFAULT;
  return `
    <div class="workshop-order" data-order-root>
      <p class="workshop-order-prompt">${escapeHtml(prompt)}</p>
      <p class="workshop-order-help">Not sure yet? Open <strong>Get more information on this</strong> below for the full reasoning.</p>
      <div class="workshop-order-pool" data-order-pool>${chips}</div>
      <ul class="workshop-order-slots" data-order-slots aria-label="Your order"></ul>
      <div class="workshop-order-actions">
        <button type="button" class="btn btn-outline btn-sm" data-order-reset>Reset</button>
        <button type="button" class="btn btn-secondary btn-sm" data-order-check>Check order</button>
      </div>
      <div class="workshop-order-feedback hidden" data-order-feedback></div>
    </div>
  `;
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement|null} hint
 */
function initOrder(scope, visual, hint) {
  if (hint) {
    hint.textContent =
      "Only the steps you click are counted — skip distractors you would not actually do.";
  }
  scope.dataset.orderPicked = "";
  renderOrderSlots(scope, visual, []);
  resetOrderChips(scope);
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {string[]} picked
 */
function renderOrderSlots(scope, visual, picked) {
  const slots = scope.querySelector("[data-order-slots]");
  const hint = visualState.get(scope)?.hint;
  if (!slots) return;
  if (picked.length === 0) {
    slots.innerHTML = `<li class="workshop-order-empty">${escapeHtml(ORDER_SLOTS_EMPTY)}</li>`;
    if (hint) {
      hint.textContent =
        "Click actions above to set your order — then press Check order.";
    }
    return;
  }
  slots.innerHTML = picked
    .map((id, i) => {
      const label = visual.orderItems?.find((x) => x.id === id)?.label ?? id;
      return `<li><span class="workshop-order-num">${i + 1}</span>${escapeHtml(label)}</li>`;
    })
    .join("");
  const total = visual.correctOrder?.length ?? picked.length;
  if (hint) {
    hint.textContent =
      picked.length < total
        ? `Step ${picked.length} set — click the next action you would take.`
        : "All steps chosen — press Check order when ready.";
  }
}

/**
 * @param {HTMLElement} scope
 */
function resetOrderChips(scope) {
  scope.querySelectorAll(".workshop-order-chip").forEach((c) => {
    c.classList.remove("is-used");
    c.disabled = false;
  });
  const feedback = scope.querySelector("[data-order-feedback]");
  feedback?.classList.add("hidden");
}

/**
 * @param {HTMLElement} scope
 * @returns {string[]}
 */
function getOrderPicked(scope) {
  const raw = scope.dataset.orderPicked ?? "";
  return raw ? raw.split(",") : [];
}

/**
 * @param {HTMLElement} scope
 * @param {string[]} picked
 */
function setOrderPicked(scope, picked) {
  scope.dataset.orderPicked = picked.join(",");
}

/**
 * @param {HTMLElement} scope
 * @param {WorkshopVisual} visual
 * @param {HTMLElement|null} hint
 * @param {Event} e
 */
function handleOrderClick(scope, visual, hint, e) {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const chip = target.closest(".workshop-order-chip");
  const resetBtn = target.closest("[data-order-reset]");
  const checkBtn = target.closest("[data-order-check]");

  if (chip && !chip.classList.contains("is-used")) {
    e.preventDefault();
    const id = chip.getAttribute("data-order-id");
    if (!id) return;
    const picked = [...getOrderPicked(scope), id];
    setOrderPicked(scope, picked);
    chip.classList.add("is-used");
    chip.disabled = true;
    renderOrderSlots(scope, visual, picked);
    return;
  }

  if (resetBtn) {
    e.preventDefault();
    setOrderPicked(scope, []);
    renderOrderSlots(scope, visual, []);
    resetOrderChips(scope);
    return;
  }

  if (checkBtn) {
    e.preventDefault();
    const feedback = scope.querySelector("[data-order-feedback]");
    if (!feedback) return;
    const picked = getOrderPicked(scope);
    const correct = visual.correctOrder ?? [];
    const ok =
      picked.length === correct.length && picked.every((id, i) => id === correct[i]);
    feedback.classList.remove("hidden");
    feedback.className = `workshop-order-feedback ${ok ? "is-correct" : "is-incorrect"}`;
    feedback.innerHTML = ok
      ? `<strong>Correct!</strong><p>${escapeHtml(visual.orderSuccess ?? "Correct order.")}</p>`
      : `<strong>Not quite.</strong><p>Open <strong>Get more information on this</strong> below for the full safest sequence and why—then Reset and try again.</p>`;
    if (hint && ok) hint.textContent = "Nice work — continue the workshop when ready.";

    const cardRoot = visualState.get(scope)?.cardRoot;
    if (cardRoot) {
      const teaching = buildTeachingContent(
        { type: "visual", visual },
        { orderChecked: true, orderCorrect: ok, orderPicked: picked }
      );
      updateLearnMorePanel(cardRoot, teaching, { open: !ok });
    }
  }
}

/** Clear cached listeners when workshop card re-renders. */
export function clearVisualBindings(root) {
  const scope = visualScope(root);
  if (!scope) return;
  visualState.delete(scope);
}

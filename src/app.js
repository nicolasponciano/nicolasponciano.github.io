import { createGallery } from "./gallery.js";
import { projectDetails, skillGroups } from "./data/portfolio.js";
import {
  OBSOLETE_PROJECT_NOTICE,
  renderSkillGroups,
  fillProjectDialog,
  formatValue,
  getProjectDetails,
  readRowData,
} from "./content.js";
import {
  CHANGE_FALLBACK_MS,
  buildUrl,
  collectStackOptions,
  countLabel,
  filterProjects,
  getSchematic,
  movePreviewIndex,
  moveSelection,
  nextTheme,
  normalizeSlug,
  parseUrlState,
  previewCountLabel,
  resolveCloseFocus,
  resolveProjectLocation,
  resolveTheme,
  resultLabel,
  searchItems,
  shouldForceClose,
  shouldShowPager,
  themeToggleLabel,
} from "./core.js";

const page = {
  rows: [],
  entries: [],
  bySlug: new Map(),
  bar: null,
  count: null,
  empty: null,
  clear: null,
  dialog: null,
  indexStage: null,
};

const state = {
  currentSlug: null,
  closing: null,
  timer: null,
  popHandler: null,
  pendingFocus: null,
  focusOrigin: null,
  stackOptions: [],
  appliedUrl: null,
};

const palette = {
  dialog: null,
  input: null,
  list: null,
  count: null,
  empty: null,
  items: [],
  results: [],
  index: -1,
  opener: null,
};

const paletteKindLabels = { project: "Projeto", stack: "Stack", section: "Seção", contact: "Contato" };

const THEME_KEY = "portfolio-theme";
const COPY_FEEDBACK_MS = 2400;

const projectNotice = {
  region: null,
};

const contact = {
  button: null,
  status: null,
  timer: null,
  request: 0,
};

const theme = {
  toggle: null,
  current: "ink",
};

function findFeaturedSlug(rows) {
  const featured = Object.keys(projectDetails).find((slug) => projectDetails[slug]?.featured === true);
  if (featured && rows.some((row) => row.dataset.projectSlug === featured)) return featured;
  return rows[0]?.dataset.projectSlug ?? featured ?? "";
}

function readRow(row) {
  const stacks = [...(row?.querySelectorAll(".stack-list .stack-tag") ?? [])];
  const links = [...(row?.querySelectorAll(".project-links a[href]") ?? [])];

  return readRowData({
    slug: row?.dataset.projectSlug,
    title: row?.querySelector("h3")?.textContent,
    summary: row?.querySelector(".project-main > p")?.textContent,
    stacks: stacks.map((tag) => tag.textContent),
    year: row?.querySelector("[data-project-year]")?.textContent,
    links: links.map((link) => ({ label: link.textContent, url: link.getAttribute("href") })),
  });
}

function readProject(row) {
  const data = readRow(row);
  return {
    row,
    data,
    details: getProjectDetails(projectDetails, row.dataset.projectSlug),
    slug: data.slug,
    stacks: data.stacks,
  };
}

function renderCanvas(canvas, details) {
  const preview = details?.preview;
  const schematic = getSchematic(details, preview);
  canvas.className = `stage-canvas stage-canvas--${preview}`;
  canvas.setAttribute("aria-hidden", "true");
  canvas.replaceChildren();

  if (schematic.items.length === 0) {
    const blocks = preview === "flow" ? 3 : 4;
    for (let index = 0; index < blocks; index += 1) {
      const block = document.createElement("i");
      block.className = "preview-block";
      canvas.append(block);
    }
    return;
  }

  canvas.classList.add("stage-canvas--schematic");

  if (schematic.purpose) {
    const purpose = document.createElement("p");
    purpose.className = "preview-purpose";
    purpose.textContent = schematic.purpose;
    canvas.append(purpose);
  }

  const list = document.createElement("ol");
  list.className = "schematic-list";

  schematic.items.forEach((text, index) => {
    const entry = document.createElement("li");
    entry.className = "schematic-item";

    const number = document.createElement("span");
    number.className = "schematic-index";
    number.textContent = String(index + 1).padStart(2, "0");

    const label = document.createElement("span");
    label.className = "schematic-text";
    label.textContent = text;

    entry.append(number, label);
    list.append(entry);
  });

  canvas.append(list);
}

function ensureStageNote(stage) {
  const chrome = stage?.querySelector(".stage-chrome");
  if (!chrome) return null;

  let note = chrome.querySelector(".stage-note");
  if (!note) {
    note = document.createElement("span");
    note.className = "stage-note";
    chrome.append(note);
  }
  return note;
}

function restartSwap(element) {
  element.classList.remove("is-swapping");
  void element.offsetWidth;
  element.classList.add("is-swapping");
}

function paintStage(stage, { data, details, slug }) {
  const schematic = getSchematic(details, details.preview);
  const note = ensureStageNote(stage);
  stage.classList.toggle("has-schematic", schematic.items.length > 0);
  stage.querySelector("[data-preview-title]").textContent = data.title;
  stage.querySelector("[data-preview-kind]").textContent = schematic.label;
  if (note) note.textContent = schematic.note;
  stage.querySelector("[data-preview-stack]").textContent = formatValue(data.stacks);
  renderCanvas(stage.querySelector("[data-preview-canvas]"), details);
  stage.dataset.slug = slug;
  restartSwap(stage);
}

function clearStage(stage) {
  const note = stage.querySelector(".stage-note");
  stage.classList.remove("has-schematic");
  stage.querySelector("[data-preview-title]").textContent = "";
  stage.querySelector("[data-preview-kind]").textContent = "";
  if (note) note.textContent = "";
  stage.querySelector("[data-preview-stack]").textContent = "";
  stage.querySelector("[data-preview-canvas]").replaceChildren();
  delete stage.dataset.slug;
}

function initHeroPreview(stage, entries) {
  if (!stage) return;

  const pager = stage.querySelector("[data-stage-pager]");
  const live = stage.querySelector("[data-stage-live]");
  const count = stage.querySelector("[data-stage-count]");

  if (!entries.length) {
    clearStage(stage);
    pager?.remove();
    live?.remove();
    return;
  }

  const featured = findFeaturedSlug(page.rows);
  let index = entries.findIndex((entry) => entry.slug === featured);
  if (index < 0) index = 0;

  const paint = () => {
    paintStage(stage, entries[index]);
    if (count) count.textContent = previewCountLabel(index, entries.length);
  };

  paint();

  if (!shouldShowPager(entries.length)) {
    pager?.remove();
    live?.remove();
    return;
  }

  const step = (delta) => {
    index = movePreviewIndex(index, delta, entries.length);
    paint();
    if (live) live.textContent = `${entries[index].data.title}, prévia ${index + 1} de ${entries.length}`;
  };

  stage.querySelector("[data-stage-prev]")?.addEventListener("click", () => step(-1));
  stage.querySelector("[data-stage-next]")?.addEventListener("click", () => step(1));
}

function ensureRowPreview(box) {
  if (!box.querySelector("[data-preview-kind]")) {
    const head = document.createElement("div");
    head.className = "row-preview-head";

    const kind = document.createElement("span");
    kind.className = "row-preview-kind";
    kind.dataset.previewKind = "";

    const note = document.createElement("span");
    note.className = "row-preview-note";
    note.dataset.previewNote = "";

    const stack = document.createElement("span");
    stack.dataset.previewStack = "";

    head.append(kind, note, stack);
    box.append(head);
  }
  return box;
}

function createRowPreview() {
  const box = document.createElement("div");
  box.className = "row-preview";
  box.setAttribute("aria-hidden", "true");
  return ensureRowPreview(box);
}

function paintRowPreview(box, { data, details }) {
  const schematic = getSchematic(details, details.preview);
  box.classList.toggle("has-schematic", schematic.items.length > 0);
  box.querySelector("[data-preview-kind]").textContent = schematic.label;
  const note = box.querySelector("[data-preview-note]");
  if (note) note.textContent = schematic.note;
  box.querySelector("[data-preview-stack]").textContent = formatValue(data.stacks);

  let canvas = box.querySelector(".stage-canvas");
  if (!canvas) {
    canvas = document.createElement("div");
    box.append(canvas);
  }
  renderCanvas(canvas, details);
  restartSwap(box);
}

function initRowPreviews(rows) {
  rows.forEach((row) => {
    const box = ensureRowPreview(row.querySelector("[data-row-preview]") ?? createRowPreview());
    if (!box.parentElement) row.append(box);
    paintRowPreview(box, readProject(row));
  });
}

function syncStage(visible) {
  const stage = page.indexStage;
  if (!stage) return;

  const current = stage.dataset.slug;
  if (current && visible.some((entry) => entry.slug === current)) return;

  if (visible.length) paintStage(stage, visible[0]);
  else clearStage(stage);
}

function lockScroll() {
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  document.documentElement.style.overflow = "";
}

function focusSection(preventScroll = true) {
  const title = document.querySelector("#projects-title");
  if (title) title.focus({ preventScroll });
}

function isAvailableOrigin(origin) {
  return Boolean(
    origin &&
      origin.isConnected &&
      origin.disabled !== true &&
      typeof origin.focus === "function" &&
      origin.getClientRects().length > 0,
  );
}

function restoreFocus(slug, intent) {
  const recorded = state.focusOrigin;
  state.focusOrigin = null;
  const origin = recorded && recorded.slug === slug ? recorded.element : null;

  if (intent === "section") {
    focusSection();
    return;
  }

  const entry = slug ? page.bySlug.get(slug) : null;
  const decision = resolveCloseFocus({
    originAvailable: isAvailableOrigin(origin),
    rowVisible: Boolean(entry && !entry.row.hidden),
  });
  if (decision.target === "origin") {
    origin.focus({ preventScroll: true });
    return;
  }
  if (decision.target === "row" && entry) {
    entry.row.focus({ preventScroll: true });
    return;
  }
  focusSection();
}

function clearFallback() {
  if (state.timer !== null) clearTimeout(state.timer);
  state.timer = null;
  if (state.popHandler) removeEventListener("popstate", state.popHandler);
  state.popHandler = null;
}

function closeDialogLocal() {
  const dialog = page.dialog;
  if (dialog?.open) dialog.close();
  state.currentSlug = null;
  unlockScroll();
}

let gallery;

function openProject(slug) {
  const entry = page.bySlug.get(slug);
  if (!entry || !page.dialog) return;

  palette.opener = null;
  closePalette();
  gallery.reset(entry.details.screenshots);
  fillProjectDialog(page.dialog, { row: entry.data, details: entry.details });

  if (!page.dialog.open) {
    lockScroll();
    page.dialog.showModal();
  }

  state.currentSlug = slug;
  page.dialog.querySelector("[data-dialog-close]")?.focus({ preventScroll: true });
}

function syncDialog(slug) {
  const dialog = page.dialog;
  if (!dialog) return;

  if (slug) {
    if (state.currentSlug !== slug || !dialog.open) openProject(slug);
    return;
  }

  if (!dialog.open) return;

  const closedSlug = state.currentSlug;
  const intent = state.pendingFocus;
  state.pendingFocus = null;
  state.closing = null;
  clearFallback();
  closeDialogLocal();
  restoreFocus(closedSlug, intent);
}

function forceClose(slug) {
  if (state.closing !== slug) return;
  if (!shouldForceClose({ popped: false, elapsedMs: CHANGE_FALLBACK_MS })) return;

  state.closing = null;
  clearFallback();

  const urlState = parseUrlState(location);
  const next = buildUrl({ pathname: location.pathname, stack: urlState.stack, project: null });
  const current = `${location.pathname}${location.search}${location.hash}`;
  if (next !== current) history.replaceState(null, "", next);

  applyLocationState();
}

function scheduleFallback(slug) {
  clearFallback();
  state.timer = setTimeout(() => forceClose(slug), CHANGE_FALLBACK_MS);
  state.popHandler = () => clearFallback();
  addEventListener("popstate", state.popHandler);
}

function requestClose() {
  const dialog = page.dialog;
  if (!dialog?.open || state.closing) return;

  const slug = state.currentSlug;
  if (history.state?.dialog === slug) {
    state.closing = slug;
    scheduleFallback(slug);
    history.back();
    return;
  }

  state.pendingFocus = "section";
  const urlState = parseUrlState(location);
  const next = buildUrl({ pathname: location.pathname, stack: urlState.stack, project: null });
  history.replaceState(null, "", next);
  applyLocationState();
}

function setProjectNotice(message) {
  if (!projectNotice.region) return;
  projectNotice.region.textContent = message;
  projectNotice.region.hidden = !message;
}

function applyUrlState(urlState, { obsoleteProject = false } = {}) {
  const stack = urlState?.stack ?? null;
  const visible = filterProjects(page.entries, stack);
  const visibleSlugs = new Set(visible.map((entry) => entry.slug));

  page.entries.forEach(({ row, slug }) => {
    row.hidden = !visibleSlugs.has(slug);
  });

  if (page.count) page.count.textContent = countLabel(visible.length, page.entries.length);

  page.bar?.querySelectorAll("[data-stack]").forEach((button) => {
    const pressed = normalizeSlug(button.dataset.stack) === (stack ?? "");
    button.setAttribute("aria-pressed", String(pressed));
  });

  if (page.empty) page.empty.hidden = visible.length !== 0;

  syncStage(visible);

  const project = urlState?.project && page.bySlug.has(urlState.project) ? urlState.project : null;
  syncDialog(project);
  setProjectNotice(obsoleteProject ? OBSOLETE_PROJECT_NOTICE : "");
}

function openFromRow(row, origin = null) {
  const slug = row.dataset.projectSlug;
  state.focusOrigin = origin ? { element: origin, slug } : null;
  const urlState = parseUrlState(location);
  const next = buildUrl({ pathname: location.pathname, stack: urlState.stack, project: slug });
  const current = `${location.pathname}${location.search}${location.hash}`;

  if (next !== current) history.pushState({ dialog: slug }, "", next);
  applyLocationState();
}

function pushFilter(stack) {
  const urlState = parseUrlState(location);
  const next = buildUrl({ pathname: location.pathname, stack, project: urlState.project });
  const current = `${location.pathname}${location.search}${location.hash}`;

  if (next !== current) history.pushState(history.state, "", next);
  applyLocationState();
}

function currentUrl() {
  return `${location.pathname}${location.search}${location.hash}`;
}

function applyLocationState({ obsoleteProject = false } = {}) {
  applyUrlState(parseUrlState(location), { obsoleteProject });
  state.appliedUrl = currentUrl();
}

function syncFromLocation() {
  if (currentUrl() === state.appliedUrl) return;

  if (!location.hash.startsWith("#projeto/")) {
    applyLocationState();
    return;
  }

  const { projectObsolete } = canonicalize(state.stackOptions);
  applyLocationState({ obsoleteProject: projectObsolete });
}

function canonicalize(options) {
  const resolution = resolveProjectLocation({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    projectSlugs: page.entries.map((entry) => entry.slug),
    stackSlugs: options.map((option) => option.slug),
  });
  const current = currentUrl();

  if (resolution.canonical !== current) history.replaceState(history.state, "", resolution.canonical);
  return {
    projectRemoved: resolution.projectRemoved,
    projectObsolete: resolution.projectObsolete,
  };
}

function buildFilter(options) {
  const bar = document.querySelector("#filter-bar");
  if (!bar) return;

  options.forEach(({ slug, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-tag";
    button.dataset.stack = slug;
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    bar.append(button);
  });

  page.bar = bar;
  page.count = document.querySelector("#filter-count");
  page.empty = document.querySelector("#projects-empty");
  page.clear = document.querySelector("#filter-clear");
}

function bindFilters() {
  page.bar?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-stack]");
    if (!button || !page.bar.contains(button)) return;
    pushFilter(normalizeSlug(button.dataset.stack) || null);
  });

  page.clear?.addEventListener("click", () => {
    pushFilter(null);
    page.bar?.querySelector('[data-stack=""]')?.focus();
  });

  addEventListener("popstate", syncFromLocation);
  addEventListener("hashchange", syncFromLocation);
}

function bindDialog() {
  const dialog = document.querySelector("#project-dialog");
  if (!dialog) return;

  page.dialog = dialog;
  gallery = createGallery(dialog);
  dialog.querySelector("[data-dialog-close]")?.addEventListener("click", requestClose);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) requestClose();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (!gallery.returnToSheet()) requestClose();
  });
  dialog.addEventListener("close", unlockScroll);
}

function bindProjectOpening() {
  const list = document.querySelector(".project-list");
  if (!list) return;

  page.rows.forEach((row) => {
    const button = row.querySelector(".project-open");
    if (!button) return;
    const title = row.querySelector("h3")?.textContent?.trim();
    if (title) button.setAttribute("aria-label", `Abrir ficha: ${title}`);
    button.hidden = false;
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".project-open");
    if (!button || !list.contains(button)) return;
    const row = button.closest("[data-project-slug]");
    if (row) openFromRow(row, button);
  });
}

function bindIndexPreview(rows, stage) {
  const list = document.querySelector(".project-list");
  if (!list || !stage || !rows.length) return;

  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const stageVisible = matchMedia("(min-width: 769px)");

  const show = (row) => {
    const slug = row?.dataset.projectSlug;
    if (!slug || slug === stage.dataset.slug || !stageVisible.matches) return;
    paintStage(stage, readProject(row));
  };

  list.addEventListener("pointerover", (event) => {
    if (!finePointer.matches) return;
    show(event.target.closest("[data-project-slug]"));
  });

  list.addEventListener("focusin", (event) => {
    show(event.target.closest("[data-project-slug]"));
  });

  const featured = findFeaturedSlug(rows);
  const row = rows.find((item) => item.dataset.projectSlug === featured) ?? rows[0];
  paintStage(stage, readProject(row));
}

function buildPaletteItems() {
  const items = [];

  page.entries.forEach(({ slug, data }) => {
    items.push({
      kind: "project",
      title: data.title,
      hint: formatValue(data.stacks),
      action: "project",
      slug,
    });
  });

  collectStackOptions(page.entries).forEach(({ slug, label }) => {
    items.push({ kind: "stack", title: label, hint: "Filtrar projetos", action: "stack", slug });
  });

  document.querySelectorAll("[data-section][data-section-label]").forEach((section) => {
    if (!section.id) return;
    items.push({
      kind: "section",
      title: section.dataset.sectionLabel,
      hint: "Ir para a seção",
      action: "section",
      id: section.id,
    });
  });

  return items;
}

function syncPaletteSelection(scroll = false) {
  const options = [...palette.list.children];

  options.forEach((option, index) => {
    const active = index === palette.index;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-selected", String(active));
  });

  const active = options[palette.index];
  if (active) {
    palette.input?.setAttribute("aria-activedescendant", active.id);
    if (scroll) active.scrollIntoView({ block: "nearest" });
  } else {
    palette.input?.removeAttribute("aria-activedescendant");
  }
}

function renderPaletteResults(query) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  palette.results = trimmed ? searchItems(palette.items, trimmed) : palette.items;
  palette.list.replaceChildren();

  palette.results.forEach((item, index) => {
    const option = document.createElement("li");
    option.className = "command-option";
    option.id = `command-option-${index}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");

    const title = document.createElement("span");
    title.className = "command-option-title";
    title.textContent = item.title;

    const kind = document.createElement("span");
    kind.className = "command-option-kind";
    kind.textContent = paletteKindLabels[item.kind] ?? "";

    const hint = document.createElement("span");
    hint.className = "command-option-hint";
    hint.textContent = item.hint ?? "";

    option.append(title, hint, kind);
    palette.list.append(option);
  });

  palette.index = palette.results.length ? 0 : -1;
  palette.count.textContent = resultLabel(palette.results.length);
  palette.empty.hidden = palette.results.length !== 0;
  syncPaletteSelection();
}

function movePaletteSelection(delta) {
  const next = moveSelection(palette.index, delta, palette.results.length);
  if (next < 0) return;
  palette.index = next;
  syncPaletteSelection(true);
}

function closePalette() {
  if (palette.dialog?.open) palette.dialog.close();
}

function openPalette({ query = "", opener = null } = {}) {
  const dialog = palette.dialog;
  if (!dialog || dialog.open || page.dialog?.open) return;

  palette.opener = opener instanceof HTMLElement && opener !== document.body ? opener : null;
  setProjectNotice("");
  lockScroll();
  dialog.showModal();
  palette.input.value = query;
  renderPaletteResults(query);
  palette.input.focus({ preventScroll: true });
  const end = palette.input.value.length;
  palette.input.setSelectionRange(end, end);
}

function activatePaletteItem(index) {
  const item = palette.results[index];
  if (!item) return;

  closePalette();

  if (item.action === "project") {
    const entry = page.bySlug.get(item.slug);
    if (entry) openFromRow(entry.row);
    return;
  }

  if (item.action === "stack") {
    pushFilter(item.slug);
    document.querySelector("#projetos")?.scrollIntoView({ block: "start" });
    return;
  }

  if (item.action === "section") location.hash = item.id;
}

function bindPalette() {
  const dialog = document.querySelector("#command-palette");
  if (!dialog) return;

  palette.dialog = dialog;
  palette.input = dialog.querySelector("#command-search");
  palette.list = dialog.querySelector("#command-list");
  palette.count = dialog.querySelector("#command-count");
  palette.empty = dialog.querySelector("#command-empty");
  palette.items = buildPaletteItems();

  dialog.querySelector("[data-command-close]")?.addEventListener("click", closePalette);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closePalette();
  });
  dialog.addEventListener("close", () => {
    if (!page.dialog?.open) unlockScroll();
    const opener = palette.opener;
    palette.opener = null;
    if (opener?.isConnected && !page.dialog?.open) opener.focus({ preventScroll: true });
  });

  palette.input?.addEventListener("input", () => renderPaletteResults(palette.input.value));

  dialog.addEventListener("keydown", (event) => {
    const hasResults = palette.results.length > 0;

    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === "Enter" && event.target !== palette.input) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      movePaletteSelection(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      movePaletteSelection(-1);
      return;
    }

    if (event.key === "Home" && hasResults) {
      event.preventDefault();
      palette.index = 0;
      syncPaletteSelection(true);
      return;
    }

    if (event.key === "End" && hasResults) {
      event.preventDefault();
      palette.index = palette.results.length - 1;
      syncPaletteSelection(true);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      activatePaletteItem(palette.index);
    }
  });

  palette.list?.addEventListener("click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    activatePaletteItem([...palette.list.children].indexOf(option));
  });

  palette.list?.addEventListener("pointerover", (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    palette.index = [...palette.list.children].indexOf(option);
    syncPaletteSelection();
  });
}

function bindGlobalSearch() {
  const heroInput = document.querySelector("#hero-search");

  heroInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== "ArrowDown") return;
    event.preventDefault();
    openPalette({ query: heroInput.value, opener: heroInput });
  });

  addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (typeof event.key !== "string" || event.key.toLowerCase() !== "k") return;
    if (page.dialog?.open) return;

    event.preventDefault();
    if (palette.dialog?.open) closePalette();
    else openPalette({ opener: document.activeElement });
  });
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "paper" || stored === "ink" ? stored : null;
  } catch (error) {
    return null;
  }
}

function storeTheme(value) {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch (error) {
    // Sem persistência: o tema vale só nesta sessão.
  }
}

function systemTheme() {
  return matchMedia("(prefers-color-scheme: light)").matches ? "paper" : "ink";
}

function syncThemeControls() {
  const label = theme.toggle?.querySelector("[data-theme-label]");
  if (label) label.textContent = themeToggleLabel(theme.current);
  theme.toggle?.removeAttribute("aria-pressed");
  theme.toggle?.removeAttribute("aria-label");

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.current === "paper" ? "#f1f0e8" : "#0b1d27");

  const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (icon) {
    icon.setAttribute(
      "href",
      theme.current === "paper"
        ? "assets/branding/icons/favicon-light.svg"
        : "assets/branding/icons/favicon-dark.svg",
    );
  }
}

function applyTheme(value) {
  const next = value === "paper" ? "paper" : "ink";
  document.documentElement.dataset.theme = next;
  theme.current = next;
  syncThemeControls();
}

function initTheme() {
  theme.toggle = document.querySelector("#theme-toggle");
  theme.current = resolveTheme({ stored: readStoredTheme(), systemDark: systemTheme() === "ink" });
  syncThemeControls();

  theme.toggle?.addEventListener("click", () => {
    applyTheme(nextTheme(theme.current));
    storeTheme(theme.current);
  });
}

function announceCopy(message) {
  const status = contact.status;
  if (!status) return;

  if (contact.timer !== null) clearTimeout(contact.timer);
  status.textContent = message;
  contact.timer = setTimeout(() => {
    status.textContent = "";
    contact.timer = null;
  }, COPY_FEEDBACK_MS);
}

function readContactEmail() {
  const link = document.querySelector("#contact-links a[href^='mailto:']");
  const address = link?.getAttribute("href")?.replace(/^mailto:/i, "").split("?")[0]?.trim();
  return address ?? "";
}

async function copyContactEmail() {
  const email = readContactEmail();
  const request = contact.request + 1;
  contact.request = request;

  try {
    if (!email) throw new Error("Endereço de e-mail ausente");
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      throw new Error("Área de transferência indisponível");
    }
    await navigator.clipboard.writeText(email);
    if (request !== contact.request) return;
    announceCopy("Copiado");
  } catch (error) {
    if (request !== contact.request) return;
    announceCopy("Não foi possível copiar");
  }
}

function initContact() {
  contact.button = document.querySelector("#copy-email");
  contact.status = document.querySelector("#copy-status");
  contact.button?.addEventListener("click", copyContactEmail);
}

function boot() {
  try {
    initTheme();
    initContact();
    renderSkillGroups(document.querySelector("#skill-groups"), skillGroups);

    const year = document.querySelector("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    page.rows = [...document.querySelectorAll("[data-project-slug]")];
    if (!page.rows.length) return;

    page.entries = page.rows.map(readProject);
    page.bySlug = new Map(page.entries.map((entry) => [entry.slug, entry]));
    projectNotice.region = document.querySelector("#project-notice");
    const options = collectStackOptions(page.entries);
    state.stackOptions = options;

    const { projectRemoved, projectObsolete } = canonicalize(options);

    buildFilter(options);
    bindFilters();
    bindDialog();
    bindProjectOpening();
    bindPalette();
    bindGlobalSearch();

    initRowPreviews(page.rows);

    const heroStage = document.querySelector("[data-preview-stage]");
    if (heroStage) initHeroPreview(heroStage, page.entries);

    page.indexStage = document.querySelector("[data-index-stage]");
    if (page.indexStage) bindIndexPreview(page.rows, page.indexStage);

    applyLocationState({ obsoleteProject: projectObsolete });
    if (projectRemoved) focusSection(false);
  } catch (error) {
    console.error("Falha ao iniciar o portfólio:", error);
  }
}

boot();

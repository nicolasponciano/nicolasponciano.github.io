export const SCENE_DURATION_MS = 7200;

export function getInitialAgentCount({ width = 0, height = 0 } = {}) {
  const compact = width <= 760 || (width <= 1100 && height > width);
  return compact ? 4 : 6;
}

export function getSceneLeg(elapsedMs, durationMs = SCENE_DURATION_MS, legCount = 1) {
  const legs = Number.isFinite(legCount) ? Math.max(1, Math.floor(legCount)) : 1;
  const total = Number.isFinite(durationMs) && durationMs > 0 ? durationMs : SCENE_DURATION_MS;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const ratio = Math.min(1, elapsed / total) * legs;
  const index = Math.min(legs - 1, Math.floor(ratio));
  return {
    index,
    progress: Math.min(1, Math.max(0, ratio - index)),
    done: elapsed >= total,
  };
}

export function getSceneCursorPoint(rect, index, count) {
  const width = Number.isFinite(rect?.width) ? Math.max(0, rect.width) : 0;
  const height = Number.isFinite(rect?.height) ? Math.max(0, rect.height) : 0;
  const x = Number.isFinite(rect?.x) ? rect.x : 0;
  const y = Number.isFinite(rect?.y) ? rect.y : 0;
  const total = Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1;
  const slot = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const padX = Math.min(26, width * 0.18);
  const padY = Math.min(20, height * 0.22);
  const usableX = Math.max(0, width - padX * 2);
  const usableY = Math.max(0, height - padY * 2);
  const angle = (slot / total) * Math.PI * 2;

  return {
    x: Math.round(x + padX + ((Math.sin(angle) + 1) / 2) * usableX),
    y: Math.round(y + padY + ((Math.cos(angle * 1.4) + 1) / 2) * usableY),
  };
}

export function getProgress(completed, total) {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safeCompleted = Number.isFinite(completed)
    ? Math.min(safeTotal, Math.max(0, Math.floor(completed)))
    : 0;
  const percent = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);

  return { completed: safeCompleted, total: safeTotal, percent };
}

export function shouldAnimate(prefersReducedMotion) {
  return prefersReducedMotion !== true;
}

export function assignBlocksToAgents(blockCount, agentCount) {
  const blocks = Number.isFinite(blockCount) ? Math.max(0, Math.floor(blockCount)) : 0;
  const agents = Number.isFinite(agentCount) ? Math.max(0, Math.floor(agentCount)) : 0;
  if (agents === 0) return [];

  const assignments = Array.from({ length: agents }, () => []);
  for (let index = 0; index < blocks; index += 1) {
    assignments[index % agents].push(index);
  }
  return assignments;
}

export function getElementTarget(rect, xInset = 0, yInset = 0) {
  const width = Number.isFinite(rect?.width) ? Math.max(0, rect.width) : 0;
  const height = Number.isFinite(rect?.height) ? Math.max(0, rect.height) : 0;
  const x = Number.isFinite(rect?.x) ? rect.x : 0;
  const y = Number.isFinite(rect?.y) ? rect.y : 0;
  return {
    x: x + Math.min(width / 2, Math.max(0, xInset)),
    y: y + Math.min(height / 2, Math.max(0, yInset)),
  };
}

export function resolveRevealMode(mode, hasChildren) {
  if ((mode === "type" || mode === "neon") && hasChildren) return "fade";
  return mode || "fade";
}

export function getAgentIdlePosition(index, count, width, height) {
  const safeWidth = Number.isFinite(width) ? Math.max(320, width) : 320;
  const safeHeight = Number.isFinite(height) ? Math.max(320, height) : 320;
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const safeCount = Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1;
  const lanes = Math.max(1, Math.ceil(safeCount / 4));
  const lane = (Math.floor(safeIndex / 4) + 1) / (lanes + 1);
  const side = safeIndex % 4;

  if (side === 0) return { x: Math.round(safeWidth * lane), y: 94 };
  if (side === 1) return { x: safeWidth - 20, y: Math.round(safeHeight * lane) };
  if (side === 2) return { x: Math.round(safeWidth * (1 - lane)), y: safeHeight - 86 };
  return { x: 16, y: Math.round(safeHeight * (1 - lane)) };
}

export function normalizeSpeed(value) {
  return [1, 2, 4].includes(Number(value)) ? Number(value) : 1;
}

export function getPauseLabel(paused) {
  return paused ? "Retomar montagem" : "Pausar montagem";
}

export function getHeroBoost(scrollDelta) {
  const delta = Number.isFinite(scrollDelta) ? Math.abs(scrollDelta) : 0;
  return delta > 4 ? 4 : 1;
}

export function canCompleteBoot({ token, bootToken, booted }) {
  if (booted === true) return false;
  return token === bootToken;
}

export function getSectionAction(rect, viewportHeight) {
  if (!rect || !Number.isFinite(rect.top) || !Number.isFinite(rect.bottom)) return "wait";
  const height = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 0;
  if (rect.bottom < 0) return "reveal";
  if (rect.top < height) return "queue";
  return "wait";
}

export function getCongaPoint(time, index, count, width, height) {
  const safeCount = Number.isFinite(count) && count > 0 ? count : 0;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;
  if (safeCount === 0 || safeWidth === 0 || safeHeight === 0) return { x: 0, y: 0 };

  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const t = Number.isFinite(time) ? time : 0;
  const phase = (safeIndex / safeCount) * Math.PI * 2;
  const marginX = safeWidth * 0.12;
  const marginY = safeHeight * 0.14;
  const rangeX = safeWidth - marginX * 2;
  const rangeY = safeHeight - marginY * 2;

  const x = marginX + (Math.sin(t * 0.6 + phase) + 1) * 0.5 * rangeX;
  const y = marginY + (Math.sin(t * 0.9 + phase * 1.7) + 1) * 0.5 * rangeY;
  return { x: Math.round(x), y: Math.round(y) };
}

export function getBlockSizeLabel(rect) {
  const width = Number.isFinite(rect?.width) ? Math.max(0, Math.round(rect.width)) : 0;
  const height = Number.isFinite(rect?.height) ? Math.max(0, Math.round(rect.height)) : 0;
  return `${width}×${height}`;
}

export function getAgentAvatars(names, max = 5) {
  const list = Array.isArray(names) ? names.filter((name) => typeof name === "string" && name.trim()) : [];
  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  return {
    initials: shown.map((name) => name.trim().charAt(0).toUpperCase()),
    extra: rest > 0 ? `+${rest}` : null,
  };
}

export function getCompletionMessage(agentCount, seconds) {
  const count = Number.isFinite(agentCount) ? Math.max(0, Math.floor(agentCount)) : 0;
  const duration = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  if (count === 0) return "Montagem concluída";
  const rounded = Math.round(duration * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",");
  return `Montada por ${count} agentes em ${formatted} s`;
}

export const CHANGE_FALLBACK_MS = 250;

const ACCENT_MARKS = /[\u0300-\u036f]/g;
const KIND_ORDER = { project: 0, stack: 1, section: 2, contact: 3 };

function fold(value) {
  if (typeof value !== "string") return "";
  return value.normalize("NFD").replace(ACCENT_MARKS, "").toLowerCase();
}

export function normalizeSlug(value) {
  return fold(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LEGACY_PROJECT_ALIASES = { "projeto-02": "open-mind" };
const OBSOLETE_PROJECTS = new Set(["projeto-01", "projeto-03"]);

export function resolveLegacyProject(value) {
  const slug = normalizeSlug(value);
  if (!slug || !Object.hasOwn(LEGACY_PROJECT_ALIASES, slug)) return null;
  return LEGACY_PROJECT_ALIASES[slug];
}

export function isObsoleteProject(value) {
  const slug = normalizeSlug(value);
  return slug ? OBSOLETE_PROJECTS.has(slug) : false;
}

export function parseUrlState({ search = "", hash = "" } = {}) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const stack = normalizeSlug(params.get("stack") || "") || null;

  let project = null;
  if (typeof hash === "string") {
    const match = hash.match(/^#projeto\/(.+)$/);
    if (match) project = normalizeSlug(match[1]) || null;
  }

  return { stack, project };
}

export function buildUrl({ pathname = "/", stack = null, project = null } = {}) {
  const path = typeof pathname === "string" && pathname.trim() ? pathname.trim() : "/";
  const stackSlug = normalizeSlug(stack);
  const projectSlug = normalizeSlug(project);
  return `${path}${stackSlug ? `?stack=${stackSlug}` : ""}${projectSlug ? `#projeto/${projectSlug}` : ""}`;
}

function toSlugList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeSlug(item)).filter(Boolean);
}

export function resolveProjectLocation({
  pathname = "/",
  search = "",
  hash = "",
  projectSlugs = [],
  stackSlugs = [],
} = {}) {
  const urlState = parseUrlState({ search, hash });
  const knownProjects = toSlugList(projectSlugs);
  const knownStacks = toSlugList(stackSlugs);
  const stack = urlState.stack && knownStacks.includes(urlState.stack) ? urlState.stack : null;
  const legacyProject = resolveLegacyProject(urlState.project);
  const obsoleteProject = isObsoleteProject(urlState.project);
  const candidate = legacyProject ?? urlState.project;
  const project = candidate && knownProjects.includes(candidate) ? candidate : null;
  const hasProjectHash = typeof hash === "string" && hash !== "";

  return {
    stack,
    project,
    canonical: buildUrl({ pathname, stack, project }),
    projectRemoved: hasProjectHash && !project,
    projectObsolete: obsoleteProject && !project,
  };
}

export function filterProjects(items, stackSlug) {
  const list = Array.isArray(items) ? items : [];
  const slug = normalizeSlug(stackSlug);
  if (!slug) return list;

  return list.filter((item) => {
    const stacks = Array.isArray(item?.stacks) ? item.stacks : [];
    return stacks.some((label) => normalizeSlug(label) === slug);
  });
}

export function collectStackOptions(items) {
  const list = Array.isArray(items) ? items : [];
  const seen = new Map();

  list.forEach((item) => {
    const stacks = Array.isArray(item?.stacks) ? item.stacks : [];
    stacks.forEach((label) => {
      const slug = normalizeSlug(label);
      if (!slug || seen.has(slug)) return;
      seen.set(slug, { slug, label: String(label).trim() });
    });
  });

  return [...seen.values()];
}

export function resultLabel(count) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (total === 0) return "Nenhum resultado";
  return total === 1 ? "1 resultado" : `${total} resultados`;
}

export function countLabel(shown, total) {
  const visible = Number.isFinite(shown) ? Math.max(0, Math.floor(shown)) : 0;
  const all = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  return `${visible} de ${all}`;
}

export function searchItems(items, query) {
  const list = Array.isArray(items) ? items : [];
  const needle = fold(query);
  if (!needle) return [];

  return list
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => fold(item?.title ?? item?.label ?? "").includes(needle))
    .sort((a, b) => {
      const priority = (KIND_ORDER[a.item?.kind] ?? 9) - (KIND_ORDER[b.item?.kind] ?? 9);
      return priority || a.index - b.index;
    })
    .map(({ item }) => item);
}

export function resolveTheme({ stored = null, systemDark = false } = {}) {
  if (stored === "paper" || stored === "ink") return stored;
  return systemDark === true ? "ink" : "paper";
}

export function nextTheme(theme) {
  return theme === "paper" ? "ink" : "paper";
}

export function themeToggleLabel(current) {
  return current === "paper" ? "Ativar tema tinta" : "Ativar tema papel";
}

export function resolveCloseFocus({ rowVisible = false, originAvailable = false } = {}) {
  if (originAvailable === true) return { target: "origin" };
  return { target: rowVisible === true ? "row" : "section" };
}

export function shouldForceClose({ popped = false, elapsedMs = 0 } = {}) {
  if (popped === true) return false;
  const elapsed = Number.isFinite(elapsedMs) ? elapsedMs : 0;
  return elapsed >= CHANGE_FALLBACK_MS;
}

export function moveSelection(index, delta, length) {
  const size = Number.isFinite(length) ? Math.floor(length) : 0;
  if (size <= 0) return -1;

  const start = Number.isFinite(index) ? Math.floor(index) : 0;
  const step = Number.isFinite(delta) ? Math.floor(delta) : 0;
  return ((start + step) % size + size) % size;
}

export const SCHEMATIC_MAX_ITEMS = 4;

const PREVIEW_TYPES = ["panel", "terminal", "flow"];
const NEUTRAL_SCHEMATIC_LABELS = { panel: "Painel", terminal: "Terminal", flow: "Fluxo" };
const SCHEMATIC_NOTE = "Prévia conceitual";

function cleanSchematicText(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSchematic(value) {
  if (!value || typeof value !== "object") return null;

  const items = (Array.isArray(value.items) ? value.items : [])
    .map(cleanSchematicText)
    .filter((item) => item.length > 0)
    .slice(0, SCHEMATIC_MAX_ITEMS);

  if (items.length === 0) return null;

  return {
    label: cleanSchematicText(value.label),
    note: cleanSchematicText(value.note) || SCHEMATIC_NOTE,
    purpose: cleanSchematicText(value.purpose),
    items,
  };
}

export function getSchematic(details, fallbackType = "panel") {
  const normalized = normalizeSchematic(details?.schematic);
  if (normalized) return normalized;

  const type = PREVIEW_TYPES.includes(fallbackType) ? fallbackType : "panel";
  return {
    label: NEUTRAL_SCHEMATIC_LABELS[type],
    note: SCHEMATIC_NOTE,
    purpose: "",
    items: [],
  };
}

export function movePreviewIndex(index, delta, length) {
  return moveSelection(index, delta, length);
}

export function shouldShowPager(length) {
  const size = Number.isFinite(length) ? Math.floor(length) : 0;
  return size >= 2;
}

export function previewCountLabel(index, length) {
  const size = Number.isFinite(length) ? Math.max(0, Math.floor(length)) : 0;
  const pad = (number) => String(number).padStart(2, "0");
  if (size === 0) return `${pad(0)} / ${pad(0)}`;

  const current = movePreviewIndex(index, 0, size);
  return `${pad(current + 1)} / ${pad(size)}`;
}


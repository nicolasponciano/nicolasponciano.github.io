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


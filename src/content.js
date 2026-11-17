import { normalizeSlug } from "./core.js";

const fill = "[A preencher]";
const previewTypes = ["panel", "terminal", "flow"];

export function formatValue(value) {
  if (Array.isArray(value)) {
    const items = value.filter((item) => typeof item === "string" && item.trim());
    return items.length ? items.join(" · ") : fill;
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return fill;
}

export function isSafeExternalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const candidate = value.trim();

  if (candidate.startsWith("mailto:")) {
    return /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(candidate);
  }

  try {
    const url = new URL(candidate);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function getProjectDetails(details, slug) {
  const entry = details?.[normalizeSlug(slug)] ?? {};

  return {
    role: formatValue(entry.role),
    challenge: formatValue(entry.challenge),
    solution: formatValue(entry.solution),
    featured: entry.featured === true,
    preview: previewTypes.includes(entry.preview) ? entry.preview : "panel",
    schematic: entry.schematic ?? null,
  };
}

export function readRowData(row) {
  const stacks = Array.isArray(row?.stacks)
    ? row.stacks.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
  const links = Array.isArray(row?.links)
    ? row.links
      .filter((link) => isSafeExternalUrl(link?.url))
      .map((link) => ({ label: formatValue(link.label), url: link.url.trim() }))
    : [];

  return {
    slug: normalizeSlug(row?.slug),
    title: formatValue(row?.title),
    summary: formatValue(row?.summary),
    stacks,
    year: formatValue(row?.year),
    links,
  };
}

function setField(dialog, selector, value) {
  const field = dialog.querySelector(selector);
  if (field) field.textContent = value;
}

export function fillProjectDialog(dialog, { row, details } = {}) {
  if (!dialog) return;

  const data = readRowData(row);
  const info = details ?? {};

  setField(dialog, "[data-dialog-title]", data.title);
  setField(dialog, "[data-dialog-summary]", data.summary);
  setField(dialog, "[data-dialog-year]", data.year);
  setField(dialog, "[data-dialog-role]", formatValue(info.role));
  setField(dialog, "[data-dialog-challenge]", formatValue(info.challenge));
  setField(dialog, "[data-dialog-solution]", formatValue(info.solution));
  setField(dialog, "[data-dialog-stack]", formatValue(data.stacks));

  const linksBox = dialog.querySelector("[data-dialog-links]");
  if (!linksBox) return;

  linksBox.replaceChildren();
  if (!data.links.length) {
    const empty = document.createElement("span");
    empty.className = "dialog-links-empty";
    empty.textContent = fill;
    linksBox.append(empty);
    return;
  }

  data.links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.textContent = link.label;
    if (/^https?:/i.test(link.url)) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    linksBox.append(anchor);
  });
}

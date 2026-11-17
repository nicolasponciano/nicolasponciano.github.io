import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const dataPath = fileURLToPath(new URL("../src/data/portfolio.js", import.meta.url));
const contentPath = fileURLToPath(new URL("../src/content.js", import.meta.url));

async function loadContent() {
  assert.ok(existsSync(contentPath), "src/content.js precisa normalizar conteúdo e links");
  return import(`${new URL("../src/content.js", import.meta.url).href}?test=${Date.now()}`);
}

async function loadData() {
  assert.ok(existsSync(dataPath), "src/data/portfolio.js precisa declarar os detalhes por slug");
  return import(`${new URL("../src/data/portfolio.js", import.meta.url).href}?test=${Date.now()}`);
}

test("os detalhes ficam indexados por slug sem repetir o conteúdo do HTML", async () => {
  const { projectDetails } = await loadData();
  const slugs = Object.keys(projectDetails);

  assert.ok(slugs.length >= 2 && slugs.length <= 4);
  slugs.forEach((slug) => {
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    const entry = projectDetails[slug];
    assert.ok(entry.role.length > 10);
    assert.ok(entry.challenge.length > 10);
    assert.ok(entry.solution.length > 10);
    assert.equal(typeof entry.featured, "boolean");
    assert.ok(["panel", "terminal", "flow"].includes(entry.preview));
    for (const duplicated of ["title", "summary", "stack", "stacks", "year", "links"]) {
      assert.equal(duplicated in entry, false, `${slug} não pode duplicar ${duplicated}`);
    }
  });
  assert.equal(slugs.filter((slug) => projectDetails[slug].featured).length, 1);
});

test("detalhes ausentes e tipo de prévia desconhecido caem no padrão", async () => {
  const { getProjectDetails } = await loadContent();
  const { projectDetails } = await loadData();
  const first = getProjectDetails(projectDetails, Object.keys(projectDetails)[0]);

  assert.ok(first.role.length > 10);
  assert.equal(first.featured, true);
  assert.equal(first.preview, "panel");

  const missing = getProjectDetails(projectDetails, "nao-existe");
  assert.match(missing.role, /\[A preencher\]/);
  assert.equal(missing.featured, false);
  assert.equal(missing.preview, "panel");

  assert.equal(getProjectDetails({ x: { preview: "3d" } }, "x").preview, "panel");
   assert.equal(getProjectDetails(null, "x").solution, "[A preencher]");
});

test("a linha entrega título, resumo, stack, ano e links sanitizados", async () => {
  const { readRowData } = await loadContent();
  const data = readRowData({
    slug: "Projeto 01",
    title: "Painel de operações",
    summary: "Resumo do projeto",
    stacks: ["React Native", " ", "Node.js"],
    year: "2025",
    links: [
      { label: "Repositório", url: "https://github.com/example" },
      { label: "Perigoso", url: "javascript:alert(1)" },
    ],
  });

  assert.deepEqual(data, {
    slug: "projeto-01",
    title: "Painel de operações",
    summary: "Resumo do projeto",
    stacks: ["React Native", "Node.js"],
    year: "2025",
    links: [{ label: "Repositório", url: "https://github.com/example" }],
  });
});

test("linha sem dados não inventa conteúdo nem links", async () => {
  const { readRowData } = await loadContent();
  const empty = readRowData();

  assert.equal(empty.title, "[A preencher]");
  assert.equal(empty.summary, "[A preencher]");
  assert.equal(empty.year, "[A preencher]");
  assert.equal(empty.slug, "");
  assert.deepEqual(empty.stacks, []);
  assert.deepEqual(empty.links, []);
});

test("conteúdo vazio e listas são formatados sem inventar valores", async () => {
  const { formatValue } = await loadContent();
  assert.equal(formatValue(""), "[A preencher]");
  assert.equal(formatValue(["React", "Node.js"]), "React · Node.js");
  assert.equal(formatValue(["", null]), "[A preencher]");
});

test("somente links HTTP, HTTPS e mailto válidos podem virar links", async () => {
  const { isSafeExternalUrl } = await loadContent();
  assert.equal(isSafeExternalUrl("https://github.com/example"), true);
  assert.equal(isSafeExternalUrl("mailto:nicolas@example.com"), true);
  assert.equal(isSafeExternalUrl("javascript:alert(1)"), false);
  assert.equal(isSafeExternalUrl("data:text/html,hello"), false);
  assert.equal(isSafeExternalUrl("#projetos"), false);
});

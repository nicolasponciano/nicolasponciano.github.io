import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const publicar = process.env.PUBLICAR === "1";
const htmlPath = fileURLToPath(new URL("../index.html", import.meta.url));
const dataPath = fileURLToPath(new URL("../src/data/portfolio.js", import.meta.url));

const placeholders = [
  "[A preencher]",
  "[Nome do projeto]",
  "[Problema e solução]",
  "[Tecnologias]",
  "Links a preencher",
];

function readHtml() {
  return readFileSync(htmlPath, "utf8");
}

function projectBlocks(html) {
  return html.match(/<article class="project-entry"[\s\S]*?<\/article>/g) ?? [];
}

async function loadDetails() {
  return (await import(`${new URL("../src/data/portfolio.js", import.meta.url).href}?publicacao=${Date.now()}`))
    .projectDetails;
}

test("index.html não contém placeholder de publicação", { skip: !publicar }, () => {
  const html = readHtml();
  const found = placeholders.filter((placeholder) => html.includes(placeholder));

  assert.deepEqual(found, [], `placeholders no index.html: ${found.join(", ")}`);
});

test("o contato tem endereço de e-mail válido em mailto:", { skip: !publicar }, () => {
  const html = readHtml();
  const hrefs = [...html.matchAll(/href="mailto:([^"]*)"/g)].map((match) => match[1]);

  assert.ok(hrefs.length > 0, "index.html precisa ter um mailto: visível");
  hrefs.forEach((address) => {
    assert.match(address, /^[^@\s]+@[^@\s]+\.[^@\s]+$/, `mailto inválido: ${address}`);
  });
});

test("projectDetails não tem placeholder nem chave inválida", { skip: !publicar }, async () => {
  const details = await loadDetails();
  const entries = Object.entries(details);

  assert.ok(entries.length > 0, "projectDetails precisa ter projetos");
  entries.forEach(([slug, entry]) => {
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug inválido: ${slug}`);
    placeholders.forEach((placeholder) => {
      assert.equal(
        JSON.stringify(entry).includes(placeholder),
        false,
        `${slug} ainda contém ${placeholder}`,
      );
    });
  });
});

test("toda chave de projectDetails existe no HTML", { skip: !publicar }, async () => {
  const details = await loadDetails();
  const htmlSlugs = projectBlocks(readHtml()).map((block) => {
    const match = block.match(/data-project-slug="([^"]+)"/);
    return match ? match[1] : "";
  });

  Object.keys(details).forEach((slug) => {
    assert.ok(htmlSlugs.includes(slug), `slug sem projeto no HTML: ${slug}`);
  });
});

test("cada projeto tem ano, resumo e stack reais", { skip: !publicar }, () => {
  const blocks = projectBlocks(readHtml());

  assert.ok(blocks.length > 0, "index.html precisa ter projetos");

  blocks.forEach((block) => {
    const slug = block.match(/data-project-slug="([^"]+)"/)?.[1] ?? "desconhecido";
    const year = block.match(/<span data-project-year>([\s\S]*?)<\/span>/)?.[1] ?? "";
    const summary = block.match(/<\/h3>\s*<p>([\s\S]*?)<\/p>/)?.[1] ?? "";
    const stacks = [...block.matchAll(/<span class="stack-tag">([\s\S]*?)<\/span>/g)].map((match) => match[1]);

    assert.match(year.trim(), /^\d{4}$/, `${slug} sem ano`);
    assert.ok(summary.trim() && !placeholders.some((placeholder) => summary.includes(placeholder)), `${slug} sem resumo`);
    assert.ok(stacks.length > 0 && stacks.every((stack) => stack.trim()), `${slug} sem stack`);
    stacks.forEach((stack) => {
      assert.equal(
        placeholders.some((placeholder) => stack.includes(placeholder)),
        false,
        `${slug} ainda tem stack provisória`,
      );
    });
  });
});

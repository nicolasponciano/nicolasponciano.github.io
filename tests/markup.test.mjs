import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const pagePath = fileURLToPath(new URL("../index.html", import.meta.url));
const dataPath = fileURLToPath(new URL("../src/data/portfolio.js", import.meta.url));

test("a página mantém perfil, projetos e contato no HTML sem depender do JavaScript", () => {
  assert.ok(existsSync(pagePath), "index.html precisa conter a experiência e o fallback estático");
  const html = readFileSync(pagePath, "utf8");
  assert.match(html, /<main\b/i);
  assert.match(html, /<h1\b[^>]*>[\s\S]*?Full Stack/i);
  assert.match(html, /id="projetos"/i);
  assert.match(html, /id="contato"/i);
  assert.doesNotMatch(html, /\[A preencher\]/i);
  assert.match(html, /rel="icon" href="assets\/favicon\.svg"/i);
  assert.ok(existsSync(new URL("../assets/favicon.svg", import.meta.url)));
});

test("a página nasce sem JavaScript e aplica o tema antes do CSS", () => {
  const html = readFileSync(pagePath, "utf8");
  assert.match(html, /<html[^>]*class="no-js"/i);

  const themeScript = html.indexOf("portfolio-theme");
  const stylesheet = html.indexOf('href="src/styles.css"');
  assert.ok(themeScript !== -1, "o script inline precisa ler o tema salvo");
  assert.ok(stylesheet !== -1, "a página precisa carregar src/styles.css");
  assert.ok(themeScript < stylesheet, "o tema precisa ser aplicado antes da primeira pintura");
  assert.doesNotMatch(html, /page-building/);
});

test("o hero tem duas ações, busca e palco de prévia sem lista duplicada", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('<section class="hero');
  const end = html.indexOf("</section>", start);
  assert.ok(start !== -1 && end !== -1, "seção do hero precisa existir");
  const hero = html.slice(start, end);

  const actions = hero.match(/<a\b[^>]*class="(?:button button-primary|text-link)"[^>]*>/g) ?? [];
  assert.equal(actions.length, 2, "o hero precisa de exatamente duas ações principais");
  assert.match(hero, /<label[^>]*for="hero-search"/);
  assert.match(hero, /id="hero-search"/);
  assert.match(hero, /data-preview-stage[^>]*aria-hidden="true"/);
  assert.match(hero, /data-preview-canvas/);
  assert.doesNotMatch(hero, /hero-diagram/);
  assert.doesNotMatch(hero, /class="hero-highlights"/);
});

test("o índice estrutura linhas com título, ano, stack, abrir e palco", () => {
  const html = readFileSync(pagePath, "utf8");
  const rows = [...html.matchAll(/<article class="project-entry"[\s\S]*?<\/article>/g)].map((match) => match[0]);

  assert.equal(rows.length, 3, "o índice precisa manter as três linhas");
  rows.forEach((row) => {
    assert.match(row, /<h3 id="projeto-0\d-title"/);
    assert.match(row, /data-project-year/);
    assert.match(row, /class="stack-tag"/);
    assert.match(row, /class="project-open"[^>]*hidden/, "abrir ficha só aparece quando a ficha existir");
    assert.match(row, /tabindex="0"/);
    assert.match(row, /aria-labelledby="[^"]+"/);
  });

  assert.match(html, /data-index-stage[^>]*aria-hidden="true"/);
  assert.match(html, /class="hero-search" role="search"[^>]*aria-label="Busca do portfólio"/, "a busca do hero fica ativa com a palette");
  assert.doesNotMatch(html, /class="hero-search"[^>]*\shidden\b/, "a busca não pode continuar oculta");
  assert.doesNotMatch(html, /data-build|data-reveal/, "não restam ganchos da montagem antiga");
});

test("a barra de filtro tem tag inicial, contagem anunciada e estado vazio", () => {
  const html = readFileSync(pagePath, "utf8");

  assert.match(html, /<div class="filter-bar" id="filter-bar" role="group" aria-label="Filtrar projetos por stack">/);
  assert.match(html, /id="filter-count"[^>]*aria-live="polite"/);

  const tags = [...html.matchAll(/<button[^>]*class="filter-tag"[^>]*>/g)].map((match) => match[0]);
  assert.ok(tags.length >= 1, "a barra precisa começar com a tag Todas");
  tags.forEach((tag) => {
    const stack = tag.match(/data-stack="([^"]*)"/)?.[1];
    assert.ok(stack !== undefined, "toda tag precisa de data-stack");
    assert.match(stack, /^[a-z0-9-]*$/, "data-stack precisa ser um slug normalizado");
    assert.match(tag, /aria-pressed="(true|false)"/);
  });
  assert.equal(tags.filter((tag) => tag.includes('aria-pressed="true"')).length, 1);

  assert.match(html, /id="projects-empty"[^>]*hidden/);
  assert.match(html, /id="filter-clear"[^>]*>Limpar filtro</);
});

test("a ficha é um dialog fechado, com campos ligados à linha e botão fechar", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('<dialog class="project-dialog"');
  const end = html.indexOf("</dialog>", start);
  assert.ok(start !== -1 && end !== -1, "o dialog da ficha precisa existir");
  const dialog = html.slice(start, end);

  assert.match(dialog, /id="project-dialog" aria-labelledby="project-dialog-title"/);
  assert.match(dialog, /<h2 id="project-dialog-title"/);
  assert.match(dialog, /data-dialog-close/);
  for (const hook of [
    "data-dialog-title",
    "data-dialog-summary",
    "data-dialog-year",
    "data-dialog-role",
    "data-dialog-challenge",
    "data-dialog-solution",
    "data-dialog-stack",
    "data-dialog-links",
  ]) {
    assert.ok(dialog.includes(hook), `a ficha precisa do gancho ${hook}`);
  }
  assert.doesNotMatch(dialog, /\bopen\b/, "a ficha não pode nascer aberta");

  assert.match(html, /id="projects-title"[^>]*tabindex="-1"/);
});

test("a palette é um dialog fechado com combobox, listbox e contagem anunciada", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('<dialog class="command-palette"');
  const end = html.indexOf("</dialog>", start);
  assert.ok(start !== -1 && end !== -1, "o dialog da palette precisa existir");
  const palette = html.slice(start, end);

  assert.match(palette, /id="command-palette" aria-labelledby="command-palette-title"/);
  assert.match(palette, /<h2[^>]*id="command-palette-title"/);
  assert.match(palette, /role="combobox"[^>]*aria-controls="command-list"/);
  assert.match(palette, /id="command-list"[^>]*role="listbox"/);
  assert.match(palette, /id="command-count"[^>]*aria-live="polite"/);
  assert.match(palette, /data-command-close/);
  assert.doesNotMatch(palette, /\bopen\b/, "a palette não pode nascer aberta");
});

test("o botão de tema usa nome acessível fixo e estado em aria-pressed", () => {
  const html = readFileSync(pagePath, "utf8");
  assert.match(html, /<button[^>]*id="theme-toggle"[^>]*aria-pressed="false"/);
  assert.match(html, /aria-label="Tema papel"/, "o nome acessível não pode descrever a próxima ação");
  assert.doesNotMatch(html, /Ativar tema/, "o nome acessível precisa ser o mesmo em qualquer tema");
  assert.doesNotMatch(html, /data-theme-label/, "o rótulo não pode mudar ao alternar");
  assert.match(html, /localStorage\.getItem\("portfolio-theme"\)/);
  assert.doesNotMatch(html, /localStorage\.setItem/, "o script de boot não pode gravar preferência");
});

test("o contato tem mailto visível, botão de copiar e região de anúncio", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('id="contato"');
  const end = html.indexOf("</section>", start);
  assert.ok(start !== -1 && end !== -1, "a seção de contato precisa existir");
  const contact = html.slice(start, end);

  assert.match(contact, /href="mailto:[^"]+@[^"]+"/, "o mailto precisa ter endereço real");
  assert.match(contact, /class="contact-email"[^>]*>[\s\S]*?@/, "o endereço precisa ficar visível");
  assert.match(contact, /<button[^>]*id="copy-email"[^>]*>Copiar e-mail</);
  assert.match(contact, /id="copy-status"[^>]*role="status"[^>]*aria-live="polite"/);
});

test("cada projeto tem slug único e correspondência nos detalhes", async () => {
  const html = readFileSync(pagePath, "utf8");
  const slugs = [...html.matchAll(/data-project-slug="([^"]+)"/g)].map((match) => match[1]);

  assert.ok(slugs.length >= 2, "o índice precisa declarar slugs");
  assert.equal(new Set(slugs).size, slugs.length, "slug de projeto precisa ser único");
  slugs.forEach((slug) => assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/));

  assert.ok(existsSync(dataPath), "src/data/portfolio.js precisa existir");
  const { projectDetails } = await import(`${new URL("../src/data/portfolio.js", import.meta.url).href}?test=${Date.now()}`);
  slugs.forEach((slug) => assert.ok(projectDetails[slug], `${slug} precisa ter detalhes em projectDetails`));

  const featured = Object.keys(projectDetails).filter((slug) => projectDetails[slug].featured === true);
  assert.equal(featured.length, 1, "exatamente um projeto deve ser featured");
  assert.ok(slugs.includes(featured[0]), "o projeto featured precisa existir no HTML");
});

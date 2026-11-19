import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const corePath = fileURLToPath(new URL("../src/core.js", import.meta.url));

async function loadCore() {
  assert.ok(existsSync(corePath), "src/core.js precisa implementar as regras do portfólio");
  return import(`${new URL("../src/core.js", import.meta.url).href}?test=${Date.now()}`);
}


test("slug normaliza acento, caixa, espaço e hífen repetido", async () => {
  const { normalizeSlug } = await loadCore();
  assert.equal(normalizeSlug("React Native"), "react-native");
  assert.equal(normalizeSlug("Café com Leite"), "cafe-com-leite");
  assert.equal(normalizeSlug("  --Node.js--  "), "node-js");
  assert.equal(normalizeSlug("Ação"), "acao");
  assert.equal(normalizeSlug(""), "");
  assert.equal(normalizeSlug(null), "");
  assert.equal(normalizeSlug(42), "");
});

test("a URL só carrega stack e projeto em formato canônico", async () => {
  const { parseUrlState } = await loadCore();
  assert.deepEqual(parseUrlState({ search: "", hash: "" }), { stack: null, project: null });
  assert.deepEqual(parseUrlState({ search: "?stack=react" }), { stack: "react", project: null });
  assert.deepEqual(parseUrlState({ search: "?stack=React%20Native" }), { stack: "react-native", project: null });
  assert.deepEqual(parseUrlState({ search: "?stack=" }), { stack: null, project: null });
  assert.deepEqual(parseUrlState({ search: "?stack=x&utm=1" }), { stack: "x", project: null });
  assert.deepEqual(parseUrlState({ hash: "#projeto/foo" }), { stack: null, project: "foo" });
  assert.deepEqual(parseUrlState({ hash: "#projetos" }), { stack: null, project: null });
  assert.deepEqual(parseUrlState({ hash: "#projeto/" }), { stack: null, project: null });
  assert.deepEqual(parseUrlState({ hash: "#projeto/Foo" }), { stack: null, project: "foo" });
  assert.deepEqual(
    parseUrlState({ search: "?stack=react", hash: "#projeto/Foo" }),
    { stack: "react", project: "foo" },
  );
});

test("buildUrl devolve URL canônica e sobrevive à ida e volta", async () => {
  const { buildUrl, parseUrlState } = await loadCore();
  assert.equal(buildUrl({ pathname: "/" }), "/");
  assert.equal(buildUrl({ pathname: "/", stack: "react" }), "/?stack=react");
  assert.equal(buildUrl({ pathname: "/", project: "foo" }), "/#projeto/foo");
  assert.equal(buildUrl({ pathname: "/", stack: "React Native", project: "Foo" }), "/?stack=react-native#projeto/foo");
  assert.equal(buildUrl({ pathname: "/", stack: "" }), "/");
  assert.equal(buildUrl({ pathname: "/", stack: null, project: "" }), "/");

  const url = buildUrl({ pathname: "/", stack: "React Native", project: "Foo" });
  assert.equal(url, "/?stack=react-native#projeto/foo");
  const parsed = new URL(`https://example.test${url}`);
  assert.deepEqual(
    parseUrlState({ search: parsed.search, hash: parsed.hash }),
    { stack: "react-native", project: "foo" },
  );
});

test("o mapa legado separa alias válido, projeto obsoleto e slug desconhecido", async () => {
  const { resolveLegacyProject, isObsoleteProject } = await loadCore();

  assert.equal(resolveLegacyProject("projeto-02"), "open-mind", "projeto-02 era Open Mind");
  assert.equal(resolveLegacyProject("Projeto 02"), "open-mind", "o mapa normaliza a entrada");
  assert.equal(isObsoleteProject("projeto-02"), false, "alias válido não é obsoleto");

  for (const slug of ["marcai", "seirei", "open-mind"]) {
    assert.equal(resolveLegacyProject(slug), null, `${slug} já é canônico`);
    assert.equal(isObsoleteProject(slug), false, `${slug} não é legado obsoleto`);
  }

  for (const slug of ["projeto-01", "projeto-03", "PROJETO-01"]) {
    assert.equal(resolveLegacyProject(slug), null, `${slug} não tem sucessor`);
    assert.equal(isObsoleteProject(slug), true, `${slug} é um projeto removido`);
  }

  for (const slug of ["projetos", "projeto-04", "desconhecido", ""]) {
    assert.equal(resolveLegacyProject(slug), null, `${slug} não é alias`);
    assert.equal(isObsoleteProject(slug), false, `${slug} não é projeto obsoleto`);
  }

  for (const value of [null, undefined, 42, {}]) {
    assert.equal(resolveLegacyProject(value), null);
    assert.equal(isObsoleteProject(value), false);
  }
});

test("o mapa legado é determinístico e não confunde os três casos", async () => {
  const { resolveLegacyProject, isObsoleteProject } = await loadCore();

  const cases = ["projeto-01", "projeto-02", "projeto-03", "open-mind", "projetos", null];
  cases.forEach((slug) => {
    const snapshot = JSON.stringify(slug);
    const first = [resolveLegacyProject(slug), isObsoleteProject(slug)];
    const second = [resolveLegacyProject(slug), isObsoleteProject(slug)];
    assert.deepEqual(first, second, `${slug} muda entre chamadas`);
    assert.equal(JSON.stringify(slug), snapshot, `${slug} não pode ser alterado`);
    assert.equal(typeof first[1], "boolean");
  });

  assert.equal(resolveLegacyProject("projeto-02"), "open-mind");
  assert.equal(isObsoleteProject("projeto-01") && resolveLegacyProject("projeto-01") === null, true);
  assert.equal(isObsoleteProject("projetos") || Boolean(resolveLegacyProject("projetos")), false);
});

test("o alias legado preserva o filtro de stack na URL canônica", async () => {
  const { buildUrl, parseUrlState, resolveLegacyProject } = await loadCore();
  const legacy = parseUrlState({ search: "?stack=typescript", hash: "#projeto/projeto-02" });

  assert.deepEqual(legacy, { stack: "typescript", project: "projeto-02" });

  const canonical = buildUrl({
    pathname: "/",
    stack: legacy.stack,
    project: resolveLegacyProject(legacy.project),
  });
  assert.equal(canonical, "/?stack=typescript#projeto/open-mind");
  assert.deepEqual(parseUrlState(new URL(`https://example.test${canonical}`)), {
    stack: "typescript",
    project: "open-mind",
  });

  const obsolete = buildUrl({
    pathname: "/",
    stack: "typescript",
    project: resolveLegacyProject("projeto-01"),
  });
  assert.equal(obsolete, "/?stack=typescript", "projeto obsoleto remove só o hash");
});

test("a navegação sem recarga canonicaliza alias, remove obsoleto e ignora desconhecido", async () => {
  const { resolveProjectLocation } = await loadCore();
  const projectSlugs = ["marcai", "seirei", "open-mind"];
  const stackSlugs = ["next-js", "typescript", "postgresql"];

  const steps = [
    ["#projeto/projeto-02", "/#projeto/open-mind", "open-mind", false, false],
    ["#projeto/projeto-01", "/", null, true, true],
    ["#projeto/projeto-03", "/", null, true, true],
    ["#projeto/desconhecido", "/", null, true, false],
    ["#projeto/marcai", "/#projeto/marcai", "marcai", false, false],
  ];

  for (const [hash, canonical, project, projectRemoved, projectObsolete] of steps) {
    const resolution = resolveProjectLocation({
      pathname: "/",
      hash,
      projectSlugs,
      stackSlugs,
    });

    assert.equal(resolution.canonical, canonical, `${hash} precisa cair na URL canônica`);
    assert.equal(resolution.project, project, `${hash} precisa abrir o projeto certo`);
    assert.equal(resolution.projectRemoved, projectRemoved, `${hash} precisa remover o hash quando não há sucessor`);
    assert.equal(resolution.projectObsolete, projectObsolete, `${hash} só aciona o aviso nos slugs obsoletos`);
  }
});

test("o mesmo documento preserva o filtro e não abre projeto substituto", async () => {
  const { resolveProjectLocation } = await loadCore();
  const projectSlugs = ["marcai", "seirei", "open-mind"];
  const stackSlugs = ["next-js", "typescript"];

  const alias = resolveProjectLocation({
    pathname: "/",
    search: "?stack=typescript",
    hash: "#projeto/projeto-02",
    projectSlugs,
    stackSlugs,
  });
  assert.equal(alias.canonical, "/?stack=typescript#projeto/open-mind");
  assert.equal(alias.project, "open-mind");
  assert.equal(alias.stack, "typescript");

  for (const hash of ["#projeto/projeto-01", "#projeto/projeto-03"]) {
    const obsolete = resolveProjectLocation({
      pathname: "/",
      search: "?stack=typescript",
      hash,
      projectSlugs,
      stackSlugs,
    });
    assert.equal(obsolete.canonical, "/?stack=typescript", "o hash sai e o filtro fica");
    assert.equal(obsolete.project, null, "projeto obsoleto não abre substituto");
    assert.equal(obsolete.projectObsolete, true);
  }

  const unknown = resolveProjectLocation({
    pathname: "/",
    search: "?stack=typescript",
    hash: "#projeto/desconhecido",
    projectSlugs,
    stackSlugs,
  });
  assert.equal(unknown.canonical, "/?stack=typescript");
  assert.equal(unknown.projectObsolete, false, "hash desconhecido permanece silencioso");

  const staleStack = resolveProjectLocation({
    pathname: "/",
    search: "?stack=dotnet",
    hash: "#projeto/projeto-02",
    projectSlugs,
    stackSlugs,
  });
  assert.equal(staleStack.canonical, "/#projeto/open-mind", "stack fora da seleção é descartado");
  assert.equal(staleStack.stack, null, "filtro fora das stacks atuais é descartado");
});

test("o filtro compara stacks normalizadas e não filtra sem slug", async () => {
  const { filterProjects } = await loadCore();
  const items = [
    { slug: "a", stacks: ["React Native", "Node.js"] },
    { slug: "b", stacks: ["CSS"] },
    { slug: "c" },
  ];
  assert.deepEqual(filterProjects(items, null), items);
  assert.deepEqual(filterProjects(items, ""), items);
  assert.deepEqual(filterProjects(items, "react native").map((item) => item.slug), ["a"]);
  assert.deepEqual(filterProjects(items, "css").map((item) => item.slug), ["b"]);
  assert.deepEqual(filterProjects(items, "inexistente"), []);
  assert.deepEqual(filterProjects(null, "react"), []);
});

test("as opções de filtro vêm das stacks da lista sem duplicar slug", async () => {
  const { collectStackOptions } = await loadCore();
  const options = collectStackOptions([
    { stacks: ["React Native", " Node.js "] },
    { stacks: ["react-native"] },
    {},
    { stacks: ["Ação", ""] },
  ]);

  assert.deepEqual(options, [
    { slug: "react-native", label: "React Native" },
    { slug: "node-js", label: "Node.js" },
    { slug: "acao", label: "Ação" },
  ]);
  assert.deepEqual(collectStackOptions(null), []);
  assert.deepEqual(collectStackOptions([{ stacks: "react" }]), []);
});

test("a contagem é sempre explícita, inclusive no zero", async () => {
  const { countLabel } = await loadCore();
  assert.equal(countLabel(0, 3), "0 de 3");
  assert.equal(countLabel(1, 3), "1 de 3");
  assert.equal(countLabel(3, 3), "3 de 3");
});

test("a busca ignora caixa e acento e ordena projeto antes de stack", async () => {
  const { searchItems } = await loadCore();
  const items = [
    { kind: "section", title: "Sobre" },
    { kind: "stack", title: "React" },
    { kind: "project", title: "Painel de reação" },
    { kind: "contact", title: "Contato" },
  ];
  assert.deepEqual(searchItems(items, ""), []);
  assert.deepEqual(searchItems(items, "   "), []);
  assert.deepEqual(searchItems(items, "rea").map((item) => item.kind), ["project", "stack"]);
  assert.deepEqual(searchItems(items, "REAÇÃO").map((item) => item.kind), ["project"]);
  assert.equal(searchItems(items, "sobre")[0].kind, "section");
});

test("o anúncio da busca descreve a quantidade de resultados", async () => {
  const { resultLabel } = await loadCore();
  assert.equal(resultLabel(0), "Nenhum resultado");
  assert.equal(resultLabel(1), "1 resultado");
  assert.equal(resultLabel(4), "4 resultados");
  assert.equal(resultLabel(undefined), "Nenhum resultado");
});

test("o tema salvo vence o sistema e valor inválido é ignorado", async () => {
  const { resolveTheme } = await loadCore();
  assert.equal(resolveTheme({ stored: null, systemDark: false }), "paper");
  assert.equal(resolveTheme({ stored: null, systemDark: true }), "ink");
  assert.equal(resolveTheme({ stored: "invalido", systemDark: true }), "ink");
  assert.equal(resolveTheme({ stored: "paper", systemDark: true }), "paper");
  assert.equal(resolveTheme({ stored: "ink", systemDark: false }), "ink");
});

test("o próximo tema sempre alterna entre papel e tinta", async () => {
  const { nextTheme } = await loadCore();
  assert.equal(nextTheme("paper"), "ink");
  assert.equal(nextTheme("ink"), "paper");
  assert.equal(nextTheme(undefined), "paper");
  assert.equal(nextTheme("invalido"), "paper");
});

test("o botão de tema anuncia a ação do próximo clique, inclusive após alternâncias", async () => {
  const { nextTheme, themeToggleLabel } = await loadCore();
  assert.equal(themeToggleLabel("ink"), "Ativar tema papel");
  assert.equal(themeToggleLabel("paper"), "Ativar tema tinta");
  assert.equal(themeToggleLabel(undefined), "Ativar tema papel");
  assert.equal(themeToggleLabel("invalido"), "Ativar tema papel");

  let current = "ink";
  const seen = [];
  for (let click = 0; click < 4; click += 1) {
    seen.push(themeToggleLabel(current));
    current = nextTheme(current);
  }
  assert.deepEqual(seen, [
    "Ativar tema papel",
    "Ativar tema tinta",
    "Ativar tema papel",
    "Ativar tema tinta",
  ]);
});

test("o tema recuperado do armazenamento define a ação anunciada", async () => {
  const { resolveTheme, themeToggleLabel } = await loadCore();
  assert.equal(themeToggleLabel(resolveTheme({ stored: "paper", systemDark: false })), "Ativar tema tinta");
  assert.equal(themeToggleLabel(resolveTheme({ stored: "ink", systemDark: true })), "Ativar tema papel");
});

test("a preferência inicial do sistema define a ação anunciada", async () => {
  const { resolveTheme, themeToggleLabel } = await loadCore();
  assert.equal(themeToggleLabel(resolveTheme({ stored: null, systemDark: true })), "Ativar tema papel");
  assert.equal(themeToggleLabel(resolveTheme({ stored: null, systemDark: false })), "Ativar tema tinta");
});

test("o foco de retorno depende de a linha ainda estar visível", async () => {
  const { resolveCloseFocus } = await loadCore();
  assert.deepEqual(resolveCloseFocus({ rowVisible: true }), { target: "row" });
  assert.deepEqual(resolveCloseFocus({ rowVisible: false }), { target: "section" });
  assert.deepEqual(resolveCloseFocus(), { target: "section" });
});

test("o foco volta ao controle de origem quando ele continua disponível", async () => {
  const { resolveCloseFocus } = await loadCore();
  assert.deepEqual(resolveCloseFocus({ originAvailable: true, rowVisible: true }), { target: "origin" });
  assert.deepEqual(resolveCloseFocus({ originAvailable: true, rowVisible: false }), { target: "origin" });
  assert.deepEqual(resolveCloseFocus({ originAvailable: false, rowVisible: true }), { target: "row" });
  assert.deepEqual(resolveCloseFocus({ originAvailable: false, rowVisible: false }), { target: "section" });
  assert.deepEqual(resolveCloseFocus(), { target: "section" });
});

test("o fallback só força o fechamento sem popstate depois de 250 ms", async () => {
  const { shouldForceClose } = await loadCore();
  assert.equal(shouldForceClose({ popped: true, elapsedMs: 1000 }), false);
  assert.equal(shouldForceClose({ popped: false, elapsedMs: 249 }), false);
  assert.equal(shouldForceClose({ popped: false, elapsedMs: 250 }), true);
  assert.equal(shouldForceClose({}), false);
});

test("a seleção percorre a lista em círculo e trata lista vazia", async () => {
  const { moveSelection } = await loadCore();
  assert.equal(moveSelection(0, 1, 3), 1);
  assert.equal(moveSelection(2, 1, 3), 0);
  assert.equal(moveSelection(0, -1, 3), 2);
  assert.equal(moveSelection(9, 1, 3), 1);
  assert.equal(moveSelection(-1, 0, 3), 2);
  assert.equal(moveSelection(0, 1, 0), -1);
});

test("o esquema normaliza propósito e capacidades sem inventar conteúdo", async () => {
  const { normalizeSchematic } = await loadCore();
  const schematic = normalizeSchematic({
    label: "  API REST  ",
    note: "Prévia conceitual",
    purpose: "  Centraliza   o cadastro pelo CEP. ",
    items: [
      "  Cadastro de clientes ",
      "   ",
      42,
      "Endereço preenchido a partir do CEP",
    ],
    foot: "conteúdo antigo não é reaproveitado",
  });

  assert.deepEqual(schematic, {
    label: "API REST",
    note: "Prévia conceitual",
    purpose: "Centraliza o cadastro pelo CEP.",
    items: ["Cadastro de clientes", "Endereço preenchido a partir do CEP"],
  });
});

test("esquema sem capacidade válida devolve null e a nota cai no padrão", async () => {
  const { normalizeSchematic } = await loadCore();
  assert.equal(normalizeSchematic(), null);
  assert.equal(normalizeSchematic(null), null);
  assert.equal(normalizeSchematic("panel"), null);
  assert.equal(normalizeSchematic({ label: "API REST", purpose: "Faz algo" }), null);
  assert.equal(normalizeSchematic({ items: [] }), null);
  assert.equal(normalizeSchematic({ items: ["", "   "] }), null);
  assert.equal(normalizeSchematic({ items: [42, null] }), null);

  const withoutNote = normalizeSchematic({ items: ["Consulta de clientes"] });
  assert.equal(withoutNote.note, "Prévia conceitual");
  assert.equal(withoutNote.label, "");
  assert.equal(withoutNote.purpose, "");
});

test("o esquema respeita o limite de quatro capacidades", async () => {
  const { SCHEMATIC_MAX_ITEMS, normalizeSchematic } = await loadCore();
  assert.equal(SCHEMATIC_MAX_ITEMS, 4);

  const items = Array.from({ length: 9 }, (_, index) => `Item ${index}`);
  const schematic = normalizeSchematic({ items });
  assert.equal(schematic.items.length, 4);
  assert.deepEqual(schematic.items, ["Item 0", "Item 1", "Item 2", "Item 3"]);
});

test("normalizar o esquema não altera o dado de entrada", async () => {
  const { normalizeSchematic } = await loadCore();
  const input = {
    label: " API REST ",
    note: "Prévia conceitual",
    purpose: " Centraliza o cadastro. ",
    items: [" Cadastro ", "Consulta"],
  };
  const snapshot = JSON.parse(JSON.stringify(input));

  const schematic = normalizeSchematic(input);

  assert.deepEqual(input, snapshot, "o dado de entrada permanece intacto");
  assert.notEqual(schematic.items, input.items, "a lista normalizada é uma cópia");
  schematic.items.push("Mutação externa");
  assert.equal(input.items.length, 2);
  assert.deepEqual(input, snapshot);
});

test("esquema ausente ou inválido cai no neutro do tipo da prévia", async () => {
  const { getSchematic } = await loadCore();
  const panel = { label: "Painel", note: "Prévia conceitual", purpose: "", items: [] };
  const terminal = { label: "Terminal", note: "Prévia conceitual", purpose: "", items: [] };
  const flow = { label: "Fluxo", note: "Prévia conceitual", purpose: "", items: [] };

  assert.deepEqual(getSchematic({ preview: "panel" }, "panel"), panel);
  assert.deepEqual(getSchematic({}, "terminal"), terminal);
  assert.deepEqual(getSchematic(null, "flow"), flow);
  assert.deepEqual(getSchematic(undefined), panel, "tipo ausente cai em panel");
  assert.deepEqual(getSchematic({}, "3d"), panel, "tipo desconhecido cai em panel");
  assert.deepEqual(getSchematic({ schematic: { items: [] } }, "terminal"), terminal, "esquema sem item cai no neutro");
  assert.deepEqual(
    getSchematic({ schematic: { items: ["   "] } }, "flow"),
    flow,
    "capacidade vazia cai no neutro",
  );
});

test("esquema válido vence o tipo da prévia e só conteúdo é reaproveitado", async () => {
  const { getSchematic } = await loadCore();
  const schematic = {
    label: "Contexto para OpenCode",
    note: "Prévia conceitual",
    purpose: "Leva o contexto do Vault para a sessão.",
    items: ["Busca trechos nas notas do Vault"],
  };

  assert.deepEqual(getSchematic({ schematic, preview: "panel" }, "panel"), schematic);
  assert.deepEqual(getSchematic({ schematic }, "flow"), schematic, "o tipo da prévia não altera o esquema");
});

test("a prévia do palco percorre os projetos em círculo", async () => {
  const { movePreviewIndex } = await loadCore();
  assert.equal(movePreviewIndex(0, 1, 3), 1);
  assert.equal(movePreviewIndex(1, 1, 3), 2);
  assert.equal(movePreviewIndex(2, 1, 3), 0, "próximo no último volta ao primeiro");
  assert.equal(movePreviewIndex(0, -1, 3), 2, "anterior no primeiro vai ao último");
  assert.equal(movePreviewIndex(2, -1, 3), 1);
  assert.equal(movePreviewIndex(1, 0, 3), 1);
  assert.equal(movePreviewIndex(0, 1, 1), 0, "com um projeto o índice fica em zero");
  assert.equal(movePreviewIndex(0, -1, 1), 0);
  assert.equal(movePreviewIndex(0, 1, 0), -1, "sem projeto não existe índice");
  assert.equal(movePreviewIndex(0, 1, undefined), -1);
});

test("o pager só aparece com dois ou mais projetos", async () => {
  const { shouldShowPager } = await loadCore();
  assert.equal(shouldShowPager(0), false);
  assert.equal(shouldShowPager(1), false);
  assert.equal(shouldShowPager(2), true);
  assert.equal(shouldShowPager(3), true);
  assert.equal(shouldShowPager(undefined), false);
  assert.equal(shouldShowPager("3"), false, "contagem precisa ser numérica");
});

test("o contador da prévia usa dois dígitos e espaço ao redor da barra", async () => {
  const { previewCountLabel } = await loadCore();
  assert.equal(previewCountLabel(0, 3), "01 / 03");
  assert.equal(previewCountLabel(1, 3), "02 / 03");
  assert.equal(previewCountLabel(2, 3), "03 / 03");
  assert.equal(previewCountLabel(9, 12), "10 / 12");
  assert.equal(previewCountLabel(0, 1), "01 / 01");
  assert.equal(previewCountLabel(0, 0), "00 / 00");
  assert.equal(previewCountLabel(-1, 3), "03 / 03", "índice fora da faixa é normalizado");
  assert.equal(previewCountLabel(5, 3), "03 / 03");
});


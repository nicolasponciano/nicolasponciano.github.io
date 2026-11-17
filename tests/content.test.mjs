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

async function loadCore() {
  const corePath = fileURLToPath(new URL("../src/core.js", import.meta.url));
  assert.ok(existsSync(corePath), "src/core.js precisa implementar as regras do portfólio");
  return import(`${new URL("../src/core.js", import.meta.url).href}?test=${Date.now()}`);
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

test("todo projeto declara um esquema válido com nota e rodapé", async () => {
  const { projectDetails } = await loadData();
  const slugs = Object.keys(projectDetails);

  slugs.forEach((slug) => {
    const { schematic } = projectDetails[slug];
    assert.ok(schematic, `${slug} precisa de schematic`);
    assert.equal(schematic.note, "Esquemático", `${slug} precisa da nota Esquemático`);
    assert.ok(typeof schematic.label === "string" && schematic.label.trim(), `${slug} precisa de rótulo`);
    assert.ok(typeof schematic.foot === "string" && schematic.foot.trim(), `${slug} precisa de rodapé`);
    assert.ok(Array.isArray(schematic.items), `${slug} precisa de itens`);
    assert.ok(
      schematic.items.length >= 4 && schematic.items.length <= 5,
      `${slug} precisa de 4 a 5 itens, recebeu ${schematic.items.length}`,
    );
    schematic.items.forEach((item) => {
      assert.ok(typeof item.tag === "string" && item.tag.trim(), `${slug} tem item sem tag`);
      assert.ok(typeof item.text === "string" && item.text.trim().length > 2, `${slug} tem item sem texto`);
      assert.doesNotMatch(item.text.trim(), /^(bloco|painel|fluxo)\b/i, `${slug} usa texto genérico como conteúdo`);
    });
  });
});

test("os esquemas usam apenas o conteúdo aprovado", async () => {
  const { projectDetails } = await loadData();
  const first = projectDetails["projeto-01"].schematic;
  const second = projectDetails["projeto-02"].schematic;
  const third = projectDetails["projeto-03"].schematic;

  assert.deepEqual(first, {
    label: "API REST",
    note: "Esquemático",
    items: [
      { tag: "POST", text: "Cadastro de cliente" },
      { tag: "GET", text: "Consulta e pesquisa" },
      { tag: "PUT", text: "Atualização" },
      { tag: "DELETE", text: "Exclusão" },
    ],
    foot: "CEP validado em serviço externo",
  });

  assert.deepEqual(third, {
    label: "Auditoria de skills",
    note: "Esquemático",
    items: [
      { tag: "ok", text: "Atualizado" },
      { tag: "upd", text: "Atualização comprovada" },
      { tag: "local", text: "Ignorada por alteração local" },
      { tag: "gate", text: "Backup e rollback verificados" },
    ],
    foot: "Sem repositório verificável, sem atualização",
  });

  assert.equal(second.label, "Sessão de ferramentas");
  assert.equal(second.items.length, 5);
  assert.deepEqual(
    second.items.map((item) => item.text),
    [
      "open_mind_status",
      "open_mind_search",
      "open_mind_read",
      "open_mind_create",
      "open_mind_update",
    ],
    "cada uma das cinco ferramentas precisa de um item com o nome exato",
  );
  assert.equal(second.foot, "open_mind_project_context por sessão · escrita desabilitada por padrão");
});

test("as seis ferramentas do Open Mind aparecem sem fundir nomes", async () => {
  const { projectDetails } = await loadData();
  const { schematic } = projectDetails["projeto-02"];
  const texts = schematic.items.map((item) => item.text);
  const tools = [
    "open_mind_status",
    "open_mind_search",
    "open_mind_read",
    "open_mind_create",
    "open_mind_update",
    "open_mind_project_context",
  ];

  tools.forEach((tool) => {
    const inItems = texts.includes(tool);
    const inFoot = schematic.foot.split("·").some((part) => part.trim().startsWith(tool));
    assert.ok(inItems || inFoot, `${tool} precisa aparecer com o nome exato`);
    if (tool === "open_mind_project_context") {
      assert.equal(inItems, false, "o contexto de projeto fica no rodapé, não entre os itens");
      assert.ok(inFoot, "open_mind_project_context precisa estar no rodapé");
    }
  });

  const joined = [...texts, schematic.foot].join(" ");
  assert.match(joined, /escrita desabilitada por padrão/);
});

test("o esquema não repete o conteúdo da linha do índice e o preview segue no enum", async () => {
  const { projectDetails } = await loadData();
  Object.entries(projectDetails).forEach(([slug, entry]) => {
    assert.ok(["panel", "terminal", "flow"].includes(entry.preview), `${slug} precisa manter o preview no enum`);
    const forbidden = ["title", "summary", "stack", "stacks", "year", "links", "role", "challenge", "solution"];
    Object.keys(entry.schematic).forEach((key) => {
      assert.equal(forbidden.includes(key), false, `${slug} não pode duplicar ${key} no esquema`);
    });
  });
});

test("esquema inválido no dado cai no neutro do tipo sem quebrar", async () => {
  const { getSchematic } = await loadCore();
  const { projectDetails } = await loadData();
  const broken = { ...projectDetails["projeto-02"], schematic: { label: "", items: [{ tag: "x", text: "" }] } };

  assert.deepEqual(getSchematic(broken, projectDetails["projeto-02"].preview), {
    label: "Terminal",
    note: "Esquemático",
    items: [],
    foot: "",
  });
});

test("o detalhe do projeto entrega o esquema para o renderizador", async () => {
  const { getProjectDetails } = await loadContent();
  const { projectDetails } = await loadData();

  Object.entries(projectDetails).forEach(([slug, entry]) => {
    const details = getProjectDetails(projectDetails, slug);
    assert.deepEqual(details.schematic, entry.schematic, `${slug} precisa levar o esquema adiante`);
    assert.equal(details.preview, entry.preview);
  });

  assert.equal(getProjectDetails(projectDetails, "nao-existe").schematic, null);
  assert.equal(getProjectDetails({ x: { preview: "3d" } }, "x").schematic, null);
});

test("cada projeto rende um esquema pronto para a lista, com nota e rodapé", async () => {
  const { getProjectDetails } = await loadContent();
  const { projectDetails } = await loadData();
  const { getSchematic } = await loadCore();

  Object.entries(projectDetails).forEach(([slug, entry]) => {
    const details = getProjectDetails(projectDetails, slug);
    const schematic = getSchematic(details, entry.preview);

    assert.equal(schematic.note, "Esquemático");
    assert.ok(schematic.label.length > 3, `${slug} precisa do tipo descritivo no palco`);
    assert.ok(schematic.items.length >= 4, `${slug} precisa de pelo menos quatro elementos nomeados`);
    assert.ok(schematic.foot.length > 5, `${slug} precisa de rodapé de contexto`);
    schematic.items.forEach((item) => {
      assert.ok(item.tag.length > 0);
      assert.ok(item.text.length > 2);
    });
    assert.equal(schematic.label, entry.schematic.label);
  });
});

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

test("todo projeto declara uma prévia conceitual com propósito e quatro capacidades", async () => {
  const { projectDetails } = await loadData();
  const slugs = Object.keys(projectDetails);

  slugs.forEach((slug) => {
    const { schematic } = projectDetails[slug];
    assert.ok(schematic, `${slug} precisa de schematic`);
    assert.equal(schematic.note, "Prévia conceitual", `${slug} precisa da nota Prévia conceitual`);
    assert.ok(typeof schematic.label === "string" && schematic.label.trim(), `${slug} precisa de categoria`);
    assert.ok(typeof schematic.purpose === "string" && schematic.purpose.trim().length > 10, `${slug} precisa de propósito`);
    assert.ok(Array.isArray(schematic.items), `${slug} precisa de capacidades`);
    assert.equal(schematic.items.length, 4, `${slug} precisa de quatro capacidades`);
    assert.deepEqual(
      Object.keys(schematic).sort(),
      ["items", "label", "note", "purpose"],
      `${slug} só pode declarar categoria, nota, propósito e capacidades`,
    );
    schematic.items.forEach((item) => {
      assert.equal(typeof item, "string", `${slug} tem capacidade que não é texto`);
      assert.ok(item.trim().length > 2, `${slug} tem capacidade vazia`);
      assert.doesNotMatch(item.trim(), /^(bloco|painel|fluxo)\b/i, `${slug} usa texto genérico como conteúdo`);
    });
  });
});

test("as prévias usam apenas o conteúdo aprovado", async () => {
  const { projectDetails } = await loadData();

  assert.deepEqual(projectDetails.marcai.schematic, {
    label: "SaaS de agendamentos",
    note: "Prévia conceitual",
    purpose: "Plataforma de agendamentos para salões, clínicas e estúdios, com cada estabelecimento isolado no seu próprio espaço e horários calculados a partir da agenda real.",
    items: [
      "Agenda com horários disponíveis calculados por profissional, serviço e duração",
      "Cada estabelecimento isolado, com papéis de dono e equipe aplicados no servidor",
      "Criação de agendamento idempotente, com verificação de conflito e registro de auditoria",
      "Página pública de agendamento por estabelecimento, do serviço à confirmação",
    ],
  });

  assert.deepEqual(projectDetails.seirei.schematic, {
    label: "Produto web de produtividade",
    note: "Prévia conceitual",
    purpose: "Aplicativo que mostra uma tarefa por vez para ajudar a terminar o que se começa, no computador e no celular.",
    items: [
      "Uma tarefa por vez no modo foco, com concluir, pular e nova rodada",
      "Entrada por texto ou voz, com várias tarefas separadas automaticamente",
      "Ordenação e duração estimadas por IA, validadas contra as tarefas do dia e com retorno à ordem de inserção quando a chamada falha",
      "Sincronização entre computador e celular, com RLS por usuário e última gravação prevalecendo",
    ],
  });

  assert.deepEqual(projectDetails["open-mind"].schematic, {
    label: "Ferramenta de desenvolvimento",
    note: "Prévia conceitual",
    purpose: "Plugin que leva o contexto de um Vault do Obsidian para dentro do OpenCode.",
    items: [
      "Contexto do Vault associado ao projeto da sessão pelo caminho",
      "Busca e leitura confinadas à raiz do Vault, com caminho relativo e limites explícitos",
      "Escrita desabilitada por padrão, liberada por operação e condicionada ao hash da versão lida",
      "Seis ferramentas disponíveis ao OpenCode, de status e busca até criação e atualização de notas",
    ],
  });
});

test("a seleção aprovada declara a visibilidade do código por projeto", async () => {
  const { projectDetails } = await loadData();
  const { getProjectDetails, getDialogLinkState } = await loadContent();

  assert.deepEqual(Object.keys(projectDetails), ["marcai", "seirei", "open-mind"]);
  assert.equal(projectDetails.marcai.codeVisibility, "private");
  assert.equal(projectDetails.seirei.codeVisibility, "private");
  assert.equal(projectDetails["open-mind"].codeVisibility, "public");

  assert.equal(getProjectDetails(projectDetails, "marcai").codeVisibility, "private");
  assert.equal(getProjectDetails(projectDetails, "open-mind").codeVisibility, "public");
  assert.equal(getProjectDetails(projectDetails, "nao-existe").codeVisibility, "public");

  assert.equal(getDialogLinkState({ links: [], codeVisibility: "private" }), "private");
  assert.equal(getDialogLinkState({ links: [], codeVisibility: "public" }), "unavailable");
  assert.equal(
    getDialogLinkState({ links: [{ label: "GitHub", url: "https://github.com/example" }], codeVisibility: "public" }),
    "links",
  );
});

test("as prévias não expõem identificadores internos nem verbos HTTP", async () => {
  const { projectDetails } = await loadData();

  Object.entries(projectDetails).forEach(([slug, entry]) => {
    const joined = [entry.schematic.label, entry.schematic.purpose, ...entry.schematic.items].join(" ");
    assert.doesNotMatch(joined, /open_mind_|project_context/, `${slug} não pode exibir identificador interno`);
    assert.doesNotMatch(joined, /\b(POST|GET|PUT|DELETE)\b/, `${slug} não pode liderar com verbo HTTP`);
  });
});

test("o esquema não repete o conteúdo da linha do índice e o preview segue no enum", async () => {
  const { projectDetails } = await loadData();
  Object.entries(projectDetails).forEach(([slug, entry]) => {
    assert.ok(["panel", "terminal", "flow"].includes(entry.preview), `${slug} precisa manter o preview no enum`);
    const forbidden = ["title", "summary", "stack", "stacks", "year", "links", "role", "challenge", "solution", "foot", "tag"];
    Object.keys(entry.schematic).forEach((key) => {
      assert.equal(forbidden.includes(key), false, `${slug} não pode duplicar ${key} no esquema`);
    });
  });
});

test("esquema inválido no dado cai no neutro do tipo sem quebrar", async () => {
  const { getSchematic } = await loadCore();
  const { projectDetails } = await loadData();
  const broken = { ...projectDetails.seirei, schematic: { label: "", items: ["   "] } };

  assert.deepEqual(getSchematic(broken, projectDetails.seirei.preview), {
    label: "Fluxo",
    note: "Prévia conceitual",
    purpose: "",
    items: [],
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

test("cada projeto rende uma prévia pronta para o palco e para a linha", async () => {
  const { getProjectDetails } = await loadContent();
  const { projectDetails } = await loadData();
  const { getSchematic } = await loadCore();

  Object.entries(projectDetails).forEach(([slug, entry]) => {
    const details = getProjectDetails(projectDetails, slug);
    const schematic = getSchematic(details, entry.preview);

    assert.equal(schematic.note, "Prévia conceitual");
    assert.ok(schematic.label.length > 3, `${slug} precisa do tipo descritivo no palco`);
    assert.ok(schematic.purpose.length > 10, `${slug} precisa de propósito`);
    assert.equal(schematic.items.length, 4, `${slug} precisa de quatro capacidades`);
    schematic.items.forEach((item) => {
      assert.equal(typeof item, "string");
      assert.ok(item.length > 2);
    });
    assert.equal(schematic.label, entry.schematic.label);
  });
});

test("o aviso de projeto removido usa o texto aprovado", async () => {
  const { OBSOLETE_PROJECT_NOTICE } = await loadContent();

  assert.equal(OBSOLETE_PROJECT_NOTICE, "A ficha deste projeto não está mais disponível no portfólio.");
});

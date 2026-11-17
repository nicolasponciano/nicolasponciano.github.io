import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const corePath = fileURLToPath(new URL("../src/core.js", import.meta.url));

async function loadCore() {
  assert.ok(existsSync(corePath), "src/core.js precisa implementar as regras do portfólio");
  return import(`${new URL("../src/core.js", import.meta.url).href}?test=${Date.now()}`);
}

test("a cena usa 6 cursores no desktop e 4 em tela compacta", async () => {
  const { getInitialAgentCount } = await loadCore();
  assert.equal(getInitialAgentCount({ width: 1440, height: 900 }), 6);
  assert.equal(getInitialAgentCount({ width: 1024, height: 768 }), 6);
  assert.equal(getInitialAgentCount({ width: 390, height: 844 }), 4);
  assert.equal(getInitialAgentCount({ width: 900, height: 1200 }), 4);
});

test("a cena dura entre 6 e 8 segundos e a linha do tempo não volta", async () => {
  const { SCENE_DURATION_MS, getSceneLeg } = await loadCore();
  assert.ok(SCENE_DURATION_MS >= 6000 && SCENE_DURATION_MS <= 8000, `duração fora da faixa: ${SCENE_DURATION_MS}`);

  const start = getSceneLeg(0, SCENE_DURATION_MS, 7);
  assert.deepEqual(start, { index: 0, progress: 0, done: false });
  assert.deepEqual(getSceneLeg(SCENE_DURATION_MS, SCENE_DURATION_MS, 7), { index: 6, progress: 1, done: true });
  assert.equal(getSceneLeg(SCENE_DURATION_MS + 5000, SCENE_DURATION_MS, 7).done, true);
  assert.deepEqual(getSceneLeg(-200, SCENE_DURATION_MS, 7), { index: 0, progress: 0, done: false });

  let previous = -1;
  for (let step = 0; step <= 20; step += 1) {
    const leg = getSceneLeg((SCENE_DURATION_MS / 20) * step, SCENE_DURATION_MS, 7);
    assert.ok(leg.index >= previous, "a linha do tempo não pode retroceder");
    previous = leg.index;
  }
  assert.deepEqual(getSceneLeg(1000, SCENE_DURATION_MS, 0), { index: 0, progress: 1000 / SCENE_DURATION_MS, done: false });
});

test("os cursores da cena ficam dentro do bloco selecionado", async () => {
  const { getSceneCursorPoint } = await loadCore();
  const rect = { x: 100, y: 200, width: 400, height: 160 };
  for (let index = 0; index < 6; index += 1) {
    const point = getSceneCursorPoint(rect, index, 6);
    assert.ok(point.x >= rect.x && point.x <= rect.x + rect.width, `x fora do bloco: ${point.x}`);
    assert.ok(point.y >= rect.y && point.y <= rect.y + rect.height, `y fora do bloco: ${point.y}`);
  }

  const tiny = getSceneCursorPoint({ x: 10, y: 10, width: 4, height: 2 }, 3, 4);
  assert.ok(tiny.x >= 10 && tiny.x <= 14 && tiny.y >= 10 && tiny.y <= 12, "retângulo pequeno não estoura");
  assert.deepEqual(getSceneCursorPoint(null, 0, 0), { x: 0, y: 0 });
});

test("o progresso é limitado ao intervalo válido e trata total zero", async () => {
  const { getProgress } = await loadCore();
  assert.deepEqual(getProgress(120, 100), { completed: 100, total: 100, percent: 100 });
  assert.deepEqual(getProgress(-2, 100), { completed: 0, total: 100, percent: 0 });
  assert.deepEqual(getProgress(0, 0), { completed: 0, total: 0, percent: 0 });
});

test("movimento reduzido inicia com conteúdo pronto", async () => {
  const { shouldAnimate } = await loadCore();
  assert.equal(shouldAnimate(false), true);
  assert.equal(shouldAnimate(true), false);
});

test("blocos são distribuídos uma vez entre agentes e o caso vazio é seguro", async () => {
  const { assignBlocksToAgents } = await loadCore();
  assert.equal(typeof assignBlocksToAgents, "function");
  assert.deepEqual(assignBlocksToAgents(5, 2), [[0, 2, 4], [1, 3]]);
  assert.deepEqual(assignBlocksToAgents(0, 3), [[], [], []]);
  assert.deepEqual(assignBlocksToAgents(4, 0), []);
});

test("pontos dos cursores são limitados ao retângulo do bloco", async () => {
  const { getElementTarget } = await loadCore();
  assert.equal(typeof getElementTarget, "function");
  assert.deepEqual(
    getElementTarget({ x: 100, y: 200, width: 80, height: 40 }, 34, 28),
    { x: 134, y: 220 },
  );
  assert.deepEqual(
    getElementTarget({ x: 10, y: 20, width: 20, height: 6 }, 34, 28),
    { x: 20, y: 23 },
  );
});

test("digitação não remove a estrutura interna de um bloco", async () => {
  const { resolveRevealMode } = await loadCore();
  assert.equal(typeof resolveRevealMode, "function");
  assert.equal(resolveRevealMode("type", false), "type");
  assert.equal(resolveRevealMode("type", true), "fade");
  assert.equal(resolveRevealMode("wipe", true), "wipe");
});

test("aborte de seção não invalida a conclusão do boot", async () => {
  const { canCompleteBoot } = await loadCore();
  assert.equal(canCompleteBoot({ token: 5, bootToken: 5, booted: false }), true);
  assert.equal(
    canCompleteBoot({ token: 5, bootToken: 5, booted: false, runId: 99 }),
    true,
    "runId bumpado por finalizeSection não pode abortar o boot",
  );
  assert.equal(canCompleteBoot({ token: 5, bootToken: 4, booted: false }), false, "restart reinicia o token do boot");
  assert.equal(canCompleteBoot({ token: 5, bootToken: 5, booted: true }), false, "boot já concluído não repete");
  assert.equal(canCompleteBoot({ token: 5, bootToken: 4, booted: true }), false);
});

test("seção que já passou da tela é revelada e a visível entra na fila", async () => {
  const { getSectionAction } = await loadCore();
  assert.equal(getSectionAction({ top: -900, bottom: -400 }, 900), "reveal");
  assert.equal(getSectionAction({ top: 100, bottom: 500 }, 900), "queue");
  assert.equal(getSectionAction({ top: -300, bottom: 100 }, 900), "queue");
  assert.equal(getSectionAction({ top: 1000, bottom: 1400 }, 900), "wait");
  assert.equal(getSectionAction(null, 900), "wait");
});

test("conga calcula trajetória contínua e limitada para cada cursor", async () => {
  const { getCongaPoint } = await loadCore();
  const point = getCongaPoint(0.5, 3, 18, 1365, 900);
  assert.ok(point.x >= 0 && point.x <= 1365, `x fora da tela: ${point.x}`);
  assert.ok(point.y >= 0 && point.y <= 900, `y fora da tela: ${point.y}`);
  const a = getCongaPoint(1, 0, 18, 1365, 900);
  const b = getCongaPoint(2, 0, 18, 1365, 900);
  assert.notDeepEqual(a, b, "a trajetória deve avançar com o tempo");
  const same = getCongaPoint(1, 1, 18, 1365, 900);
  assert.notDeepEqual(a, same, "cursores diferentes seguem fases diferentes");
  assert.deepEqual(getCongaPoint(1, 0, 0, 0, 0), { x: 0, y: 0 });
});

test("aceleração do hero só entra com deslocamento real de rolagem", async () => {
  const { getHeroBoost } = await loadCore();
  assert.equal(getHeroBoost(0), 1);
  assert.equal(getHeroBoost(4), 1);
  assert.equal(getHeroBoost(-9), 4);
  assert.equal(getHeroBoost(12), 4);
});

test("medida do bloco é exibida como largura por altura em pixels", async () => {
  const { getBlockSizeLabel } = await loadCore();
  assert.equal(getBlockSizeLabel({ width: 320.4, height: 118.6 }), "320×119");
  assert.equal(getBlockSizeLabel({ width: 0, height: -5 }), "0×0");
  assert.equal(getBlockSizeLabel(null), "0×0");
});

test("barra mostra no máximo 5 avatares com inicial e o excedente como +N", async () => {
  const { getAgentAvatars } = await loadCore();
  const names = ["MALHA", "LEITURA", "INTERFACE", "SERVIÇO", "DADOS", "CONTRASTE", "ACESSO"];
  assert.deepEqual(getAgentAvatars(names), {
    initials: ["M", "L", "I", "S", "D"],
    extra: "+2",
  });
  assert.deepEqual(getAgentAvatars(["MALHA"]), { initials: ["M"], extra: null });
  assert.deepEqual(getAgentAvatars([]), { initials: [], extra: null });
});

test("mensagem final informa agentes e duração em segundos", async () => {
  const { getCompletionMessage } = await loadCore();
  assert.equal(getCompletionMessage(18, 24.6), "Montada por 18 agentes em 24,6 s");
  assert.equal(getCompletionMessage(8, 3), "Montada por 8 agentes em 3 s");
  assert.equal(getCompletionMessage(0, 0), "Montagem concluída");
});

test("títulos podem usar o modo neon e caem em fade quando têm filhos", async () => {
  const { resolveRevealMode } = await loadCore();
  assert.equal(resolveRevealMode("neon", false), "neon");
  assert.equal(resolveRevealMode("neon", true), "fade");
});

test("cursores sem tarefa aguardam no perímetro, fora do foco do conteúdo", async () => {
  const { getAgentIdlePosition } = await loadCore();
  assert.equal(typeof getAgentIdlePosition, "function");
  assert.deepEqual(getAgentIdlePosition(0, 18, 1365, 900), { x: 228, y: 94 });
  assert.deepEqual(getAgentIdlePosition(1, 18, 1365, 900), { x: 1345, y: 150 });
  assert.deepEqual(getAgentIdlePosition(2, 18, 1365, 900), { x: 1138, y: 814 });
  assert.deepEqual(getAgentIdlePosition(3, 18, 1365, 900), { x: 16, y: 750 });
});

test("velocidade só aceita os passos visíveis e pausa tem rótulo coerente", async () => {
  const { normalizeSpeed, getPauseLabel } = await loadCore();
  assert.equal(typeof normalizeSpeed, "function");
  assert.equal(typeof getPauseLabel, "function");
  assert.equal(normalizeSpeed(2), 2);
  assert.equal(normalizeSpeed(4), 4);
  assert.equal(normalizeSpeed(3), 1);
  assert.equal(getPauseLabel(false), "Pausar montagem");
  assert.equal(getPauseLabel(true), "Retomar montagem");
});

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

test("o foco de retorno depende de a linha ainda estar visível", async () => {
  const { resolveCloseFocus } = await loadCore();
  assert.deepEqual(resolveCloseFocus({ rowVisible: true }), { target: "row" });
  assert.deepEqual(resolveCloseFocus({ rowVisible: false }), { target: "section" });
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

test("o esquema normaliza rótulo, nota, itens e rodapé sem inventar conteúdo", async () => {
  const { normalizeSchematic } = await loadCore();
  const schematic = normalizeSchematic({
    label: "  API REST  ",
    note: "Esquemático",
    items: [
      { tag: " POST ", text: "  Cadastro   de cliente " },
      { tag: "GET", text: "   " },
      { tag: "PUT", text: 42 },
      { tag: "DELETE", text: "Exclusão" },
    ],
    foot: " CEP validado em serviço externo ",
  });

  assert.deepEqual(schematic, {
    label: "API REST",
    note: "Esquemático",
    items: [
      { tag: "POST", text: "Cadastro de cliente" },
      { tag: "DELETE", text: "Exclusão" },
    ],
    foot: "CEP validado em serviço externo",
  });
});

test("esquema sem item válido devolve null e a nota cai no padrão", async () => {
  const { normalizeSchematic } = await loadCore();
  assert.equal(normalizeSchematic(), null);
  assert.equal(normalizeSchematic(null), null);
  assert.equal(normalizeSchematic("panel"), null);
  assert.equal(normalizeSchematic({ label: "API REST" }), null);
  assert.equal(normalizeSchematic({ items: [] }), null);
  assert.equal(normalizeSchematic({ items: [{ tag: "GET", text: "" }] }), null);
  assert.equal(normalizeSchematic({ items: [{ tag: "GET" }] }), null);

  const withoutNote = normalizeSchematic({ items: [{ tag: "GET", text: "Consulta" }] });
  assert.equal(withoutNote.note, "Esquemático");
  assert.equal(withoutNote.label, "");
  assert.equal(withoutNote.foot, "");
});

test("o esquema respeita o limite de cinco itens", async () => {
  const { SCHEMATIC_MAX_ITEMS, normalizeSchematic } = await loadCore();
  assert.equal(SCHEMATIC_MAX_ITEMS, 5);

  const items = Array.from({ length: 9 }, (_, index) => ({ tag: `t${index}`, text: `Item ${index}` }));
  const schematic = normalizeSchematic({ items });
  assert.equal(schematic.items.length, 5);
  assert.deepEqual(schematic.items.map((item) => item.text), [
    "Item 0",
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
  ]);
});

test("esquema ausente ou inválido cai no neutro do tipo da prévia", async () => {
  const { getSchematic } = await loadCore();
  const panel = { label: "Painel", note: "Esquemático", items: [], foot: "" };
  const terminal = { label: "Terminal", note: "Esquemático", items: [], foot: "" };
  const flow = { label: "Fluxo", note: "Esquemático", items: [], foot: "" };

  assert.deepEqual(getSchematic({ preview: "panel" }, "panel"), panel);
  assert.deepEqual(getSchematic({}, "terminal"), terminal);
  assert.deepEqual(getSchematic(null, "flow"), flow);
  assert.deepEqual(getSchematic(undefined), panel, "tipo ausente cai em panel");
  assert.deepEqual(getSchematic({}, "3d"), panel, "tipo desconhecido cai em panel");
  assert.deepEqual(getSchematic({ schematic: { items: [] } }, "terminal"), terminal, "esquema sem item cai no neutro");
  assert.deepEqual(
    getSchematic({ schematic: { items: [{ tag: "GET", text: " " }] } }, "flow"),
    flow,
    "item sem texto cai no neutro",
  );
});

test("esquema válido vence o tipo da prévia e só conteúdo é reaproveitado", async () => {
  const { getSchematic } = await loadCore();
  const schematic = {
    label: "Sessão de ferramentas",
    note: "Esquemático",
    items: [{ tag: "status", text: "open_mind_status" }],
    foot: "open_mind_project_context por sessão",
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


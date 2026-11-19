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
  assert.match(html, /<h1\b[^>]*>[\s\S]*?Nicolas Ponciano/i);
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
  assert.match(hero, /data-preview-stage[^>]*role="group"[^>]*aria-label="Prévia de projetos"/);
  assert.doesNotMatch(hero, /data-preview-stage[^>]*aria-hidden/);
  assert.match(hero, /class="stage-chrome"[^>]*aria-hidden="true"/);
  assert.match(hero, /data-preview-canvas[^>]*aria-hidden="true"/);
  assert.match(hero, /data-preview-stage/);
  assert.match(hero, /data-stage-prev[^>]*aria-label="Prévia anterior"/);
  assert.match(hero, /data-stage-next[^>]*aria-label="Próxima prévia"/);
  assert.match(hero, /data-stage-count[^>]*aria-hidden="true"[^>]*>01 \/ 03</);
  assert.match(hero, /data-stage-live[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.doesNotMatch(hero, /hero-diagram/);
  assert.doesNotMatch(hero, /class="hero-highlights"/);
});

test("o hero identifica a pessoa primeiro e mantém papel, resumo, fatos e ações", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('<section class="hero');
  const end = html.indexOf("</section>", start);
  const hero = html.slice(start, end);

  assert.match(hero, /<h1[^>]*>\s*Nicolas Ponciano\s*<\/h1>/i, "o h1 contém apenas o nome");
  const kickerAt = hero.indexOf('class="hero-kicker"');
  const h1At = hero.indexOf("<h1");
  assert.ok(kickerAt !== -1, "o papel precisa ser um kicker");
  assert.ok(kickerAt < h1At, "o kicker fica acima do nome");
  assert.match(hero, /<p class="hero-kicker">\s*Desenvolvedor de Software Full Stack\s*<\/p>/i);
  assert.doesNotMatch(hero, /hero-name/);

  const summaryAt = hero.indexOf('class="hero-summary"');
  assert.ok(summaryAt > h1At, "o resumo aprovado continua abaixo do nome");
  assert.match(hero, /<p class="hero-summary">Desenvolvedor de Software com experiência em \.NET/);

  const factsBlock = hero.match(/<ul class="hero-facts">[\s\S]*?<\/ul>/);
  assert.ok(factsBlock, "a linha de fatos precisa existir");
  const facts = [...factsBlock[0].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => match[1].replace(/\s+/g, " ").trim());
  assert.deepEqual(facts, [
    "Backend .NET e SQL Server",
    "Sistemas web corporativos",
    "Pós-graduação em IA em andamento",
  ], "os três fatos aprovados aparecem, sem número ou métrica");

  const factsAt = hero.indexOf('class="hero-facts"');
  const actionsAt = hero.indexOf('class="hero-actions"');
  const searchAt = hero.indexOf('class="hero-search"');
  assert.ok(actionsAt > factsAt, "as ações vêm depois dos fatos");
  assert.ok(searchAt > actionsAt, "a busca continua depois das ações");
  assert.doesNotMatch(hero, /<title>|meta name="description"/);
});

test("o índice estrutura linhas com título, ano, stack, abrir e palco", () => {
  const html = readFileSync(pagePath, "utf8");
  const rows = [...html.matchAll(/<article class="project-entry"[\s\S]*?<\/article>/g)].map((match) => match[0]);

  assert.equal(rows.length, 3, "o índice precisa manter as três linhas");
  rows.forEach((row) => {
    assert.match(row, /<h3 id="[a-z0-9-]+-title"/);
    assert.match(row, /data-project-year/);
    assert.match(row, /class="stack-tag"/);
    assert.match(row, /class="project-open"[^>]*hidden/, "abrir ficha só aparece quando a ficha existir");
    assert.match(row, /tabindex="0"/);
    assert.match(row, /aria-labelledby="[^"]+"/);
  });

  assert.match(html, /data-index-stage[^>]*aria-hidden="true"/);
  assert.match(html, /class="hero-search" role="search"[^>]*aria-label="Busca do portfólio"/, "a busca do hero fica ativa com a palette");
  assert.doesNotMatch(html, /class="hero-search"[^>]*\shidden\b/, "a busca não pode continuar oculta");
  assert.doesNotMatch(html, /data-build|data-reveal/, "não restam ganchos de revelação antigos");
});

test("o selo das prévias vem do contrato de dados, não de um texto fixo no HTML", () => {
  const html = readFileSync(pagePath, "utf8");
  const app = readFileSync(fileURLToPath(new URL("../src/app.js", import.meta.url)), "utf8");
  const data = readFileSync(dataPath, "utf8");

  assert.doesNotMatch(html, /Esquemático/, "o HTML não pode manter o rótulo antigo");
  assert.match(html, /<span class="stage-note"><\/span>/, "o chrome nasce vazio e recebe o selo do dado");
  assert.equal(
    (data.match(/note: "Prévia conceitual"/g) ?? []).length,
    3,
    "cada projeto declara o mesmo selo no contrato",
  );
  assert.match(app, /note\.textContent = schematic\.note/, "o palco usa o selo normalizado");
  assert.match(app, /\[data-preview-note\]/, "a prévia compacta usa o mesmo selo");
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

test("a Trajetória fica entre Projetos e Sobre com as seis entradas do currículo", () => {
  const html = readFileSync(pagePath, "utf8");

  const projectsAt = html.indexOf('id="projetos"');
  const pathAt = html.indexOf('id="trajetoria"');
  const aboutAt = html.indexOf('id="sobre"');
  assert.ok(projectsAt !== -1 && pathAt > projectsAt && aboutAt > pathAt, "a Trajetória entra entre Projetos e Sobre");

  const sectionStart = html.indexOf('<section class="path-section');
  const sectionEnd = html.indexOf("</section>", pathAt);
  assert.ok(sectionStart !== -1 && sectionEnd !== -1, "a seção da Trajetória precisa existir");
  const section = html.slice(sectionStart, sectionEnd);

  assert.match(section, /id="trajetoria"/);
  assert.match(section, /data-section="path"/);
  assert.match(section, /data-section-label="Trajetória"/);
  assert.match(section, /<h2>Trajetória<\/h2>/);
  assert.match(section, /<p>Experiência em desenvolvimento de software e formação\.<\/p>/);
  assert.equal((section.match(/<ol class="path-list">/g) ?? []).length, 2, "Experiência e Formação usam listas ordenadas");
  assert.match(section, /<h3>Experiência<\/h3>[\s\S]*<ol class="path-list">/);
  assert.match(section, /<h3>Formação<\/h3>[\s\S]*<ol class="path-list">/);
  assert.doesNotMatch(section, /\btabindex=|\brole=/, "a lista não precisa de role artificial nem de tabindex");

  const header = html.slice(0, html.indexOf("</header>"));
  assert.doesNotMatch(header, /trajetoria|Trajetória/, "a Trajetória não entra na navegação do cabeçalho");

  const items = [...section.matchAll(/<li class="path-item">[\s\S]*?<\/li>/g)].map((match) => match[0]);
  assert.equal(items.length, 6, "três experiências e três formações");

  const expected = [
    { period: "fev. 2026 a atual", role: "Desenvolvedor de Software Júnior", org: "Empresa do setor de tecnologia", place: "Rio de Janeiro" },
    { period: "jul. 2025 a fev. 2026", role: "Desenvolvedor de Software Júnior", org: "SOFTCASE Soluções Tecnológicas", place: "Santos" },
    { period: "jul. 2024 a jul. 2025", role: "Estágio em Desenvolvimento de Software", org: "SOFTCASE Soluções Tecnológicas", place: "São Vicente" },
    { period: "fev. 2026 a fev. 2027", role: "Pós-Graduação em Inteligência Artificial", org: "Universidade Santa Cecília" },
    { period: "fev. 2023 a jun. 2025", role: "Tecnólogo em Análise e Desenvolvimento de Sistemas", org: "Universidade Santa Cecília" },
    { period: "fev. 2022 a jul. 2023", role: "Ensino Técnico em Tecnologia da Informação", org: "ETEC Praia Grande" },
  ];

  items.forEach((item, index) => {
    const entry = expected[index];
    assert.match(item, new RegExp(`<p class="path-period">${entry.period}`), `período ${index + 1}`);
    assert.match(item, new RegExp(`<p class="path-role">${entry.role}</p>`), `cargo ou curso ${index + 1}`);
    assert.match(item, new RegExp(entry.org.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `organização ${index + 1}`);
    if (entry.place) {
      assert.match(item, new RegExp(`<span class="path-place">${entry.place}</span>`), `local ${index + 1}`);
    }

    const periodAt = item.indexOf('class="path-period"');
    const roleAt = item.indexOf('class="path-role"');
    const orgAt = item.indexOf('class="path-org"');
    assert.ok(periodAt < roleAt && roleAt < orgAt, "a ordem de leitura é período, cargo, organização");
  });

  assert.match(items[3], /<span class="path-note">em andamento<\/span>/, "a pós-graduação está em andamento");
  assert.equal((section.match(/class="path-note"/g) ?? []).length, 1, "só a pós-graduação tem nota de status");
  assert.doesNotMatch(section, /Plano Santa Casa|2021|Sup(orte|port)|anos de experiência|concluíd[ao]/i, "fora do recorte editorial aprovado");
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

test("o botão de tema anuncia a próxima ação e não usa estado de toggle", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('id="theme-toggle"');
  assert.ok(start !== -1, "o botão de tema precisa existir");
  const open = html.lastIndexOf("<button", start);
  const close = html.indexOf("</button>", start) + "</button>".length;
  const button = html.slice(open, close);

  assert.match(button, /<button[^>]*type="button"/, "o botão precisa ser nativo para funcionar por teclado");
  assert.match(button, /data-theme-label[^>]*>Ativar tema papel</, "o rótulo inicial descreve a ação no tema tinta");
  assert.doesNotMatch(button, /aria-pressed/, "um botão de ação não combina rótulo variável com estado de toggle");
  assert.doesNotMatch(button, /aria-label/, "o nome acessível vem do texto visível, sem rótulo paralelo");
  assert.doesNotMatch(button, /role=/, "o botão nativo não precisa de role artificial");

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

test("o aviso de projeto removido nasce oculto, vazio e fora da ordem de foco", () => {
  const html = readFileSync(pagePath, "utf8");
  const start = html.indexOf('id="project-notice"');
  assert.ok(start !== -1, "a seção Projetos precisa da região de aviso");

  const tagStart = html.lastIndexOf("<p", start);
  const tagEnd = html.indexOf(">", start) + 1;
  const tag = html.slice(tagStart, tagEnd);
  const body = html.slice(tagEnd, html.indexOf("</p>", start));

  assert.match(tag, /role="status"/);
  assert.match(tag, /aria-live="polite"/);
  assert.match(tag, /aria-atomic="true"/);
  assert.match(tag, /\bhidden\b/, "o estado oculto vem do HTML, não só do CSS");
  assert.doesNotMatch(tag, /tabindex|autofocus/, "o aviso não recebe foco");
  assert.equal(body.trim(), "", "o aviso nasce vazio e só o JS escreve");

  const section = html.slice(html.indexOf('id="projetos"'), html.indexOf("</section>", html.indexOf('id="projetos"')));
  assert.ok(section.includes('id="project-notice"'), "o aviso vive dentro da seção Projetos");
  assert.equal((section.match(/data-project-slug=/g) ?? []).length, 3, "a lista principal continua com três linhas");
});

test("o aviso é alimentado pela canonicalização, sem empilhar histórico", () => {
  const app = readFileSync(fileURLToPath(new URL("../src/app.js", import.meta.url)), "utf8");
  const start = app.indexOf("function canonicalize");
  const end = app.indexOf("function buildFilter", start);
  assert.ok(start !== -1 && end > start, "canonicalize precisa existir");
  const canonicalize = app.slice(start, end);

  assert.match(canonicalize, /resolveProjectLocation\(/, "a canonicalização reusa a regra pura");
  assert.match(canonicalize, /history\.replaceState/, "alias antigo usa replaceState");
  assert.doesNotMatch(canonicalize, /history\.pushState/, "canonicalização não cria entrada no histórico");
  assert.match(app, /addEventListener\("hashchange", syncFromLocation\)/, "hash alterado no mesmo documento passa pela canonicalização");
  assert.match(app, /addEventListener\("popstate", syncFromLocation\)/, "Voltar e Avançar usam o mesmo caminho");
  assert.match(app, /function syncFromLocation\(\)/, "a sincronização não é duplicada entre os dois eventos");
  assert.match(app, /projectNotice\.region\.textContent = message/, "o aviso é escrito com textContent");
  assert.match(app, /projectNotice\.region\.hidden = !message/, "o aviso volta a ficar oculto ao limpar");
});

const APPROVED_ROWS = [
  {
    slug: "marcai",
    index: "01",
    title: "MarcAi",
    summary:
      "Plataforma de agendamentos multi-tenant com agenda por profissional, papéis de acesso e página pública de agendamento.",
    year: "2026",
    stacks: ["Next.js", "TypeScript", "PostgreSQL"],
    link: ["https://marcai-demo.netlify.app/", "Ver demo"],
    privateCode: true,
  },
  {
    slug: "seirei",
    index: "02",
    title: "Seirei",
    summary:
      "Aplicativo de foco que mostra uma tarefa por vez, ordena o dia com IA e sincroniza entre dispositivos.",
    year: "2026",
    stacks: ["Next.js", "TypeScript", "Supabase"],
    link: null,
    privateCode: true,
  },
  {
    slug: "open-mind",
    index: "03",
    title: "Open Mind",
    summary:
      "Plugin para OpenCode que transforma um Vault do Obsidian em contexto de projeto, com leitura confinada e escrita desabilitada por padrão.",
    year: "2026",
    stacks: ["TypeScript", "Node.js", "OpenCode"],
    link: ["https://github.com/nicolasponciano/open-mind", "GitHub"],
    privateCode: false,
  },
];

function readRows(html) {
  return [...html.matchAll(/<article class="project-entry"[\s\S]*?<\/article>/g)].map((match) => {
    const row = match[0];
    const anchor = row.match(/<a href="([^"]+)"[^>]*>([^<]+)</);
    const links = row.match(/class="project-links[^"]*"[^>]*>([\s\S]*?)<\/span>\s*<\/div>/);
    return {
      slug: row.match(/data-project-slug="([^"]+)"/)[1],
      index: row.match(/class="project-index"[^>]*>([^<]+)</)[1].trim(),
      title: row.match(/<h3[^>]*>([^<]+)<\/h3>/)[1].trim(),
      summary: row.match(/<\/h3>\s*<p>([\s\S]*?)<\/p>/)[1].trim(),
      year: row.match(/data-project-year>([^<]+)</)[1].trim(),
      stacks: [...row.matchAll(/class="stack-tag">([^<]+)</g)].map((m) => m[1].trim()),
      link: anchor ? anchor.slice(1) : null,
      privateCode: /Código privado/.test(links?.[1] ?? ""),
      open: row.match(/class="project-open"[^>]*>([^<]+)</)[1].trim(),
      labelledBy: row.match(/<article[^>]*aria-labelledby="([^"]+)"/)[1],
    };
  });
}

test("a lista principal de Projetos mantém ordem, textos e atributos aprovados", () => {
  const html = readFileSync(pagePath, "utf8");
  const rows = readRows(html);

  assert.equal(rows.length, APPROVED_ROWS.length, "a lista mantém exatamente três linhas");
  rows.forEach((row, position) => {
    const approved = APPROVED_ROWS[position];
    assert.equal(row.slug, approved.slug, `a linha ${position + 1} mantém o slug`);
    assert.equal(row.index, approved.index, `${approved.slug} mantém o índice visual`);
    assert.equal(row.title, approved.title, `${approved.slug} mantém o título`);
    assert.equal(row.year, approved.year, `${approved.slug} mantém o ano`);
    assert.deepEqual(row.stacks, approved.stacks, `${approved.slug} mantém as tecnologias e a ordem`);
    assert.deepEqual(row.link, approved.link, `${approved.slug} mantém link e rótulo`);
    assert.equal(row.privateCode, approved.privateCode, `${approved.slug} mantém o estado do código`);
    assert.equal(row.open, "Abrir", `${approved.slug} mantém o botão Abrir`);
    assert.equal(
      row.labelledBy,
      `${approved.slug}-title ${approved.slug}-year ${approved.slug}-stack`,
      `${approved.slug} mantém o nome acessível da linha`,
    );
  });

  const section = html.slice(html.indexOf('id="projetos"'), html.indexOf("</section>", html.indexOf('id="projetos"')));
  assert.equal((section.match(/data-project-slug=/g) ?? []).length, 3, "a seção não ganha linha extra");
  assert.equal((section.match(/class="row-preview"/g) ?? []).length, 3, "cada linha mantém uma prévia");
});

test("só o projeto público tem âncora de repositório, sem link privado nem legado", () => {
  const html = readFileSync(pagePath, "utf8");
  const section = html.slice(html.indexOf('id="projetos"'), html.indexOf("</section>", html.indexOf('id="projetos"')));
  const anchors = [...section.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)</g)].map((m) => [m[1], m[2]]);

  assert.deepEqual(anchors, [["https://marcai-demo.netlify.app/", "Ver demo"], ["https://github.com/nicolasponciano/open-mind", "GitHub"]]);
  assert.equal((section.match(/>Código privado</g) ?? []).length, 2, "MarcAi e Seirei exibem Código privado");
  assert.doesNotMatch(section, /href="#"/, "estado privado não pode virar link artificial");
  assert.doesNotMatch(section, /disabled/, "estado privado não pode virar botão desabilitado");
  assert.doesNotMatch(section, /ClienteAPI|Skill Upgrader|skill-upgrader|projeto-0\d/i, "projetos antigos saem da lista");
  assert.doesNotMatch(section, /\.NET\b/, "a API .NET não entra em texto público");
});

test("as três fichas descrevem apenas o produto web aprovado", async () => {
  const { projectDetails } = await import(
    `${new URL("../src/data/portfolio.js", import.meta.url).href}?test=${Date.now()}`
  );

  Object.entries(projectDetails).forEach(([slug, entry]) => {
    const publicText = [entry.role, entry.challenge, entry.solution, entry.schematic.purpose, ...entry.schematic.items].join(" ");
    assert.doesNotMatch(publicText, /\.NET\b|ClienteAPI|Skill Upgrader|skill-upgrader/, `${slug} expõe conteúdo fora da seleção`);
    assert.doesNotMatch(publicText, /postgresql:\/\/|Bearer\s+[A-Za-z0-9]|api[_-]?key\s*[:=]|secret\s*[:=]/i, `${slug} expõe dado sensível`);
    assert.doesNotMatch(publicText, /\b(supabase\.co|vercel\.app|netlify\.app)\b/, `${slug} expõe endpoint de produção`);
  });
});

test("os resumos das três linhas permanecem byte a byte iguais ao texto aprovado", () => {
  const html = readFileSync(pagePath, "utf8");
  const rows = readRows(html);

  rows.forEach((row, position) => {
    assert.equal(row.summary, APPROVED_ROWS[position].summary, `${row.slug} alterou o resumo`);
    assert.doesNotMatch(row.summary, /…|\.\.\.$|\[A preencher\]/, `${row.slug} não pode truncar o resumo`);
    assert.equal(Buffer.from(row.summary, "utf8").toString("utf8"), APPROVED_ROWS[position].summary);
  });
});

test("as fichas mantêm papel, desafio e solução aprovados", async () => {
  const { projectDetails } = await import(
    `${new URL("../src/data/portfolio.js", import.meta.url).href}?test=${Date.now()}`
  );

  const approved = {
    marcai: {
      role: "Desenvolvimento individual do produto, do modelo de dados à interface.",
      challenge:
        "Impedir horário duplicado e vazamento de dados entre estabelecimentos quando duas pessoas tentam marcar o mesmo horário ao mesmo tempo.",
      solution:
        "Modelei o vínculo do usuário com o estabelecimento no token e apliquei verificação de conflito, chave de idempotência e limite de requisições nas rotas sensíveis, com testes para papéis e conflito.",
      featured: true,
      preview: "panel",
      codeVisibility: "private",
    },
    seirei: {
      role: "Desenvolvimento individual do produto, do schema ao aplicativo.",
      challenge:
        "Manter o foco em uma tarefa sem perder o que ficou para depois e continuar confiável quando a IA de ordenação falha.",
      solution:
        "Persisti ordem, dependências e duração no banco, validei a resposta da IA contra as tarefas reais do dia e mantive fallback explícito; a sincronização usa RLS por usuário e última gravação prevalecendo.",
      featured: false,
      preview: "flow",
      codeVisibility: "private",
    },
    "open-mind": {
      role: "Desenvolvimento individual do plugin, dos testes e da documentação.",
      challenge:
        "Dar contexto de notas locais a um agente sem expor caminhos absolutos e sem permitir escrita sem autorização.",
      solution:
        "Separei core, adaptador do OpenCode e acesso ao filesystem, confinei as operações à raiz do Vault e condicionei cada escrita a permissão explícita e ao hash da versão lida.",
      featured: false,
      preview: "terminal",
      codeVisibility: "public",
    },
  };

  assert.deepEqual(Object.keys(projectDetails), Object.keys(approved), "a ficha mantém os três projetos na ordem");
  Object.entries(approved).forEach(([slug, expected]) => {
    const { role, challenge, solution, featured, preview, codeVisibility } = projectDetails[slug];
    assert.deepEqual(
      { role, challenge, solution, featured, preview, codeVisibility },
      expected,
      `${slug} alterou a ficha`,
    );
  });
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

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const cssPath = fileURLToPath(new URL("../src/styles.css", import.meta.url));

function readCss() {
  assert.ok(existsSync(cssPath), "src/styles.css precisa estilizar a página");
  return readFileSync(cssPath, "utf8");
}

function readRule(css, selector) {
  const index = css.indexOf(selector);
  assert.ok(index !== -1, `regra "${selector}" precisa existir em styles.css`);
  const open = css.indexOf("{", index);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

function mediaRanges(css, selector) {
  const ranges = [];
  let index = 0;
  while ((index = css.indexOf(selector, index)) !== -1) {
    const open = css.indexOf("{", index);
    let depth = 1;
    let cursor = open + 1;
    while (depth > 0 && cursor < css.length) {
      if (css[cursor] === "{") depth += 1;
      else if (css[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    ranges.push([open, cursor]);
    index = cursor;
  }
  return ranges;
}

test("nenhuma regra oculta conteúdo por estado de montagem", () => {
  const css = readCss();
  assert.doesNotMatch(css, /page-building/);
  assert.doesNotMatch(css, /\[data-build\][^{}]*\{[^}]*opacity:\s*0/);
});

test("hover que desloca a linha fica dentro do media de ponteiro fino", () => {
  const css = readCss();
  const finePointer = "@media (hover: hover) and (pointer: fine)";
  const ranges = mediaRanges(css, finePointer);
  assert.ok(ranges.length > 0, "media query de ponteiro fino precisa existir");

  const rulePattern = /([^{}]*:hover[^{}]*)\{([^}]*)\}/g;
  let match;
  while ((match = rulePattern.exec(css))) {
    if (!/transform\s*:/.test(match[2])) continue;
    const offset = match.index;
    const inside = ranges.some(([open, close]) => offset > open && offset < close);
    assert.ok(inside, `hover com transform fora do media de ponteiro fino: ${match[1].trim()}`);
  }

  const entryRule = readRule(css, ".project-entry:hover");
  assert.doesNotMatch(entryRule, /transform:/, "hover não pode deslocar a linha nem o palco");
});

test("sem JavaScript os controles mortos ficam ocultos", () => {
  const css = readCss();
  const index = css.indexOf("html.no-js");
  assert.ok(index !== -1, "regra html.no-js precisa existir");
  const open = css.indexOf("{", index);
  const close = css.indexOf("}", open);
  const block = css.slice(index, close);
  assert.match(block, /display:\s*none/);
  for (const selector of [
    ".hero-search",
    ".hero-stage",
    ".index-stage",
    ".row-preview",
    ".filter-bar",
    ".filter-count",
    "#theme-toggle",
    "#copy-email",
    ".project-open",
    "#scene-button",
  ]) {
    assert.ok(block.includes(selector), `html.no-js precisa ocultar ${selector}`);
  }
});

test("a prévia do índice fica fixa em desktop e entra na linha em 768 px", () => {
  const css = readCss();
  assert.match(css, /\.index-stage\s*{[^}]*position:\s*sticky/);
  assert.match(css, /\.row-preview\s*{\s*display:\s*none/);

  const ranges = mediaRanges(css, "@media (max-width: 768px)");
  assert.ok(ranges.length > 0, "o breakpoint de 768 px precisa existir");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.index-stage\s*{[^}]*display:\s*none/);
  assert.match(block, /\.row-preview\s*{[^}]*display:\s*block/);
});

test("a grade do índice colapsa para uma coluna depois do breakpoint de 1024 px", () => {
  const css = readCss();
  const fortyIndex = css.indexOf(".work-layout {\n    grid-template-columns: minmax(0, 1fr) minmax(240px, 40%);");
  assert.ok(fortyIndex !== -1, "o palco do índice ocupa 40% até 1024 px");
  const oneColumnIndex = css.indexOf(".work-layout {\n    grid-template-columns: minmax(0, 1fr);");
  assert.ok(oneColumnIndex > fortyIndex, "a coluna única precisa vencer o breakpoint de 1024 no mobile");
});

test("a linha de projeto empilha os metadados antes de 1440 px", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (max-width: 1439px)");
  assert.ok(ranges.length > 0, "o breakpoint de 1439 px precisa existir");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.project-entry\s*{[^}]*grid-template-columns:\s*46px minmax\(0,\s*1fr\) auto/);
  assert.match(block, /\.project-meta\s*{[^}]*grid-column:\s*2/);
});

test("o botão de montagem fica no rodapé do hero e não flutua sobre o conteúdo", () => {
  const css = readCss();
  const button = readRule(css, ".scene-button {");
  assert.doesNotMatch(button, /position:\s*fixed/, "o botão não pode flutuar sobre o conteúdo");
  assert.match(button, /min-height:\s*44px/);
  assert.match(button, /align-items:\s*center/);

  const foot = readRule(css, ".hero-foot {");
  assert.match(foot, /flex-wrap:\s*wrap/);
  assert.match(css, /\.hero-foot-actions\s*{[^}]*display:\s*flex/);

  const ranges = mediaRanges(css, "@media (max-width: 720px)");
  assert.ok(ranges.length > 0, "o breakpoint de 720 px precisa existir");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.hero-foot\s*{[^}]*position:\s*static/, "no mobile o rodapé entra no fluxo do hero");
});

test("o nome domina o hero com kicker, resumo e linha de fatos", () => {
  const css = readCss();
  const h1 = readRule(css, ".hero h1");
  assert.match(h1, /font-size:\s*clamp\(64px,\s*9\.5vw,\s*136px\)/);
  assert.match(h1, /line-height:\s*0\.84/);
  assert.match(h1, /letter-spacing:\s*-0\.03em/);
  assert.doesNotMatch(h1, /overflow-wrap:\s*anywhere/);

  const kicker = readRule(css, ".hero-kicker");
  assert.match(kicker, /font-size:\s*11px/);
  assert.match(kicker, /font-weight:\s*700/);
  assert.match(kicker, /letter-spacing:\s*0\.14em/);
  assert.match(kicker, /text-transform:\s*uppercase/);
  assert.match(kicker, /color:\s*var\(--mint-text\)/);

  const facts = readRule(css, ".hero-facts");
  assert.match(facts, /font-size:\s*13px/);
  assert.match(facts, /line-height:\s*1\.45/);
  assert.match(facts, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(facts, /border-block:\s*1px solid var\(--line\)/);
  assert.match(css, /\.hero-facts li\s*{[^}]*border-left:\s*1px solid var\(--line\)/);
  assert.doesNotMatch(css, /\.hero-name/);
});

test("em 390 px o nome cabe em duas linhas e os fatos empilham em coluna", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (max-width: 720px)");
  assert.ok(ranges.length > 0, "o breakpoint de 720 px precisa existir");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.hero h1\s*{[^}]*font-size:\s*clamp\(60px,\s*13\.5vw,\s*76px\)/);
  assert.doesNotMatch(block, /overflow-wrap/);
  assert.match(block, /\.hero-facts\s*{[^}]*grid-template-columns:\s*1fr/);
  assert.match(block, /\.hero-facts li\s*{[^}]*border-top:\s*1px solid var\(--line\)/);
});

test("o pager do hero tem alvos de 44 px, contador técnico e foco visível", () => {
  const css = readCss();
  const pager = readRule(css, ".stage-pager");
  assert.match(pager, /border-top:\s*1px solid var\(--line\)/);
  assert.doesNotMatch(pager, /gradient|box-shadow/);

  const button = readRule(css, ".stage-button");
  assert.match(button, /width:\s*44px/);
  assert.match(button, /height:\s*44px/);
  assert.match(button, /background:\s*transparent/);
  assert.match(button, /transition:[^;]*transform var\(--dur-1\)/);
  assert.match(button, /transition:[^;]*background-color var\(--dur-1\)/);
  assert.doesNotMatch(button, /transition:[^;]*(--dur-[34]|--dur-[2-4]\b)/, "o pager usa só --dur-1 e --dur-2");

  assert.match(css, /\.stage-button:hover\s*{[^}]*background:/, "hover discreto sem deslocamento");

  const press = readRule(css, ".stage-button:active");
  assert.match(press, /transform:\s*scale\(0\.98\)/);
  assert.match(press, /background:/);

  const count = readRule(css, ".stage-count");
  assert.match(count, /font-variant-numeric:\s*tabular-nums/);
  assert.match(count, /letter-spacing:\s*0\.16em/);

  assert.match(css, /\.stage-button:focus-visible\s*{[^}]*outline:\s*2px solid var\(--lime\)/);
});

test("a troca de prévia dura 160 ms", () => {
  const css = readCss();
  assert.match(css, /--dur-2:\s*160ms/);
  assert.match(css, /\.preview-stage\.is-swapping \.stage-canvas[\s\S]*?animation:\s*preview-swap var\(--dur-2\)/);
  assert.match(css, /@keyframes preview-swap/);
});

test("a prévia tem propósito, lista, item e numeração com hierarquia visual", () => {
  const css = readCss();
  assert.match(css, /\.preview-purpose\s*{[^}]*color:\s*var\(--paper\)/);
  assert.match(css, /\.preview-purpose\s*{[^}]*font-size:\s*15px/);
  assert.match(css, /\.preview-purpose\s*{[^}]*line-height:\s*1\.45/);
  assert.match(css, /\.preview-purpose\s*{[^}]*max-width:\s*36ch/);
  assert.match(css, /\.schematic-list\s*{[^}]*display:\s*grid/);
  assert.match(css, /\.schematic-list\s*{[^}]*list-style:\s*none/);
  assert.match(css, /\.schematic-item\s*{[^}]*display:\s*grid/);
  assert.match(css, /\.schematic-item\s*{[^}]*align-items:\s*baseline/, "numeração e texto dividem a mesma linha de base");
  assert.match(css, /\.schematic-index\s*{[^}]*color:\s*var\(--mint-text\)/);
  assert.match(css, /\.schematic-index\s*{[^}]*font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /\.schematic-text\s*{[^}]*font-size:\s*12\.5px/);
  assert.match(css, /\.schematic-text\s*{[^}]*line-height:\s*1\.45/);
  assert.match(css, /\.schematic-text\s*{[^}]*color:\s*var\(--paper-dim\)/, "capacidade fica um nível abaixo do propósito");
  assert.match(css, /@media \(min-width: 1200px\)\s*{\s*\.schematic-text\s*{[^}]*font-size:\s*13px/);
  assert.doesNotMatch(css, /\.schematic-foot/, "o rodapé interno saiu do contrato");
});

test("a capacidade perde borda, fundo e coluna fixa de rótulo", () => {
  const css = readCss();
  const item = readRule(css, ".schematic-item {");
  assert.doesNotMatch(item, /border:\s*1px solid var\(--line\)/, "a capacidade não é cartão");
  assert.match(item, /background:\s*none/, "a capacidade não tem fundo próprio");
  assert.match(item, /border-top:\s*1px solid var\(--line\)/, "o filete separa capacidades");
  assert.match(css, /\.schematic-item:first-child\s*{[^}]*border-top:\s*0/, "o primeiro item não ganha filete acima");
  assert.match(css, /\.schematic-item:last-child\s*{[^}]*padding-bottom:\s*0/, "o último item encosta no rodapé do canvas");
  assert.doesNotMatch(css, /\.stage-canvas--schematic[\s\S]{0,400}?grid-template-columns:\s*repeat\(2/, "a lista é uma coluna em qualquer largura");
});

test("o esquema ocupa a área do canvas sem rolagem interna nem deslocamento", () => {
  const css = readCss();
  const canvas = readRule(css, ".stage-canvas--schematic {");
  assert.match(canvas, /display:\s*flex/);
  assert.match(canvas, /flex-direction:\s*column/);
  assert.doesNotMatch(canvas, /overflow:\s*(auto|scroll)/);

  assert.match(css, /\.preview-stage\.has-schematic\s*{[^}]*aspect-ratio:\s*auto/, "o palco cresce com o esquema");
  assert.match(css, /\.hero-stage\.has-schematic\s*{[^}]*min-height:\s*432px/, "o palco do hero mantém altura estável");
  assert.match(
    css,
    /@media \(max-width: 400px\)\s*{\s*\.hero-stage\.has-schematic\s*{[^}]*min-height:\s*520px/,
    "em 390 px o chrome quebrado pede altura comum maior",
  );
  assert.match(css, /@media \(max-width: 377px\)\s*{\s*\.hero-stage\.has-schematic\s*{[^}]*min-height:\s*520px/);
  assert.match(css, /@media \(max-width: 371px\)\s*{\s*\.hero-stage\.has-schematic\s*{[^}]*min-height:\s*520px/);
  assert.match(
    css,
    /@media \(max-width: 650px\)\s*{\s*\.hero-stage\.has-schematic\s*{[^}]*min-height:\s*486px/,
    "entre 401 e 650 px a altura comum cobre a quebra do Seirei",
  );
  const heroStages = [...css.matchAll(/\.hero-stage\.has-schematic\s*{[^}]*}/g)];
  assert.equal(heroStages.length, 7, "a altura do hero tem uma regra base, duas faixas largas e quatro faixas estreitas");
  assert.doesNotMatch(canvas, /overflow(-y)?:\s*(auto|scroll|hidden)/, "o conteúdo não é cortado nem rola dentro do canvas");
  assert.doesNotMatch(css, /\.preview-purpose[^{]*{[^}]*line-clamp/);
  assert.doesNotMatch(css, /\.schematic-text[^{]*{[^}]*line-clamp/);
  assert.doesNotMatch(css, /\.stage-canvas--schematic[^{]*{[^}]*max-height/);
  assert.match(css, /\.row-preview\.has-schematic \.stage-canvas\s*{[^}]*aspect-ratio:\s*auto/);
  assert.match(css, /\.stage-canvas--schematic::before,[\s\S]*?display:\s*none/, "os conectores do fluxo neutro não aparecem no esquema");
});

test("o hero no celular afasta o selo do filete e densifica o miolo", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (max-width: 480px)");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.hero-stage \.stage-chrome\s*{[^}]*padding-block:\s*5px/, "o chrome quebrado ganha respiro vertical");
  assert.match(block, /\.hero-stage \.stage-canvas--schematic\s*{[^}]*gap:\s*16px/);
  assert.match(block, /\.hero-stage \.stage-canvas--schematic\s*{[^}]*padding:\s*16px 14px/);
});

test("a prévia compacta usa densidade própria e não corta o rodapé", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (max-width: 768px)");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.ok(block, "o bloco de 768 px precisa existir");
  assert.match(block, /\.row-preview \.preview-purpose\s*{[^}]*font-size:\s*14px/);
  assert.match(block, /\.row-preview \.preview-purpose\s*{[^}]*max-width:\s*100%/);
  assert.match(block, /\.row-preview \.stage-canvas--schematic\s*{[^}]*gap:\s*14px/);
  assert.match(block, /\.row-preview \.schematic-item\s*{[^}]*padding:\s*8px 0/);
  assert.match(block, /\.row-preview \.schematic-item\s*{[^}]*column-gap:\s*8px/);
  assert.match(block, /\.row-preview-head\s*{[^}]*flex-wrap:\s*wrap/);
  assert.match(block, /\.row-preview-head\s*{[^}]*padding-block:\s*8px/);
  assert.match(block, /\.row-preview-head > span:last-child\s*{[^}]*white-space:\s*normal/, "a stack quebra em vez de reticências");
  assert.doesNotMatch(block, /line-clamp|max-height/);
});

test("a prévia lateral sobe a altura comum conforme a coluna estreita", () => {
  const css = readCss();
  assert.match(css, /\.index-stage\.has-schematic\s*{[^}]*min-height:\s*456px/, "a coluna larga usa a altura medida");
  assert.match(css, /@media \(max-width: 1024px\)\s*{\s*\.index-stage\.has-schematic\s*{[^}]*min-height:\s*448px/);
  assert.match(css, /@media \(max-width: 960px\)\s*{\s*\.index-stage\.has-schematic\s*{[^}]*min-height:\s*464px/);
  assert.match(css, /@media \(max-width: 900px\)\s*{\s*\.index-stage\.has-schematic\s*{[^}]*min-height:\s*560px/);
  assert.match(css, /\.index-stage \.stage-title\s*{[^}]*flex-basis:\s*100%/, "na coluna estreita o nome ocupa a primeira linha do chrome");
  assert.match(css, /\.index-stage \.stage-chrome\s*{[^}]*padding-block:\s*6px/, "o chrome quebrado respira");
});

test("o rodapé da prévia lateral não corta a stack entre 769 e 900 px", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (min-width: 769px) and (max-width: 900px)");
  assert.ok(ranges.length > 0, "a faixa estreita da coluna lateral precisa de regra própria");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.index-stage \.stage-foot > span:last-child\s*{[^}]*white-space:\s*normal/);
  assert.match(block, /\.index-stage \.stage-foot > span:last-child\s*{[^}]*overflow:\s*visible/);
  assert.match(block, /\.index-stage \.stage-foot > span:last-child\s*{[^}]*max-width:\s*100%/);
  assert.doesNotMatch(block, /text-overflow:\s*ellipsis/, "a stack não termina em reticências");
});

test("a numeração do esquema cabe na coluna sem empurrar o texto", () => {
  const css = readCss();
  const item = readRule(css, ".schematic-item {");
  const match = item.match(/grid-template-columns:\s*(\d+)px/);
  assert.ok(match, "a coluna da numeração precisa de largura fixa");
  assert.ok(Number(match[1]) >= 24, "a coluna comporta dois dígitos sem corte");
  assert.ok(Number(match[1]) <= 40, "a coluna não rouba espaço do texto");
});

test("o cabeçalho da prévia da linha não corta a stack no celular", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (max-width: 768px)");
  assert.ok(ranges.length > 0, "o breakpoint de 768 px precisa existir");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.row-preview-head\s*{[^}]*flex-wrap:\s*wrap/, "o cabeçalho quebra em vez de cortar");
  assert.match(block, /\.row-preview-head > span:last-child\s*{[^}]*white-space:\s*normal/);
  assert.doesNotMatch(block, /text-overflow:\s*ellipsis/, "a stack não termina em reticências");
});

test("a Trajetória usa hairlines, metadados técnicos e display nos cargos", () => {
  const css = readCss();

  const layout = readRule(css, ".path-layout {");
  assert.match(layout, /grid-template-columns:\s*minmax\(0,\s*1fr\)/, "empilha por padrão");
  assert.match(css, /@media \(min-width: 1024px\)\s*{\s*\.path-layout\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*gap:\s*44px/);

  const item = readRule(css, ".path-item {");
  assert.match(item, /border-top:\s*1px solid var\(--line\)/);
  assert.doesNotMatch(item, /transition|animation|box-shadow|background/);

  const period = readRule(css, ".path-period {");
  assert.match(period, /font-size:\s*10px/);
  assert.match(period, /text-transform:\s*uppercase/);
  assert.match(period, /letter-spacing:\s*0\.14em/);
  assert.match(period, /color:\s*var\(--muted\)/);

  const role = readRule(css, ".path-role {");
  assert.match(role, /font-family:\s*"Big Shoulders Display"/);
  assert.match(role, /font-size:\s*clamp\(23px,\s*2\.1vw,\s*29px\)/);

  const org = readRule(css, ".path-org {");
  assert.match(org, /font-size:\s*15px/);
  assert.match(org, /color:\s*var\(--paper-dim\)/);

  assert.match(css, /\.path-group h3\s*{[^}]*text-transform:\s*uppercase/);
  assert.match(css, /\.path-note\s*{[^}]*color:\s*var\(--mint-text\)/);
  assert.doesNotMatch(css, /\.path-item:hover/, "item de trajetória não é interativo");
  assert.doesNotMatch(css, /\.path-(list|item)[^{}]*{[^}]*(::before|::after)[^}]*background/, "sem linha do tempo desenhada");
});

test("o bloco neutro continua estilizado como fallback dos três tipos", () => {
  const css = readCss();
  assert.match(css, /\.preview-block\s*{[^}]*border:\s*1px solid var\(--line-strong\)/);
  assert.match(css, /\.stage-canvas--panel\s*{[^}]*display:\s*grid/);
  assert.match(css, /\.stage-canvas--terminal\s*{[^}]*display:\s*flex/);
  assert.match(css, /\.stage-canvas--flow \.preview-block\s*{[^}]*position:\s*absolute/);
});

test("o selo conceitual acompanha o palco e a prévia de linha", () => {
  const css = readCss();
  assert.match(css, /\.stage-note\s*{[^}]*border:\s*1px solid var\(--line\)/);
  assert.match(css, /\.stage-note\s*{[^}]*color:\s*var\(--muted\)/);
  assert.match(css, /\.row-preview-note\s*{[^}]*border:\s*1px solid var\(--line\)/);
  assert.match(css, /\.stage-chrome\s*{[^}]*justify-content:\s*flex-start/);
  assert.match(css, /\.stage-chrome\s*{[^}]*flex-wrap:\s*wrap/, "o chrome pode quebrar em larguras pequenas");
  assert.match(css, /\.stage-title\s*{[^}]*margin-right:\s*auto/);
});

test("a ficha é folha clara com fechar sempre visível e tela cheia em 480 px", () => {
  const css = readCss();
  assert.match(css, /\.project-dialog\s*{[^}]*background:\s*var\(--sheet\)/);
  assert.match(css, /\.project-dialog::backdrop/);
  assert.match(css, /\.project-dialog\[open\]\s*{[^}]*flex-direction:\s*column/);
  assert.match(css, /\.dialog-close\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /scrollbar-gutter:\s*stable/);

  const ranges = mediaRanges(css, "@media (max-width: 480px)");
  assert.ok(ranges.length > 0, "o breakpoint de 480 px precisa existir");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.project-dialog\s*{[^}]*height:\s*100dvh/);
});

test("a palette é folha clara, entra em 200 ms e vira tela cheia em 480 px", () => {
  const css = readCss();
  assert.match(css, /\.command-palette\s*{[^}]*background:\s*var\(--sheet\)/);
  assert.match(css, /\.command-palette::backdrop/);
  assert.match(css, /\.command-palette\[open\]\s*{[^}]*display:\s*flex/);
  assert.match(css, /animation:\s*palette-in var\(--dur-3\)/);
  assert.match(css, /\.command-option\.is-active\s*{[^}]*background:\s*var\(--sheet-ink\)/);

  const ranges = mediaRanges(css, "@media (max-width: 480px)");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /\.command-palette\s*{[^}]*height:\s*100dvh/);
});

test("os temas papel e tinta trocam tokens e mantêm ficha e palette claras", () => {
  const css = readCss();
  const paper = readRule(css, 'html[data-theme="paper"]');
  assert.match(paper, /--ink:\s*#f1f0e8/, "o tema papel inverte o fundo da página");
  assert.match(paper, /--paper:\s*#0b1d27/, "o tema papel inverte o texto da página");
  assert.match(paper, /--mint-text:/, "o tema papel escurece o acento de texto");

  const ranges = mediaRanges(css, "@media (prefers-color-scheme: light)");
  assert.ok(ranges.length > 0, "o sistema claro precisa valer na primeira visita");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /html:not\(\[data-theme\]\)/);

  assert.match(css, /--sheet:\s*#f1f0e8/);
  assert.match(css, /\.project-dialog\s*{[^}]*background:\s*var\(--sheet\)/);
  assert.match(css, /\.command-palette\s*{[^}]*background:\s*var\(--sheet\)/);
});

test("o botão de tema tem alvo de 44 px, some sem JavaScript e mantém nome no mobile", () => {
  const css = readCss();
  assert.match(css, /\.theme-toggle\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.theme-toggle:focus-visible\s*{[^}]*outline/);

  const label = readRule(css, ".theme-toggle-label");
  assert.match(label, /clip-path:\s*inset\(50%\)/, "no mobile o rótulo continua no nome acessível");
  assert.doesNotMatch(label, /display:\s*none/, "esconder o rótulo com display:none apagaria o nome acessível");
});

test("as tags de filtro respeitam alvo de 44 px e o estado vazio fica oculto", () => {
  const css = readCss();
  assert.match(css, /\.filter-tag,\s*\.filter-clear\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.filter-tag\[aria-pressed="true"\]/);
  assert.match(css, /\.empty-state\[hidden\]\s*{\s*display:\s*none/);
  assert.match(css, /\.project-entry\[hidden\]\s*{\s*display:\s*none/);
  assert.match(css, /\.project-notice\[hidden\]\s*{\s*display:\s*none/, "o aviso não pode aparecer vazio");
  assert.match(css, /\.project-notice\s*{[^}]*color:\s*var\(--paper-dim\)/);
  assert.match(css, /\.filter-bar\s*{[^}]*overscroll-behavior-x:\s*contain/);
});

test("o botão de montagem é um controle único, oculto até a cena existir", () => {
  const html = readFileSync(fileURLToPath(new URL("../index.html", import.meta.url)), "utf8");
  assert.match(html, /id="scene-button"[^>]*hidden/);
  assert.match(html, /Ver montagem/);
  assert.doesNotMatch(html, /id="build-controls"/);
});

test("as durações de movimento vêm de um único conjunto de tokens", () => {
  const css = readCss();
  assert.match(css, /--dur-1:\s*120ms/);
  assert.match(css, /--dur-2:\s*160ms/);
  assert.match(css, /--dur-3:\s*200ms/);
  assert.match(css, /--dur-4:\s*240ms/);

  const transitions = css.match(/transition:[^;]+;/g) ?? [];
  assert.ok(transitions.length > 0, "os componentes precisam declarar transições");
  transitions.forEach((rule) => {
    assert.doesNotMatch(rule, /\d+ms/, `transição com duração crua: ${rule}`);
    assert.match(rule, /var\(--dur-[12]\)/, `hover, press e cor usam --dur-1 ou --dur-2: ${rule}`);
  });
});

test("nenhuma transição anima propriedades que deslocam o layout", () => {
  const css = readCss();
  const transitions = css.match(/transition:[^;]+;/g) ?? [];
  transitions.forEach((rule) => {
    assert.doesNotMatch(rule, /\ball\b/, `transition: all não é permitido: ${rule}`);
    assert.doesNotMatch(
      rule,
      /\b(width|height|top|left|right|bottom|margin|padding|inset|flex|gap)\b/,
      `transição de layout não é permitida: ${rule}`,
    );
  });
});

test("controles respondem a press e mantêm foco visível", () => {
  const css = readCss();
  for (const selector of [
    ".theme-toggle:active",
    ".button:active",
    ".filter-tag:active",
    ".filter-clear:active",
    ".project-entry:active",
    ".project-open:active",
    ".dialog-close:active",
    ".copy-email:active",
  ]) {
    const index = css.indexOf(selector);
    assert.ok(index !== -1, `${selector} precisa existir`);
    const block = css.slice(index, css.indexOf("}", index));
    assert.match(block, /transform:\s*scale\(0\.98\)|background:/, `${selector} precisa responder ao press`);
  }

  for (const selector of [
    ".project-entry:focus-visible",
    ".project-open:focus-visible",
    ".filter-tag:focus-visible",
    ".dialog-close:focus-visible",
    ".dialog-links a:focus-visible",
    ".contact-email:focus-visible",
    ".copy-email:focus-visible",
    ".theme-toggle:focus-visible",
  ]) {
    const index = css.indexOf(selector);
    assert.ok(index !== -1, `${selector} precisa de foco visível`);
    assert.match(css.slice(index, css.indexOf("}", index)), /outline:/);
  }
});

test("o link textual responde ao press sem deslocar a linha", () => {
  const css = readCss();
  const link = readRule(css, ".text-link {");
  assert.match(link, /min-height:\s*44px/);
  assert.match(link, /transition:\s*color var\(--dur-1\)/);

  const press = readRule(css, ".text-link:active");
  assert.match(press, /color:\s*var\(--lime-text\)/);
  assert.doesNotMatch(press, /transform|margin|padding|position|top|left/, "press do link não desloca o layout");
});

test("itens não interativos não ganham hover nem cursor de clique", () => {
  const css = readCss();
  assert.doesNotMatch(css, /\.schematic-item:hover/);
  assert.doesNotMatch(css, /\.path-item:hover/);
  assert.doesNotMatch(css, /\.schematic-item\s*{[^}]*cursor:/);
  assert.doesNotMatch(css, /\.path-item\s*{[^}]*cursor:/);
});

test("o movimento reduzido neutraliza o press do pager", () => {
  const css = readCss();
  const blocks = [...css.matchAll(/html\.motion-reduced[^{}]*\{[^}]*transform:\s*none[^}]*\}/g)].map((m) => m[0]);
  assert.ok(blocks.length > 0, "o bloco global de movimento reduzido precisa existir");
  assert.ok(blocks.every((block) => block.includes(".stage-button")), "o pager precisa estar na lista de movimento reduzido");
  assert.ok(blocks.every((block) => block.includes(".copy-email")), "os controles existentes continuam na lista");
});

test("contato copiável tem alvo de 44 px e mantém o mailto visível", () => {
  const css = readCss();
  assert.match(css, /\.contact-email\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.copy-email\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.copy-email:hover\s*{/);
  assert.match(css, /\.contact-email:hover\s*{/);
});

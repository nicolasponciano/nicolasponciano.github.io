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

test("o botão de montagem não cobre o link do rodapé do hero", () => {
  const css = readCss();
  const ranges = mediaRanges(css, "@media (min-width: 721px)");
  assert.ok(ranges.length > 0, "o espaço do botão flutuante vale a partir de 721 px");
  const block = ranges.map(([open, close]) => css.slice(open, close)).join("\n");
  assert.match(block, /html\.js \.hero-foot\s*{[^}]*padding-right:\s*168px/);
});

test("a troca de prévia dura 160 ms", () => {
  const css = readCss();
  assert.match(css, /--dur-2:\s*160ms/);
  assert.match(css, /\.preview-stage\.is-swapping \.stage-canvas[\s\S]*?animation:\s*preview-swap var\(--dur-2\)/);
  assert.match(css, /@keyframes preview-swap/);
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

test("o botão de tema tem alvo de 44 px e some sem JavaScript", () => {
  const css = readCss();
  assert.match(css, /\.theme-toggle\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.theme-toggle:focus-visible\s*{[^}]*outline/);
});

test("as tags de filtro respeitam alvo de 44 px e o estado vazio fica oculto", () => {
  const css = readCss();
  assert.match(css, /\.filter-tag,\s*\.filter-clear\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.filter-tag\[aria-pressed="true"\]/);
  assert.match(css, /\.empty-state\[hidden\]\s*{\s*display:\s*none/);
  assert.match(css, /\.project-entry\[hidden\]\s*{\s*display:\s*none/);
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

test("contato copiável tem alvo de 44 px e mantém o mailto visível", () => {
  const css = readCss();
  assert.match(css, /\.contact-email\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.copy-email\s*{[^}]*min-height:\s*44px/);
  assert.match(css, /\.copy-email:hover\s*{/);
  assert.match(css, /\.contact-email:hover\s*{/);
});

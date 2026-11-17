---
name: Portfólio Full Stack
description: Portfólio de página única com índice de trabalho, ficha de projeto e busca por comando.
colors:
  ink: "#0b1d27"
  ink-raised: "#102a35"
  ink-raised-2: "#153541"
  paper: "#f1f0e8"
  paper-dim: "#c5d0cc"
  muted: "#a4b7b5"
  mint: "#55d6be"
  lime: "#d7ef70"
  coral: "#ff896f"
  sheet: "#f1f0e8"
  sheet-ink: "#0b1d27"
typography:
  display:
    fontFamily: "Big Shoulders Display, Impact, sans-serif"
    fontSize: "clamp(62px, 7vw, 96px)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "Big Shoulders Display, Impact, sans-serif"
    fontSize: "clamp(52px, 7.5vw, 102px)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.015em"
  project-title:
    fontFamily: "Big Shoulders Display, Impact, sans-serif"
    fontSize: "clamp(34px, 4vw, 54px)"
    fontWeight: 700
    lineHeight: 1.02
  body:
    fontFamily: "Atkinson Hyperlegible, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.58
    letterSpacing: "0em"
  meta:
    fontFamily: "Atkinson Hyperlegible, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.09em"
spacing:
  gutter: "clamp(22px, 5.7vw, 92px)"
  section: "clamp(84px, 12vw, 168px)"
  gap-sm: "11px"
  gap-md: "30px"
  gap-lg: "44px"
components:
  button-primary:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "0px"
    padding: "0 21px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.lime}"
  nav-contact:
    textColor: "{colors.paper}"
    height: "44px"
  project-entry:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "0px"
    padding: "25px 8px 25px 0"
  scene-button:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.paper}"
    rounded: "0px"
    padding: "8px 11px"
  project-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.sheet-ink}"
    rounded: "0px"
---

## Overview

Portfólio de página única para candidaturas full stack, publicado como mesa técnica editorial. O conteúdo aparece inteiro na primeira renderização: hero com cópia e palco de prévia, índice de trabalho com filtro por stack, ficha de projeto em `<dialog>` e busca por comando. A montagem por cursores deixou de bloquear a leitura e virou uma cena opcional de 6 a 8 s, acionada por um único botão, sobre conteúdo já visível.

## Colors

Dois planos de cor do mesmo vocabulário. Fundo azul-petróleo (`ink`), texto em `paper`, secundários em `paper-dim` e `muted`, grade de 48 px em turquesa a 3,5%. Acentos com função fixa: turquesa para interface e foco, lima para o nome, coral para o terceiro item e o bloco de entrega. A seção de contato inverte para turquesa com texto em `ink`.

O tema papel troca os tokens: `--ink` vira `#f1f0e8`, `--paper` vira `#0b1d27`, `paper-dim` e `muted` escurecem, acentos de texto usam variantes escuras (`--mint-text`, `--lime-text`, `--coral-text`). Ficha e palette são sempre folhas claras: `--sheet` e `--sheet-ink` não mudam com o tema. Preferência em `localStorage` (`portfolio-theme`), aplicada por script inline antes do CSS; sem JS ou sem valor salvo, `prefers-color-scheme` decide.

Contraste medido em 2026-11-17 por estilo computado (alfa composto sobre o fundo real): mínimo 6,61:1 no tema tinta e 5,38:1 no tema papel; ficha e palette 5,63:1 nas folhas claras. Nenhum par abaixo de 4,5:1.

## Typography

Display condensado em caixa alta para títulos, com entrelinha curta e tracking entre -0,025em e -0,015em. Corpo em Atkinson Hyperlegible, com medida entre 58ch e 66ch. Metadados pequenos em caixa alta com tracking 0,09em. Fontes auto-hospedadas em `assets/fonts` sob SIL Open Font License 1.1.

## Layout

Página centralizada em 1440 px com gutter fluido. Hero ocupa a primeira tela em duas colunas (texto e palco de prévia), passando a uma coluna abaixo de 1020 px. Seções empilhadas com borda superior de 1 px e respiro de 84 a 168 px.

Índice de trabalho em duas colunas: lista e palco fixo. O palco fica com 40% da largura até 1024 px e some abaixo de 768 px, quando a prévia passa para dentro da linha. A linha de projeto usa quatro colunas (índice, título e resumo, metadados, ações) somente a partir de 1440 px; abaixo disso os metadados empilham sob o título, mantendo a coluna de texto legível entre 1200 e 1439 px. Abaixo de 720 px as ações vão para a linha seguinte.

Ficha e palette ocupam a tela cheia abaixo de 480 px, com o fechar sempre visível. Em 390 px a página é uma coluna, as ações ocupam a largura toda e os filtros rolam dentro do próprio contêiner. Sem rolagem horizontal em nenhuma largura.

## Elevation & Depth

Não há sombras decorativas. Profundidade vem de planos de cor (`ink`, `ink-raised`), hairlines de 1 px, do backdrop das folhas e da sobreposição explícita entre cursores, seleção e esqueleto durante a cena. O botão "Ver montagem" flutua com sombra deslocada; o `.hero-foot` reserva espaço à direita, a partir de 721 px, para ele não cobrir o link.

## Shapes

Cantos retos em todos os elementos: botões, campos, linhas, folhas e controles. Ícones são traços de 1,5 px sem preenchimento. Cursores são a única forma orgânica da página e só existem durante a cena.

## Components

- Botão primário: bloco turquesa, texto em tinta, sem raio, escala 0,98 no clique.
- Hero: título, nome, resumo, duas ações e campo de busca que abre a palette (`Ctrl+K`/`⌘+K`).
- Palco de prévia: moldura 4:3 `aria-hidden`, barra de título e composição por tipo (`panel`, `terminal`, `flow`) montada em HTML/CSS. Fixo no índice em desktop, dentro da linha em toque.
- Linha de projeto: índice, título, resumo, ano, stack, botão "Abrir" e links externos reais; hover e foco trocam a prévia em 160 ms.
- Filtro: tags com `aria-pressed`, contagem `N de M` em `aria-live` e estado vazio com "Limpar filtro".
- Ficha: folha clara em `<dialog>`, título, resumo, papel, desafio, solução, stack, ano e links clonados da linha.
- Palette: `<dialog>` estreito com `role="listbox"`, setas, Home, End, Enter e Esc.
- Botão de tema: nome acessível fixo "Tema papel", `aria-pressed` fiel ao tema e persistência local.
- Contato: `mailto:` visível e botão que copia o endereço com confirmação em `aria-live`.
- "Ver montagem": botão único, fora do fluxo, oculto sem JS e com movimento reduzido; a cena usa 6 cursores no desktop e 4 no mobile, nunca oculta conteúdo e para na primeira interação.

## Motion

Tokens únicos em `:root`: `--dur-1` 120 ms (hover, press, cor), `--dur-2` 160 ms (troca de prévia, foco), `--dur-3` 200 ms (entrada da palette), `--dur-4` 240 ms (entrada da ficha). Só `transform` e `opacity` movem; cor, borda e fundo podem transicionar. Press usa `scale(0.98)`. Com `prefers-reduced-motion: reduce`, durações caem para `0.00001s`, `transform` é removido e a cena não é oferecida.

## Do's and Don'ts

- Fazer: manter dados ausentes como `[A preencher]` e bloquear a publicação até o conteúdo real entrar (checagem `PUBLICAR=1 npm test`).
- Fazer: respeitar movimento reduzido com conteúdo pronto; manter controles operáveis por teclado e foco visível.
- Fazer: animar apenas `transform` e `opacity`; usar as durações dos tokens.
- Não fazer: alegar agentes de IA, inventar experiência, projetos, datas, métricas ou links.
- Não fazer: copiar nome, imagem, textos ou identidade visual da referência analisada.
- Não fazer: animar propriedades de layout nem criar rolagem horizontal.

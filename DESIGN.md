---
name: Portfólio Full Stack
description: Portfólio de página única com herói dominante, prévias esquemáticas, índice de trabalho, ficha de projeto, trajetória e busca por comando.
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
    fontSize: "clamp(64px, 9.5vw, 136px)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.03em"
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
    padding: "0 16px"
    height: "44px"
  project-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.sheet-ink}"
    rounded: "0px"
---

## Overview

Portfólio de página única para candidaturas full stack, publicado como mesa técnica editorial. O conteúdo aparece inteiro na primeira renderização: herói com nome dominante e palco de prévia, índice de trabalho com filtro por stack, seção Trajetória, ficha de projeto em `<dialog>` e busca por comando. As prévias são esquemas derivados das funcionalidades reais de cada projeto, não composições genéricas. A montagem por cursores é uma cena opcional de 6 a 8 s, acionada por um botão no rodapé do herói, sobre conteúdo já visível.

## Colors

Dois planos de cor do mesmo vocabulário. Fundo azul-petróleo (`ink`), texto em `paper`, secundários em `paper-dim` e `muted`, grade de 48 px em turquesa a 3,5%. Acentos com função fixa: turquesa para interface e foco, lima para o nome e para o foco/hover de controles, coral para o terceiro item e o bloco de entrega. A seção de contato inverte para turquesa com texto em `ink`.

O tema papel troca os tokens: `--ink` vira `#f1f0e8`, `--paper` vira `#0b1d27`, `paper-dim` e `muted` escurecem, acentos de texto usam variantes escuras (`--mint-text`, `--lime-text`, `--coral-text`). Ficha e palette são sempre folhas claras: `--sheet` e `--sheet-ink` não mudam com o tema. Preferência em `localStorage` (`portfolio-theme`), aplicada por script inline antes do CSS; sem JS ou sem valor salvo, `prefers-color-scheme` decide.

Contraste medido em 2026-11-17 por estilo computado (alfa composto sobre o fundo real), incluindo os controles da v1.1: mínimo 6,61:1 no tema tinta e 5,53:1 no tema papel. Ficha e palette ficam em 5,63:1 nas folhas claras. Nenhum par abaixo de 4,5:1.

## Typography

Display condensado em caixa alta para títulos, com entrelinha curta e tracking entre -0,03em e -0,015em. O `h1` do herói é o maior texto da página: `clamp(64px, 9.5vw, 136px)`, entrelinha 0,84, e não usa `overflow-wrap: anywhere`. Corpo em Atkinson Hyperlegible, com medida entre 54ch e 66ch. Metadados pequenos em caixa alta com tracking 0,09em. Fontes auto-hospedadas em `assets/fonts` sob SIL Open Font License 1.1.

## Layout

Página centralizada em 1440 px com gutter fluido. O herói ocupa a primeira tela em duas colunas (cópia e palco de prévia) acima de 1020 px e passa a uma coluna abaixo disso. Seções empilhadas com borda superior de 1 px e respiro de 84 a 168 px.

Ordem de leitura do herói:

1. `p.hero-kicker`: "Desenvolvedor de Software Full Stack", meta em caixa alta, turquesa.
2. `h1`: "Nicolas Ponciano", display dominante.
3. `p.hero-summary`: resumo aprovado, máximo 54ch.
4. `ul.hero-facts`: três fatos verificáveis, em três colunas com hairlines; uma coluna abaixo de 720 px.
5. `.hero-actions`: "Explorar projetos" e "Entrar em contato".
6. `.hero-search`: campo que abre a palette.
7. `.hero-foot`: "Interfaces, serviços e dados", link "Desça para explorar" e o botão "Ver montagem".

Índice de trabalho em duas colunas: lista e palco fixo. O palco fica com 40% da largura até 1024 px e some abaixo de 768 px, quando a prévia passa para dentro da linha. A linha de projeto usa quatro colunas (índice, título e resumo, metadados, ações) somente a partir de 1440 px; abaixo disso os metadados empilham sob o título, mantendo a coluna de texto legível entre 1200 e 1439 px. Abaixo de 720 px as ações vão para a linha seguinte.

A Trajetória usa duas colunas iguais com gap de 44 px a partir de 1024 px e uma coluna abaixo disso; em 768 px ou menos o período aparece acima do cargo.

Ficha e palette ocupam a tela cheia abaixo de 480 px, com o fechar sempre visível. Em 390 px a página é uma coluna, as ações ocupam a largura toda e os filtros rolam dentro do próprio contêiner. Sem rolagem horizontal em nenhuma largura.

## Elevation & Depth

Não há sombras decorativas. Profundidade vem de planos de cor (`ink`, `ink-raised`), hairlines de 1 px, do backdrop das folhas e da sobreposição explícita entre cursores, seleção e esqueleto durante a cena. O botão "Ver montagem" fica no fluxo do `.hero-foot`, sem posicionamento fixo e sem cobrir conteúdo; abaixo de 720 px o rodapé do herói passa a `position: static`.

## Shapes

Cantos retos em todos os elementos: botões, campos, linhas, folhas e controles. Ícones são traços de 1,5 px sem preenchimento. Cursores são a única forma orgânica da página e só existem durante a cena.

## Components

- **Botão primário**: bloco turquesa, texto em tinta, sem raio, escala 0,98 no clique.
- **Herói**: kicker com o papel, `h1` com o nome, resumo, linha de fatos, duas ações e busca que abre a palette (`Ctrl+K`/`⌘+K`).
- **Palco de prévia**: moldura `aria-hidden` no miolo, barra de título, tipo descritivo e nota "Esquemático", canvas `aria-hidden` e rodapé com a stack. O conteúdo é composto em HTML/CSS a partir do `schematic` do projeto, com `ol.schematic-list` e `p.schematic-foot`; tipo desconhecido ou esquema inválido cai no bloco neutro `panel`. No índice é fixo em desktop e entra dentro da linha em toque.
- **Palco estável do herói**: com esquema, `min-height: 380px` e o esquema centralizado no canvas. A altura não muda entre projetos e não há animação de altura, então o pager permanece no mesmo Y.
- **Pager manual**: dois botões de 44 × 44 px, "Prévia anterior" e "Próxima prévia", contador visível `01 / 03` em `aria-hidden` e região `aria-live="polite"` que anuncia "`<título>`, prévia N de M" após a troca. Ordem circular, sem timer ou autoplay. Com dois ou mais projetos o pager aparece; com um projeto o esquema aparece sem pager nem contador; com zero o palco fica vazio.
- **Linha de projeto**: índice, título, resumo, ano, stack, botão "Abrir" e links externos reais; hover e foco trocam a prévia do índice em 160 ms. Abaixo de 720 px o cabeçalho da prévia de linha quebra e mostra a stack inteira.
- **Filtro**: tags com `aria-pressed`, contagem `N de M` em `aria-live` e estado vazio com "Limpar filtro"; o filtro vive em `?stack=`.
- **Ficha**: folha clara em `<dialog>`, título, resumo, papel, desafio, solução, stack, ano e links clonados da linha; aberta por "Abrir" ou `#projeto/<slug>`.
- **Palette**: `<dialog>` estreito com `role="listbox"`, busca sem caixa e sem acento, setas, Home, End, Enter e Esc; bloqueada enquanto a ficha está aberta.
- **Trajetória**: `#trajetoria` entre Projetos e Sobre, com dois grupos (`h3` Experiência e Formação) e listas ordenadas. Cada item mostra período, cargo ou curso e organização; a pós-graduação leva a nota "em andamento". Não entra na navegação do cabeçalho e entra na palette por `data-section-label`.
- **Botão de tema**: nome acessível fixo "Tema papel", `aria-pressed` fiel ao tema e persistência local.
- **Contato**: `mailto:` visível e botão que copia o endereço com confirmação em `aria-live`.
- **"Ver montagem"**: botão único dentro de `.hero-foot-actions`, oculto sem JS e com movimento reduzido; a cena usa 6 cursores no desktop e 4 em telas compactas, nunca oculta conteúdo e para na primeira interação.

## Motion

Tokens únicos em `:root`: `--dur-1` 120 ms (hover, press, cor), `--dur-2` 160 ms (troca de prévia, foco), `--dur-3` 200 ms (entrada da palette), `--dur-4` 240 ms (entrada da ficha). Só `transform` e `opacity` movem; cor, borda e fundo podem transicionar. Press usa `scale(0.98)` nos botões, no pager e no botão de montagem; o link textual "Entrar em contato" responde ao press apenas com cor, sem deslocar a linha. Com `prefers-reduced-motion: reduce`, durações caem para `0.00001s`, `transform` é removido e a cena não é oferecida. Nenhuma transição anima `width`, `height`, `top`, `left`, `margin`, `padding`, `gap` ou `all`.

## Accessibility

- O palco do herói é `role="group"` com nome acessível "Prévia de projetos"; chrome, canvas e rodapé são `aria-hidden`, e o pager é a única parte focável.
- O contador visível é `aria-hidden`; a mensagem falada vem de `[data-stage-live]`.
- Botões do pager têm 44 × 44 px, `aria-label` fixo, foco visível e nunca ficam `disabled` no modo circular. O foco permanece no botão após a troca.
- A ordem de Tab segue a ordem visual: navegação, tema, ações, busca, pager, "Desça para explorar", "Ver montagem", filtros, projetos, Trajetória e contato.
- Ficha e palette contêm o foco enquanto abertas e devolvem o foco à linha ou à seção ao fechar. `Esc` fecha a camada do topo.
- A Trajetória usa lista ordenada real, sem `tabindex` e sem `role` artificial; cor não é o único diferenciador.
- Com movimento reduzido, a troca de prévia não anima, o anúncio continua e a cena não aparece.
- Sem JS: `.hero-stage`, pager, busca, filtros, tema, cópia de e-mail, fichas e "Ver montagem" ficam ocultos; perfil, projetos, Trajetória, sobre e contato continuam legíveis.

## Responsiveness

| Largura | Herói | Palco | Trajetória |
|---|---|---|---|
| 1440 px | duas colunas, nome até 136 px | 380 px de altura, pager sob o esquema | duas colunas |
| 1024 px | duas colunas, nome ~97 px, sem truncar | palco de 380 px, pager de 44 px | duas colunas |
| 768 px | uma coluna | palco abaixo do texto, 380 px de altura | uma coluna |
| 390 px | uma coluna, nome 60 px em uma linha | todos os itens, fonte 12 px, pager completo | uma coluna |

Todos os itens do esquema continuam no DOM em todas as larguras. O rótulo do esquema tem coluna de 78 px para caber "atualização". Se o espaço apertar, reduz tipografia e padding, nunca remove conteúdo nem cria rolagem interna. A barra de filtros rola na horizontal dentro do próprio contêiner em 390 px, comportamento herdado da v1.0.

## Contracts de URL e navegação

- `?stack=<slug>` filtra o índice; `?stack=` vazio remove o filtro. Voltar e Avançar restauram o estado.
- `#projeto/<slug>` abre a ficha correspondente; fechar limpa o hash e devolve o foco.
- O pager do herói não escreve na URL, não cria histórico e não controla o palco do índice.
- A palette não altera a URL; ao ativar um resultado, rola até a seção ou abre o projeto.
- O tema persiste em `localStorage`; a URL não carrega tema.

## Do's and Don'ts

- Fazer: manter a checagem `PUBLICAR=1 npm test` verde antes de publicar.
- Fazer: respeitar movimento reduzido com conteúdo pronto; manter controles operáveis por teclado e foco visível.
- Fazer: animar apenas `transform` e `opacity`; usar as durações dos tokens.
- Fazer: descrever o projeto com fatos verificáveis e manter os esquemas dentro do conteúdo permitido.
- Não fazer: alegar agentes de IA, inventar experiência, projetos, datas, métricas ou links.
- Não fazer: copiar nome, imagem, textos ou identidade visual da referência analisada.
- Não fazer: animar propriedades de layout, criar rolagem horizontal ou deixar controles flutuando sobre conteúdo.

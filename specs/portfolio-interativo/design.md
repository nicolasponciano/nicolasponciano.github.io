# Design: Portfólio interativo

## Stack

Segue a do projeto: HTML, CSS e JavaScript estáticos, sem etapas de build e sem dependências. Aprovado na Constitution. APIs nativas: `<dialog>`, History API, `localStorage`, `matchMedia`. Sem `IntersectionObserver` novo: a página não revela nada por rolagem.

Um único `<script>` inline no `<head>` (cerca de 8 linhas) lê o tema salvo, aplica `data-theme` e troca `no-js` por `js` no `<html>`, antes da primeira pintura. Nenhum outro script inline. `src/app.js` continua como módulo no fim do `<body>`.

## Dados: uma fonte por informação

Regra que resolve a duplicação atual e o funcionamento sem JS:

| Informação | Fonte única |
|---|---|
| Nome, papel-alvo, resumo, seções, textos de apoio | `index.html` |
| Projeto: título, resumo, stack, ano, links externos | `index.html`, na linha do índice |
| Projeto: papel exercido, desafio, solução, `featured`, tipo de prévia | `src/data/portfolio.js`, em `projectDetails[slug]` |
| E-mail e canais de contato | `index.html` |
| Preferência de tema | `localStorage` |

`projectDetails` é indexado por slug, não por posição:

```js
export const projectDetails = {
  "slug-do-projeto": {
    role: "[A preencher]",
    challenge: "[A preencher]",
    solution: "[A preencher]",
    featured: true,
    preview: "panel", // panel | terminal | flow
  },
};
```

Regras:
- Slug sem entrada em `projectDetails`: a ficha abre normalmente e os campos ausentes aparecem como `[A preencher]`.
- `preview` desconhecido cai em `panel`.
- `year` não existe em `projectDetails`: o ano é lido da linha do índice e clonado para a ficha, junto com título, resumo, stack e links.
- Nenhum projeto com `featured: true`: o palco do hero usa o primeiro projeto do HTML.
- Nenhum campo vira link. Links vêm de `<a>` já presentes no HTML e são clonados para a ficha.
- `src/content.js` deixa de aplicar texto por `data-content` nas seções; mantém `formatValue`, `isSafeExternalUrl` e ganha `getProjectDetails(details, slug)`, `readRowData(row)` e `fillProjectDialog(dialog, { row, details })`. O ano entra em `readRowData`, não em `details`.

## Rotas e modelo de URL

Formas canônicas, sem variações:

- `/`
- `/?stack=<slug>`
- `/#projeto/<slug>`
- `/?stack=<slug>#projeto/<slug>`

Funções puras em `src/core.js`:

| Função | Contrato |
|---|---|
| `normalizeSlug(value)` | minúsculo, sem acento, `[a-z0-9-]`, sem hífen duplicado ou nas pontas; `""` quando não sobra caractere útil |
| `parseUrlState({ search, hash })` | `{ stack: string|null, project: string|null }`; `stack` inválido vira `null`; hash fora do padrão `#projeto/<slug>` vira `null`; o hash genérico `#projetos` não é estado |
| `buildUrl({ pathname, stack, project })` | URL relativa canônica, sem `?` e sem `#` vazios, sem parâmetros extras |
| `filterProjects(items, stackSlug)` | `items` é `[{ slug, stacks: [rótulos] }]`; compara `normalizeSlug` de cada rótulo; `stackSlug` nulo devolve a lista inteira |
| `countLabel(shown, total)` | `"3 de 5"`; plural e zero são explícitos |
| `searchItems(items, query)` | substring sem caixa e sem acento; título antes de stack, stack antes de seção; devolve `[]` para query vazia |
| `resolveTheme({ stored, systemDark })` | `"paper"` ou `"ink"`; valor inválido em `stored` é ignorado |
| `resolveCloseFocus({ rowVisible })` | `{ target: "row" }` ou `{ target: "section" }` |
| `moveSelection(index, delta, length)` | índice circular; `length === 0` devolve `-1` |

### Transições de estado

| Ação | URL | Histórico | Foco |
|---|---|---|---|
| Clicar tag | `?stack=<slug>` | `pushState` | permanece na tag clicada |
| Limpar filtro | remove `stack` | `pushState` | tag "Todas" |
| Abrir ficha | `#projeto/<slug>` | `pushState`, preserva `stack` | botão fechar da ficha |
| Fechar por Esc, backdrop ou botão, ficha aberta por clique | remove hash | `history.back()` | linha de origem, se visível; senão título de `#projetos` com `tabindex="-1"` e `focus({ preventScroll: true })` |
| Fechar ficha aberta por URL direta | remove hash | `replaceState` | título de `#projetos` |
| Voltar/Avançar | o que a URL disser | apenas leitura | se a ficha fechou, linha do projeto; se abriu, botão fechar; se o filtro mudou e a linha sumiu, título de `#projetos` |
| Slug de stack inválido na carga | remove `stack` | `replaceState` | nenhum roubo de foco |
| Hash desconhecido na carga | remove hash, preserva `stack` | `replaceState` | foco no título de `#projetos` |
| URL não canônica na carga | `buildUrl(parseUrlState(location))` | um único `replaceState` antes de renderizar | nenhum |
| Filtro sem resultado | mantém `stack` | já gravado no clique | tag clicada; após limpar, tag "Todas" |

Regras de implementação:

- `applyUrlState(state)` é o único lugar que mexe em lista, contagem, `aria-pressed` e abertura da ficha. Ele não escreve URL nem histórico.
- Na carga, a primeira ação é canonicalizar: se `buildUrl(parseUrlState(location))` difere de `location.pathname + location.search + location.hash`, aplicar `replaceState` e nunca `pushState`. Correção de URL não é navegação e não deixa entrada no histórico.
- `popstate`, carga inicial e handlers de clique chamam `applyUrlState(parseUrlState(location))`. Clique primeiro escreve a URL, depois chama o mesmo caminho.
- Abrir a ficha grava `history.state = { dialog: slug }` no `pushState`. Fechar consulta esse marcador: se bater com a ficha aberta, `history.back()`; senão, `replaceState` sem hash. O marcador vive no histórico, então sobrevive a recarga e a Voltar/Avançar.
- Fechamento com rede de segurança: antes de `history.back()`, guardar o slug em `state.closing` e registrar um listener `popstate` de uso único. Se o evento chegar, o fluxo normal fecha a ficha e limpa `state.closing`. Se não chegar em `CHANGE_FALLBACK_MS = 250`, forçar o fechamento local (`dialog.close()`), limpar `state.closing` e aplicar `replaceState` sem hash. A decisão fica em uma função pura: `shouldForceClose({ popped, elapsedMs })`, com `popped === true` sempre vencendo o tempo.
- `closeProject()` é idempotente: só age se `state.closing` ou o dialog estiver aberto, para o fallback não fechar duas vezes nem roubar o foco de novo.
- Abrir a ficha usa `showModal()` sem rolar a página: `document.documentElement.style.overflow = "hidden"` com `scrollbar-gutter: stable` no `<html>`, revertido no `close`.
- O filtro não fecha ficha e não força rolagem, exceto quando o topo da lista filtrada sai da tela; nesse caso, `scrollIntoView({ block: "start", behavior: "auto" })` em `#projetos`.
- `history.scrollRestoration` fica no padrão do navegador. Nenhuma rolagem é gravada à mão.

## Páginas e componentes

Página única `index.html`: cabeçalho, hero, projetos, sobre/stack, contato, rodapé.

- Cabeçalho: âncora para conteúdo, navegação, botão de tema com nome acessível fixo "Tema papel" e `aria-pressed`.
- Hero: título, nome, resumo, duas ações (ver projetos, contato) e campo de busca. À direita, o palco de prévia do projeto `featured`. Sem lista de destaques duplicando o índice.
- Índice de trabalho: barra de filtro (tags), contagem `N de M`, lista de linhas e palco de prévia fixo em desktop.
- Linha de projeto: `<article data-project-slug="<slug>">` com índice, `<h3>`, resumo, ano, stack e dois grupos de link: `button.project-open` (abre a ficha) e os `<a>` externos que existirem. Hover e foco trocam o palco.
- Palco de prévia: moldura 4:3 `aria-hidden="true"` com grade, barra de título e composição por tipo (`panel`, `terminal`, `flow`) montada em HTML/CSS a partir de `projectDetails` e dos rótulos da linha.
- Ficha: `<dialog id="project-dialog">` em folha clara, `aria-labelledby` no título, cabeçalho com metadados, desafio, solução, stack, links clonados e fechar.
- Palette: `<dialog id="command-palette">` estreito, `aria-labelledby`, campo de busca, `role="listbox"` com `role="option"`, rodapé de atalhos.
- Contato: bloco invertido, `mailto:` visível e botão de copiar com `aria-live`.
- Barra de montagem: um único botão "Ver montagem", fora do fluxo de leitura, oculto sem JS e com movimento reduzido.

## Direção visual

Mantém o mundo aprovado (tinta `#0b1d27`, papel `#f1f0e8`, turquesa, lima, coral, Big Shoulders e Atkinson), mas troca o registro de espetáculo passivo por mesa técnica editorial.

- Hero ocupa a primeira tela com cópia à esquerda e palco à direita. Sem diagrama decorativo nem lista de destaques.
- Uma seção por tela em 1440x900, com h2 no topo e bordas alinhadas à mesma coluna.
- Linhas do índice com muito ar, tipografia display nos títulos e metadados em caixa alta. Nada de card arredondado.
- Ficha e palette são folhas de papel sobre a tinta, sempre claras. É o contraste que separa documento de interface.
- Traço de 1 px, cantos retos, sem sombra decorativa. Profundidade por plano de cor.
- Tema papel inverte o fundo para `#f1f0e8`, texto para tinta e reduz acentos ao traço; o palco de prévia vira tinta sobre papel.
- Cursores só existem dentro da cena opt-in. Fora dela, o ponteiro é o do sistema.

## Mapa de interação

| Superfície | Gatilho | Resposta | Fallback |
|---|---|---|---|
| Linha de projeto | hover (ponteiro fino) | palco troca em 160 ms | em toque, prévia inline |
| Linha de projeto | foco por teclado | mesmo palco + contorno de foco | idêntico |
| Linha de projeto | clique em "Abrir" | ficha + `pushState` | botão oculto sem JS |
| Tag de stack | clique | filtra, grava `?stack=`, anuncia contagem | barra oculta sem JS |
| Busca do hero | digitar/Enter | abre palette com o texto | campo oculto sem JS |
| `Ctrl+K` / `⌘+K` | tecla | alterna palette, exceto com ficha aberta | atalho ausente sem JS |
| Ficha | Esc/backdrop/fechar | fecha, ajusta histórico e foco | fecha nativo do `<dialog>` |
| Botão de e-mail | clique | copia e anuncia "Copiado" | `mailto:` sempre visível |
| Botão de tema | clique | alterna, persiste e atualiza `aria-pressed`; o nome acessível "Tema papel" nunca muda | segue o sistema, inclusive sem JS |
| "Ver montagem" | clique | cena de 6 a 8 s sobre conteúdo visível | botão ausente com movimento reduzido |

## Movimento

Fontes únicas de duração, em `:root`:

| Token | Valor | Uso |
|---|---|---|
| `--dur-1` | 120 ms | hover, press, cor |
| `--dur-2` | 160 ms | troca de prévia, foco |
| `--dur-3` | 200 ms | backdrop e entrada da palette |
| `--dur-4` | 240 ms | entrada da ficha |

Regras:
- Press usa `scale(0.98)`; hover não desloca nada além de 4 px de `translateY`.
- Troca de prévia: `opacity` + `translateY(4px)`, 160 ms, `--ease-out`.
- Ficha: entrada de 240 ms com `opacity` + `translateY(8px)`. A saída não anima: devolver foco não espera transição.
- Palette: entrada de 200 ms com `opacity` + `scale(0.98)`, `transform-origin` no topo do campo.
- Filtro: linhas trocam por `opacity` em 160 ms; altura nunca anima. View Transitions só dentro de `if (document.startViewTransition)`, sem depender do suporte.
- Entrada de seção: nenhuma animação ligada à rolagem.
- Movimento reduzido: sem `transform`, sem `scale`, sem cena; apenas troca imediata de estado.
- `@media (hover: hover) and (pointer: fine)` obrigatório em todo hover com movimento.

## Layout e breakpoints

- 1440: hero em duas colunas; índice com palco fixo à direita.
- 1024: palco do índice com 40% da largura; hero mantém duas colunas.
- 768: palco do índice some, prévia entra na linha, hero passa a uma coluna.
- 480: ficha e palette em tela cheia, com fechar fixo no topo.
- 390: uma coluna, ações em largura total, filtros com rolagem horizontal contida no próprio contêiner (`overscroll-behavior-x: contain`), sem rolagem horizontal na página.
- Sem rolagem horizontal em nenhum breakpoint; `min-width: 0` nos filhos flexíveis que contêm texto longo.

## Testes e verificação

Sem navegador automatizado (proibido adicionar dependência). A cobertura se divide em quatro camadas, e `npm test` continua sendo o portão de cada tarefa.

### 1. Regras puras: `tests/core.test.mjs`

- `normalizeSlug`: acento, espaço, maiúscula, hífen repetido, string vazia, entrada não-string.
- `parseUrlState`: `/`, `?stack=react`, `?stack=React%20Native`, `?stack=`, `?stack=x&utm=1`, `#projeto/foo`, `#projetos`, `#projeto/`, `#projeto/Foo`, hash com `stack` junto.
- `buildUrl`: ida e volta com `parseUrlState`; nunca produz `?` ou `#` vazios; URL não canônica de entrada gera saída diferente, para o `replaceState` da carga ser acionado.
- `filterProjects`: lista inteira, subconjunto, filtro inexistente, item sem stack.
- `countLabel`: `0 de 3`, `1 de 3`, `3 de 3`.
- `searchItems`: vazio, acento, caixa, ordem título antes de stack.
- `resolveTheme`: sem valor salvo e sistema claro, sem valor e sistema escuro, valor salvo inválido, valor salvo válido sobrepondo o sistema.
- `resolveCloseFocus`: linha visível e linha filtrada para fora.
- `shouldForceClose`: `popped === true` nunca força; sem `popstate` e abaixo de 250 ms não força; sem `popstate` e a partir de 250 ms força.
- `moveSelection`: circular para cima e para baixo, lista vazia, índice fora do intervalo.
- `getInitialAgentCount`: 6 no desktop, 4 em tela compacta (substitui o contrato de 18/8).

### 2. Contrato de arquivos: `tests/markup.test.mjs`, `tests/styles.test.mjs`, `tests/content.test.mjs`

Markup:
- Um único `<h1>`.
- `<html class="no-js">` e script inline de tema antes do CSS.
- Todo `[data-project-slug]` tem slug único e não vazio, um `h3` e um `button.project-open` com nome acessível que inclui o título do projeto.
- Existe `<dialog id="project-dialog" aria-labelledby>` e `<dialog id="command-palette" aria-labelledby>`.
- Cada tag de filtro tem `data-stack` compatível com `normalizeSlug` e `aria-pressed` inicial.
- Nenhum `href="javascript:"` e nenhum link externo sem `rel="noopener"`.
- Contato contém `mailto:` visível.

CSS:
- Não existe regra que aplique `opacity: 0` a `[data-build]` ou a seções em estado de montagem (substitui o teste de "blocos não montados ficam ocultos").
- Todo seletor com `:hover` que move algo está dentro de `@media (hover: hover) and (pointer: fine)` (substitui o teste de hover estilo editor).
- Existem regras `html.no-js` que ocultam `.project-open`, `.filter-bar`, `.hero-search`, `#theme-toggle`, `#copy-email`, `#scene-button`.
- Existe bloco `@media (prefers-color-scheme: light)` que aplica papel quando `html` não tem `data-theme`.
- Bloco de movimento reduzido zera `transition-duration`/`animation-duration` e remove `transform` dos componentes novos.
- Nenhum `transition: all`, e nenhuma transição de `width`, `height`, `top`, `left`, `margin` ou `padding`.
- Ficha e palette têm regra de tela cheia em `max-width: 480px`.

Conteúdo:
- `projectDetails` tem chave para todo slug do HTML e `preview` em `panel|terminal|flow`; `year` não existe nos dados.
- `formatValue` e `isSafeExternalUrl` mantêm o contrato atual.
- `getProjectDetails` devolve `[A preencher]` para chave e campo ausentes.
- Sai o teste de `getProjectLinks` e entra teste de que título, resumo, stack, ano e links vêm do HTML clonado (função `readRowData(row)` com `row` falso).

### 3. Publicação: `tests/publicacao.test.mjs`

Arquivo novo, rodado só quando a variável `PUBLICAR=1` existe. No `npm test` padrão os casos aparecem como `skip`, para o desenvolvimento com placeholders continuar verde.

- Falha se `index.html` ainda contiver `[A preencher]`, `[Nome do projeto]`, `[Problema e solução]`, `[Tecnologias]`, `Links a preencher` ou `mailto:` sem endereço.
- Falha se `projectDetails` tiver valor `[A preencher]`, chave vazia ou chave sem projeto correspondente no HTML.
- Falha se todo projeto continuar sem ano ou sem stack.
- Passa apenas com conteúdo real em todos os projetos.

### 4. Verificação manual no navegador

Checklist em `verificacao.md`, executada nas tarefas T-06, T-07, T-11 e T-12: modais, teclado, histórico, responsividade, acessibilidade e modo sem JS. Cada item é marcado com navegador, largura e resultado.

## Decisões técnicas

- Conteúdo visível por padrão; o estado `page-building` deixa de existir. Motivo: o problema medido foi atraso de até 70 s.
- HTML como fonte do conteúdo visível e `projectDetails` apenas com o que a linha não carrega. Motivo: elimina a duplicação atual entre HTML e `data.js` e faz o modo sem JS funcionar sem segunda cópia.
- `<dialog>` nativo para ficha e palette. Motivo: foco preso, Esc e top layer sem biblioteca.
- Um marcador `{ dialog: slug }` em `history.state` decide entre `history.back()` e `replaceState` ao fechar. Motivo: evita a armadilha de precisar de dois Voltar e sobrevive a recarga.
- Filtro em `?stack=` com `pushState`; normalização de URL inválida com `replaceState`. Motivo: Voltar desfaz o filtro, mas corrigir a URL não cria histórico.
- Prévia composta em DOM/CSS a partir dos dados da linha e de `projectDetails`. Motivo: não há imagens reais e um placeholder vazio quebraria a regra de "todo visual desenha".
- Saída de modal sem animação. Motivo: devolver foco e histórico não pode esperar transição.
- Zero dependências novas. Motivo: Constitution e custo de manutenção.
- `localStorage` guarda apenas `portfolio-theme`, sempre com `try/catch`. Nenhum dado pessoal é coletado.
- URL não canônica é corrigida com `replaceState` antes da renderização. Motivo: `pushState` na carga faria o primeiro Voltar parecer quebrado.
- Fechamento da ficha tem rede de segurança de 250 ms (`shouldForceClose`) para o caso de `history.back()` não emitir `popstate`. Motivo: histórico inconsistente e navegador antigo não podem deixar o modal preso nem a URL suja.
- Checagem de publicação opt-in em `tests/publicacao.test.mjs`, acionada por `PUBLICAR=1`. Motivo: `[A preencher]` não pode chegar ao site publicado, e o `npm test` precisa continuar verde durante o desenvolvimento.

## Riscos e dependências

- Sem dados reais, as prévias blueprint podem parecer decorativas; mitigar com metadados reais na moldura (stack, ano, papel), e a checagem de publicação bloqueia a entrega.
- Dois caminhos de fechamento (histórico, `replaceState` e fallback) são a maior fonte de bug; cobrir com os testes de `parseUrlState`/`buildUrl`/`shouldForceClose` e com os itens 5, 6, 27 e 28 do checklist manual.
- Enquanto o HTML não tiver links reais, a ficha mostra "Links a preencher", o que é esperado e não é bug.
- Contraste no tema claro é o principal risco visual; medir os pares de cor antes de fechar.
- A cena de montagem reutiliza o motor atual; se a adaptação passar de uma tarefa, cortar a cena e manter o botão fora.
- `<dialog>` em navegador antigo: aceitar conteúdo aberto com botão fechar visível; testar em Chromium atual.

## Referências de inspiração

Ver `referencias.md` na mesma pasta.

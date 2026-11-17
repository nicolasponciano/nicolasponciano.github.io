---
version: 2
slug: "index-html"
primary_target: "index.html"
related_targets:
  - "src/styles.css"
  - "src/app.js"
  - "src/core.js"
  - "src/content.js"
  - "src/data/portfolio.js"
---

## Scope
Página única de portfólio pessoal full stack. Modo Experience: o trabalho visual lidera a primeira viewport, mas o conteúdo é legível de imediato. Público confirmado: recrutadores/equipes técnicas em avaliação de candidatura. Ação principal: explorar projetos; ação secundária: contato.

## Direction contract

THESIS: a página é uma mesa técnica editorial que se deixa inspecionar; o índice abre fichas, o filtro compartilha estado pela URL e a montagem por cursores existe como demonstração opt-in, não como pedágio de leitura.

OWN-WORLD: caderno técnico de alto contraste, fundo azul-petróleo profundo (#0B1D27), papel claro (#F1F0E8), texto tinta (#0B1D27), acentos turquesa (#55D6BE), amarelo-lima (#D7EF70) e coral (#FF896F). Tipografia de display condensada e sans de leitura, com mono apenas em metadados. Cantos retos, hairlines de 1 px, folhas claras sobre a tinta. Cursores multicoloridos próprios; não copiar retrato, marca, texto nem nomes da referência.

STORY: a pessoa entende que é um portfólio full stack, vê o índice de projetos com prévia, filtra por stack, abre a ficha de um projeto, encontra o contato e pode assistir à montagem se quiser. Qualquer dado pessoal não fornecido fica como [A preencher] e a publicação fica bloqueada.

FIRST VIEWPORT: navegação curta no topo com marca, Projetos, Sobre, Contato e botão de tema; hero em duas colunas com título, nome, resumo, duas ações e busca que abre a palette, palco de prévia do projeto destacado à direita e link "Desça para explorar". A primeira seção de projetos começa abaixo da dobra. O botão "Ver montagem" flutua no canto inferior direito, oculto sem JS e com movimento reduzido; não há barra de reprodução.

## States and surfaces

- Índice: linhas com prévia no palco fixo (hover e foco, 160 ms) ou dentro da linha em toque; filtro por stack com `?stack=`, contagem `N de M` e estado vazio com "Limpar filtro".
- Ficha: `<dialog>` em folha clara, aberta por "Abrir" ou por `#projeto/<slug>`, com `history.state` marcando a entrada e devolução de foco à linha.
- Palette: `<dialog>` com `role="listbox"`, `Ctrl+K`/`⌘+K`, busca sem caixa e sem acento, setas, Home, End, Enter e Esc; bloqueada com a ficha aberta.
- Temas: tinta (padrão do sistema escuro) e papel, persistidos em `localStorage`; ficha e palette sempre claras.
- Sem JS: busca, filtro, contagem, tema, copiar, "Abrir" e "Ver montagem" ocultos; hero, projetos com ano/stack, sobre e contato com `mailto:` continuam legíveis; o tema segue `prefers-color-scheme`.

FORM: direção de interação definida pelo usuário na spec aprovada. Code-first aprovado. Sem concept-seed porque a direção foi explicitamente escolhida; a referência REA serve como evidência do mecanismo de cursores, não como material a copiar. FINISH: revisão de acabamento registrada em `specs/portfolio-interativo/verificacao.md`; textos reais pendentes.

## Constraints and open content
Sem agentes de IA, serviços externos ou backend. Movimento reduzido e fallback sem JavaScript obrigatórios. Conteúdo de perfil, tecnologias, projetos e links ainda não fornecido: `index.html` e `projectDetails` mantêm `[A preencher]`, `[Nome do projeto]`, `[Tecnologias]` e "Links a preencher". Hospedagem não definida. A checagem `PUBLICAR=1 npm test` falha de propósito enquanto houver placeholder e é obrigatória antes de publicar.

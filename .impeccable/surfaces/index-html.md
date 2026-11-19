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
Página única de portfólio pessoal full stack, publicada em https://nicolasponciano.github.io/. Modo Experience: o trabalho visual lidera a primeira viewport, mas o conteúdo é legível de imediato. Público confirmado: recrutadores e equipes técnicas em avaliação de candidatura. Ação principal: explorar projetos; ação secundária: contato.

## Direction contract

THESIS: a página é uma mesa técnica editorial que se deixa inspecionar; o herói identifica a pessoa, as prévias mostram o que cada projeto faz, o índice abre fichas, o filtro compartilha estado pela URL.

OWN-WORLD: caderno técnico de alto contraste, fundo azul-petróleo profundo (#0B1D27), papel claro (#F1F0E8), texto tinta (#0B1D27), acentos turquesa (#55D6BE), amarelo-lima (#D7EF70) e coral (#FF896F). Tipografia de display condensada e sans de leitura, com mono apenas em metadados. Cantos retos, hairlines de 1 px, folhas claras sobre a tinta. Cursores multicoloridos próprios; não copiar retrato, marca, texto nem nomes da referência.

STORY: a pessoa vê primeiro o nome e o papel, entende que é um portfólio full stack, examina as prévias conceituais dos três projetos, filtra por stack, abre a ficha, percorre a Trajetória, encontra o contato.

FIRST VIEWPORT: navegação curta no topo com marca, Projetos, Sobre, Contato e botão de tema; herói em duas colunas. Na coluna de cópia, nesta ordem: kicker "Desenvolvedor de Software Full Stack", `h1` "Nicolas Ponciano" dominante, resumo, três fatos verificáveis, duas ações e busca que abre a palette. Na coluna direita, palco de prévia do projeto em destaque, com título, tipo, nota "Prévia conceitual", propósito, quatro capacidades numeradas, stack e pager de anterior/próximo com contador. No rodapé do herói, "Interfaces, serviços e dados", link "Desça para explorar". A primeira seção de projetos começa abaixo da dobra.

## States and surfaces

- Herói: prévia inicial é o projeto `featured`; o pager troca em ordem circular, anuncia "`<título>`, prévia N de M" em `aria-live` e mantém o foco no botão; sem autoplay e sem mudança de URL.
- Palco do herói: altura útil comum aos três projetos em cada faixa de largura, determinada pelo conteúdo mais alto e medida no navegador (cerca de 520 px até 400 px, 486 px entre 401 e 650 px, 410 px entre 651 e 768 px, 486 px entre 769 e 1439 px e 432 px a partir de 1440 px); o pager não se desloca ao trocar de projeto e nada é cortado. Com um projeto não há pager; com zero o palco fica vazio.
- Índice: linhas com prévia no palco fixo (hover e foco, 160 ms) ou dentro da linha em 768 px ou menos; filtro por stack com `?stack=`, contagem `N de M` e estado vazio com "Limpar filtro".
- Ficha: `<dialog>` em folha clara, aberta por "Abrir" ou por `#projeto/<slug>`, com `history.state` marcando a entrada e devolução de foco à linha.
- Palette: `<dialog>` com `role="listbox"`, `Ctrl+K`/`⌘+K`, busca sem caixa e sem acento, setas, Home, End, Enter e Esc; bloqueada com a ficha aberta.
- Trajetória: `#trajetoria` entre Projetos e Sobre, com Experiência e Formação em listas ordenadas; período, cargo/curso e organização em texto; a pós-graduação indica "em andamento".
- Temas: tinta (padrão do sistema escuro) e papel, persistidos em `localStorage`; ficha e palette sempre claras.
- Movimento reduzido: troca de prévia instantânea, sem animação de entrada.
- Sem JS: busca, filtro, contagem, tema, copiar, "Abrir", prévias do herói, do índice e da linha ocultos; perfil, projetos com ano/stack, Trajetória, sobre e contato com `mailto:` continuam legíveis; o tema segue `prefers-color-scheme`.

FORM: direção de interação definida pelo usuário na spec aprovada. Code-first aprovado. Sem concept-seed porque a direção foi explicitamente escolhida; a referência REA serve como evidência do mecanismo de cursores, não como material a copiar. FINISH: revisão de acabamento e medições de 2026-11-17 registradas em `specs/portfolio-interativo/verificacao.md` (v1.0) e `specs/portfolio-v1-1/` (v1.1).

## Constraints and open content
Sem agentes de IA, serviços externos, backend, analytics ou dependências de execução. Conteúdo real de perfil, tecnologias, projetos, trajetória e contato já publicado. Movimento reduzido e fallback sem JavaScript obrigatórios. A checagem `PUBLICAR=1 npm test` não encontra placeholders e é obrigatória antes de publicar. Layout verificado em 390, 768, 1024 e 1440 px, sem rolagem horizontal; contraste mínimo de 5,53:1 no tema papel e 6,61:1 no tema tinta.

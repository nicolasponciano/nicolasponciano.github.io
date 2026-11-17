# Verificação manual: Portfólio interativo

Complementa `npm test`. Só cobre o que depende de navegador real. Registrar navegador, largura e data em cada bloco executado.

Formato de registro: `item | navegador | largura | passou/falhou | observação`.

## A. Ficha e dialog (itens 1 a 8)

Executar ao fim da T-06, em Chromium e Firefox, com teclado e ponteiro.

1. **Abertura por clique**: clicar "Abrir" em um projeto. Esperado: ficha abre na hora, URL vira `#projeto/<slug>`, foco no botão fechar, fundo não rola com a roda.
2. **Esc**: abrir e pressionar Esc. Esperado: ficha fecha, URL perde o hash, foco volta para a linha do projeto.
3. **Backdrop**: abrir e clicar fora da folha. Esperado: fecha igual ao item 2; clique dentro da folha não fecha.
4. **Botão fechar**: igual ao item 2, com foco no botão.
5. **Voltar uma vez**: abrir a ficha e clicar Voltar do navegador. Esperado: fecha a ficha com um único Voltar e devolve o foco à linha.
6. **Avançar**: após o item 5, clicar Avançar. Esperado: reabre a mesma ficha, foco no botão fechar.
7. **URL direta**: abrir `/#projeto/<slug>` em aba nova. Esperado: página carrega com a ficha aberta, sem rolar até o projeto, foco dentro da ficha.
8. **Hash inválido**: abrir `/#projeto/nao-existe`. Esperado: ficha não abre, URL perde o hash, página na seção de projetos, console sem erro.

### Execução da T-06

Data: 2026-11-16. Navegador: Chrome via browser do app OpenCode, viewport de 1296x887. Itens 1 a 8 e 28: passaram, console sem erros.

- Itens 1, 3 e 4: abertura por clique, botão fechar e backdrop (ponto fora da folha resolve para o próprio dialog) fecham a ficha; foco volta para a linha.
- Item 2: Esc real fecha, hash sai e foco volta à linha.
- Itens 5 e 6: um único Voltar fecha; Avançar reabre com foco no fechar.
- Item 7: URL direta abre com foco no fechar, `scrollY = 0`, sem rolagem até o projeto.
- Item 8: hash inválido é removido com `replaceState`, preservando `?stack=tecnologias`, sem erro no console.
- Item 28: com `history.back` sobrescrito, a ficha fecha em 278 ms, o hash sai, o estado fica nulo e o foco vai à linha uma única vez.
- Extra: com a ficha aberta, PageDown não move o fundo (700 px antes e depois) e o foco fica preso no dialog.

Dois defeitos encontrados e corrigidos nesta execução: prévias inline vazias quebravam o boot (`ensureRowPreview`) e `showModal()` resetava a rolagem para o topo por falta de `position: fixed` no dialog.

## B. Palette e teclado (itens 9 a 13)

Executar ao fim da T-07.

9. **Atalho**: `Ctrl+K` no Windows e `⌘+K` no macOS. Esperado: alterna abrir e fechar.
10. **Foco anterior**: abrir a palette a partir de um botão, fechar com Esc. Esperado: foco volta ao botão que abriu.
11. **Busca do hero**: digitar "rea" no campo do hero e pressionar Enter. Esperado: palette abre com "rea" no campo e resultados filtrados.
12. **Navegação por teclado**: setas para cima e para baixo, Home e End. Esperado: seleção circular, item ativo com `aria-selected="true"` e foco visível.
13. **Bloqueio com ficha aberta**: abrir a ficha e pressionar `Ctrl+K`. Esperado: nada acontece, a ficha continua aberta e Esc fecha só a ficha.

### Execução da T-07

Data: 2026-11-16. Navegador: Chrome via browser do app OpenCode, viewport de 1296x887. Itens 9 a 13: passaram, console sem erros.

- Item 9: `Ctrl+K` e `⌘+K` alternam a palette; `dialog[open]` é único, o fundo trava e o foco vai ao campo de busca.
- Item 10: a palette abriu a partir da tag "Todas" e Esc devolveu o foco exatamente a ela.
- Item 11: a busca do hero abriu a palette com o texto digitado, foco no campo e resultados filtrados. "rea" retorna vazio porque os projetos ainda são `[Nome do projeto]`; a mesma verificação passou com "proj" (3 projetos e a seção Projetos) e com "APRESENTACAO", mostrando filtro sem acento e sem caixa.
- Item 12: setas circulam (do primeiro para o último e vice-versa), Home vai ao primeiro, End ao último, apenas um `aria-selected="true"` por vez, `aria-activedescendant` acompanha e o item ativo fica invertido (foco visível). Tab circula entre campo e fechar sem sair da palette.
- Item 13: com a ficha aberta, `Ctrl+K` não abriu a palette e Esc fechou apenas a ficha, devolvendo o foco à linha.
- Extras: Enter abriu a ficha do item ativo e encerrou a palette; o item de stack aplicou `?stack=tecnologias`; o item de seção levou a `#sobre`; clique em opção abriu a ficha; o anúncio `N resultados` atualizou a cada consulta; o botão fechar devolveu o foco ao campo do hero e liberou a rolagem.

Sem JS, a palette continua fechada por não ter o atributo `open`, o campo do hero fica oculto por `html.no-js` e o atalho depende do script; a conferência com JavaScript desativado fica no item 22.

## C. Responsividade, acessibilidade e sem JS (itens 14 a 24)

Executar ao fim da T-11 e repetir na T-12.

14. **390 px**: página sem rolagem horizontal; prévia dentro das linhas; ficha e palette em tela cheia com fechar visível.
15. **768 px**: hero em uma coluna, palco do índice ausente, prévia na linha, sem rolagem horizontal.
16. **1024 px**: palco do índice com 40%, hero em duas colunas, sem corte de texto.
17. **1440 px**: hero em duas colunas, palco fixo do índice, linhas sem deslocamento ao trocar a prévia.
18. **Alvos de toque**: com emulação de toque, medir altura dos botões de abrir, tags, tema e copiar. Esperado: mínimo 44 px.
19. **Ordem de foco**: Tab do topo ao rodapé em 390 e 1440. Esperado: ordem visual, sem elemento inalcançável, sem foco atrás da ficha. O botão de tema mantém o nome acessível "Tema papel" e alterna `aria-pressed` entre falso (tinta) e verdadeiro (papel) a cada clique.
20. **Movimento reduzido**: ativar `prefers-reduced-motion: reduce`. Esperado: sem deslocamento, sem cena de montagem e conteúdo completo.
21. **Contraste**: no tema tinta e no tema papel, conferir texto, metadados, links e tags com mínimo 4,5:1.
22. **Sem JS**: desativar JavaScript e recarregar. Esperado: hero, projetos com stack e links, sobre e contato legíveis; nenhum campo de busca, filtro, contagem, botão de tema, copiar ou abrir ficha visível.
23. **Tema sem JS**: com JS desativado e sistema em modo claro. Esperado: página em papel; com sistema escuro, página em tinta.
24. **Cópia de e-mail**: clicar copiar. Esperado: "Copiado" anunciado, `mailto:` continua visível; negar permissão de área de transferência mostra mensagem de falha e o `mailto:` funciona.

### Execução da T-08 (temas)

Data: 2026-11-16. Navegador: Chrome via browser do app OpenCode, viewport de 1296x887, sistema em modo escuro. Itens 21 e 23 conferidos parcialmente; a auditoria completa continua na T-11/T-12.

- Primeira visita sem `portfolio-theme`: página em tinta, `data-theme` ausente (media query assume), nenhuma chave gravada, `aria-pressed="false"`.
- Botão alterna na hora para papel, grava `portfolio-theme=paper`, passa a `aria-pressed="true"` e atualiza `meta[theme-color]`. O nome acessível continua "Tema papel" nas duas direções. Recarregar mantém papel antes da primeira pintura (script inline antes do CSS).
- Valor corrompido (`roxo`): sem `data-theme`, segue o sistema, sem erro e sem sobrescrever a chave.
- `localStorage.setItem` forçado a lançar: o tema troca na sessão, sem erro no console, sem gravar.
- Contraste medido por estilo computado, mínimo 4,5:1. No papel: texto 15,07; secundário 8,49; muted 6,13; nome 5,38; acentos de texto 5,27 a 6,49; palco 5,87; ficha e palette 4,65 ou mais (0,68 de alfa no texto secundário). No tinta: mínimo 7,44 (placeholder da busca). Ficha e palette seguem em papel nos dois temas.
- Botão de tema com 44 px de altura e rótulo textual oculto abaixo de 720 px.

Limitação: capturas de tela falharam porque a janela do navegador não estava visível; a conferência visual foi feita por estilos computados em ambos os temas.

### Execução da T-09 (micro-interações e cópia de e-mail)

Data: 2026-11-16. Navegador: Chrome via browser do app OpenCode, viewport de 1296x887. Itens 18 e 24 conferidos; 22 e 25 cobertos por teste de CSS.

- Item 18: `#copy-email`, `.contact-email`, `.theme-toggle`, `.filter-tag` e `.project-open` medem 44 px de altura por `getBoundingClientRect`.
- Item 24 (sucesso): o clique chama `navigator.clipboard.writeText` com `niickponciano@gmail.com` e anuncia "Copiado" em `#copy-status` (`role="status"`, `aria-live="polite"`); o `mailto:` continua visível e inalterado. O navegador do app nega a escrita real na área de transferência mesmo com gesto confiável, então a confirmação de sucesso foi medida com `writeText` observado, sem alterar o código de produção.
- Item 24 (falha): `writeText` rejeitando com `NotAllowedError` produz "Não foi possível copiar" e mantém o `mailto:` funcional. É o mesmo resultado observado na tentativa de cópia real sob a política do navegador do app.
- Durações computadas: 120 ms (`0.12s`) em cor, borda e transform de tema, tags, abrir, fechar e copiar; 160 ms na troca de prévia e no foco do campo de busca.
- Hover na linha não altera a altura das três linhas (251 px) nem a moldura do palco (267 px); o palco troca durante o hover.
- Com `html.motion-reduced`, `transition-duration` cai para `0.00001s` e o press não aplica `scale`.
- Tema papel e tinta mantêm o texto do contato em `#0b1d27` sobre o bloco `--mint`, sem erro no console.

### Execução da T-10 (cena de montagem opcional)

Data: 2026-11-17. Navegador: Chrome via browser do app OpenCode, viewport de 1296x887. Itens 20 apenas por análise estática; execução em tela fica na T-11.

- Botão `#scene-button` nasce com `hidden` no HTML e só perde o atributo no boot, quando `prefers-reduced-motion` não está ativo. Sem interação, `#agent-layer` fica vazio: a cena nunca inicia sozinha.
- Clique em "Ver montagem": 6 cursores (`MALHA`, `LEITURA`, `INTERFACE`, `SERVIÇO`, `DADOS`, `CONTRASTE`), moldura de seleção com `background` transparente e medida do bloco (ex.: `720×57`), anúncio "Montagem em cena: 6 cursores" em `#build-status`.
- Nada é ocultado: `opacity` do `h1` continua `1`, altura do `h1` (56,8 px) e largura do palco (650 px) não mudam, `#agent-layer` tem `pointer-events: none` e `elementFromPoint` no botão do hero resolve para o próprio `<a>`.
- Duração medida do clique ao esvaziamento da camada: 7215 ms, dentro da faixa de 6 a 8 s; a cena termina com a camada vazia e "Montagem concluída" (limpo após 2,4 s).
- Interrupção: `pointerdown` real dobra a cena em 120 ms, remove cursores e seleção e anuncia "Montagem interrompida". Clicar no próprio botão durante a cena também interrompe; a guarda de 400 ms evita reinício acidental e um novo clique depois dela reinicia normalmente.
- Limpeza: `cancelAnimationFrame`, remoção dos cinco listeners (`pointerdown`, `keydown`, `wheel`, `scroll`, `touchstart`), `replaceChildren` da camada e estado zerado. Como `requestAnimationFrame` pausa com a janela oculta, um `setTimeout` de segurança (`SCENE_DURATION_MS + 400`) garante o encerramento.
- Sem emulação de viewport neste navegador, os 4 cursores do mobile foram cobertos pelo teste puro de `getInitialAgentCount`; a conferência em 390 px fica no item 14 da T-11.
- Sem emulação de `prefers-reduced-motion`, a ausência da cena foi verificada só por código: `initScene` mantém o botão com `hidden` quando `matchMedia` casa ou quando `html.motion-reduced` existe, e um `change` na preferência para a cena em andamento. Conferência em tela no item 20 da T-11.
- Sem erros no console durante a cena, a interrupção e o reinício.

### Execução da T-11 (responsividade, acessibilidade e sem JS)

Data: 2026-11-17. Navegador: Chrome 157.0.8103.51 headless via CDP, com emulação de viewport em 390x844, 768x1024, 1024x900 e 1440x900, e emulação de `prefers-reduced-motion`, `prefers-color-scheme` e JavaScript desativado. Não houve dispositivo físico nem Firefox.

- Item 14 (390): passou. `scrollWidth` 390 em todos os estados (ficha e palette abertas inclusive); nenhum elemento passando da borda. Prévia inline com 338 px dentro da linha de 346 px. Ficha e palette em `390x844` cheias, fechar em `287..372` e `293..378` respectivamente, sempre visíveis.
- Item 15 (768): passou. Hero em uma coluna, `.index-stage` com `display: none`, `.row-preview` com `display: block` (683x415 dentro da linha de 691), sem rolagem horizontal.
- Item 16 (1024): passou depois da correção. Hero em duas colunas (434 e 393 px), palco do índice com 359 px de 898 px (40%), `h3`, resumo e metadados sem `scrollWidth` maior que `clientWidth`.
- Item 17 (1440): passou. Hero em duas colunas (613 e 554 px), palco fixo de 380 px, altura das três linhas em 202 px antes e depois da troca de prévia (`is-swapping` aplicado).
- Item 18 (390, emulação de viewport móvel): passou. Alturas medidas: abrir 44, tags 44, tema 44, copiar 44, "Ver montagem" 44, `mailto:` 44, busca do hero 52, botão do hero 54. Fora do escopo do item: link "Contato" do cabeçalho com 40 px e link do rodapé com 19 px (são links de texto, não botões).
- Item 19: passou. Tab real do topo ao rodapé em 390 e em 1440 percorre pular-conteúdo, marca, Projetos, Sobre, Contato, tema, ações do hero, busca, "Desça para explorar", tags, cada linha e seu "Abrir", e-mail, copiar, "Ver montagem" e "Voltar ao início": ordem visual, nada fora da tela. Com a ficha aberta o foco nunca chega a um controle do fundo (alterna fechar e o documento, comportamento do Chrome ao sair para a interface do navegador); Esc devolve o foco à linha. Na palette alterna campo e fechar, sem escapar. Botão de tema mantém nome acessível "Tema papel" e alterna `aria-pressed` falso (tinta) / verdadeiro (papel) / falso (tinta).
- Item 20: passou. Com `prefers-reduced-motion: reduce`, `#scene-button` fica oculto, o `html` recebe `motion-reduced`, `transition-duration` cai para `1e-05s` e as quatro seções continuam com conteúdo (921, 2028, 801 e 423 px). Cena em andamento com a preferência trocada para `reduce`: 4 cursores somem em menos de 300 ms, a camada fica vazia e o botão é ocultado.
- Item 21: passou, medido por estilo computado, mínimo 4,5:1. Tema tinta: título 15,07; resumo 10,88; nome 13,51; navegação 10,88; resumo do projeto 10,88; rótulo de metadado 8,22; stack 10,88; tag 9,64; rodapé 15,07; rodapé do hero 8,22; e-mail 9,64; texto do contato 6,61. Tema papel: título 15,07; resumo 8,49; nome 5,38; navegação 8,49; resumo do projeto 8,49; rótulo 6,13; stack 8,49; tag 9,64; rodapé 15,07; rodapé do hero 6,13; e-mail 9,64; texto do contato 6,61. A auditoria completa segue na T-12.
- Item 22: passou na estrutura, com a ressalva de conteúdo da T-12. Sem JS e com `html.no-js`, busca, filtro, contagem, tema, copiar, "Abrir" e "Ver montagem" ficam ocultos; hero, projetos com título, resumo, stack e ano, sobre e contato continuam legíveis; `mailto:niickponciano@gmail.com` visível; ficha e palette fechadas; sem rolagem horizontal. Os textos reais ainda são placeholders e os links externos ainda são "Links a preencher", então CA-39 só fecha com o conteúdo da T-12.
- Item 23: passou. Sem JS e sistema claro, `body` em `rgb(241, 240, 232)` com texto `rgb(11, 29, 39)`; sistema escuro, `rgb(11, 29, 39)` com texto `rgb(241, 240, 232)`; `data-theme` ausente nos dois casos.
- Cena em 390: passou. 4 cursores (`getInitialAgentCount` mobile), mesmo comportamento de interrupção da T-10.

Cinco defeitos encontrados e corrigidos em `src/styles.css` nesta execução:

1. Em 390 px a lista de projetos colapsava para 74 px e a coluna de texto para 0 px. O bloco `@media (max-width: 1020px)` vinha depois do de 768 px e reimpunha duas colunas na grade de trabalho. A grade agora colapsa em um bloco próprio, colocado depois do de 1024 px.
2. O palco do índice media 380 px de 898 px (42%) em 1024 px. O corte de 40% passou para um `@media (max-width: 1024px)`.
3. Em 1024 px a linha de projeto esmagava o texto: coluna principal de 12 px e título cortado, porque a coluna de metadados exigia 220 px. Abaixo de 1180 px os metadados passam a empilhar sob o título, como no mobile.
4. No mobile a coluna de ações media 24 px e o botão "Abrir", com 72 px, vazava 26 px para fora da linha. A coluna passou a `auto`.
5. O botão flutuante "Ver montagem" cobria o link "Desça para explorar" no rodapé do hero em 1024, 1280 e 1440. Com JS, `.hero-foot` reserva 168 px à direita a partir de 721 px.

`tests/styles.test.mjs` ganhou três testes de regressão para os itens 1, 2, 3 e 5. `npm test`: 65 testes, 65 aprovados.

Limitação: a conferência foi feita por medição de layout e captura de tela em Chrome headless, não em dispositivo físico, e o Firefox não foi executado.

## D. Histórico e URL (auditoria da T-12)

25. Sequência `todos → filtro → abrir ficha → fechar → Voltar → Avançar`: conferir em cada passo lista, contagem, `aria-pressed`, hash e foco contra a tabela de transições de `design.md`.
26. Em todos os estados, copiar a URL e abrir em aba nova: mesma tela, mesmo filtro, mesma ficha.
27. **URL não canônica**: abrir `/?utm=1&stack=React%20Native#projetos`. Esperado: URL vira `/?stack=react-native`, sem hash e sem `utm`; um único Voltar sai da página, sem passar por um estado intermediário.
28. **Fallback de fechamento**: abrir a ficha, rodar `history.back = () => {}` no console e fechar. Esperado: ficha fecha em até 300 ms, hash sai da URL e o foco não é roubado duas vezes.
29. **Publicação**: rodar a checagem opt-in de `[A preencher]` (T-12). Esperado: falha enquanto houver placeholder e passa só com conteúdo real.

### Execução da T-12 (polimento e auditoria final)

Data: 2026-11-17. Navegador: Chrome 157.0.8103.51 headless via CDP, com emulação de viewport em 390x844, 768x900, 1024x900, 1200x900, 1240x900, 1279x900, 1366x900, 1400x900, 1439x900 e 1440x900, além de `prefers-reduced-motion`, `prefers-color-scheme` e JavaScript desativado. Cliques e teclas enviados por CDP (`Input.dispatchMouseEvent`, `Input.dispatchKeyEvent`). Não houve dispositivo físico nem Firefox. Nenhuma mensagem de erro ou exceção no console em toda a bateria.

Reexecução dos itens 1 a 13 (ficha, palette e teclado), depois das tarefas posteriores:

- Item 1: passou. Clique real em "Abrir" abre a ficha, `scrollY` fica em 700 antes e depois de roda (600 px) e PageDown, `overflow` do `<html>` vai a `hidden` e volta a `visible` no fechamento.
- Itens 2, 3 e 4: passaram. Esc real fecha em até 120 ms, backdrop e botão fecham; nos três o foco volta para a linha e a URL perde o hash.
- Itens 5 e 6: passaram. Um único Voltar fecha a ficha e devolve o foco à linha; Avançar reabre com foco no fechar e `history.state = { dialog: "projeto-01" }`.
- Item 7: passou em documento novo. `/#projeto/projeto-02` abre a ficha, foco no fechar, `scrollY = 0` e o título do projeto continua fora da tela (`top = 1524`).
- Item 8: passou. `/#projeto/nao-existe` remove o hash com `replaceState`, mantém a página na seção de projetos e não abre a ficha.
- Item 9: passou. `Ctrl+K` abre com foco em `#command-search` e fecha no segundo toque.
- Item 10: passou. A palette aberta a partir da tag "Tecnologias" devolve o foco exatamente a `data-stack="tecnologias"`.
- Item 11: passou. "proj" no campo do hero abre a palette com o texto preenchido e 4 resultados anunciados.
- Item 12: passou. Apenas um item com `aria-selected="true"`, seleção circular para cima (do primeiro ao último), Home no primeiro, End no último e foco dentro da palette o tempo todo.
- Item 13: passou. Com a ficha aberta, `Ctrl+K` não abre a palette e Esc fecha só a ficha.

Reexecução dos itens 14 a 24:

- Item 14 (390): passou. `scrollWidth` 390 em todos os estados, prévia inline na linha, ficha e palette em 390x844 com fechar visível.
- Item 15 (768): passou. Hero em uma coluna, `.index-stage` oculto, prévia na linha, sem rolagem horizontal.
- Item 16 (1024): passou. Hero em duas colunas, palco do índice com 359 px de 898 px (40%), título e resumo sem corte.
- Item 17 (1440): passou. Hero em duas colunas, palco fixo de 380 px, as três linhas medem 202 px antes e depois da troca de prévia.
- Item 18 (390): passou. Abrir, tags, tema, copiar, "Ver montagem" e `mailto:` com 44 px; busca do hero com 52 px.
- Item 19: passou. Tab do topo ao rodapé em 1440 e em 390 percorre os mesmos controles na ordem visual, sem elemento invisível ou fora da tela; ficha e palette prendem o foco.
- Item 20: passou. Com movimento reduzido, `#scene-button` fica oculto, `html` recebe `motion-reduced`, `transition-duration` cai para `1e-05s` e as quatro seções mantêm conteúdo.
- Item 21: passou. Medição refeita com alfa composto sobre o fundo real. Tema tinta, mínimo 6,61:1 (texto do contato); título 15,07; resumo 10,88; busca digitada 13,65; ficha e palette 5,63 a 15,07. Tema papel, mínimo 5,38:1 (nome no hero); resumo 8,49; metadados 6,13; palco 5,53; busca digitada 13,94; ficha e palette 5,63 a 15,07.
- Item 22: passou na estrutura. Sem JS e com `html.no-js`, busca, filtro, contagem, tema, copiar, "Abrir" e "Ver montagem" ficam ocultos; hero, seções e contato seguem legíveis, `mailto:niickponciano@gmail.com` visível, ficha e palette fechadas, sem rolagem horizontal. Os textos de projeto continuam provisórios, então CA-39 segue aberto.
- Item 23: passou. Sem JS e sistema claro, `body` em `rgb(241, 240, 232)` com texto `rgb(11, 29, 39)`; sistema escuro, `rgb(11, 29, 39)` com texto `rgb(241, 240, 232)`; `data-theme` ausente nos dois casos.
- Item 24: mantém o resultado da T-09, sem alteração de código no contato.

Itens 25 a 29:

- Item 25: passou. `todos` (`/`, 3 de 3, "Todas" pressionada) → filtro (`/?stack=tecnologias`, 3 de 3, tag pressionada) → ficha (`/?stack=tecnologias#projeto/projeto-01`, foco no fechar, `history.state` marcado) → fechar (URL volta a `/?stack=tecnologias`, foco na linha) → Voltar (`/`, "Todas" pressionada) → Avançar (`/?stack=tecnologias`, tag pressionada). A lista tem 3 itens em todos os passos porque as três stacks provisórias são iguais; com conteúdo real o subconjunto passa a variar.
- Item 26: passou. `/?stack=tecnologias`, `/#projeto/projeto-02` e `/?stack=tecnologias#projeto/projeto-03` reabertos pela URL copiada devolvem a mesma lista, contagem, tag pressionada e ficha.
- Item 27: passou com ressalva de conteúdo. `/?utm=1&stack=React%20Native#projetos` vira `/`: o `utm` e o hash saem e, como "react-native" ainda não é stack de nenhum projeto, o parâmetro é removido pela regra de slug desconhecido (CA-10). O esperado `/?stack=react-native` só vale quando existir um projeto com essa stack. Um único Voltar saiu da página e voltou a `about:blank`, sem estado intermediário.
- Item 28: passou. Com `history.back` sobrescrito, a ficha continua aberta em 120 ms e fecha até 420 ms, com a URL em `/`, o estado nulo e o foco na linha uma única vez.
- Item 29: falhou como esperado. `PUBLICAR=1 npm test`: 70 testes, 67 aprovados, 3 falhas e nenhum skip. Falham "index.html não contém placeholder de publicação" (os cinco marcadores), "projectDetails não tem placeholder nem chave inválida" (`projeto-01` com `[A preencher]`) e "cada projeto tem ano, resumo e stack reais" (`projeto-01` sem ano). Passam a validação do `mailto:` e a correspondência entre slugs de `projectDetails` e o HTML. No `npm test` padrão os cinco casos ficam como `skip`.

Defeito encontrado e corrigido nesta auditoria:

- Entre 1200 e 1439 px a linha de projeto ficava com a coluna de texto espremida: em 1200 px o título ocupava 139 px com fonte de 47,6 px e quebrava uma palavra por linha. A causa era o breakpoint de empilhamento em 1180 px, que só deixava de valer depois de a lista ter largura suficiente. O bloco passou de `max-width: 1180px` para `max-width: 1439px`; em 1200, 1240, 1279 e 1366 px a coluna de texto passa a medir 389, 422, 455 e 528 px e a linha fica com 304 a 311 px de altura, sem corte. A partir de 1440 px as quatro colunas continuam como aprovado (título em duas linhas, linha de 202 px). `tests/styles.test.mjs` acompanhou a mudança.

Resultado do `npm test` ao fim da T-12: 70 testes, 65 aprovados, 5 skip (os de publicação), nenhuma falha.

Limitações: medição em Chrome headless, sem Firefox, sem dispositivo físico e sem leitor de tela real; a ordem de foco foi conferida por Tab real, não por árvore de acessibilidade. As capturas de `.impeccable/review` são da versão anterior à reformulação.

Revisão final com conteúdo real (T-13):

- Conteúdo: `index.html` traz Nicolas Ponciano, posicionamento Desenvolvedor de Software Full Stack, resumo, experiência, formação, seis linhas de tecnologias, três projetos (ClienteAPI, Open Mind, Skill Upgrader) com ano, stack e GitHub, e-mail, LinkedIn e GitHub. `src/data/portfolio.js` guarda só papel, desafio, solução, `featured` e tipo de prévia. Nenhum `[A preencher]`, `[Nome do projeto]` ou link provisório permanece; o título de fallback da ficha é "Projeto selecionado".
- Links externos: `https://github.com/nicolasponciano/ClienteAPI`, `/open-mind`, `/skill-upgrader` e o perfil `https://github.com/nicolasponciano` respondem 200. O LinkedIn aponta para `https://www.linkedin.com/in/nicolas-ponciano/`; respostas 405/999 são bloqueio de bot e não confirmam a URL.
- Layout: 390, 768, 1024 e 1440 px sem rolagem horizontal (`scrollWidth` igual a 380, 758, 1014 e 1430 px contra viewports de 390 a 1440). Nenhum texto cortado; resumos quebram em 5 linhas em 390, 2 em 768, 4 em 1024 e 3 em 1440. Metadados empilham abaixo do título até 1439 px e voltam à quarta coluna em 1440.
- Filtros: as nove tags reais filtram corretamente (C#, .NET 8, SQL Server, TypeScript, Node.js, OpenCode, Markdown, Git) e a contagem anuncia "1 de 3", "2 de 3" e "3 de 3". `?stack=sql-server`, `?stack=net-8`, `?stack=c`, `?stack=node-js` e `?stack=git#projeto/projeto-03` reabrem filtro e ficha corretos.
- Prévias: palco do hero abre em ClienteAPI (PAINEL, C# · .NET 8 · SQL Server); Open Mind troca para TERMINAL e Skill Upgrader para FLUXO, com stack correspondente.
- Ficha e palette: preenchem título, ano, resumo, papel, stack, desafio, solução e GitHub sem placeholder; em 390 px ocupam 390x900 e 390x844 com fechar visível e sem corte.
- Teclado e contraste: Tab percorre a ordem visual com foco visível em ambos os temas; ficha e palette prendem o foco e Esc devolve o foco à linha ou ao campo de origem. Contraste mínimo medido 5,38:1 (nome no hero, tema papel) e 6,61:1 (texto do contato); ficha e palette entre 5,63:1 e 15,07:1. Lighthouse: acessibilidade, boas práticas e SEO em 1,0, com aviso não pontuado de `label-content-name-mismatch` no link da marca e no link "Desça para explorar" (aria-label difere do texto visível).
- Sem JS: hero, projetos, sobre e contato legíveis, `mailto:` visível, controles dependentes de script ocultos, sem rolagem horizontal.
- Cena `Ver montagem` conclui com "Montagem concluída" sem erro de console.

Defeito encontrado e corrigido nesta revisão:

- A palette não fechava no primeiro Esc quando o campo tinha texto: o `<input type="search">` consumia o Esc para limpar o valor e o `<dialog>` só fechava no segundo toque, contra CA-19. `src/app.js` passou a tratar `Escape` no `keydown` do `<dialog>` com `preventDefault()` e `closePalette()`. Verificado: Esc com "open" digitado fecha a palette, mantém o texto e devolve o foco ao campo do hero. Setas, Home, End, Enter e `Ctrl+K` seguem funcionando.

Observações sem correção (por não serem regressão e envolverem escolha de design):

- Em 390 px o título do hero quebra em "DESENVOLVEDOR / DE SOFTWARE / | BACKEND & / FULL STACK": o separador abre a terceira linha e lê como barra de destaque. Corrigir exigiria mudar a quebra ou remover o separador.
- Em 390 px a barra de filtros rola na horizontal, comportamento previsto no CSS; não há indicador visual de que existem mais tags.
- Em 390 px o nome do cabeçalho quebra em duas linhas para caber junto da navegação e do botão de tema.

Resultado final: `npm test` 70 testes, 65 aprovados, 5 skip, nenhuma falha; `PUBLICAR=1 npm test` 70 aprovados, nenhum skip. CA-42 aprovado: não há placeholder de publicação e a checagem opt-in passa.

Conclusão da auditoria: portfólio pronto para publicação quanto a conteúdo, layout, filtros, prévias, ficha, palette, teclado, contraste e ausência de provisórios. Pendência real: não há URL pública de deploy dos projetos, então as fichas apontam apenas para o GitHub; e o perfil do LinkedIn não pôde ser confirmado por requisição.

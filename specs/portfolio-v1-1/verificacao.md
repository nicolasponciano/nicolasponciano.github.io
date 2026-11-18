# Verificação: Portfólio v1.1 (T-09)

Auditoria final da v1.1 na branch `feature/portfolio-v1.1`.

Data: 2026-11-17. Ambiente: Chrome 157 headless via CDP, emulação de viewport em 390x844, 768x1024, 1024x900 e 1440x900, temas tinta e papel, `prefers-reduced-motion` e JavaScript desativado. Não houve Firefox, dispositivo físico nem leitor de tela.

Método: `npm test` e `PUBLICAR=1 npm test`, medição por DOM e estilo computado, capturas de tela em diretório temporário local (fora do repositório), teclado e ponteiro por CDP. Os scripts de auditoria também ficam fora do repositório.

## 1. Testes

| Comando | Resultado |
|---|---|
| `npm test` | 104 testes, 99 aprovados, 0 falhas, 5 skip |
| `PUBLICAR=1 npm test` | 104 aprovados, 0 falhas, 0 skip |

Nenhum arquivo de teste foi alterado na T-09. Os três testes do ajuste 01 entraram na T-10.

## 2. Roteiro de `specs/portfolio-interativo/verificacao.md` (itens afetados)

Itens 1 a 8 (ficha e dialog):

- Abrir os três projetos por "Abrir": ficha preenchida com título, papel, desafio, solução, stack, ano e GitHub; `#projeto/<slug>` gravado; foco no fechar.
- Esc (via evento `cancel`), botão fechar e clique no backdrop fecham, removem o hash e devolvem o foco à linha de origem.
- Voltar fecha em um único passo preservando `?stack=opencode`; Avançar reabre com foco no fechar.
- `/#projeto/nao-existe` fecha a ficha, limpa o hash, mantém a página na seção de projetos e não gera erro.
- Limitação de método: sob CDP o evento `cancel` do `dialog` chega com `cancelable: false`, então o Esc nativo fecha sem passar pelo handler da página. O caminho do app foi exercitado com um evento `cancel` sintético cancelável (mesmo handler de produção); o Esc nativo já havia sido validado em navegador real na v1.0.

Itens 9 a 13 (palette):

- `Ctrl+K` abre e fecha; foco vai ao campo.
- Busca sem caixa e sem acento; "proj" retorna 1 resultado (a seção Projetos, único texto com o termo após o conteúdo real), 16 resultados com o campo vazio.
- Setas, Home, End e seta para cima circular mantêm um único `aria-selected` e `aria-activedescendant` acompanhando.
- Esc fecha no primeiro acionamento com texto no campo e devolve o foco ao campo do hero.
- Enter em "cliente" abre a ficha de ClienteAPI e fecha a palette.
- Com a ficha aberta, `Ctrl+K` é ignorado.

Itens 14 a 24 (responsividade, acessibilidade e sem JS):

- 390, 768, 1024 e 1440 sem rolagem horizontal de página (`scrollWidth` 390, 758, 1014 e 1430).
- 768: herói em uma coluna, palco do índice oculto, prévia dentro da linha.
- 1024: herói em duas colunas (cópia 434 px, palco 392 px), nome em duas linhas sem invadir o palco, palco de 380 px.
- 1440: duas colunas, palco de 380 px, pager no mesmo Y nas três prévias.
- Alvos com 44 px ou mais: pager, tema, filtro, "Abrir", copiar, "Ver montagem", `mailto:`; busca do hero com 52 px e botão primário com 54 px.
- Tab do topo ao rodapé segue a ordem visual: pular-conteúdo, marca, navegação, tema, ações, busca, pager, "Desça para explorar", "Ver montagem", filtros, linhas, e-mail, copiar.
- Movimento reduzido: `html.motion-reduced`, `transition-duration` 1e-05s, botão "Ver montagem" oculto e seções completas.
- Sem JS: hero, 3 projetos, 6 itens de Trajetória, sobre e contato legíveis; busca, palco, filtro, tema, abrir, copiar e cena ocultos; `mailto:` visível.
- Copiar e-mail: `writeText` chamado com `niickponciano@gmail.com`, anúncio "Copiado" e limpeza após 2,4 s.

Itens 25 a 29 (URL e histórico):

- Filtro grava `?stack=`, restaura em recarga e mantém `aria-pressed`.
- Voltar/Avançar restauram lista, contagem, tag e ficha.
- Hash inválido remove o hash com `replaceState`.
- Placeholders: `PUBLICAR=1 npm test` verde, sem ocorrências de `[A preencher]`, `[Nome do projeto]` ou `Links a preencher`.

## 3. Verificação manual de `design.md` (12 itens)

| Item | Resultado |
|---|---|
| 1. 1440 px, nome dominante | passou: `h1` 136 px em duas linhas, kicker acima, fatos abaixo |
| 2. Pager circular | passou: três "próxima" voltam a ClienteAPI; "anterior" do primeiro vai a Skill Upgrader |
| 3. Tab no pager | passou: Enter e Espaço trocam, foco permanece no botão, 44×44 |
| 4. Anúncio do pager | passou: "Open Mind, prévia 2 de 3" em `aria-live="polite"`, só após ação |
| 5. Sem autoplay | parcial: 3 s sem troca nesta execução; nenhum timer no código (60 s cobertos na v1.0) |
| 6. Movimento reduzido | passou: transição 1e-05s e conteúdo completo |
| 7. 390 px | passou: nome em 1 linha a 60 px, tudo legível, palco e pager inteiros |
| 8. 1024 px | passou: duas colunas, palco 392×380, pager sem cobrir conteúdo |
| 9. Um/zero projetos | coberto por teste puro (`shouldShowPager`, `movePreviewIndex`, `previewCountLabel`); não executado em tela |
| 10. Trajetória | passou: duas colunas em 1024/1440, uma em 390/768; período, cargo, organização e local |
| 11. Palco do índice independente | passou: hover em Open Mind e foco em Skill Upgrader trocam só o palco do índice, que segue `aria-hidden` e sem pager |
| 12. Regressões | passou: ficha, filtro, palette, tema, cópia e sem-JS reexecutados |

## 4. Contraste (alfa composto sobre o fundo real)

| Tema | Mínimo | Onde |
|---|---|---|
| Tinta | 6,61:1 | nota do contato "E-mail direto" |
| Papel | 5,53:1 | nota e rodapé do palco, contador do pager |

Extremos: no tinta, título e cargo 15,07:1, resumo 10,88:1, nota do esquema 7,13:1. No papel, título 15,07:1, resumo 8,49:1, metadados 6,13:1. Ficha e palette: mínimo 5,63:1 nas folhas claras, nos dois temas.

Nenhum par abaixo de 4,5:1 (CA-28 e CA-72).

## 5. Responsividade medida

| Largura | Nome | Colunas do herói | Palco | Trajetória |
|---|---|---|---|---|
| 390 | 60 px, 1 linha | 1 | 346×380 | 1 coluna |
| 768 | 72,96 px, 1 linha | 1 | 650×380 | 1 coluna |
| 1024 | 97,28 px, 2 linhas | 2 | 392×380 | 2 colunas |
| 1440 | 136 px, 2 linhas | 2 | 553×380 | 2 colunas |

O palco mantém 380 px de altura e o pager no mesmo Y nas três prévias, em todas as larguras. Nenhuma sobreposição; a barra de filtros rola dentro do próprio contêiner em 390 px (herdado da v1.0).

## 6. Acessibilidade

- Um `h1`, hierarquia sem saltos, `lang="pt-BR"`, `<title>` e meta description preservados.
- Sem ids duplicados; todos os controles com nome acessível.
- Nada focável dentro de `aria-hidden`; palco do índice e prévia de linha seguem ocultos.
- Palco do herói é `role="group"` com nome "Prévia de projetos"; chrome, canvas e rodapé ocultos; contador `aria-hidden`; anúncio em região viva.
- Foco visível no pager; ficha e palette prendem o foco (o Tab pode passar pelo documento do navegador, sem alcançar controles do fundo) e devolvem o foco ao fechar.
- Links externos com `rel="noopener noreferrer"`.
- Verificação automatizada por DOM e teclado simulado. Não houve leitor de tela real.

## 7. Critérios de aceite

### v1.1 (CA-43 a CA-73)

| Critério | Evidência | Resultado |
|---|---|---|
| CA-43 | três esquemas com 4, 5 e 4 itens + rodapé | aprovado |
| CA-44 | itens conferidos contra `requirements.md`; nomes de ferramenta exatos | aprovado |
| CA-45 | "Esquemático" no chrome dos dois palcos e na prévia de linha | aprovado |
| CA-46 | HTML/CSS a partir dos dados; sem imagem, SVG novo, canvas ou requisição | aprovado |
| CA-47 | `normalizeSchematic`/`getSchematic` caem no neutro; console limpo | aprovado |
| CA-48 | troca em 160 ms, sem deslocamento; canvas `aria-hidden` | aprovado |
| CA-49 | `h1` = "Nicolas Ponciano"; papel no kicker; resumo preservado | aprovado |
| CA-50 | três fatos do currículo, sem números | aprovado |
| CA-51 | dois botões e contador com 3 projetos; início no `featured`; circular; sem timer | aprovado |
| CA-52 | Tab, Enter, Espaço, 44 px, foco visível, anúncio `aria-live` | aprovado |
| CA-53 | pager não altera URL nem histórico; palcos independentes | aprovado |
| CA-54 | palco é `group` nomeado; chrome/canvas ocultos | aprovado |
| CA-55 | movimento reduzido sem animação; sem JS o palco fica oculto | aprovado |
| CA-56 | `#trajetoria` com `data-section-label`; fora da navegação; na palette | aprovado |
| CA-57 | período, cargo, organização e local conforme a tabela | aprovado |
| CA-58 | três formações; pós com "em andamento" | aprovado |
| CA-59 | nenhuma métrica, entrega ou senioridade inventada | aprovado |
| CA-60 | `section`, `h2`, `h3`, lista ordenada, texto legível | aprovado |
| CA-61 | 390 px em uma coluna, sem rolagem horizontal | aprovado |
| CA-62 | sem token novo; `--dur-1`/`--dur-2` e `scale(0.98)` | aprovado |
| CA-63 | pager com hover, press e `:focus-visible`; press do link sem deslocar | aprovado |
| CA-64 | nenhuma transição de propriedade de layout | aprovado |
| CA-65 | controles existentes com comportamento e foco inalterados | aprovado |
| CA-66 | README sincronizado com o produto atual | aprovado |
| CA-67 | PRODUCT sem montagem obrigatória nem dados pendentes | aprovado |
| CA-68 | DESIGN e surface com estados reais; tokens preservados | aprovado após correção de contraste e altura |
| CA-69 | v1.0 não reescrita; `verificacao.md` histórico intacto | aprovado |
| CA-70 | `npm test` e `PUBLICAR=1 npm test` verdes; CA-01 a CA-42 válidos | aprovado |
| CA-71 | 4 larguras sem rolagem, corte, sobreposição ou perda de alvo | aprovado |
| CA-72 | mínimo 6,61:1 (tinta) e 5,53:1 (papel) | aprovado |
| CA-73 | sem dependência, build, fonte, imagem ou requisição nova | aprovado |

### Ajuste 01 (CA-74 a CA-79)

| Critério | Evidência | Resultado |
|---|---|---|
| CA-74 | tinta exibe "Ativar tema papel"; papel exibe "Ativar tema tinta"; troca na mesma interação | aprovado |
| CA-75 | nome acessível na árvore AX igual ao texto ("ATIVAR TEMA PAPEL"/"ATIVAR TEMA TINTA"), sem `aria-label`, `aria-pressed` ou `role` | aprovado |
| CA-76 | 390 px: rótulo recortado, botão 44×44 e nome acessível presente | aprovado |
| CA-77 | HTML inicial "Ativar tema papel"; `initTheme` sincroniza com armazenamento e sistema antes da interação | aprovado |
| CA-78 | `localStorage` e `prefers-color-scheme` preservados; cores e temas inalterados | aprovado |
| CA-79 | botão nativo; Enter e Espaço alternam, mantêm foco, gravam preferência e atualizam `meta[theme-color]` | aprovado |

### v1.0 preservada (CA-01 a CA-42)

Reexecutados os itens afetados: leitura imediata, prévia por hover/foco sem deslocamento, filtro e URL, ficha e histórico, palette e teclado, movimento, temas, acessibilidade, sem-JS e publicação. Todos passaram. A única substituição declarada é a do `h1`, que agora traz o nome e manda o papel para o kicker.

## 8. Correções feitas na T-09

Somente documentação, sem tocar em HTML, CSS, JavaScript, dados ou testes:

1. Contraste mínimo do tema tinta corrigido de 7,13:1 para 6,61:1 em `README.md`, `DESIGN.md` e `.impeccable/surfaces/index-html.md`. 7,13:1 era o mínimo só dos elementos do esquema; a página inteira tem 6,61:1 na nota do contato.
2. `DESIGN.md`: na tabela de responsividade, o palco em 1024 px passou de "≥ 360 px" para "380 px", conforme a altura medida.

## 9. Estado do Git

- Branch `feature/portfolio-v1.1`; `main` em `4505888`, sem alteração.
- 14 arquivos modificados e `specs/portfolio-v1-1/` não rastreado.
- Nada commitado, sem stash, reset, merge ou push.
- Sem arquivos temporários, logs, capturas, segredos ou credenciais no repositório.
- `specs/portfolio-v1-1/requirements.md` e `design.md` citam apenas a data de referência do currículo; caminhos locais foram removidos antes do commit.

## 10. Ajuste 01 — botão de tema (T-10)

Validado em Chrome 157 headless por CDP, com `prefers-color-scheme` em escuro e claro, clique, Enter, Espaço, recarga e 390 px.

| Cenário | Tema | Rótulo | `aria-pressed` | `aria-label` | Armazenamento | `meta[theme-color]` |
|---|---|---|---|---|---|---|
| Inicial, sistema escuro | tinta | Ativar tema papel | ausente | ausente | nulo | `#0b1d27` |
| Enter no tinta | papel | Ativar tema tinta | ausente | ausente | `paper` | `#f1f0e8` |
| Espaço no papel | tinta | Ativar tema papel | ausente | ausente | `ink` | `#0b1d27` |
| Duas alternâncias + recarga | tinta | Ativar tema papel | ausente | ausente | `ink` | `#0b1d27` |
| Armazenado `paper` + recarga | papel | Ativar tema tinta | ausente | ausente | `paper` | `#f1f0e8` |
| Armazenado `ink` + recarga | tinta | Ativar tema papel | ausente | ausente | `ink` | `#0b1d27` |
| Sem armazenamento, sistema claro | papel | Ativar tema tinta | ausente | ausente | nulo | `#f1f0e8` |
| 390 px, sistema claro | papel | recortado | ausente | ausente | nulo | `#f1f0e8` |

- Árvore de acessibilidade: `role="button"`, nome "ATIVAR TEMA PAPEL" no tinta e "ATIVAR TEMA TINTA" no papel, sem propriedade `pressed`; em 390 px o nome continua "ATIVAR TEMA TINTA" com o rótulo recortado.
- Alvo do botão: 183×44 px no desktop e 44×44 px em 390 px. Foco permanece no botão após Enter e Espaço.
- Nenhuma exceção ou mensagem de erro no console durante carga, duas alternâncias e recarga.
- Capturas conferidas nos dois temas: papel em `#f1f0e8` com texto em `#0b1d27`; tinta em `#0b1d27` com texto em `#f1f0e8`. Tokens, tipografia e movimento não mudaram.

## 11. Limitações conhecidas (v1.1)

- Chrome headless apenas; sem Firefox, dispositivo físico ou leitor de tela real.
- O Esc nativo do `dialog` não é reproduzível por CDP; o caminho do app foi validado com evento `cancel` cancelável e o Esc real consta da auditoria da v1.0.
- Estados de zero e um projeto cobertos por funções puras, não em tela.
- O item 5 da verificação manual (60 s parado) foi medido por 3 s nesta execução; a ausência de `setInterval`/`setTimeout` no pager foi confirmada no código.
- A barra de filtros rola na horizontal dentro do contêiner em 390 px, herdado da v1.0.
- `src/core.js` mantém exportações da cena antiga usadas só por testes (`getProgress`, `normalizeSpeed`, `getPauseLabel` e outras). Código morto pré-existente, sem impacto em execução; fora do escopo da v1.1.
- O perfil do LinkedIn não foi confirmado por requisição (bloqueio de bot); os quatro repositórios do GitHub responderam 200.

## 12. Ajuste 03 — auditoria final (TA-03)

Data: 2026-11-18. Branch `feature/portfolio-v1.1-ajuste-02`, worktree `witty-meadow`, base `5327909`. Nenhum arquivo de produção foi alterado nesta tarefa.

Ambiente: navegador Chromium embutido do OpenCode, servidor estático local com `Cache-Control: no-store` (o cache do navegador havia servido módulos antigos numa primeira rodada; todas as medições abaixo foram refeitas com os arquivos atuais). Larguras medidas por iframe same-origin de viewport fixo; temas aplicados por `data-theme`. Sem Firefox, dispositivo físico ou leitor de tela real.

### 12.1 Testes

| Comando | Resultado |
|---|---|
| `npm test` | 124 testes, 118 aprovados, 0 falhas, 6 skip |
| `PUBLICAR=1 npm test` | 124 aprovados, 0 falhas, 0 skip |

Nenhum teste foi alterado na TA-03.

### 12.2 Critérios de aceite do Ajuste 03

| Critério | Resultado | Evidência |
|---|---|---|
| CA-01 | PASS | HTML na ordem MarcAi, Seirei, Open Mind; ano 2026 e três stacks por linha; teste de markup compara byte a byte. |
| CA-02 | PASS | `featured: true` em MarcAi; palco inicia em MarcAi com as quatro capacidades da seção 8.1. |
| CA-03 | PASS | Quatro itens em cada `schematic.items`; fichas com papel, desafio e solução aprovados; testes de conteúdo e markup. |
| CA-04 | PASS | MarcAi e Seirei exibem "Código privado" na linha e na ficha; zero âncoras nesses blocos; nenhum `[A preencher]` público. |
| CA-05 | PASS | Open Mind mantém `https://github.com/nicolasponciano/open-mind` com rótulo "GitHub", `target="_blank"` e `rel="noopener noreferrer"`. Link respondeu 200. |
| CA-06 | PASS | `marcai`, `seirei` e `open-mind` abrem a ficha correta; Voltar fecha em um passo e devolve o foco à linha. |
| CA-07 | PASS | `#projeto/projeto-02` canonicaliza para `#projeto/open-mind` e abre a ficha; Voltar saiu da página, provando `replaceState` sem entrada extra. |
| CA-08 | PASS | `projeto-01` e `projeto-03` removem o hash, não abrem ficha e exibem o aviso em `role="status"`; `?stack=` preservado. |
| CA-09 | PASS | Filtros gerados: Todas, Next.js, TypeScript, PostgreSQL, Supabase, Node.js, OpenCode; contagem "3 de 3" sem filtro. |
| CA-10 | PASS | Varredura por padrões e inspeção contextual dos arquivos alterados: nenhum caminho ou URL de repositório privado, credencial, string de conexão, endpoint, project ref ou nome de cliente. |
| CA-11 | PASS | Diff sem `img`, ícone novo, sombra, gradiente ou linha extra; teste de markup fixa três linhas e três prévias. |
| CA-12 | PASS | Moldura, filetes e selo preservados; altura comum às três prévias em 390, 768, 1024 e 1440 px. Em 360 px, Seirei cresce 6 px (518 contra 512). |
| CA-13 | PASS | Mínimos calculados: 7,13:1 (tinta) e 5,53:1 (papel); aviso 10,88:1 / 8,49:1; ficha 5,59:1; esquema 9,45:1 / 7,67:1. |
| CA-14 | PASS | `npm test` e `PUBLICAR=1 npm test` verdes, conforme 12.1. |
| CA-15 | PASS | Sem JS: três linhas legíveis, "Código privado", link do Open Mind visível, palcos e prévias ocultos, zero rolagem horizontal. |
| CA-16 | PASS | Nenhuma operação de visibilidade, push, merge ou deploy foi executada; o remoto do repositório é apenas o do portfólio. |

### 12.3 Responsividade medida

Alturas em px, tema tinta e papel com os mesmos valores. `palco` = `.hero-stage`; `lateral` = `.index-stage`; `prévias` = altura das três `.row-preview`.

| Largura | Herói | Palco | Lateral | Pager (Y relativo ao herói) | Prévias | Rolagem horizontal |
|---|---|---|---|---|---|---|
| 360 | 1506 | 323×512 | oculta | 1312 | 467 / 427 / 389 | nenhuma |
| 390 | 1506 | 336×512 | oculta | 1312 | 375 / 409 / 370 | nenhuma |
| 768 | 1180 | 650×410 | oculta | 1029 | 243 / 261 / 223 | nenhuma |
| 1024 | 866 | 393×486 | 359×448 | 620 | 0 (oculta) | nenhuma |
| 1440 | 920 | 554×432 | 380×456 | 620 | 0 (oculta) | nenhuma |

Extras: em 769x600, 800x600 e 900x650 a lateral de 560 px fica inteira visível depois de rolar até a lista; o rodapé do palco fica abaixo da dobra no topo, mas a lateral é decorativa (`aria-hidden`) e os dados repetidos estão na linha. Nenhum texto truncado nas larguras medidas; nenhuma fonte reduzida para caber. O rodapé do site aparece inteiro no fim da página.

### 12.4 Acessibilidade

- Árvore de acessibilidade: três `article` com nome "título + ano + tecnologias"; palco do herói é `group` "Prévia de projetos"; canvas, chrome, rodapé do palco e prévias de linha com `aria-hidden="true"`; aviso obsoleto aparece como `[status]` com o texto uma única vez.
- Foco: ficha abre com foco em "Fechar ficha"; botão, backdrop e evento `cancel` fecham; foco volta à linha de origem. Palette devolve o foco ao elemento de origem.
- Pager: clique e `Enter`/`Espaço` nativos do botão trocam a prévia; contador `02 / 03`; anúncio "Seirei, prévia 2 de 3" em `aria-live="polite"`. Foco não se move.
- Alvos em 390 px: tema 44×44, pager 44×44, filtros 44 de altura, "Abrir" 44, copiar 44, e-mail 44, fechar 44, busca 52. Links textuais inline do cabeçalho e do rodapé são a exceção prevista para links em texto.
- Movimento reduzido: `transition-duration` e `animation-duration` em 1e-05 s, botão "Ver montagem" oculto, pager funcional.
- Sem JS: ver CA-15.
- Limitação de método: o Tab físico do navegador hospedeiro não foi entregue à página (o harness intercepta o atalho); a ordem foi conferida pela sequência de elementos focáveis e os controles foram acionados por clique e evento sintético equivalente. Não houve leitor de tela real, então o anúncio do aviso e a ausência de duplicidade foram conferidos na árvore AX e no código (uma única região viva), não por áudio.

### 12.5 Navegação e histórico

- Hash canônico, alias e obsoletos validados em carga completa; `?stack=` preservado em todos.
- `projeto-02` com `?stack=node-js` abre Open Mind com filtro "1 de 3".
- Hash desconhecido remove só o hash, sem aviso.
- Filtro grava `?stack=`, Voltar e Avançar restauram contagem e `aria-pressed`.
- Palette: `Ctrl+K` sintético abre com foco no campo; busca "open" retorna 2 resultados; Enter abre Open Mind; Esc fecha e devolve o foco.
- Console limpo em carga, filtros, fichas, palette, Voltar e Avançar.

### 12.6 Segurança e privacidade

- Inspeção contextual de `index.html`, `src/`, `tests/`, `README.md` e specs alteradas. Nenhuma URL de repositório privado, credencial, token real, string de conexão, endpoint interno, identificador de projeto ou nome de cliente.
- O único link de repositório no conteúdo público é o do Open Mind, que é público.
- Correção aplicada: a spec do Ajuste 02 citava um caminho absoluto local (`.../skills/skill-upgrader/SKILL.md`); o caminho foi removido, mantendo a referência ao arquivo.
- Esta auditoria cobre o conteúdo do portfólio. Revisões de segurança de outros repositórios continuam sendo atividade privada separada e prioritária.

### 12.7 Limitações e riscos residuais

1. Mudança de hash no mesmo documento não passava por `canonicalize`: um link antigo aberto numa aba já carregada permanecia na URL e não abria ficha. O fluxo de link (carga completa) funcionava. **Resolvido na TA-04; registro mantido como histórico.**
2. Em 360 px, a prévia do Seirei media 518 px e as outras 512 px; deslocamento de 6 px ao paginar nessa largura. **Resolvido na TA-04; registro mantido como histórico.**
3. A árvore de acessibilidade foi inspecionada, mas não houve teste com leitor de tela real.
4. O estado vazio de filtro não é alcançável pela URL: stack desconhecida é descartada na canonicalização e cai em "Todas". O estado permanece como defesa de interface.
5. Abrir `?stack=` incompatível com `#projeto/<slug>` mantém a ficha aberta e a linha filtrada; comportamento herdado, fora dos critérios deste ajuste.
6. O aviso depende de a região existir no HTML e de o CSS ocultá-la por padrão; ambos cobertos por teste.
7. O limite de requisições do MarcAi é em memória; a frase pública é verdadeira, mas não descreve limite distribuído.
8. Seirei não tem suíte automatizada e Open Mind foi validado apenas em Windows com OpenCode 2.2.5.

### 12.8 Arquivos alterados nesta tarefa

- `README.md`
- `DESIGN.md` (rótulo "Prévia conceitual", alturas medidas e contrato dos links antigos)
- `specs/portfolio-v1-1/requirements.md`
- `specs/portfolio-v1-1/tasks.md`
- `specs/portfolio-v1-1/verificacao.md`
- `specs/portfolio-v1-1/ajuste-03-selecao.md`
- `specs/portfolio-v1-1/ajuste-02-previews.md` (remoção de caminho local)

Nenhum arquivo de `index.html`, `src/` ou `tests/` foi alterado na TA-03.

## 13. Ajuste 03 — estabilização final (TA-04)

Data: 2026-11-18. Branch `feature/portfolio-v1.1-ajuste-02`, worktree `witty-meadow`, base `5327909`. A TA-04 corrige os dois defeitos residuais da seção 12.7, sem alterar seleção, textos, stacks, fichas, tema, palette ou renderizador.

### 13.1 Causa dos dois defeitos

1. **Hash sem recarga:** o app escutava só `popstate`. Trocar `location.hash` na mesma página dispara `hashchange` (e não `popstate` no Chromium), então nenhum estado era aplicado: o alias não canonicalizava, o obsoleto não mostrava aviso e o hash desconhecido permanecia. Na carga completa o fluxo passava por `canonicalize`.
2. **Hero instável em 360 px:** a faixa estreita usava `min-height: 512px`, mas o conteúdo do Seirei media 517,8 px. Como o palco cresce com o conteúdo, ele virava 517,8 px e empurrava o pager 5,8 px. A mesma insuficiência existia entre 401 e 641 px, onde a faixa de 410 px não cobria o conteúdo (até 481,5 px em 401).

### 13.2 Correções aplicadas

- `src/core.js`: nova função pura `resolveProjectLocation`, que resolve alias, projeto obsoleto, slug desconhecido, stack conhecida e URL canônica em uma única chamada. `canonicalize` passou a consumi-la.
- `src/app.js`: `hashchange` e `popstate` chamam o mesmo `syncFromLocation`. A guarda `state.appliedUrl` ignora o segundo evento da mesma navegação, evitando tratamento duplicado e perda do aviso. Hashes que não começam com `#projeto/` (âncoras de seção) continuam intocados; a canonicalização usa `replaceState` e preserva `?stack=`.
- `src/styles.css`: altura comum do hero em `520px` até 400 px (cobre as três prévias em 360) e nova faixa `486px` entre 401 e 650 px. Nenhuma tipografia foi reduzida, nenhum `line-clamp` foi criado e nenhum `overflow` interno foi adicionado.

### 13.3 Testes

| Comando | Resultado |
|---|---|
| `npm test` | 126 testes, 120 aprovados, 0 falhas, 6 skip |
| `PUBLICAR=1 npm test` | 126 aprovados, 0 falhas, 0 skip |

Testes novos:

- `a navegação sem recarga canonicaliza alias, remove obsoleto e ignora desconhecido` (`tests/core.test.mjs`), com a sequência `projeto-02`, `projeto-01`, `projeto-03`, slug desconhecido e slug canônico.
- `o mesmo documento preserva o filtro e não abre projeto substituto` (`tests/core.test.mjs`), cobrindo `?stack=`, aliases, obsoletos e stack fora da seleção.
- Travas de CSS atualizadas para 520 px nas três faixas estreitas, 486 px na faixa de 401 a 650 px e sete regras de altura do hero (`tests/styles.test.mjs`).
- Trava de markup para `hashchange` e `popstate` no mesmo sincronizador e para o uso de `resolveProjectLocation` (`tests/markup.test.mjs`).

### 13.4 Navegação sem recarga — matriz medida

Servidor local com `Cache-Control: no-store`. Cada linha começou em `location.hash = ...` na mesma aba já carregada.

| Entrada | URL final | Ficha | Aviso | Histórico |
|---|---|---|---|---|
| `#projeto/projeto-02` | `#projeto/open-mind` | Open Mind, aberta | não | `replaceState`, sem entrada extra |
| `#projeto/projeto-01` | sem hash | fechada | sim, `role="status"` | hash removido sem nova entrada |
| `#projeto/projeto-03` | sem hash | fechada | sim, `role="status"` | hash removido sem nova entrada |
| `#projeto/desconhecido` | sem hash | fechada | não | silencioso |
| `#projeto/marcai` | `#projeto/marcai` | MarcAi, aberta | não | entrada criada pelo próprio hash |
| `?stack=next-js` + `#projeto/projeto-02` | `?stack=next-js#projeto/open-mind` | Open Mind | não | filtro preservado, `2 de 3` |
| `?stack=next-js` + `#projeto/projeto-01` | `?stack=next-js` | fechada | sim | filtro preservado |
| Voltar após abrir pela linha | URL anterior | fecha | limpo | foco volta à seção |
| Avançar | `#projeto/marcai` | reabre | limpo | `history.state` correto |
| Alias após Avançar, depois Voltar | `#projeto/marcai` | reabre MarcAi | limpo | sem loop entre eventos |
| Fechar ficha aberta por hash | sem hash | fechada | limpo | foco em `#projects-title` |

Console: zero entradas em carga, aliases, obsoletos, hash desconhecido, abertura, fechamento e Voltar/Avançar.

### 13.5 Altura do hero e pager

Medição em tema tinta; papel repetiu os mesmos valores. `Y do pager` é o topo do `.stage-pager`; `spread` é a diferença entre a maior e a menor altura das três prévias.

| Largura | MarcAi | Seirei | Open Mind | Spread | Y do pager |
|---|---|---|---|---|---|
| 360 | 520 | 520 | 520 | 0 | igual nas três |
| 390 | 520 | 520 | 520 | 0 | igual nas três |
| 400 | 520 | 520 | 520 | 0 | igual nas três |
| 401 | 486 | 486 | 486 | 0 | igual nas três |
| 480 | 486 | 486 | 486 | 0 | igual nas três |
| 650 | 486 | 486 | 486 | 0 | igual nas três |
| 651 | 410 | 410 | 410 | 0 | igual nas três |
| 768 | 410 | 410 | 410 | 0 | igual nas três |
| 1024 | 486 | 486 | 486 | 0 | igual nas três |
| 1440 | 432 | 432 | 432 | 0 | igual nas três |

Também medidas sem spread e sem rolagem horizontal: 320, 340, 370, 371, 377, 378, 481, 500, 520, 560, 600, 640, 641, 642, 700 e 769 px. Em 320 e 340 px a largura de layout continua limitada pelo overflow herdado (342 px); a correção não o alterou nem criou novo. `scrollHeight` do canvas igual à altura visível em todas as medições: sem rolagem interna e sem corte.

### 13.6 Reavaliação dos critérios

| Critério | Resultado | Evidência |
|---|---|---|
| CA-06 | PASS | Slugs canônicos abrem a ficha correta na carga e no hash alterado na mesma página; Voltar fecha e devolve o foco. |
| CA-07 | PASS | `projeto-02` canonicaliza para `open-mind` nos dois fluxos, com `replaceState`; a contagem de histórico cresce só pela entrada criada pelo próprio hash. |
| CA-08 | PASS | `projeto-01` e `projeto-03` removem o hash, não abrem substituto e exibem o aviso em `role="status"`; `?stack=` permanece. |
| CA-12 | PASS | Moldura, filetes e selo inalterados; altura comum e pager no mesmo Y em 360, 390, 400, 401, 480, 650, 651, 768, 1024 e 1440 px. |

Os demais critérios permanecem como na seção 12.2: nenhuma alteração de conteúdo, dados, links, filtros, contraste, sem-JS ou publicação foi feita.

### 13.7 Regressões verificadas

- 320 a 1440 px: nenhuma rolagem horizontal nova; 320 e 340 continuam com o overflow herdado, explicitamente fora do escopo.
- Temas tinta e papel: mesmas alturas e mesmo Y do pager; nenhum token de cor foi alterado.
- Pager circular: as três prévias continuam acessíveis por anterior/próximo, com contador e anúncio.
- Fichas: abertura por linha, por URL canônica e por alias; fechamento por botão e por Voltar; foco preservado.
- Filtros: `?stack=` preservado na canonicalização, `aria-pressed` e contagem corretos.
- Console limpo; nenhuma dependência, markup, texto ou dado novo.
- Sem JS: a altura só vale para `.hero-stage`, que continua oculto por `html.no-js`.

### 13.8 Limitações de método

- Sem leitor de tela real e sem Firefox ou dispositivo físico; a verificação usou Chromium embutido, árvore de acessibilidade e eventos equivalentes.
- Hashes que não são de projeto (`#projetos`, `#sobre`) continuam sem passar pela canonicalização no mesmo documento, por decisão de escopo: são âncoras de seção e não links de ficha.

### 13.9 Arquivos alterados nesta tarefa

`src/core.js`, `src/app.js`, `src/styles.css`, `tests/core.test.mjs`, `tests/markup.test.mjs`, `tests/styles.test.mjs`, `README.md`, `DESIGN.md`, `specs/portfolio-v1-1/requirements.md`, `specs/portfolio-v1-1/tasks.md`, `specs/portfolio-v1-1/verificacao.md` e `specs/portfolio-v1-1/ajuste-03-selecao.md`.

Nenhum commit, push, merge ou deploy. O estado do Git permanece com as alterações não commitadas da v1.1.

## 14. Ajuste 04 - restauração de foco (correção de acessibilidade)

Data: 2026-11-18. Branch `feature/portfolio-v1.1-ajuste-02`, worktree `witty-meadow`, base `5327909`. Correção restrita a `src/app.js`, `src/core.js` e `tests/core.test.mjs`; nenhum texto, dado, markup ou contrato público mudou.

- **Problema anterior:** ao fechar a ficha, o foco voltava ao `article` da lista, não ao controle que abriu a ficha. Quem navega por teclado perdia a posição na lista e precisava percorrer o bloco de novo.
- **Solução:** a abertura pela linha grava a origem em `state.focusOrigin` como `{ element, slug }`. No fechamento, `resolveCloseFocus({ originAvailable, rowVisible })` prioriza a origem e só depois recorre a `row` e `section`. `isAvailableOrigin` valida a origem com `isConnected`, `disabled` falso, `focus` de função e `getClientRects().length > 0`, além de exigir que o slug guardado coincida com o projeto fechado.
- **Fallback:** deep link, palette e qualquer origem indisponível abrem com origem nula e mantêm o comportamento anterior (linha visível ou `#projects-title`). Linha oculta por filtro também cai no fallback.
- **Verificação em navegador:** Chromium embutido, servidor local com `Cache-Control: no-store`. O foco voltou ao botão de origem em Enter/Escape, botão "Fechar", backdrop, deep link, palette, Voltar e Avançar, filtro que oculta a linha e canonicalização de `#projeto/projeto-02` para `#projeto/open-mind`.
- **Teste automatizado:** `o foco volta ao controle de origem quando ele continua disponível` (`tests/core.test.mjs`), escrito antes da correção, falhou no código antigo e passou depois. O teste `o foco de retorno depende de a linha ainda estar visível` cobre o fallback.
- **Suítes:** `npm test` 127 testes, 121 aprovados, 0 falhas, 6 skip; `PUBLICAR=1 npm test` 127 aprovados, 0 falhas, 0 skip.

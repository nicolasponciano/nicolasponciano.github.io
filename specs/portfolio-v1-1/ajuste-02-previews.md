# Ajuste 02: caixas de pré-visualização

Spec para aprovação. Nenhum código de produção foi alterado.

## 1. Estado do Git e Ajuste 01

| Local | Branch | Commit | Estado |
|---|---|---|---|
| Worktree do Ajuste 01 | `feature/portfolio-v1.1` | `5327909` | 11 arquivos modificados, não commitados |
| Worktree desta sessão | `feature/portfolio-v1.1-ajuste-02` | `5327909` | limpo |

Verificação do Ajuste 01: **ausente neste worktree**. `index.html` ainda tem `aria-pressed="false"` e `aria-label="Tema papel"`; `syncThemeControls` ainda escreve `aria-pressed`; não existe `themeToggleLabel` em `src/core.js`.

No worktree do Ajuste 01, o diff pendente é **exclusivamente o Ajuste 01**:

- `index.html`: rótulo `data-theme-label`, sem `aria-pressed` nem `aria-label`.
- `src/core.js`: `themeToggleLabel(current)`.
- `src/app.js`: sincroniza rótulo e remove atributos de toggle.
- `src/styles.css`: rótulo recortado visualmente no mobile, sem `display: none`.
- `tests/`: 3 testes novos e asserções de markup/CSS ajustadas.
- `DESIGN.md` e `specs/portfolio-v1-1/`: documentação do RF-18 e T-10.

Não há nenhuma alteração de prévia, dados ou T-11/T-12 nesse diff.

### Estratégia segura para o Ajuste 01

Reaplicar o patch exato, sem tocar no worktree de origem:

1. Exportar o diff do worktree do Ajuste 01 para um arquivo temporário fora do repositório.
2. Conferir no patch que ele contém apenas os 11 arquivos acima.
3. Validar a aplicação neste worktree com `git apply --check` antes de aplicar.
4. `npm test` e `PUBLICAR=1 npm test`. Esperado: 104 testes, 0 falhas.
5. Sem commit. O Ajuste 02 começa depois disso.

Motivo: os dois worktrees partem do mesmo commit `5327909`, então o patch aplica sem conflito e sem interpretação manual. Ler o diff não altera o worktree de origem.

## 2. Escopo

Muda:

1. `.hero-stage` (caixa do hero).
2. `.index-stage` (caixa lateral de Projetos).
3. `.row-preview` (caixa compacta dentro da linha, até 768 px).
4. `projectDetails[*].schematic`, `normalizeSchematic`/`getSchematic`.
5. `renderCanvas` e as duas funções que o alimentam.
6. CSS específico das três caixas.
7. Testes que travam o contrato antigo.

Não muda: ver seção 8.

## 3. Direção visual aprovada

Ficha editorial. Preserva moldura externa, tipografia, paleta, cantos retos e hairlines. A mudança é de hierarquia e conteúdo, não de identidade.

```
OPEN MIND            CONTEXTO PARA OPENCODE        [PRÉVIA CONCEITUAL]
──────────────────────────────────────────────────────────────────────
Leva o contexto do Vault do Obsidian
para dentro do OpenCode.

01  Busca trechos nas notas do Vault
02  Associa a sessão ao projeto certo
03  Atualiza notas só se nada mudou desde a leitura
04  Escrita desligada por padrão, liberada por permissão
──────────────────────────────────────────────────────────────────────
TECNOLOGIAS                        TypeScript · Node.js · OpenCode
```

Hierarquia, do mais forte ao mais fraco:

1. Nome no chrome, display condensado, `--paper`.
2. Propósito: corpo 15 px, `--paper`, medida máxima de 36ch, entrelinha 1.45.
3. Capacidades: 12,5 px, `--paper-dim`, número `01` a `04` em 10 px `--mint-text` com `font-variant-numeric: tabular-nums`.
4. Categoria no chrome, meta 10 px `--mint-text`.
5. Selo `Prévia conceitual`: 9 px, `--muted`, filete de 1 px, sem fundo.
6. Tecnologias no rodapé existente, `--muted`.

Redução de ruído:

- Sem borda em cada capacidade. Só um filete de 1 px `--line` entre itens, ausente no primeiro.
- Sem caixa interna, sem fundo por item, sem coluna fixa de rótulo.
- Sem ícone, imagem, cartão, sombra, gradiente novo ou elemento decorativo.
- Nada de hover ou cursor em capacidade, porque não é interativo.
- Divulgação progressiva: a caixa mostra propósito, capacidades e stack. Papel, desafio, solução e links continuam exclusivos da ficha "Abrir".

## 4. Textos finais propostos

Todas as afirmações foram conferidas na fonte indicada. Nenhuma métrica foi inventada.

### ClienteAPI

Fonte: `github.com/nicolasponciano/ClienteAPI`, README e `Program.cs`.

- Categoria: `API REST`
- Propósito: `Centraliza o cadastro de clientes e o endereço obtido pelo CEP.`
- Capacidades:
  1. `Cadastro, consulta e pesquisa de clientes`
  2. `Endereço preenchido a partir do CEP`
  3. `Atualização com validação dos dados`
  4. `Mensagens de erro claras e consistentes`

Conferência: CRUD e pesquisa no README; validação de CEP por API externa; atualização com validações específicas; mensagens personalizadas e consistentes.

### Open Mind

Fonte: `github.com/nicolasponciano/open-mind`, README e `src/tools/open-mind-tools.ts`.

- Categoria: `Contexto para OpenCode`
- Propósito: `Leva o contexto do Vault do Obsidian para dentro do OpenCode.`
- Capacidades:
  1. `Busca trechos nas notas do Vault`
  2. `Associa a sessão ao projeto certo`
  3. `Atualiza notas só se nada mudou desde a leitura`
  4. `Escrita desligada por padrão, liberada por permissão`

Conferência: busca literal retorna trechos e caminhos relativos; associação por diretório da sessão; update exige o SHA-256 esperado; escrita `disabled` por padrão e `ctx.permission.assert` por ação.

### Skill Upgrader

Fonte: `SKILL.md` do skill-upgrader, mantido fora deste repositório.

- Categoria: `Auditoria de skills`
- Propósito: `Atualiza skills só com prova de que a troca é segura e reversível.`
- Capacidades:
  1. `Confere origem, versão e conteúdo de cada skill`
  2. `Separa instalação ativa de cópia antiga em cache`
  3. `Preserva skills alteradas localmente`
  4. `Exige backup e rollback testado antes de trocar`

Conferência: compara origem, versão e conteúdo; cache não é instalação ativa; alteração local bloqueia sobrescrita; exige backup e procedimento de restauração verificável. Não promete execução automática: o fluxo para quando a evidência não fecha.

Selo comum: `Prévia conceitual`.

## 5. Contrato de dados e migração

```js
schematic: {
  label: "Contexto para OpenCode",
  note: "Prévia conceitual",
  purpose: "Leva o contexto do Vault do Obsidian para dentro do OpenCode.",
  items: [
    "Busca trechos nas notas do Vault",
    "Associa a sessão ao projeto certo",
    "Atualiza notas só se nada mudou desde a leitura",
    "Escrita desligada por padrão, liberada por permissão",
  ],
}
```

`items` passa de `{ tag, text }` para `string`. `foot` sai: tecnologias já vêm da linha e não devem aparecer duas vezes.

**Migração escolhida: B, atômica.** Dados, normalização, renderizador e testes mudam na mesma tarefa.

Motivo: o renderizador atual lê `item.tag` e `item.text`. Trocar só os dados quebra a interface e deixa a suíte vermelha. A transição compatível (A) manteria dois caminhos de renderização e dois formatos aceitos por tempo indeterminado, contrariando "sem arquitetura além do necessário". Com B, cada tarefa termina funcional e com `npm test` verde.

Trade-off: TA-01 é a maior tarefa do ajuste. Fica isolada em um único commit lógico e não altera CSS, então continua revisável.

## 6. Altura e estabilidade

380 px deixa de ser limite. Passa a ser apenas a referência herdada da v1.1.

Regra nova:

- A altura útil da caixa é comum aos três projetos em cada breakpoint.
- É definida pelo projeto mais alto, medida no navegador com as três prévias.
- Usa `min-height` compartilhado, nunca `height` fixo com corte.
- Proibido `overflow: hidden`, `overflow-y: auto`, `max-height` ou `line-clamp` no conteúdo da prévia.
- O pager fica no mesmo Y nas três prévias, em cada breakpoint.
- Crescer é aceitável. Cortar ou rolar internamente não é.
- O palco do índice mantém `position: sticky` e a mesma altura comum; o hero usa a mesma regra, com os valores medidos.

## 7. Critérios de aceite

Conteúdo e hierarquia:

- CA-01: as três caixas mostram nome, categoria, propósito, 4 capacidades, tecnologias e selo `Prévia conceitual`.
- CA-02: nenhuma caixa exibe identificador interno (`open_mind_*`, `project_context`) no conteúdo principal.
- CA-03: ClienteAPI não usa `POST`, `GET`, `PUT` ou `DELETE` como rótulo principal.
- CA-04: cada afirmação das capacidades existe na fonte citada na seção 4, e Skill Upgrader não promete automação além do fluxo documentado.
- CA-05: uma única função monta o conteúdo das três caixas; `paintStage` e `paintRowPreview` não duplicam marcação.
- CA-06: propósito é o maior texto do miolo; categoria e selo são meta; tecnologias ficam no rodapé.
- CA-07: nenhuma capacidade tem borda própria, ícone, fundo, hover ou cursor de clique.

Comportamento:

- CA-08: pager circular, contador `01 / 03`, anúncio em `aria-live` apenas após ação e foco preservado no botão.
- CA-09: altura comum e estável nas três prévias em 390, 768, 1024 e 1440 px; nenhuma capacidade cortada, nenhuma rolagem interna, pager no mesmo Y.
- CA-10: caixa lateral continua `sticky` e `aria-hidden`; prévia de linha continua `aria-hidden`.
- CA-11: até 768 px a caixa compacta mostra o mesmo conteúdo, sem truncar, e a página não ganha rolagem horizontal em 390 px.
- CA-12: contraste mínimo de 4,5:1 para propósito, capacidades, categoria e selo nos temas tinta e papel.
- CA-13: `prefers-reduced-motion` remove a animação de troca; sem JS as três caixas continuam ocultas e o conteúdo da lista permanece legível.
- CA-14: sem dependência, fonte, imagem, SVG decorativo, requisição ou `canvas` novo.

Preservação:

- CA-15: a lista principal de Projetos não muda: markup, ordem, índices, títulos e links.
- CA-16: os resumos das três linhas permanecem byte a byte iguais.
- CA-17: as fichas abertas por "Abrir" e por `#projeto/<slug>` não mudam.
- CA-18: filtros, contagem, `?stack=`, URLs, `history.state` e palette não mudam.
- CA-19: o botão de tema do Ajuste 01 continua funcionando: rótulo de ação, sem `aria-pressed`, persistência e mobile preservados.
- CA-20: os três projetos, slugs, ordem e ano continuam os mesmos. Substituição de projeto fica fora deste ajuste.
- CA-21: nenhum arquivo fora da seção 9 é alterado.
- CA-22: `npm test` e `PUBLICAR=1 npm test` verdes ao fim de cada tarefa.

## 8. Fora de escopo

Lista, resumos, metadados, links, "Abrir", fichas, filtros, stacks, Trajetória, hero fora da caixa, palette, navegação, busca, tema, URLs, deep links, publicação e troca de projetos.

## 9. Tarefas

- [x] TA-00 Ajuste 01: aplicar o patch exclusivo do tema conforme a seção 1, rodar as duas suítes e confirmar 104 testes verdes. Nenhum outro arquivo muda.
- [x] TA-01 Contrato e renderizador (migração atômica): novo `schematic` com `purpose` e `items: string[]`; `normalizeSchematic` aceita apenas o formato novo; `renderCanvas` monta propósito + lista numerada; remover ramo de `tag` e `foot`; atualizar `tests/content.test.mjs` e `tests/core.test.mjs`. Fecha CA-01 a 05 e 14.
- [x] TA-02 Chrome e selo: `index.html` recebe o selo `Prévia conceitual` nas três caixas e a estrutura do cabeçalho; pager e `aria-live` intocados. Fecha CA-06, 08 e 10.
- [x] TA-03 CSS desktop: hierarquia, filetes entre capacidades, remoção das bordas internas, altura comum do hero e do palco lateral, contraste. Fecha CA-06, 07, 09, 10 e 12.
- [x] TA-04 CSS compacto mobile: variante da prévia de linha até 768 px, mesma marcação, densidade e altura estável. Fecha CA-09, 11 e 13.
- [x] TA-05 Verificação e travas: testes de markup e estilo, preservação da lista, resumos, ficha, filtro e tema; medição em 390/768/1024/1440 nos dois temas; movimento reduzido e sem JS. Fecha CA-15 a 22.

## 10. Arquivos previstos

`src/data/portfolio.js`, `src/core.js`, `src/app.js`, `index.html`, `src/styles.css`, `tests/content.test.mjs`, `tests/core.test.mjs`, `tests/markup.test.mjs`, `tests/styles.test.mjs` e este arquivo. TA-00 toca os 11 arquivos do Ajuste 01.

## 11. Riscos

- Patch do Ajuste 01 depender do estado de outro worktree. Mitigação: conferir o conteúdo do patch e aplicar com `--check` antes.
- Altura comum: se a medição for feita só em 1440 px, o mobile corta. Mitigação: medir nos quatro breakpoints e adotar o maior valor por breakpoint.
- Coluna lateral estreita: capacidade longa quebra em duas linhas. Aceitável; a altura comum absorve, desde que sem rolagem interna.
- CA-16 exige prova de que os resumos não mudaram. Mitigação: teste que compara o texto de cada linha com a string aprovada.
- O selo e a categoria podem competir no chrome em 320 a 390 px. Mitigação: selo quebra para a linha seguinte abaixo de 480 px, sem truncar.

## 12. Auditoria final (TA-05)

Data: 2026-11-17. Branch `feature/portfolio-v1.1-ajuste-02`, base `5327909`, alterações não commitadas. Chrome 157 headless via CDP, cache desabilitado, `setFocusEmulationEnabled`, temas tinta e papel. Sem Firefox, dispositivo físico ou leitor de tela real.

### 12.1 Correções pontuais

1. `src/styles.css`, rodapé da caixa lateral em 769 a 900 px: a stack de Open Mind e Skill Upgrader era cortada com reticências. A faixa ganhou `white-space: normal`, `overflow: visible`, `text-overflow: clip` e `max-width: 100%`, com a stack quebrando em duas linhas dentro do rodapé de 38 px. A altura da caixa continua 412 px nas três prévias.
2. `src/styles.css`, sem JavaScript: `.index-stage` não estava na lista `html.no-js` e aparecia como caixa vazia. Entrou na regra `display: none`, junto de `.hero-stage` e `.row-preview`.
3. `src/styles.css`, faixa de 371 px: com `min-height: 412px`, Skill Upgrader crescia para 423,5 px e o pager descia 11 px. A faixa de 428 px passou de `max-width: 370px` para `max-width: 371px`.

### 12.2 Alturas medidas (tema tinta e papel idênticos)

| Largura | Hero | Palco lateral | Prévia compacta (ClienteAPI / Open Mind / Skill Upgrader) |
|---|---|---|---|
| 360 | 428 | - | 261,5 / 297,8 / 315,9 |
| 370 | 428 | - | - |
| 371 | 428 | - | - |
| 377 | 412 | - | - |
| 378 | 396 | - | - |
| 390 | 396 | - | 243,3 / 279,7 / 261,5 |
| 400 | 396 | - | - |
| 401 | 380 | - | - |
| 480 | 380 | - | 223,0 / 241,2 / 223,0 |
| 481 | 380 | - | 223,0 / 241,2 / 223,0 |
| 767 | 380 | - | 223,0 / 223,0 / 223,0 |
| 768 | 380 | - | 223,0 / 223,0 / 223,0 |
| 769 | 380 | 412 | - |
| 900 | 380 | 412 | - |
| 960 | 380 | 392 | - |
| 1024 | 380 | 356 | - |
| 1440 | 380 | 336 | - |

O pager ficou no mesmo Y nas três prévias em todas as larguras. Nenhuma rolagem horizontal em 360 a 1440 px, nenhuma rolagem interna, nenhum texto cortado, quatro capacidades visíveis nas três caixas. Em 320 e 340 px a página mantém a rolagem horizontal herdada e o palco do hero continua com 428 px; a posição do pager dentro da caixa não muda.

### 12.3 Contraste (mínimo por elemento)

| Elemento | Tinta | Papel |
|---|---|---|
| Propósito | 13,08:1 | 13,61:1 |
| Capacidade | 9,45:1 | 7,67:1 |
| Numeração | 8,36:1 | 5,87:1 |
| Categoria | 8,36:1 | 5,87:1 |
| Selo | 7,13:1 | 5,53:1 |
| Tecnologias | 9,45:1 | 7,67:1 |

### 12.4 Preservação e regressões

- Seção de Projetos byte a byte igual a `5327909`: três linhas na mesma ordem, slugs, índices, títulos, resumos, anos, stacks, links, "Abrir" e `aria-labelledby`.
- Fichas com papel, desafio, solução, stack, ano e GitHub inalterados; abertura por "Abrir" e por `#projeto/<slug>`, fechamento, foco e Voltar/Avançar preservados.
- Filtro por stack grava `?stack=`, restaura na recarga, contagem `2 de 3`, `aria-pressed` e limpar filtro funcionando.
- Palette por `Ctrl+K` abre com foco no campo e `Esc` devolve o foco à busca do hero.
- Tema alterna por clique e por Enter, mantém foco, atualiza rótulo e `meta[theme-color]` e persiste no armazenamento; sem `aria-pressed`.
- Cópia do e-mail grava `niickponciano@gmail.com` e anuncia "Copiado".
- Movimento reduzido: `html.motion-reduced`, transição `1e-05s`, troca de prévia sem animação.
- Sem JavaScript: as três caixas, busca, pager, filtro, tema, "Abrir", copiar e montagem ocultos; lista com três títulos e resumos legíveis; sem rolagem horizontal.
- Console sem exceções e sem mensagens de erro em todas as medições.

### 12.5 Critérios

| Critério | Evidência | Resultado |
|---|---|---|
| CA-15 | seção de Projetos byte a byte igual à base; teste de ordem e atributos | aprovado |
| CA-16 | teste de resumo byte a byte por projeto | aprovado |
| CA-17 | teste de papel, desafio, solução, destaque e tipo de prévia; ficha executada nos três projetos | aprovado |
| CA-18 | filtro, `?stack=`, contagem, estado vazio, palette e histórico reexecutados | aprovado |
| CA-19 | rótulo de ação, sem `aria-pressed`, persistência e Enter | aprovado |
| CA-20 | três projetos, slugs, ordem e anos iguais à base | aprovado |
| CA-21 | alterações restritas a `src/styles.css`, `tests/styles.test.mjs`, `tests/markup.test.mjs` e esta spec | aprovado |
| CA-22 | `npm test` 114 testes (109 aprovados, 5 skip, 0 falhas); `PUBLICAR=1 npm test` 114 aprovados | aprovado |

### 12.6 Limitações

- Chrome headless apenas; sem Firefox, dispositivo físico ou leitor de tela real.
- Em 769 a 860 px o chrome da caixa lateral usa três linhas quando a categoria é longa, porque categoria e selo não cabem juntos na coluna: o chrome tem 76 px em vez de 56,2 px, sem afetar a altura comum de 412 px nem cortar texto.
- Em 320 e 340 px o cabeçalho da prévia compacta ocupa três linhas e a página mantém rolagem horizontal herdada da v1.0; fora do escopo deste ajuste.
- O Enter nativo em botões não é reproduzível por `rawKeyDown` no CDP; foi validado com `keyDown` mais `text`, com foco preservado no pager e no botão de tema.
- TA-00 estava desmarcada na seção 9 apesar de o patch do Ajuste 01 estar aplicado. A marcação foi corrigida na auditoria do Ajuste 03, sem alterar código.

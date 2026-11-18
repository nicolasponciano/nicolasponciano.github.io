# Ajuste 03: seleção de projetos

Spec de investigação, planejamento e execução. A investigação inicial não alterou código; TA-01 e TA-02 alteraram dados, HTML, CSS, JS e testes, TA-03 só auditou e documentou, e TA-04 corrigiu os dois defeitos residuais apontados na auditoria.
Data: 2026-11-18. Branch: `feature/portfolio-v1.1-ajuste-02`. Base: `5327909`.

O relatório interno completo, com nomes de repositório e detalhes de infraestrutura, fica fora deste repositório, por ser público. Esta spec usa os nomes públicos dos produtos e omite caminhos de repositórios privados.

## 0. Aprovação e status

Aprovado pelo proprietário em 2026-11-18.

- Ordem aprovada: MarcAi em destaque, Seirei em segundo, Open Mind em terceiro.
- Textos da seção 8 aprovados, com duas correções de fidelidade registradas em 8.1: o `.NET` sai de todos os textos de MarcAi (D3) e a menção a testes passa a cobrir apenas papéis e conflito, porque não existe teste automatizado de disponibilidade no repositório.
- D1, D2, D3 e D4 decididas conforme a seção 14.
- TA-00 concluída: seleção, textos, stacks, links e ordem formalizados. Nenhuma linha de código de produção foi alterada neste ajuste.
- TA-01 concluída em 2026-11-18: dados, HTML, estado "Código privado" e testes atualizados juntos.
- TA-02 concluída em 2026-11-18: `projeto-02` canonicaliza para `open-mind` com `replaceState`, `projeto-01` e `projeto-03` removem só o hash e acionam o aviso acessível. Hash desconhecido continua removido em silêncio.
- TA-03 concluída em 2026-11-18: auditoria dos 16 critérios nos temas tinta e papel, em 360, 390, 768, 1024 e 1440 px, com árvore de acessibilidade, movimento reduzido e sem JS. `npm test` 118/124 (6 ignorados) e `PUBLICAR=1 npm test` 124/124. Relatório em `verificacao.md`, seção 12. Nenhum arquivo de produção alterado nesta tarefa.
- TA-04 concluída em 2026-11-18: estabilização complementar. O hash alterado no mesmo documento passa pela canonicalização, e o herói ganha altura comum de 520 px até 400 px e 486 px entre 401 e 650 px. `npm test` 120/126 (6 ignorados) e `PUBLICAR=1 npm test` 126/126. Relatório em `verificacao.md`, seção 13.
- MarcAi e Seirei continuam privados. Só os textos sanitizados desta spec podem ser publicados.

## 1. Escopo

Auditar os repositórios acessíveis da conta `nicolasponciano` e definir os três projetos do portfólio, com foco em backend, arquitetura, integrações e qualidade de engenharia.

A seleção final é uma decisão do proprietário e substitui a recomendação anterior, que era baseada apenas na matriz de pontuação. Os três projetos são MarcAi, Seirei e Open Mind, nesta ordem. Nenhuma alteração de conteúdo, markup, CSS ou teste nesta etapa.

## 2. Cobertura da auditoria

| Item | Quantidade |
|---|---|
| Repositórios encontrados | 26 |
| Públicos | 22 |
| Privados | 4 |
| Forks | 2 |
| Arquivados | 0 |
| Vazios | 2 |
| Estrutura inspecionada | 12 |
| Código lido em profundidade | 6 |

Fonte: GitHub CLI 2.104.0 autenticada com escopo `repo`, listagem paginada e leitura de árvore e conteúdo via API. Nenhum acesso foi ampliado. Sem organizações ou colaborações externas.

Limitações: nenhum repositório foi executado. Não houve inspeção linha a linha dos exercícios WinForms de 2024, do pokedex e dos 2 forks. Nenhum repositório possui CI.

## 3. Inventário público

| Repositório | Linguagem | Último push | Papel |
|---|---|---|---|
| nicolasponciano.github.io | JavaScript | 2026-11-17 | site do portfólio |
| open-mind | TypeScript | 2026-11-16 | ferramenta de desenvolvimento |
| skill-upgrader | Markdown | 2026-11-14 | processo documentado |
| ProjectFit | C#/JavaScript | 2025-07-04 | aplicação WebForms legada |
| ClienteAPI | C# | 2025-06-22 | API REST .NET |
| DesafioMobile | Kotlin | 2025-04-01 | exercício Android |
| Sistema-Estacionamento | C# | 2024-05-25 | exercício WinForms |
| DesafioEstacionamento | C# | 2024-05-01 | exercício WinForms |
| 9 exercícios WinForms | C# | 2024-03 | exercícios de lógica |
| pokedex | HTML | 2023-05-20 | exercício frontend |
| 2 forks | HTML | 2023 a 2024 | material de terceiros |

Os repositórios privados foram avaliados na auditoria. O detalhamento fica no relatório interno.

## 4. Matriz de avaliação

Pesos: relevância 30%, qualidade 25%, funcionalidade 20%, documentação e testes 15%, diversidade 10%. A nota não considera divulgação; elegibilidade é condição separada.

| Projeto | Relev. | Qualidade | Funcional | Docs/Testes | Divers. | Nota |
|---|---|---|---|---|---|---|
| MarcAi (antes P1) | 5,0 | 4,5 | 4,5 | 4,5 | 4,5 | 4,65 |
| Open Mind | 4,0 | 4,5 | 4,5 | 4,5 | 4,5 | 4,35 |
| Seirei (antes P2) | 4,5 | 4,5 | 4,5 | 3,5 | 4,0 | 4,30 |
| ClienteAPI | 4,5 | 3,5 | 4,0 | 2,5 | 3,0 | 3,70 |
| ProjectFit | 4,0 | 3,0 | 4,0 | 1,5 | 4,5 | 3,43 |
| Skill Upgrader | 2,5 | 3,0 | 3,0 | 4,0 | 2,5 | 2,95 |
| API .NET privada | 4,5 | 2,0 | 3,5 | 1,5 | 3,5 | 3,10 |
| Demais exercícios | 1,0 a 2,0 | 2,0 a 2,5 | 2,0 a 3,0 | 1,0 a 1,5 | 1,5 a 3,0 | até 2,18 |

Confiança alta em MarcAi, Seirei, Open Mind e ClienteAPI. Média em ProjectFit e na API .NET privada, sem execução. Baixa nos exercícios não lidos linha a linha.

A matriz continua registrada como evidência da auditoria. Ela não define mais a seleção: ClienteAPI (3,70) e ProjectFit (3,43) ficam fora por decisão do proprietário, e Skill Upgrader (2,95) sai da terceira posição.

## 5. Seleção aprovada

| Posição | Projeto | Categoria | Visibilidade do código | Divulgação | Papel no portfólio |
|---|---|---|---|---|---|
| 1 destaque | MarcAi | SaaS de agendamentos | privado | descrição autorizada, sem link | produto full stack com multi-tenant, papéis, idempotência e testes |
| 2 | Seirei | Produto web de produtividade | privado | descrição autorizada, sem link | produto completo com autenticação, RLS, IA no servidor e sincronização |
| 3 | Open Mind | Ferramenta de desenvolvimento | público | repositório aberto | plugin com testes, documentação e escrita fail-closed |

Fora da seleção: ClienteAPI, Skill Upgrader, ProjectFit, a API .NET privada, exercícios e forks.

## 6. Evidências por projeto

Levantamento feito no HEAD dos repositórios em 2026-11-18, por leitura de árvore e conteúdo, sem execução local.

### 6.1 MarcAi

Dois componentes, ambos privados.

| Componente | Stack | Evidência |
|---|---|---|
| Aplicação web | Next.js 16, TypeScript, React 19, PostgreSQL, Prisma, Tailwind 4, Zod, Vitest | schema Prisma com migrations, testes automatizados, rotas de API, README e PRD |
| API .NET | C#, ASP.NET minimal API, Dapper, Postgres/Supabase, JWT | grupos de endpoints por domínio (tenant, usuário, local, serviço, profissional, cliente, agendamento), sem README e sem testes |

A aplicação web está ativa. A API .NET teve desenvolvimento curto e não há evidência de que a aplicação web a consuma. O README web está desatualizado em relação ao schema: anuncia menos tabelas do que o schema tem.

Funcionalidades verificadas no código, não só no README: autenticação JWT com access de 15 minutos e refresh de 7 dias com rotação em cookie HttpOnly, recuperação de senha por email, RBAC com papéis, isolamento por tenant no token, cálculo de disponibilidade com duração, buffer e exceções de agenda, verificação de conflito, chave de idempotência, auditoria, exclusão lógica, limite de requisições em memória nas rotas sensíveis e fluxo público de agendamento em `/[slug]/booking`.

### 6.2 Seirei

Repositório privado. Stack: Next.js 16, TypeScript, Tailwind 4, Supabase (Auth, Postgres com RLS e Realtime), com deploy configurado.

Funcionalidades verificadas: cadastro, login, logout, recuperação e redefinição de senha com validação de força no cliente e no servidor, proteção de rotas por proxy com renovação de sessão, tarefas com separação automática por vírgula, ponto e quebra de linha, dependência entre tarefas do mesmo dia, ordenação e duração estimadas por IA no servidor, modo foco com concluir, pular e nova rodada, progresso do dia, adiar tarefa, sincronização por Realtime com RLS por usuário e fallback de polling.

O projeto tem specs próprias, constitution e glossário de siglas, com as tarefas marcadas como concluídas. Não tem suíte de testes automatizada: o `package.json` não define script de teste e a verificação registrada é manual.

### 6.3 Open Mind

Repositório público em `https://github.com/nicolasponciano/open-mind`, licença MIT, criado em 2026-11-13, push em 2026-11-16. 41 arquivos, 16 commits, 152 KB. Stack: TypeScript, Node.js, OpenCode V2.

Funcionalidades verificadas: seis ferramentas registradas (`status`, `search`, `read`, `project_context`, `create`, `update`), contexto do Vault por sessão, busca e leitura confinadas à raiz do Vault com caminhos relativos, limites explícitos de leitura e busca, escrita desabilitada por padrão com autorização por operação e atualização condicionada ao SHA-256 da versão lida. Testes em quatro arquivos TypeScript com `node:test`, mais testes PowerShell e do curador. README em português e inglês. Versão validada apenas em Windows com OpenCode 2.2.5; três testes são ignorados no Windows e não contam como aprovados.

## 7. Situação de implementação

Classificação usada: **implementado** (código e verificação presentes), **parcial** (existe, com lacuna declarada) e **planejado** (só em spec, PRD ou roadmap).

### 7.1 MarcAi

| Funcionalidade | Situação |
|---|---|
| Autenticação com access, refresh rotativo, recuperação de senha | implementado |
| Multi-tenant, papéis e filtro por estabelecimento | implementado |
| Agenda, disponibilidade, conflito, idempotência, auditoria, exclusão lógica | implementado |
| CRUD de clientes, profissionais e serviços | implementado |
| Página pública de agendamento por estabelecimento | implementado |
| Limite de requisições por IP | parcial: armazenamento em memória, sem backend compartilhado |
| API .NET paralela | parcial: 7 grupos de endpoints, sem testes, sem README, consumo pela web não confirmado |
| Agente de IA por WhatsApp | planejado, declarado no PRD como futuro |
| i18n, Sentry, CI e Docker | planejado, descrito no PRD e ausente das dependências |

### 7.2 Seirei

| Funcionalidade | Situação |
|---|---|
| Autenticação completa e proteção de rotas | implementado |
| Entrada por texto ou voz com separação automática | implementado; voz depende da Web Speech API do navegador |
| Ordenação e duração por IA com validação e fallback | implementado, com chave lida só no servidor |
| Dependência entre tarefas, modo foco, progresso e adiar | implementado |
| Sincronização entre dispositivos com RLS e last-write-wins | implementado |
| Suíte de testes automatizada | não existe; verificação manual registrada em spec |
| Notificações, múltiplos dias, compartilhamento, calendário, tarefas recorrentes | planejado como fora de escopo |

### 7.3 Open Mind

| Funcionalidade | Situação |
|---|---|
| Contexto do Vault por sessão e seis ferramentas | implementado |
| Escrita fail-closed com autorização e hash | implementado |
| Testes automatizados e documentação bilíngue | implementado |
| Compatibilidade fora do Windows e de OpenCode 2.2.5 | parcial, declarada como limitação conhecida |
| Publicação em npm e releases versionadas | planejado, não existe |

## 8. Conteúdo editorial proposto

Textos para aprovação. Linguagem voltada a recrutador, sem promessa de roadmap.

### 8.1 MarcAi

- **Nome público:** MarcAi
- **Categoria:** SaaS de agendamentos
- **Propósito:** plataforma de agendamentos para salões, clínicas e estúdios, com cada estabelecimento isolado no seu próprio espaço e horários calculados a partir da agenda real.
- **Capacidades comprovadas:**
  1. Agenda com horários disponíveis calculados por profissional, serviço e duração.
  2. Cada estabelecimento isolado, com papéis de dono e equipe aplicados no servidor.
  3. Criação de agendamento idempotente, com verificação de conflito e registro de auditoria.
  4. Página pública de agendamento por estabelecimento, do serviço à confirmação.
- **Resumo para a lista:** plataforma de agendamentos multi-tenant com agenda por profissional, papéis de acesso e página pública de agendamento.
- **Papel:** desenvolvimento individual do produto, do modelo de dados à interface.
- **Desafio:** impedir horário duplicado e vazamento de dados entre estabelecimentos quando duas pessoas tentam marcar o mesmo horário ao mesmo tempo.
- **Solução:** modelei o vínculo do usuário com o estabelecimento no token e apliquei verificação de conflito, chave de idempotência e limite de requisições nas rotas sensíveis, com testes para papéis e conflito.
- **Tecnologias na linha:** Next.js, TypeScript, PostgreSQL
- **Ano:** 2026
- **Links públicos:** nenhum. Código privado.

Nota de fidelidade (2026-11-18): o limite de requisições existe em `proxy.ts` e usa `Map` em memória, o que mantém a ressalva já registrada em 7.1. Não há teste automatizado de disponibilidade: os testes cobrem papéis, conflito e idempotência. Por decisão D3 o `.NET` não entra em nenhum texto público. A ficha exibe as mesmas três tecnologias da linha, porque o campo de stack do `<dialog>` é lido da linha e não de `projectDetails`: criar uma lista separada para a ficha duplicaria conteúdo sem uso.

### 8.2 Seirei

- **Nome público:** Seirei
- **Categoria:** Produto web de produtividade
- **Propósito:** aplicativo que mostra uma tarefa por vez para ajudar a terminar o que se começa, no computador e no celular.
- **Capacidades comprovadas:**
  1. Uma tarefa por vez no modo foco, com concluir, pular e nova rodada.
  2. Entrada por texto ou voz, com várias tarefas separadas automaticamente.
  3. Ordenação e duração estimadas por IA, validadas contra as tarefas do dia e com retorno à ordem de inserção quando a chamada falha.
  4. Sincronização entre computador e celular, com RLS por usuário e última gravação prevalecendo.
- **Resumo para a lista:** aplicativo de foco que mostra uma tarefa por vez, ordena o dia com IA e sincroniza entre dispositivos.
- **Papel:** desenvolvimento individual do produto, do schema ao aplicativo.
- **Desafio:** manter o foco em uma tarefa sem perder o que ficou para depois e continuar confiável quando a IA de ordenação falha.
- **Solução:** persisti ordem, dependências e duração no banco, validei a resposta da IA contra as tarefas reais do dia e mantive fallback explícito; a sincronização usa RLS por usuário e última gravação prevalecendo.
- **Tecnologias:** Next.js, TypeScript, Supabase
- **Ano:** 2026
- **Links públicos:** nenhum. Código privado.

### 8.3 Open Mind

- **Nome público:** Open Mind
- **Categoria:** Ferramenta de desenvolvimento
- **Propósito:** plugin que leva o contexto de um Vault do Obsidian para dentro do OpenCode.
- **Capacidades comprovadas:**
  1. Contexto do Vault associado ao projeto da sessão pelo caminho.
  2. Busca e leitura confinadas à raiz do Vault, com caminho relativo e limites explícitos.
  3. Escrita desabilitada por padrão, liberada por operação e condicionada ao hash da versão lida.
  4. Seis ferramentas disponíveis ao OpenCode, de status e busca até criação e atualização de notas.
- **Resumo para a lista:** plugin para OpenCode que transforma um Vault do Obsidian em contexto de projeto, com leitura confinada e escrita desabilitada por padrão.
- **Papel:** desenvolvimento individual do plugin, dos testes e da documentação.
- **Desafio:** dar contexto de notas locais a um agente sem expor caminhos absolutos e sem permitir escrita sem autorização.
- **Solução:** separei core, adaptador do OpenCode e acesso ao filesystem, confinei as operações à raiz do Vault e condicionei cada escrita a permissão explícita e ao hash da versão lida.
- **Tecnologias:** TypeScript, Node.js, OpenCode
- **Ano:** 2026
- **Links públicos:** GitHub, `https://github.com/nicolasponciano/open-mind`

## 9. Divulgação segura

| Item | MarcAi | Seirei | Open Mind |
|---|---|---|---|
| Repositório | privado | privado | público |
| Link de código | não publicar | não publicar | publicar |
| Nome do produto | sim | sim | sim |
| Descrição de capacidades | sim, apenas o aprovado na seção 8 | sim | sim |
| Trecho de código ou tela | não | não | sim, o que já é público |
| Nome de cliente, estabelecimento ou tenant | não | não | não se aplica |

Regras:

- Nenhum caminho de repositório privado, URL de preview, endpoint, project ref, credencial ou nome de cliente entra neste repositório nem nos dados do portfólio.
- As descrições falam de capacidades e decisões, não de implementação confidencial.
- Se um repositório privado vier a ser publicado, a divulgação de detalhes técnicos e eventuais mudanças de visibilidade dependem de revisão de segurança e autorização específica.
- A publicação das descrições aprovadas não depende de link de código para repositório privado, porque não há link publicado.

## 10. Impacto técnico

| Componente | Impacto |
|---|---|
| `index.html` | três linhas: título, resumo, ano, stacks, links e prévia. MarcAi e Seirei ficam sem âncora de GitHub; Open Mind mantém. IDs e `aria-labelledby` passam a usar o slug novo. |
| `src/data/portfolio.js` | três entradas novas com `role`, `challenge`, `solution`, `featured`, `preview` e `schematic` (rótulo, selo, propósito, 4 itens). MarcAi com `featured: true`. |
| `src/core.js` | ganha apenas funções puras do mapa de slugs antigos (`resolveLegacyProject`, `isObsoleteProject`). `normalizeSchematic` e o limite de 4 itens continuam intactos. A mudança é aditiva e existe para que o roteamento seja testável sem DOM simulado, conforme a regra de execução de `tasks.md`. |
| `src/app.js` | sem mudança estrutural. Filtros continuam gerados a partir das linhas; o destaque vem de `featured`. Passa a consumir o mapa de slugs antigos e a exibir o aviso de link obsoleto. |
| `src/content.js` | hoje a ficha grava `[A preencher]` quando não há link. Ganha o estado "Código privado", derivado de `codeVisibility` em `projectDetails` e não da ausência de link. |
| `src/styles.css` | ajuste pontual para o estado sem link e para o aviso de link obsoleto. Sem novo componente visual. |
| Slugs | `marcai`, `seirei` e `open-mind` no lugar de `projeto-01` a `projeto-03`. |
| Links antigos | `projeto-02` era Open Mind e redireciona para `open-mind`. `projeto-01` (ClienteAPI) e `projeto-03` (Skill Upgrader) não têm sucessor e não abrem ficha de outro projeto. |
| Filtros | as stacks mudam e os botões são regenerados. A contagem continua "3 de 3" sem filtro. |
| Hero | `featured: true` em MarcAi. `preview` usa `panel` em MarcAi, `flow` em Seirei e `terminal` em Open Mind. |
| Testes | `content.test.mjs`, `markup.test.mjs` e `publicacao.test.mjs` fixam nomes, slugs, stacks e resumos e precisam acompanhar. `styles.test.mjs` só muda se o seletor do aviso entrar na trava. |
| Documentação | `README.md`, `requirements.md`, `tasks.md` e `verificacao.md` citam os projetos atuais. |
| Preservado | pager circular, temas, palette, fichas, acessibilidade, movimento reduzido, sem JS e as três caixas do Ajuste 02. |

### 10.1 Estratégia de slugs e links antigos

- `#projeto/marcai`, `#projeto/seirei` e `#projeto/open-mind` passam a ser as URLs canônicas.
- A canonicalização roda tanto na carga completa quanto quando o hash muda na mesma página. `hashchange` e `popstate` chamam o mesmo sincronizador, que ignora a segunda chamada da mesma navegação.
- `projeto-02` era Open Mind. O mapa `projeto-02 → open-mind` preserva o link e não troca o projeto associado. A URL é corrigida com `history.replaceState`, sem criar entrada nova no histórico, e só depois o estado é aplicado, para que a ficha já abra no slug canônico.
- `projeto-01` era ClienteAPI e `projeto-03` era Skill Upgrader. Nenhum dos dois continua na seleção. O hash é removido e a seção Projetos exibe um aviso curto e acessível: o projeto do link não faz parte da seleção atual. O aviso não abre ficha e não escolhe outro projeto.
- O mapa vale só para os três slugs legados. Qualquer outro hash desconhecido continua removido em silêncio, como hoje, sem aviso novo.
- O aviso usa `role="status"` em região já existente na marcação, desaparece ao abrir um projeto, ao trocar de filtro e ao fechar a ficha, e não insere histórico. Não recebe foco e não interrompe a leitura.
- `?stack=` é independente do hash: o redirecionamento de `projeto-02` mantém o parâmetro, e hash desconhecido não descarta um filtro válido.
- Voltar e Avançar continuam consistentes porque nada é empilhado: o redirecionamento usa `replaceState` e o fechamento usa o mesmo caminho de hoje.
- Sem JavaScript, nenhum dos dois comportamentos acontece: a lista continua legível e a âncora não abre nada, como hoje.

## 11. Fora de escopo

- Atividades de remediação de segurança. Isso pertence ao plano privado.
- Publicar repositório privado, mudar visibilidade, criar deploy ou gravar demo em vídeo.
- Criar nova seção, novo cartão, imagem, ícone, sombra ou gradiente.
- Alterar a matriz de avaliação ou reabrir a seleção.
- Ajustar a rolagem horizontal herdada em 320 e 340 px.
- Refatorar `src/core.js` ou alterar o formato do esquema de prévia. As funções puras do mapa de slugs antigos, previstas na seção 10, são aditivas e não contam como refatoração.

## 12. Critérios de aceite

- CA-01: as três linhas aparecem na ordem MarcAi, Seirei, Open Mind, com nome, resumo, ano 2026 e stacks aprovados.
- CA-02: MarcAi é o projeto em destaque no hero e a prévia do hero mostra as quatro capacidades numeradas da seção 8.1.
- CA-03: as quatro capacidades de Seirei e de Open Mind nas prévias são exatamente as aprovadas na seção 8, e as três fichas exibem papel, desafio e solução aprovados.
- CA-04: MarcAi e Seirei exibem "Código privado" na ficha, sem âncora quebrada, sem link de repositório e sem `[A preencher]`.
- CA-05: Open Mind mantém o link público e o rótulo "GitHub".
- CA-06: `#projeto/marcai`, `#projeto/seirei` e `#projeto/open-mind` abrem a ficha correta; Voltar fecha.
- CA-07: `#projeto/projeto-02` abre Open Mind e troca a URL para `#projeto/open-mind` sem criar entrada no histórico.
- CA-08: `#projeto/projeto-01` e `#projeto/projeto-03` não abrem ficha, removem o hash e exibem o aviso de link obsoleto.
- CA-09: os filtros refletem apenas as stacks das três linhas e a contagem continua "3 de 3" sem filtro.
- CA-10: nenhum nome de repositório privado, URL privada, endpoint, credencial, project ref, nome de cliente, estabelecimento ou preço aparece no HTML, nos dados ou nos testes.
- CA-11: a lista de Projetos não ganha linha, ícone, imagem, sombra ou gradiente.
- CA-12: as três caixas de prévia continuam com moldura, filetes, selo e altura comum por faixa.
- CA-13: os temas tinta e papel mantêm contraste mínimo de 4,5:1 em todos os textos das prévias, fichas e aviso.
- CA-14: `npm test` e `PUBLICAR=1 npm test` passam sem falha após a atualização dos testes fixos.
- CA-15: sem JavaScript a lista continua legível e as caixas decorativas seguem ocultas.
- CA-16: nenhum repositório privado é tornado público por causa deste ajuste.

Observação sobre CA-02 e CA-03: as quatro capacidades vivem em `schematic.items`, renderizadas nas prévias do hero e da linha, como no Ajuste 02, e não em uma lista nova dentro do `<dialog>`. A ficha acessível continua exibindo resumo, papel, stack, desafio, solução e links. Criar lista de capacidades na ficha está fora de escopo e violaria a reutilização integral do renderizador do Ajuste 02.

## 13. Plano de implementação

- TA-00: aprovar os textos da seção 8, a ordem, as stacks e a lista de links. Bloqueia TA-01 a TA-05.
- TA-00: **concluída em 2026-11-18.** Aprova os textos da seção 8, a ordem, as stacks e a lista de links. Nenhum código de produção alterado.
- TA-01 (atômica): conteúdo, marcação e estado de código privado no mesmo passo. `src/data/portfolio.js` recebe as três entradas (`marcai`, `seirei`, `open-mind`) com `role`, `challenge`, `solution`, `featured`, `preview`, `codeVisibility` e `schematic` de 4 itens; `index.html` recebe as três linhas com título, resumo, ano, stacks, slugs, IDs e `aria-labelledby` novos, sem âncora para os privados; `src/content.js` e `src/styles.css` recebem o estado "Código privado"; `tests/content.test.mjs`, `tests/markup.test.mjs` e `tests/publicacao.test.mjs` são atualizados para os textos aprovados. Fecha CA-01 a CA-05, CA-09, CA-11, CA-12 e CA-14.
- TA-01: **concluída em 2026-11-18.** As três entradas, as três linhas, o estado "Código privado" e as travas de conteúdo, markup, publicação e altura entraram no mesmo passo. `npm test` 112/118 com 6 ignorados; `PUBLICAR=1 npm test` 118/118. Nenhum link de repositório privado, nenhum `[A preencher]` e nenhuma referência aos projetos antigos na interface.
- TA-02: links antigos. `src/core.js` recebe as funções puras `resolveLegacyProject` e `isObsoleteProject`; `src/app.js` aplica o mapa dentro de `canonicalize`, depois remove o hash obsoleto e exibe o aviso; `index.html` recebe a região `role="status"` do aviso, inerte sem JavaScript; `src/styles.css` estiliza o aviso sem componente novo; `tests/core.test.mjs` cobre mapa, slug canônico, slug obsoleto e preservação de `?stack=`. Fecha CA-06, CA-07, CA-08 e CA-15.
- TA-02: **concluída em 2026-11-18.** `resolveLegacyProject` mapeia só `projeto-02` para `open-mind`; `isObsoleteProject` reconhece só `projeto-01` e `projeto-03`; `canonicalize` usa `replaceState`, preserva `?stack=` e alimenta a região `role="status"` com `textContent`. O aviso nasce vazio e `hidden` no HTML, é limpo por filtro, abertura, fechamento e palette, e não volta na recarga canonicalizada. `npm test` 118/124 com 6 ignorados; `PUBLICAR=1 npm test` 124/124. Verificado nos temas tinta e papel em 390 e 1440 px, sem rolagem horizontal e sem erro de console.
- TA-03: **concluída em 2026-11-18.** Conferidos os 16 critérios no navegador, nos temas tinta e papel, em 360, 390, 768, 1024 e 1440 px, com teclado, árvore de acessibilidade, movimento reduzido e sem JS. `npm test` 118/124 com 6 ignorados; `PUBLICAR=1 npm test` 124/124. Nenhum arquivo de produção alterado. Documentação sincronizada em `README.md`, `requirements.md`, `tasks.md`, `verificacao.md` e nesta spec. Ressalvas registradas: em 360 px a prévia do Seirei mede 6 px a mais que as outras; hash antigo alterado no mesmo documento não passa por `canonicalize`.

- TA-04 (complementar, 2026-11-18): **concluída.** Estabilização dos dois defeitos residuais da TA-03. `src/core.js` ganha `resolveProjectLocation`, que resolve alias, projeto obsoleto, slug desconhecido e stack em uma função pura; `src/app.js` passa `hashchange` e `popstate` por um único `syncFromLocation`, com guarda de URL já aplicada para não duplicar tratamento; `src/styles.css` sobe a altura comum do herói para 520 px até 400 px e cria a faixa de 486 px entre 401 e 650 px. Testes puros simulam a navegação sem recarga e travas de CSS fixam as novas faixas. Reavalia CA-06, CA-07, CA-08 e CA-12. Relatório em `verificacao.md`, seção 13.

Sequenciamento revisado. Quatro tarefas, porque a divisão anterior deixava estados incompatíveis:

- Dados e HTML não podem ser separados. As linhas vivem no HTML e as fichas, o destaque e as prévias vêm de `portfolio.js`. Trocar só o HTML zera as fichas, tira o destaque do MarcAi e quebra as travas de conteúdo, markup e publicação. Trocar só os dados quebra a trava de chaves e o teste de publicação que exige slug no HTML. Por isso TA-01 é atômica e absorve o antigo TA-05.
- O estado "Código privado" também entra em TA-01. Publicar MarcAi e Seirei sem link antes do estado novo exibiria `[A preencher]` na ficha, que é exatamente o que CA-04 proíbe.
- Nenhuma tarefa duplica regra de conteúdo para satisfazer teste antigo. As travas de `tests/` são reescritas para os textos aprovados, não contornadas com dados duplicados ou chaves legadas mantidas em `projectDetails`.
- Cada tarefa termina com `npm test` verde. TA-01 e TA-02 incluem a atualização dos testes que elas próprias afetam.
- `src/core.js` só ganha funções puras, conforme a regra de `tasks.md` de não criar teste com DOM simulado.

Nenhuma tarefa começa antes da autorização explícita de Nicolas.

## 14. Decisões

- D1: decidida. `projeto-02` redireciona para `open-mind`; `projeto-01` e `projeto-03` são obsoletos e não abrem projeto substituto. Nenhum slug legado é reutilizado para outro projeto.
- D2: decidida. Três tecnologias por linha, preservando a altura medida no Ajuste 02.
- D3: decidida. A ficha de MarcAi descreve só a aplicação web. A API `.NET` não é citada em nenhum texto público, por estar incompleta e sem consumo confirmado.
- D4: decidida. Ano 2026 nos três projetos.

## 15. Arquivos previstos

| Tarefa | Arquivos |
|---|---|
| TA-01 | `src/data/portfolio.js`, `index.html`, `src/content.js`, `src/styles.css`, `tests/content.test.mjs`, `tests/markup.test.mjs`, `tests/publicacao.test.mjs` |
| TA-02 | `src/core.js`, `src/app.js`, `index.html`, `src/styles.css`, `tests/core.test.mjs` e, se o seletor do aviso entrar na trava, `tests/styles.test.mjs` |
| TA-03 | `README.md`, `specs/portfolio-v1-1/requirements.md`, `specs/portfolio-v1-1/tasks.md`, `specs/portfolio-v1-1/verificacao.md`. Nenhum arquivo de produção. |
| TA-04 | `src/core.js`, `src/app.js`, `src/styles.css`, `tests/core.test.mjs`, `tests/markup.test.mjs`, `tests/styles.test.mjs`, `README.md`, `DESIGN.md`, `specs/portfolio-v1-1/requirements.md`, `specs/portfolio-v1-1/tasks.md`, `specs/portfolio-v1-1/verificacao.md`, `specs/portfolio-v1-1/ajuste-03-selecao.md`. |

## 16. Riscos residuais

1. MarcAi e Seirei continuam privados. Qualquer mudança de visibilidade depende de revisão de segurança e autorização específica, atividade separada e prioritária.
2. O limite de requisições do MarcAi vive em memória no `proxy.ts`. A frase pública é verdadeira, mas não descreve limite distribuído. Se for lida como garantia de produção, reescrever.
3. Seirei não tem suíte automatizada. A fidelidade dos textos foi conferida no código e na verificação manual registrada, mas regressões futuras não serão detectadas por teste.
4. Open Mind foi validado só em Windows com OpenCode 2.2.5, com três testes ignorados nessa plataforma.
5. Filtros antigos deixam de existir: `?stack=html`, `?stack=markdown` e `?stack=dotnet` são descartados na canonicalização e a lista cai em "Todas". O estado vazio continua na interface como defesa, mas não é alcançável por URL. É consequência esperada da troca de projetos, não regressão.
6. O aviso de link obsoleto depende de a região `role="status"` existir no HTML e de o CSS escondê-la por padrão. Se o CSS não entrar junto, o aviso aparece sempre.
7. Resolvido na TA-04: em 360 px as três prévias passaram a medir 520 px; a altura comum também cobre 401 a 650 px com 486 px. A medição de 6 px em 360 px fica registrada como histórico da TA-03.
8. O aviso é anunciado por `role="status"` no carregamento inicial, depois do JS. Sem JavaScript ele não existe, o que mantém o comportamento atual do link.
9. A spec cita o nome público dos produtos. Nenhum caminho de repositório privado, URL, endpoint, project ref, credencial ou nome de cliente entra em arquivo público deste repositório.
10. Resolvido na TA-04: mudança de hash no mesmo documento passou a ser canonicalizada por um único sincronizador de `hashchange`/`popstate`, sem duplicar tratamento nem empilhar histórico. O registro da limitação original permanece em `verificacao.md`, seção 12.7, como histórico da auditoria.
11. Resolvido na TA-04: a altura comum do herói passou a 520 px até 400 px e 486 px entre 401 e 650 px. Em 360 px as três prévias medem 520 px, com o pager no mesmo Y; as demais faixas de contrato foram remedidas sem regressão.

## 17. Encerramento do Ajuste 03

TA-00, TA-01, TA-02, TA-03 e TA-04 concluídas. TA-01 trocou dados, markup, estado de código privado, alturas das prévias e testes no mesmo passo. TA-02 adicionou o mapa de links antigos, o aviso acessível e suas travas de teste. TA-03 auditou os 16 critérios, mediu responsividade, acessibilidade, segurança e testes, e sincronizou a documentação. TA-04 corrigiu a navegação por hash no mesmo documento e estabilizou a altura do herói, com testes novos. Nenhum commit, push, merge ou deploy.

Resultado final: **AJUSTE 03 PRONTO PARA REVISÃO DE PUBLICAÇÃO**, sem ressalvas abertas de navegação ou altura. O registro da TA-03, com as duas limitações então existentes, permanece em `verificacao.md`, seção 12, e a correção está na seção 13.

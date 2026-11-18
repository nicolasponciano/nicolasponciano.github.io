# Requirements: Portfólio v1.1

## Visão geral

Evolução da v1.0 aprovada. A v1.1 fecha a maior lacuna de credibilidade do portfólio atual (prévias abstratas), corrige a hierarquia do herói, adiciona a trajetória profissional e acadêmica com dados reais e sincroniza a documentação com o produto que existe hoje. O escopo é P1, P2, P4, P5 e P6. P3 fica no backlog.

Nada aqui autoriza copiar design, código ou conteúdo de qualquer referência analisada, adicionar dependência, alterar a identidade visual ou inventar informação.

## Relação com a v1.0

- Os critérios CA-01 a CA-42 de `specs/portfolio-interativo/requirements.md` continuam válidos, exceto onde esta spec declara a substituição.
- Substituições explícitas: CA-07 ganha composição situada e rótulo de esquema (mantém o fallback para o tipo `panel`); o teste de markup que exige `Full Stack` dentro do `<h1>` muda porque o nome passa a ser o `h1`; CA-26 muda no nome acessível e no estado do botão de tema, conforme RF-18.
- Nenhum outro contrato da v1.0 muda: URL canônica, filtro, ficha, palette, tema visual, sem-JS e publicação continuam iguais.

## Escopo aprovado

| Item | Entrega |
|---|---|
| P1 | Prévias situadas, compostas apenas por funcionalidades comprovadas nos repositórios, identificadas como esquemáticas. |
| P2 | Herói com nome dominante, papel como kicker, linha de fatos verificáveis e pager manual no palco. |
| P4 | Seção Trajetória com experiência e formação extraídas do currículo fornecido. |
| P5 | Micro-interações restantes, reaproveitando tokens e padrões existentes. |
| P6 | Documentação corrigida, sem alterar contratos da v1.0. |

## Funcionalidades

### RF-12 Prévia situada e esquemática (P1)

Cada projeto deixa de exibir quatro blocos genéricos e passa a exibir um esquema reconhecível da sua funcionalidade real. O esquema usa apenas fatos comprovados no repositório ou no material do projeto.

Conteúdo permitido, por projeto:

| Projeto | Elementos comprovados que podem aparecer |
|---|---|
| MarcAi | agenda com disponibilidade por profissional, serviço e duração; isolamento por estabelecimento; papéis de dono e equipe aplicados no servidor; agendamento idempotente com verificação de conflito e auditoria; página pública de agendamento. |
| Seirei | modo foco com concluir, pular e nova rodada; entrada por texto ou voz com separação automática; ordenação e duração estimadas por IA com validação e fallback; dependência entre tarefas; sincronização com RLS por usuário. |
| Open Mind | as seis ferramentas `open_mind_status`, `open_mind_search`, `open_mind_read`, `open_mind_create`, `open_mind_update`, `open_mind_project_context`; contexto de projeto por sessão; leitura confinada à raiz do Vault; escrita desabilitada por padrão e condicionada ao hash da versão lida. |

Atualização de 2026-11-18 (Ajuste 03): a seleção passou a ser MarcAi, Seirei e Open Mind, nesta ordem, com MarcAi em destaque. ClienteAPI e Skill Upgrader, que ocupavam a tabela anterior desta spec, saíram do portfólio. Cada esquema passou a ter quatro itens, sem o agrupamento de cinco ferramentas e sem rodapé separado: a sexta ferramenta do Open Mind é citada no quarto item, junto das outras cinco.

Critérios de aceite:
- CA-43: os três esquemas válidos (MarcAi, Seirei e Open Mind) exibem exatamente quatro elementos nomeados cada; nenhum esquema usa texto genérico como "bloco", "painel" ou "fluxo" como conteúdo. O mínimo de quatro não se aplica ao esquema neutro de fallback de CA-47.
- CA-44: nenhum elemento do esquema afirma função, integração, métrica ou resultado ausente da tabela de conteúdo permitido; nome de ferramenta aparece exatamente como no repositório.
- CA-45: todo palco e toda prévia de linha exibem o rótulo visível "Prévia conceitual" ao lado do tipo da prévia, e o palco mantém o tipo descritivo ("SaaS de agendamentos", "Produto web de produtividade", "Ferramenta de desenvolvimento").
- CA-46: CA-07 permanece: a prévia é composta em HTML/CSS a partir dos dados do projeto, sem imagem, vídeo, `canvas`, SVG novo ou requisição; tipo desconhecido cai em `panel`.
- CA-47: slug sem esquema ou esquema inválido (sem itens, item sem texto) não quebra a página: a prévia cai no esquema neutro do tipo e nenhum erro vai ao console.
- CA-48: a troca de prévia continua em 160 ms, não desloca linhas nem palco, e o conteúdo do esquema fica dentro de um contêiner `aria-hidden="true"`.

### RF-13 Herói com nome dominante e pager manual (P2)

O herói passa a identificar a pessoa primeiro. O palco deixa de ser uma peça estática e ganha um pager manual, sem troca automática.

Critérios de aceite:
- CA-49: o `<h1>` contém apenas "Nicolas Ponciano"; o papel "Desenvolvedor de Software Full Stack" aparece como kicker acima do nome; o resumo aprovado continua abaixo.
- CA-50: entre o resumo e as ações existe uma linha com três fatos verificáveis no currículo, sem número de anos, métrica ou resultado: backend .NET e SQL Server, sistemas web corporativos, pós-graduação em IA em andamento.
- CA-51: com dois ou mais projetos, o palco do herói tem exatamente dois botões (anterior e próximo) e um contador `01 / 03`; o índice inicial é o projeto `featured`; a navegação é circular e não existe timer, autoplay ou troca por tempo. Com zero projetos, o palco fica vazio e sem pager; com um projeto, mostra o projeto sem pager e sem contador. Nunca existe controle visível sem função.
- CA-52: os botões são operáveis por Tab, Enter e Espaço, têm nome acessível "Prévia anterior" e "Próxima prévia", alvo mínimo de 44 px, foco visível e não movem o foco após a troca; a troca anuncia "`<título>`, prévia N de M" em região `aria-live="polite"`, com M igual ao total de projetos.
- CA-53: o pager não altera a URL, não cria histórico e não controla o palco do índice; os dois palcos são independentes.
- CA-54: o contêiner do palco deixa de ser `aria-hidden` (para os botões serem alcançáveis); apenas a moldura textual e o canvas do esquema ficam `aria-hidden`, e o conjunto tem nome acessível "Prévia de projetos".
- CA-55: com `prefers-reduced-motion: reduce`, a troca é instantânea, sem animação de entrada, e todo o conteúdo permanece visível; sem JS, o palco e o pager continuam ocultos por `html.no-js`.

### RF-14 Trajetória (P4)

Nova seção entre Projetos e Sobre. Todo dado vem do currículo fornecido por Nicolas em 2026-11-17, em arquivo local mantido fora do repositório. Esta spec registra a data de referência. Se o arquivo for movido, a fonte continua sendo o currículo fornecido, não uma inferência.

Conteúdo aprovado para esta versão:

| Período | Cargo | Organização | Local |
|---|---|---|---|
| fev. 2026 a atual | Desenvolvedor de Software Júnior | Empresa do setor de tecnologia (nome não informado no currículo) | Rio de Janeiro |
| jul. 2025 a fev. 2026 | Desenvolvedor de Software Júnior | SOFTCASE Soluções Tecnológicas | Santos |
| jul. 2024 a jul. 2025 | Estágio em Desenvolvimento de Software | SOFTCASE Soluções Tecnológicas | São Vicente |

| Período | Curso | Instituição |
|---|---|---|
| fev. 2026 a fev. 2027 (em andamento) | Pós-Graduação em Inteligência Artificial | Universidade Santa Cecília |
| fev. 2023 a jun. 2025 | Tecnólogo em Análise e Desenvolvimento de Sistemas | Universidade Santa Cecília |
| fev. 2022 a jul. 2023 | Ensino Técnico em Tecnologia da Informação | ETEC Praia Grande |

Ficam fora da v1.1, por decisão editorial aprovada e não por falta de dado: a experiência de suporte de jul. a nov. de 2023 e o período na Plano Santa Casa Saúde (2021 a 2022). A seção cobre apenas a trajetória em desenvolvimento de software e a formação correspondente.

Critérios de aceite:
- CA-56: a seção existe com `id="trajetoria"`, `data-section-label="Trajetória"`, entra na palette sem código extra e não adiciona item à navegação do cabeçalho.
- CA-57: cada experiência mostra período, cargo, organização e local exatamente como na tabela; a organização sem nome no currículo aparece como "Empresa do setor de tecnologia", nunca como empresa inventada.
- CA-58: cada formação mostra período, curso e instituição exatamente como na tabela; a pós-graduação exibe "em andamento" e não é apresentada como concluída.
- CA-59: nenhuma linha traz entrega, resultado, cliente, tecnologia ou senioridade que não esteja no currículo; a seção não promete "3 anos de experiência" nem qualquer número.
- CA-60: a marcação usa `section`, `h2`, subtítulo `h3`, lista ordenada e itens; período, cargo e organização são texto legível, não barra de progresso, gráfico ou elemento dependente de cor.
- CA-61: em 390 px a seção empilha em uma coluna, sem rolagem horizontal; a ordem de leitura é período, cargo, organização, local.

### RF-15 Micro-interações restantes (P5)

Só entra o que falta. Tokens, padrões de hover, press, foco e o desligamento global de movimento já existem.

Critérios de aceite:
- CA-62: nenhum token novo de duração ou curva; novos controles usam `--dur-1` e `--dur-2` e o padrão `scale(0.98)` no press.
- CA-63: botões do pager têm hover, press e `:focus-visible` com `outline`; o link textual "Entrar em contato" ganha resposta de press que não desloca o layout.
- CA-64: nenhuma transição nova anima `width`, `height`, `top`, `left`, `margin`, `padding`, `gap` ou `all`; CA-25 continua valendo.
- CA-65: os controles existentes (tema, filtro, linha, ficha, palette, copiar e-mail) não mudam de comportamento, duração ou foco.

### RF-16 Documentação sincronizada (P6)

A documentação descreve o produto atual, sem reescrever contratos.

Critérios de aceite:
- CA-66: `README.md` deixa de citar 18/8 cursores e "montagem por cursores" como experiência principal; descreve prévia esquemática, herói, trajetória, ficha, palette, temas e testes reais, e corrige a lista de arquivos e a seção de edição de conteúdo.
- CA-67: `PRODUCT.md` reflete a direção aprovada (conteúdo primeiro, prévia esquemática, cena opt-in), o público e a hospedagem publicada, e remove afirmações desatualizadas sobre montagem obrigatória e dados pendentes.
- CA-68: `DESIGN.md` e `.impeccable/surfaces/index-html.md` registram nome dominante, pager manual, prévias esquemáticas, Trajetória e os estados reais; tokens, cores e tipografia existentes não mudam.
- CA-69: nenhum documento altera critérios CA-01 a CA-42 nem reescreve `specs/portfolio-interativo/verificacao.md`; notas históricas recebem marcação de data, não reescrita.

### RF-17 Regressão e verificação

Critérios de aceite:
- CA-70: CA-01 a CA-42 continuam passando, exceto a troca de `h1` declarada nesta spec; `npm test` verde e `PUBLICAR=1 npm test` verde antes de publicar.
- CA-71: em 390, 768, 1024 e 1440 px não há rolagem horizontal, corte de texto, sobreposição do pager ou perda de alvo de 44 px nas áreas alteradas. Em 390 px, o nome ocupa no máximo duas linhas, nenhuma palavra fica cortada ou sobreposta, a linha de fatos, as duas ações e a busca cabem na largura, e o palco com pager aparece inteiro abaixo da cópia. Em 1024 px, o herói mantém duas colunas, o nome não é truncado nem invade o palco, e o pager não cobre a borda nem o conteúdo do esquema.
- CA-72: contraste de texto e controles novos permanece no mínimo 4,5:1 nos temas tinta e papel.
- CA-73: nenhuma dependência, etapa de build, fonte nova, imagem nova ou requisição de rede é adicionada.

### RF-18 Botão de tema como ação (Ajuste 01)

Correção do contrato de acessibilidade herdado da v1.0. O botão exibia o rótulo fixo "Tema papel" e `aria-pressed`, então o texto não informava o que aconteceria ao clicar e o controle misturava rótulo variável com estado de toggle. Esta regra substitui CA-26 apenas no nome acessível e no estado do botão; a persistência, a preferência inicial e os temas visuais continuam valendo.

Critérios de aceite:
- CA-74: com o tema tinta ativo, o botão exibe "Ativar tema papel"; com o tema papel ativo, exibe "Ativar tema tinta". O texto muda na mesma interação que troca `data-theme`, sem recarregar a página e sem indicar o estado atual como rótulo.
- CA-75: o nome acessível corresponde ao texto visível. O botão não tem `aria-label` paralelo, `aria-pressed` nem `role="switch"`; é um botão de ação.
- CA-76: abaixo de 720 px o rótulo permanece no nome acessível por recorte visual, nunca por `display: none`.
- CA-77: o HTML inicial mostra a ação correta para o tema tinta (fallback), e `initTheme` sincroniza o rótulo com o armazenamento e o sistema antes da primeira interação, sem rótulo errado visível.
- CA-78: `localStorage` sob `portfolio-theme`, `prefers-color-scheme` na primeira visita, temas, tokens, cores e movimentos não mudam.
- CA-79: o botão continua nativo (`type="button"`), operável por Tab, Enter e Espaço; cada acionamento troca o tema, atualiza o rótulo e `meta[theme-color]` e grava a preferência.

### RF-19 Seleção de projetos (Ajuste 03)

Aprovada em 2026-11-18. Substitui integralmente a lista de projetos de RF-12; os critérios CA-01 a CA-16 de `specs/portfolio-v1-1/ajuste-03-selecao.md` são a autoridade desta seleção.

| Posição | Projeto | Categoria | Código | Stack na linha |
|---|---|---|---|---|
| 1 destaque | MarcAi | SaaS de agendamentos | privado | Next.js, TypeScript, PostgreSQL |
| 2 | Seirei | Produto web de produtividade | privado | Next.js, TypeScript, Supabase |
| 3 | Open Mind | Ferramenta de desenvolvimento | público | TypeScript, Node.js, OpenCode |

Regras:
- Todos os projetos exibem ano 2026 e exatamente três tecnologias na linha.
- MarcAi é o `featured`: é a prévia inicial do herói.
- MarcAi e Seirei não têm âncora de repositório e exibem "Código privado", derivado de `codeVisibility` em `projectDetails`. Open Mind mantém o link público com o rótulo "GitHub".
- Os slugs canônicos são `marcai`, `seirei` e `open-mind`. `projeto-02` canonicaliza para `open-mind` com `replaceState`; `projeto-01` e `projeto-03` removem o hash e exibem um aviso em `role="status"`. Hash desconhecido continua removido em silêncio. A mesma regra vale na carga completa e quando o hash muda na página, sem recarga, com um único caminho para `hashchange` e `popstate`.
- Os filtros são gerados a partir das stacks das três linhas. Stack fora da seleção é descartada na canonicalização da URL, sem estado vazio artificial.
- Nenhum caminho, URL de repositório privado, endpoint, project ref, credencial, nome de cliente ou preço entra em arquivo público.

## Backlog

- P3: bloco "Decisões técnicas" dentro da ficha do projeto, com escolhas, alternativas e trade-offs. Fica fora da v1.1; exige dados reais por projeto e novo espaço na folha.
- Estado do pager na URL (`?previa=<n>` ou hash): não entra na v1.1.
- Inclusão da experiência de suporte de jul. a nov. de 2023 e do período na Plano Santa Casa Saúde: fora da v1.1 por decisão editorial de 2026-11-17. Podem voltar em versão futura, com texto próprio e sem inflar a seção.
- Navegação com item "Trajetória" no cabeçalho: avaliar em versão futura, depois de medir o espaço em 390 px e 1024 px. A v1.1 usa rolagem e palette.

## Fora de escopo

- Reestruturar o site, trocar a identidade visual, adicionar foto, logo ou retrato.
- Copiar marquee de ferramentas, comparador antes/depois, cursor customizado, scroll-driven, selo de disponibilidade ou animar `grid-template-rows` da referência.
- Autoplay, carrossel automático, vídeo, GIF, captura de tela real ou mockup de interface de terceiros.
- Página por projeto, blog, i18n, CMS, analytics, formulário, backend ou download de currículo.
- Reescrever a cena de montagem por cursores.

## Decisões aprovadas

Aprovadas em 2026-11-17. Valem como requisito, não como sugestão.

1. Experiência de jul. a nov. de 2023: omitida por foco editorial, não por falta do título do cargo. Não entra como "A confirmar".
2. Plano Santa Casa Saúde (2021 a 2022): fora da v1.1.
3. Empregadora atual: manter "Empresa do setor de tecnologia", sem inventar nome.
4. Cidade da experiência atual: exibir Rio de Janeiro.
5. Linha de fatos do herói: manter as três frases de CA-50.
6. Resumo do herói: preservar o texto atual da v1.0.

## Decisões pendentes

Nenhuma bloqueia a implementação. Qualquer mudança de escopo posterior atualiza esta spec antes do código.

## Impacto no que já existe

- `index.html`: `h1` vira o nome, entra kicker e linha de fatos; palco do herói perde `aria-hidden` no contêiner e ganha pager; entra a seção Trajetória; o palco do índice mantém estrutura.
- `src/app.js`: `renderCanvas` passa a renderizar esquema a partir de dados; entra o controlador do pager; a prévia de linha usa o mesmo renderizador.
- `src/data/portfolio.js`: cada projeto ganha `schematic` com rótulo, nota, itens e rodapé; `preview` continua string de layout.
- `src/core.js`: entram funções puras de índice do pager, leitura/validação de esquema e rótulo de ação do tema.
- `index.html`, `src/app.js` e `src/styles.css`: o botão de tema passa a exibir a próxima ação e perde `aria-pressed` e `aria-label`, conforme RF-18; no mobile o rótulo é recortado visualmente para não perder o nome acessível.
- `src/styles.css`: novos blocos de pager, esquema, kicker, fatos e Trajetória; `.preview-block` permanece como fallback.
- `tests/`: `markup.test.mjs` muda a asserção do `h1` e ganha pager, palco e Trajetória; `styles.test.mjs` ganha pager, esquema e responsividade; `content.test.mjs` valida `schematic`; `core.test.mjs` cobre o pager.
- `README.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/surfaces/index-html.md`: sincronizados na P6.

## Riscos

- Troca do `h1` mexe em SEO, teste de markup e hierarquia visual; mitigar mantendo `<title>` e a meta description atuais.
- Tirar `aria-hidden` do palco expõe moldura decorativa ao leitor de tela; mitigar com grupo nomeado e `aria-hidden` no canvas.
- Esquemas podem virar conteúdo inventado se saírem da tabela de CA-44; revisar item por item contra o repositório.
- Nome grande no herói pode estourar em 390 px ou criar salto de layout; validar nos quatro breakpoints antes de fechar.
- Empregadora atual sem nome e ausência de 2023 e 2021 podem ser lidas como lacuna; mitigar com o recorte editorial declarado, texto neutro e nenhum "A confirmar" na página.
- Adicionar `schematic` em `projectDetails` pressiona a regra de fonte única (CA-41); limitar o objeto a fatos que a linha não carrega e documentar a regra.

export const skillGroups = [
  {
    title: "Backend e APIs",
    items: [
      { name: "C#", icon: "csharp" },
      { name: ".NET", icon: "dot-net" },
      { name: "ASP.NET Core", icon: "dotnetcore" },
      { name: "ASP.NET MVC", icon: "panels-top-left" },
      { name: "VB.NET", icon: "visualbasic" },
      { name: "APIs RESTful", icon: "route" },
      { name: "JWT", icon: "key-round" },
      { name: "Swagger/OpenAPI", icon: "swagger" },
      { name: "integrações", icon: "cable" },
    ],
  },
  {
    title: "Dados",
    items: [
      { name: "SQL Server", icon: "microsoftsqlserver" },
      { name: "T-SQL", icon: "database" },
      { name: "Entity Framework", icon: "entityframeworkcore" },
      { name: "LINQ", icon: "funnel" },
    ],
  },
  {
    title: "Web",
    items: [
      { name: "HTML5", icon: "html5" },
      { name: "CSS3", icon: "css3" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Vue.js", icon: "vuejs" },
      { name: "Bootstrap", icon: "bootstrap" },
    ],
  },
  {
    title: "Engenharia de software",
    items: [
      { name: "Git", icon: "git" },
      { name: "Clean Architecture", icon: "layers" },
      { name: "SOLID", icon: "blocks" },
      { name: "testes automatizados", icon: "list-checks" },
    ],
  },
  {
    title: "Em estudo",
    items: [
      { name: "LLMs", icon: "brain" },
      { name: "MCP", icon: "circuit-board" },
      { name: "RAG", icon: "book-search" },
      { name: "automação", icon: "workflow" },
    ],
  },
];

export const projectDetails = {
  marcai: {
    screenshots: [
      {
        src: "assets/projects/marcai/01-dashboard-preview.png",
        full: "assets/projects/marcai/01-dashboard.png",
        title: "Painel do dia",
        caption: "O painel reúne os indicadores do dia e o link público de agendamento.",
        alt: "Dashboard com seis agendamentos no dia, dois pendentes, dois confirmados e zero cancelados.",
      },
      {
        src: "assets/projects/marcai/02-agenda-preview.png",
        full: "assets/projects/marcai/02-agenda.png",
        title: "Agenda semanal",
        caption: "Na quinta-feira, seis atendimentos ocupam horários consecutivos das 9h às 15h.",
        alt: "Calendário semanal com seis blocos coloridos na coluna de quinta-feira, cada um com horário e serviço.",
      },
      {
        src: "assets/projects/marcai/03-servicos-preview.png",
        full: "assets/projects/marcai/03-servicos.png",
        title: "Serviços",
        caption: "A equipe consulta o preço, a duração e a profissional responsável por cada serviço.",
        alt: "Seis cartões de serviços do ateliê com controles para editar e excluir, e um botão Novo Serviço.",
      },
      {
        src: "assets/projects/marcai/04-agendamento-mobile-preview.png",
        full: "assets/projects/marcai/04-agendamento-mobile.png",
        title: "Escolha do serviço",
        caption: "Na página pública do Ateliê Aurora, o agendamento começa pela escolha do serviço.",
        alt: "Tela de celular com opções de corte, escova, coloração e hidratação, cada uma com duração e preço.",
      },
    ],
    role: "Desenvolvimento individual do produto, do modelo de dados à interface.",
    challenge: "Impedir horário duplicado e vazamento de dados entre estabelecimentos quando duas pessoas tentam marcar o mesmo horário ao mesmo tempo.",
    solution: "Modelei o vínculo do usuário com o estabelecimento no token e apliquei verificação de conflito, chave de idempotência e limite de requisições nas rotas sensíveis, com testes para papéis e conflito.",
    featured: true,
    preview: "panel",
    codeVisibility: "private",
    schematic: {
      label: "SaaS de agendamentos",
      note: "Prévia conceitual",
      purpose: "Plataforma de agendamentos para salões, clínicas e estúdios, com cada estabelecimento isolado no seu próprio espaço e horários calculados a partir da agenda real.",
      items: [
        "Agenda com horários disponíveis calculados por profissional, serviço e duração",
        "Cada estabelecimento isolado, com papéis de dono e equipe aplicados no servidor",
        "Criação de agendamento idempotente, com verificação de conflito e registro de auditoria",
        "Página pública de agendamento por estabelecimento, do serviço à confirmação",
      ],
    },
  },
  seirei: {
    screenshots: [
      {
        src: "assets/projects/seirei/hoje-preview.png",
        full: "assets/projects/seirei/hoje.png",
        title: "Tarefas do dia",
        caption: "A lista reúne as três tarefas do dia e permite escolher de qual tarefa cada uma depende.",
        alt: "Lista com uma tarefa concluída, duas pendentes e seletores de dependência em “nenhuma”.",
      },
      {
        src: "assets/projects/seirei/foco-preview.png",
        full: "assets/projects/seirei/foco.png",
        title: "Modo foco",
        caption: "Com uma tarefa concluída, a próxima é desenhar a tela de boas-vindas.",
        alt: "Cartão “Desenhar a tela de boas-vindas” com as ações Concluir e Pular.",
      },
      {
        src: "assets/projects/seirei/dia-concluido-preview.png",
        full: "assets/projects/seirei/dia-concluido.png",
        title: "Dia concluído",
        caption: "O modo foco confirma que as três tarefas do dia foram concluídas.",
        alt: "Barra de progresso completa sobre a mensagem “Dia concluído”.",
      },
    ],
    role: "Desenvolvimento individual do produto, do schema ao aplicativo.",
    challenge: "Manter o foco em uma tarefa sem perder o que ficou para depois e continuar confiável quando a IA de ordenação falha.",
    solution: "Persisti ordem, dependências e duração no banco, validei a resposta da IA contra as tarefas reais do dia e mantive fallback explícito; a sincronização usa RLS por usuário e última gravação prevalecendo.",
    featured: false,
    preview: "flow",
    codeVisibility: "private",
    schematic: {
      label: "Produto web de produtividade",
      note: "Prévia conceitual",
      purpose: "Aplicativo que mostra uma tarefa por vez para ajudar a terminar o que se começa, no computador e no celular.",
      items: [
        "Uma tarefa por vez no modo foco, com concluir, pular e nova rodada",
        "Entrada por texto ou voz, com várias tarefas separadas automaticamente",
        "Ordenação e duração estimadas por IA, validadas contra as tarefas do dia e com retorno à ordem de inserção quando a chamada falha",
        "Sincronização entre computador e celular, com RLS por usuário e última gravação prevalecendo",
      ],
    },
  },
  "open-mind": {
    screenshots: [],
    role: "Desenvolvimento individual do plugin, dos testes e da documentação.",
    challenge: "Dar contexto de notas locais a um agente sem expor caminhos absolutos e sem permitir escrita sem autorização.",
    solution: "Separei core, adaptador do OpenCode e acesso ao filesystem, confinei as operações à raiz do Vault e condicionei cada escrita a permissão explícita e ao hash da versão lida.",
    featured: false,
    preview: "terminal",
    codeVisibility: "public",
    schematic: {
      label: "Ferramenta de desenvolvimento",
      note: "Prévia conceitual",
      purpose: "Plugin que leva o contexto de um Vault do Obsidian para dentro do OpenCode.",
      items: [
        "Contexto do Vault associado ao projeto da sessão pelo caminho",
        "Busca e leitura confinadas à raiz do Vault, com caminho relativo e limites explícitos",
        "Escrita desabilitada por padrão, liberada por operação e condicionada ao hash da versão lida",
        "Seis ferramentas disponíveis ao OpenCode, de status e busca até criação e atualização de notas",
      ],
    },
  },
};

export const projectDetails = {
  marcai: {
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

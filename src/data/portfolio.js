export const projectDetails = {
  "projeto-01": {
    role: "Desenvolvimento individual de uma API RESTful.",
    challenge: "Modelar operações de clientes e integrar a consulta de CEP sem deixar a validação e o acesso a dados espalhados pelos endpoints.",
    solution: "Implementei controllers, serviços, DTOs, mapeamentos, Entity Framework Core com SQL Server, AutoMapper, HttpClient para o serviço de CEP, Swagger e middleware de exceções.",
    featured: true,
    preview: "panel",
    schematic: {
      label: "API REST",
      note: "Esquemático",
      items: [
        { tag: "POST", text: "Cadastro de cliente" },
        { tag: "GET", text: "Consulta e pesquisa" },
        { tag: "PUT", text: "Atualização" },
        { tag: "DELETE", text: "Exclusão" },
      ],
      foot: "CEP validado em serviço externo",
    },
  },
  "projeto-02": {
    role: "Desenvolvimento e manutenção individual do plugin.",
    challenge: "Disponibilizar contexto de um Vault Markdown para sessões do OpenCode sem expor caminhos absolutos nem permitir escritas não autorizadas.",
    solution: "Estruturei um plugin TypeScript com core de contexto, associação de projetos por sessão, busca, leitura, criação e atualização condicionada por hash, com escrita desabilitada por padrão.",
    featured: false,
    preview: "terminal",
    schematic: {
      label: "Sessão de ferramentas",
      note: "Esquemático",
      items: [
        { tag: "status", text: "open_mind_status" },
        { tag: "busca", text: "open_mind_search" },
        { tag: "leitura", text: "open_mind_read" },
        { tag: "criação", text: "open_mind_create" },
        { tag: "atualização", text: "open_mind_update" },
      ],
      foot: "open_mind_project_context por sessão · escrita desabilitada por padrão",
    },
  },
  "projeto-03": {
    role: "Desenvolvimento individual da skill.",
    challenge: "Auditar skills instaladas sem confundir cópias de cache, commits móveis ou alterações locais com uma atualização segura.",
    solution: "Documentei um fluxo que compara origem, versão e conteúdo, exige evidência de atualização, cria backup e valida rollback antes de substituir arquivos.",
    featured: false,
    preview: "flow",
    schematic: {
      label: "Auditoria de skills",
      note: "Esquemático",
      items: [
        { tag: "ok", text: "Atualizado" },
        { tag: "upd", text: "Atualização comprovada" },
        { tag: "local", text: "Ignorada por alteração local" },
        { tag: "gate", text: "Backup e rollback verificados" },
      ],
      foot: "Sem repositório verificável, sem atualização",
    },
  },
};

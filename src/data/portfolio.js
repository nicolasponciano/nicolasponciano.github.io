export const projectDetails = {
  "projeto-01": {
    role: "Desenvolvimento individual de uma API RESTful.",
    challenge: "Modelar operações de clientes e integrar a consulta de CEP sem deixar a validação e o acesso a dados espalhados pelos endpoints.",
    solution: "Implementei controllers, serviços, DTOs, mapeamentos, Entity Framework Core com SQL Server, AutoMapper, HttpClient para o serviço de CEP, Swagger e middleware de exceções.",
    featured: true,
    preview: "panel",
  },
  "projeto-02": {
    role: "Desenvolvimento e manutenção individual do plugin.",
    challenge: "Disponibilizar contexto de um Vault Markdown para sessões do OpenCode sem expor caminhos absolutos nem permitir escritas não autorizadas.",
    solution: "Estruturei um plugin TypeScript com core de contexto, associação de projetos por sessão, busca, leitura, criação e atualização condicionada por hash, com escrita desabilitada por padrão.",
    featured: false,
    preview: "terminal",
  },
  "projeto-03": {
    role: "Desenvolvimento individual da skill.",
    challenge: "Auditar skills instaladas sem confundir cópias de cache, commits móveis ou alterações locais com uma atualização segura.",
    solution: "Documentei um fluxo que compara origem, versão e conteúdo, exige evidência de atualização, cria backup e valida rollback antes de substituir arquivos.",
    featured: false,
    preview: "flow",
  },
};

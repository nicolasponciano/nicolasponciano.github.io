# Ferramentas de trabalho

## Problema

Hoje a seção apresenta seis linhas numeradas. Quem procura experiência em .NET ou SQL Server precisa percorrer sequências de nomes para localizar a área que interessa. A grade deve permitir essa leitura por área e identificar o que está em estudo.

## Escopo

- RF-01 Organizar o conteúdo atual em cinco grupos, na ordem abaixo. A ordem dos itens também define a ordem de leitura.

| Grupo | Itens |
| --- | --- |
| Backend e APIs | C#, .NET, ASP.NET Core, ASP.NET MVC, VB.NET, APIs RESTful, JWT, Swagger/OpenAPI, integrações |
| Dados | SQL Server, T-SQL, Entity Framework, LINQ |
| Web | HTML5, CSS3, JavaScript, Vue.js, Bootstrap |
| Engenharia de software | Git, Clean Architecture, SOLID, testes automatizados |
| Em estudo | LLMs, MCP, RAG, automação |

- RF-02 Exibir o nome completo de cada item. Tecnologias podem receber um monograma decorativo junto ao nome. Práticas aparecem por extenso.
- RF-03 Adaptar a disposição à largura disponível e aos dois temas do portfólio.
- RF-04 Permitir cadastrar uma ferramenta em um grupo existente editando apenas os dados.

## Fora de escopo

Filtros, carrossel, animação de montagem, agentes visuais, níveis de proficiência, links externos por ferramenta e alterações nas fichas dos projetos.

## Critérios de aceite

- CA-01 (RF-01) Em `#sobre`, os cinco títulos e seus itens aparecem na ordem da tabela. Cada item aparece uma vez. “Em estudo” identifica os quatro itens de IA e automação.
- CA-02 (RF-02) JavaScript exibe o monograma JS e o nome JavaScript. Clean Architecture exibe apenas o nome. Todos os nomes estão disponíveis sem passar o mouse ou tocar, e o leitor de tela ignora os monogramas.
- CA-03 (RF-03) A 1280 px, a introdução fica à esquerda e os grupos à direita. A 320 px, a introdução precede os grupos em uma coluna, “Entity Framework” e “Swagger/OpenAPI” ficam integralmente visíveis e a seção cabe na largura da página.
- CA-04 (RF-03) Nos temas claro e escuro, nomes, monogramas e títulos têm contraste mínimo de 4,5:1 com seus fundos.
- CA-05 (RF-04) Em teste, adicionar um item sem monograma a Dados faz seu nome aparecer nesse grupo sem espaço reservado para símbolo e sem alterar o renderizador.

## Impacto no que já existe

A implementação substitui as linhas em `index.html#sobre` e os estilos de `.skill-row` em `src/styles.css`. Preserva a âncora, o título, a introdução e o texto biográfico. A seção continua acessível pela navegação atual.

## Decisões técnicas

Usar HTML semântico, CSS Grid e JavaScript do projeto. Manter em `src/data/portfolio.js` a lista ordenada de grupos com título e itens. Cada item contém nome e monograma opcional. Renderizar títulos e listas na seção existente. Aplicar `aria-hidden="true"` aos monogramas e reutilizar as cores e a tipografia dos temas. A referência orienta o uso de monogramas, com conteúdo e identidade do próprio portfólio.

## Decisões em aberto

Nenhuma.

## Tarefas

- [x] T-01 Cadastrar os cinco grupos e verificar ordem, cobertura e ausência de duplicatas contra a tabela (CA-01).
- [x] T-02 Integrar a lista de dados à seção e testar itens com e sem monograma, inclusive a inclusão de um item temporário (CA-01, CA-02, CA-05).
- [x] T-03 Aplicar a grade responsiva, conferir os dois temas nas duas larguras, validar a leitura acessível e o acesso por `#sobre`, ajustar o acabamento e executar a suíte do projeto (CA-01 a CA-05).

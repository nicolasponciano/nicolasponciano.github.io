# Portfólio Full Stack

Site publicado em **https://nicolasponciano.github.io/**

Portfólio de Nicolas Ponciano, desenvolvedor de software full stack. A página apresenta o perfil, três projetos reais com papel, desafio e solução, a trajetória profissional e acadêmica e os canais de contato.

É uma página única, estática, em HTML, CSS e JavaScript, sem framework, sem etapa de build e sem backend. O conteúdo aparece na primeira renderização; o JavaScript adiciona prévias, filtros, fichas, busca por comando e a cena opcional de montagem.

## Funcionalidades

- **Conteúdo primeiro**: título, nome, resumo, fatos verificáveis, ações, busca e palco de prévia visíveis sem interação.
- **Herói com nome dominante**: `h1` "Nicolas Ponciano", papel como kicker e três fatos do currículo.
- **Prévias esquemáticas**: cada projeto mostra um esquema da sua funcionalidade real, identificado como "Esquemático", composto em HTML e CSS a partir dos dados.
- **Pager manual**: anterior e próximo trocam a prévia do herói em ordem circular, com contador `01 / 03` e anúncio em `aria-live`; não há autoplay, timer nem mudança de URL.
- **Filtros por tecnologia**: tags com `aria-pressed`, contagem `N de M` e estado vazio com "Limpar filtro".
- **Fichas de projeto**: `<dialog>` com papel, desafio, solução, stack, ano e links, aberta pela linha ou por `#projeto/<slug>`.
- **Palette**: busca por comando em `Ctrl+K` (`⌘+K`), sem diferenciar caixa ou acento, com navegação por setas, Home, End, Enter e Esc.
- **Temas tinta e papel**: alternância manual persistida em `localStorage`, com `prefers-color-scheme` como padrão.
- **Trajetória**: três experiências e três formações, extraídas do currículo, em lista ordenada.
- **Cena opcional de montagem**: botão único no rodapé do herói que inicia uma demonstração de 6 a 8 segundos por cursores locais; não bloqueia a leitura e para na primeira interação.
- **Acessibilidade**: operação por teclado, foco visível, foco contido nas fichas e palette, alvos de 44 px, contraste mínimo de 4,5:1 e respeito a `prefers-reduced-motion`.
- **Fallback sem JavaScript**: perfil, projetos, trajetória, sobre e contato continuam legíveis; busca, filtros, tema, cópia de e-mail, fichas e cena ficam ocultos.

## Projetos apresentados

| Projeto | Ano | Stack | Repositório |
|---|---|---|---|
| ClienteAPI | 2025 | C#, .NET 8, SQL Server | https://github.com/nicolasponciano/ClienteAPI |
| Open Mind | 2026 | TypeScript, Node.js, OpenCode | https://github.com/nicolasponciano/open-mind |
| Skill Upgrader | 2026 | Markdown, OpenCode, Git | https://github.com/nicolasponciano/skill-upgrader |

## Tecnologias

- HTML, CSS e JavaScript sem framework e sem bundler.
- Módulos ES nativos (`type="module"`).
- CSS com variáveis, grid, `clamp()`, `@font-face` e temas por `data-theme`.
- Elementos nativos: `<dialog>`, `<ol>`, `<dl>`, `aria-live`, `aria-pressed`.
- Fontes auto-hospedadas em `assets/fonts`: Big Shoulders Display e Atkinson Hyperlegible, sob SIL Open Font License 1.1.
- Testes com `node:test`, sem dependências externas.
- Publicação via GitHub Pages.

## Arquitetura

Não há framework, etapa de build, backend ou chamada de rede em tempo de execução. O navegador carrega `index.html`, `src/styles.css` e os módulos de `src/`.

- `index.html` contém a estrutura, o conteúdo textual e o fallback legível sem JavaScript.
- `src/data/portfolio.js` guarda os detalhes de cada projeto: papel, desafio, solução, destaque, tipo de prévia e esquema.
- `src/core.js` concentra as regras puras: estado de URL, filtro, busca, tema, foco, movimento, esquema e pager.
- `src/content.js` lê os dados, valida links e preenche a ficha do projeto.
- `src/app.js` liga a interface: prévias, filtros, ficha, palette, tema, cópia de e-mail e cena.
- `src/styles.css` contém o sistema visual, os temas, a responsividade e o desligamento de movimento.

## Estrutura de arquivos

```text
index.html                 página única, conteúdo e fallback sem JS
src/
  app.js                   comportamento da interface
  content.js               leitura de dados, links e ficha
  core.js                  regras puras e estado
  data/portfolio.js        detalhes e esquemas dos projetos
  styles.css               sistema visual e responsividade
assets/
  favicon.svg
  fonts/                   fontes locais e licenças
tests/
  core.test.mjs            funções puras
  content.test.mjs         dados e preenchimento da ficha
  markup.test.mjs          estrutura do HTML
  styles.test.mjs          contratos do CSS
  publicacao.test.mjs      checagem de publicação (PUBLICAR=1)
specs/                     requisitos, design e tarefas por versão
DESIGN.md                  sistema visual e contratos de interface
PRODUCT.md                 produto, público e posicionamento
.impeccable/               superfícies e revisão de acabamento
package.json               apenas o script de teste
```

## Rodar localmente

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4173/`. Qualquer servidor estático funciona; abrir o arquivo direto no navegador não carrega os módulos ES.

## Testes

```powershell
npm test
```

São 101 testes: funções puras, dados, markup e contratos de CSS. Cinco testes de publicação ficam pulados por padrão.

Para incluir a checagem de publicação (sem placeholders, com e-mail válido, projetos completos e stacks reais):

```powershell
$env:PUBLICAR="1"; npm test
```

Essa checagem deve passar antes de publicar.

## Atualizar o conteúdo

- **Perfil, resumo, fatos, ações e contato**: editar `index.html`.
- **Linhas de projeto** (título, resumo, ano, stack e links): editar os `<article class="project-entry">` em `index.html`.
- **Ficha e prévia de cada projeto** (papel, desafio, solução, destaque, tipo de prévia e esquema): editar `src/data/portfolio.js`.
- **Trajetória**: editar a seção `#trajetoria` em `index.html`.
- **Tema visual**: editar os tokens em `:root` e em `[data-theme="paper"]` de `src/styles.css`.

O esquema usa no máximo cinco itens, com `tag`, `text` e um `foot` de contexto. Um projeto sem esquema válido cai no bloco neutro do tipo `panel`, sem erro no console. Os dados do esquema não repetem título, ano, stack ou resumo já presentes na linha.

## Acessibilidade e responsividade

- Layout verificado em 390, 768, 1024 e 1440 px, sem rolagem horizontal.
- Em 390 px o nome fica em uma linha, a linha de fatos empilha e o palco com pager aparece inteiro abaixo da cópia.
- Em 1024 px o herói mantém duas colunas, o nome não é truncado e o palco tem pelo menos 360 px.
- O palco do herói tem altura estável de 380 px, então o pager não se desloca ao trocar de projeto.
- Contraste mínimo medido de 5,53:1 no tema papel e 6,61:1 no tema tinta.
- Ordem de foco segue a ordem visual; todos os controles têm foco visível.
- Fichas e palette contêm o foco enquanto abertas e devolvem o foco ao fechar.
- Com movimento reduzido, a troca de prévia é instantânea e a cena de montagem não é oferecida.

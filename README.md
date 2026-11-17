# Portfólio Full Stack

Site publicado em **https://nicolasponciano.github.io**

Portfólio de Nicolas Ponciano, desenvolvedor de software full stack: apresentação, experiências, formação, tecnologias e três projetos reais com papel, desafio e solução.

Página única, estática, em HTML, CSS e JavaScript. A página é montada em cena por 18 cursores no desktop e 8 em telas estreitas.

## Tecnologias

- HTML, CSS e JavaScript sem framework, sem etapa de build
- CSS: variáveis, grid, tipografia local com `@font-face`, temas claro e escuro
- JavaScript: módulos ES, estado de URL (filtro e projeto aberto), `dialog`, `prefers-reduced-motion`
- Fontes locais: Big Shoulders Display e Atkinson Hyperlegible
- Testes em Node.js (`node:test`) sobre as regras puras de `src/core.js`
- Publicação via GitHub Pages, direto da raiz de `main`

## Rodar localmente

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4173/`.

## Testes

```powershell
npm test
```

## Preencher seus dados

Edite apenas `src/data/portfolio.js`:

- `profile.name`, `profile.summary`, `profile.about`, `profile.skillsNote`
- `skills`: seis tecnologias
- `projects`: três itens com `title`, `summary`, `stack`, `repoUrl` e `demoUrl`
- `contact.message` e `contact.links` (`label` + `url`)

Enquanto um campo estiver vazio, a interface mostra `[A preencher]`. Links só viram âncoras se forem `http`, `https` ou `mailto` válidos.

## Estrutura

- `index.html`: estrutura e conteúdo de fallback sem JavaScript
- `src/styles.css`: sistema visual
- `src/app.js`: montagem, cursores e controles
- `src/core.js`: regras puras (contagem de cursores, progresso, distribuição de blocos)
- `src/content.js`: aplicação do conteúdo e validação de links
- `specs/`: requisitos, design e tarefas
- `DESIGN.md`: sistema visual documentado
- `.impeccable/review/`: capturas e revisão de acabamento

## Acessibilidade

Controles operáveis por teclado, foco visível, botão de pular montagem, respeito a `prefers-reduced-motion` e conteúdo legível sem JavaScript.

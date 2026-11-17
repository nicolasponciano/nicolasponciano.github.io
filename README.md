# Portfólio Full Stack

Página única, estática, em HTML, CSS e JavaScript. A página é montada em cena por 18 cursores no desktop e 8 em telas estreitas.

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

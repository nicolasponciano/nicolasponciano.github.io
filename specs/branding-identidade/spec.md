# Spec: identidade visual do portfólio

## Objetivo
Integrar o pacote oficial de marca (`logo-assets-portfolio.zip`) ao site publicado em https://nicolasponciano.github.io/ sem alterar conteúdo, layout ou funcionalidades.

## Escopo
- RF-01: assets organizados em `assets/branding/{svg,png,icons,social}` e `assets/favicon.svg` mantido como ícone padrão.
- RF-02: cabeçalho troca o símbolo textual `</>` pelo logotipo, com `logo-dark.svg` no tema tinta e `logo-light.svg` no tema papel.
- RF-03: favicon SVG acompanha o tema ativo, com ICO de fallback, Apple Touch Icon e Web App Manifest.
- RF-04: metadados Open Graph e Twitter Card apontam para a imagem social publicada.
- RF-05: nome acessível do cabeçalho e alturas reservadas evitam mudança de layout.

## Fora de escopo
- Redesign, textos, projetos, busca, filtros, prévias e diálogos.
- Novas dependências, frameworks ou build.
- Troca do favicon durante a sessão sem recarregar a página em navegadores sem suporte a SVG.
- Publicação na `main` (entrega em branch de integração).

## Critérios de aceite
- CA-01: `index.html` referencia apenas arquivos que existem no repositório.
- CA-02: tema papel exibe `logo-light.svg` e tema tinta exibe `logo-dark.svg`, inclusive sem tema salvo (preferência do sistema).
- CA-03: `site.webmanifest` referencia ícones existentes e abre a partir da raiz.
- CA-04: `og:image` e `twitter:image` usam URL absoluta do domínio publicado.
- CA-05: `npm test` passa sem novas falhas.

## Decisões técnicas
- Troca do logotipo por CSS com `html[data-theme="paper"]` e fallback em `prefers-color-scheme`, seguindo o mecanismo de tema já existente.
- Favicon sincronizado em `syncThemeControls()` (app.js), executado na carga e na troca manual.
- `assets/favicon.svg` é a versão adaptativa (responde a `prefers-color-scheme`) e serve de fallback sem JavaScript.
- Caminhos relativos no HTML; `start_url` absoluto apenas no manifesto.

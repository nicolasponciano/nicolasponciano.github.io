# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML, CSS e JavaScript estáticos, em módulos ES, sem framework, bundler ou backend.

## Users

Recrutadores e equipes técnicas que avaliam candidatos para vagas full stack, principalmente backend e desenvolvimento web corporativo.

## Product Purpose

Apresentar o perfil, os projetos e a trajetória de Nicolas Ponciano para apoiar candidaturas a vagas full stack. O sucesso é a pessoa visitante entender o papel, examinar os projetos com contexto real e encontrar um canal de contato sem precisar interagir com animação.

## Positioning

Portfólio técnico editorial, de página única, que mostra o trabalho antes de qualquer efeito. A credibilidade vem do conteúdo verificável: três projetos reais com papel, desafio e solução, prévias esquemáticas derivadas das funcionalidades de cada repositório e a trajetória profissional e acadêmica. A montagem por cursores existe como demonstração opt-in, não como a experiência principal nem como agentes de IA.

## Operating Context

Site publicado em https://nicolasponciano.github.io/, navegado por rolagem e âncoras. Página única com fichas de projeto e busca por comando em diálogos nativos; o estado de filtro e de ficha aberta vive na URL.

## Capabilities and Constraints

- Conteúdo disponível na primeira renderização: herói com nome dominante, resumo, fatos verificáveis, duas ações, busca e palco de prévia.
- Prévias esquemáticas por projeto, rotuladas como "Esquemático", compostas em HTML e CSS a partir dos dados, sem imagem, vídeo ou requisição.
- Pager manual com anterior, próximo e contador, em ordem circular e sem autoplay; com um projeto não há pager e com zero o palco fica vazio.
- Índice com filtro por tecnologia em `?stack=`, contagem `N de M`, prévia por hover e foco e ficha aberta por `#projeto/<slug>`.
- Trajetória com três experiências e três formações, sem métricas ou resultados inventados.
- Temas tinta e papel, persistidos em `localStorage`, e palette por `Ctrl+K`.
- Cena opcional de montagem por 6 cursores no desktop e 4 em telas compactas, com duração de 6 a 8 segundos e parada na primeira interação.
- Sem backend, autenticação, chamadas a modelos, analytics ou armazenamento remoto.
- Fontes e ícones locais; nenhuma dependência de execução ou de build.

## Brand Commitments

- Identidade própria, sem reutilizar nome, imagem, textos, projetos, contatos ou identidade visual de referências analisadas.
- Vocabulário visual de caderno técnico: tinta azul-petróleo, papel claro, turquesa, lima e coral, cantos retos e hairlines.
- Os cursores da cena são animação local, nunca apresentados como agentes de IA.

## Evidence on Hand

- Três repositórios públicos: ClienteAPI, Open Mind e Skill Upgrader.
- Currículo fornecido em 2026-11-17, usado como fonte exclusiva da seção Trajetória; o recorte editorial exclui a experiência de suporte de 2023 e o período na Plano Santa Casa Saúde.
- Medições de responsividade e contraste nos temas tinta e papel registradas em `specs/portfolio-v1-1/`.
- Capturas e revisão de acabamento em `.impeccable/review/`.

## Product Principles

- Dar prioridade à identificação do candidato, aos projetos e ao contato.
- Explicar o trabalho com fatos verificáveis; não fabricar experiência, datas, métricas, clientes ou links.
- Manter o conteúdo legível e operável sem JavaScript e sem movimento.
- Usar movimento apenas para explicar a interface, com duração curta, tokens existentes e opção de desligar.
- Preferir uma entrega estática e simples, sem dependências desnecessárias.

## Accessibility & Inclusion

Conteúdo principal legível sem JavaScript, controles operáveis por teclado, foco visível e contido nas fichas e palette, alvos mínimos de 44 px, contraste de pelo menos 4,5:1 nos dois temas e respeito a `prefers-reduced-motion`, que desliga animações e não oferece a cena.

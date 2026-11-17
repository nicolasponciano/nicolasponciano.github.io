# Requirements: Portfólio interativo

## Visão geral

Evolução do portfólio de página única para uma mesa de trabalho navegável: conteúdo legível de imediato, projetos como índice com prévia, ficha aberta por hash e busca por comando. Público: recrutadores e equipes técnicas que avaliam candidatura full stack. A montagem por cursores deixa de bloquear a leitura e passa a ser uma cena opcional.

## Problema

O resultado atual gasta até 70 s antes de entregar o conteúdo, esconde seções atrás de uma animação não solicitada e concentra a interação em controles de reprodução. Para quem avalia candidatos, isso atrasa a leitura e não demonstra domínio de interface. Falta interação útil: inspecionar projeto, filtrar por stack, buscar, compartilhar um estado e voltar pelo histórico sem perder o lugar.

## Modelo de estado compartilhado

Toda navegação interna deriva de uma única fonte: a URL. Formas canônicas:

- `/?stack=<slug>`: índice filtrado.
- `/#projeto/<slug>`: ficha aberta.
- `/?stack=<slug>#projeto/<slug>`: ficha aberta sobre índice filtrado.

Regras gerais:

- O slug é sempre minúsculo, sem acento, com `[a-z0-9-]`; qualquer outro caractere vira hífen e hífens repetidos ou nas pontas são removidos.
- Só o parâmetro `stack` sobrevive. Outros parâmetros são descartados na normalização.
- Toda correção de URL acontece com `replaceState` e antes de renderizar: normalizar não navega e não acrescenta entrada ao histórico.
- A renderização é idempotente: aplicar o mesmo estado duas vezes não muda a tela nem cria entrada de histórico.

## Funcionalidades

### RF-01 Leitura imediata

A primeira renderização mostra o conteúdo. Nenhuma seção depende de animação ou de rolagem para aparecer. A montagem por cursores vira cena opcional, sobre conteúdo já visível.

Critérios de aceite:
- CA-01: ao carregar `/` com JS e sem movimento reduzido, título, nome, resumo, ações e o palco de prévia estão visíveis sem nenhuma interação; o índice de projetos começa na dobra seguinte, com os itens já renderizados.
- CA-02: rolar do topo ao rodapé não revela nenhum bloco que estivesse invisível por padrão; nenhuma regra CSS aplica `opacity: 0` a conteúdo por estado de montagem.
- CA-03: a cena de montagem só começa por ação explícita, dura de 6 a 8 s, para na primeira interação e nunca oculta texto, foco ou link.

### RF-02 Índice de trabalho com prévia

Cada projeto é uma linha de índice com prévia. Em ponteiro fino, hover e foco exibem a prévia em um palco fixo; em toque, a prévia aparece dentro da própria linha.

Critérios de aceite:
- CA-04: em 1440 px, passar o ponteiro sobre uma linha troca a prévia do palco em até 160 ms e não desloca as linhas nem o palco.
- CA-05: focar a linha por Tab exibe a mesma prévia, com a mesma duração de CA-04; o palco é `aria-hidden="true"` e a linha mantém nome acessível único, com título, ano e stack.
- CA-06: em 390 px, cada projeto mostra sua prévia estática na linha, sem depender de hover, e a linha não ganha altura ao receber foco.
- CA-07: a prévia é composta em HTML/CSS com os dados do projeto, sem imagem, vídeo, `canvas` ou requisição nova; tipo desconhecido de prévia cai no tipo `panel`.

### RF-03 Filtro por stack

Tecnologias funcionam como filtro do índice. O filtro é compartilhável, sobrevive ao recarregamento e participa do histórico.

Critérios de aceite:
- CA-08: ativar uma tag filtra a lista, grava `?stack=<slug>` com `pushState` e mantém o foco na tag ativada; a contagem `N de M` é anunciada em região `aria-live` educada.
- CA-09: abrir a URL filtrada mostra o mesmo subconjunto, a mesma contagem e a tag correspondente em `aria-pressed="true"`.
- CA-10: slug de stack desconhecido não filtra: a lista completa aparece, o parâmetro é removido com `replaceState` e nenhum erro vai ao console.
- CA-11: filtro sem resultado mostra estado vazio com a contagem `0 de M` e um botão "Limpar filtro" que restaura todos os projetos, grava a URL sem `stack` com `pushState` e move o foco para a tag "Todas".

### RF-04 Ficha de projeto

Cada projeto abre uma ficha completa em `<dialog>`, com URL própria, foco gerenciado e o mesmo conteúdo essencial já presente na linha.

Critérios de aceite:
- CA-12: ativar um projeto abre a ficha, grava `#projeto/<slug>` com `pushState` preservando `?stack` e mantém a rolagem da página parada.
- CA-13: abrir a URL com hash de projeto carrega a página com a ficha aberta e o foco no botão fechar; a página não rola até o projeto.
- CA-14: Esc, botão fechar e clique no backdrop fecham a ficha, e o foco volta para a linha de origem quando ela ainda está visível; se a linha estiver filtrada para fora, o foco vai para o título da seção de projetos.
- CA-15: apenas um `<dialog>` fica aberto por vez; com a ficha aberta, `Ctrl+K`/`⌘+K` é ignorado e Esc fecha só a ficha.
- CA-16: hash desconhecido mantém a página na seção de projetos, remove o hash com `replaceState`, preserva o `stack` atual e não gera erro no console.
- CA-17: a ficha mostra título, resumo, papel, desafio, solução, stack, ano e apenas os links fornecidos; título, resumo, stack, ano e links são clonados da linha do índice, e campo sem dado aparece como `[A preencher]` e nunca vira link.

### RF-05 Comando e busca

Uma palette acessível por teclado reúne seções, projetos, stacks e contato. A busca do hero abre a palette com o texto já digitado.

Critérios de aceite:
- CA-18: `Ctrl+K` e `⌘+K` alternam a palette, exceto com a ficha aberta; o campo de busca do hero abre a palette com o texto digitado e foco no campo.
- CA-19: digitar filtra os itens por substring, sem diferenciar maiúsculas nem acentos; Enter executa o item ativo e Esc fecha, devolvendo o foco ao elemento anterior.
- CA-20: a palette funciona só com teclado (setas, Home, End, Enter, Esc), mostra foco visível e anuncia o número de resultados.
- CA-21: a palette é `<dialog>` com `aria-labelledby`, lista de opções com `role="listbox"`/`option` e `aria-selected` no item ativo; sem JS ela permanece fechada, sem atalho e sem botão de abrir.

### RF-06 Micro-interações e contato copiável

Todo alvo interativo responde ao ponteiro e ao toque, e o contato principal pode ser copiado com confirmação.

Critérios de aceite:
- CA-22: link, botão, linha de projeto e tag respondem a hover e a press em 120 a 160 ms, sem deslocar o layout.
- CA-23: nenhuma função depende só de hover em tela de toque; alvos têm no mínimo 44 px de altura no mobile.
- CA-24: o botão de e-mail copia o endereço, anuncia "Copiado" em região `aria-live` e mantém o link `mailto:` visível ao lado; falha de cópia anuncia "Não foi possível copiar" e o `mailto:` permanece.
- CA-25: transições e animações usam apenas `transform`, `opacity` e `clip-path` para movimento; cor, borda e fundo podem transicionar, mas nunca `width`, `height`, `top`, `left`, `margin` ou `padding`.

### RF-07 Tema papel e tinta

A página alterna entre os dois planos de cor do próprio vocabulário visual, com preferência persistida.

Critérios de aceite:
- CA-26: o botão de tema alterna na hora e persiste em `localStorage` sob a chave `portfolio-theme`; a primeira visita segue `prefers-color-scheme` e o tema é aplicado antes da primeira pintura, sem flash. O botão mantém o nome acessível fixo "Tema papel" e usa `aria-pressed="true"` somente quando o tema papel está ativo, `"false"` no tema tinta, sem alterar o nome ao alternar.
- CA-27: `localStorage` indisponível ou corrompido não quebra a página; o tema cai para a preferência do sistema.
- CA-28: texto e controles mantêm contraste mínimo de 4,5:1 nos dois temas, inclusive nas folhas claras de ficha e palette.

### RF-08 Acessibilidade e responsividade do conjunto

Critérios de aceite:
- CA-29: com `prefers-reduced-motion: reduce`, os novos componentes não deslocam nem animam posição; estados e conteúdo permanecem completos e a cena de montagem não é oferecida.
- CA-30: em 390, 768, 1024 e 1440 px não há rolagem horizontal em nenhuma seção, ficha ou palette.
- CA-31: ficha e palette ficam em tela cheia abaixo de 480 px, com o botão fechar sempre visível e sem corte de conteúdo.
- CA-32: a ordem de foco segue a ordem visual em todos os breakpoints, e nenhum controle fica fora da tela sem possibilidade de alcançar.
- CA-33: com a ficha aberta, o fundo não rola; ao fechar, a posição de rolagem anterior é mantida e não há salto causado pela barra de rolagem.

### RF-09 Navegação, URL e histórico

Critérios de aceite:
- CA-34: só existe um caminho de renderização: `popstate`, carga inicial e clique convergem em `applyUrlState(parseUrlState(url))`; nenhum handler altera a tela sem passar por ele.
- CA-35: Voltar depois de abrir a ficha fecha a ficha e devolve o foco à linha do projeto fechado; Avançar reabre a mesma ficha com o foco no botão fechar.
- CA-36: Voltar depois de filtrar restaura a lista anterior, a contagem e o `aria-pressed` das tags, sem recarregar a página.
- CA-37: fechar a ficha pelo botão ou por Esc usa `history.back()` quando a entrada atual foi criada pela própria página para aquela ficha (marcada em `history.state`) e `replaceState` quando a ficha veio de URL direta; em nenhum caso é preciso apertar Voltar duas vezes.
- CA-38: a URL escrita pela página é sempre canônica: sem `?` vazio, sem `#` vazio, sem parâmetros extras e sem hash de projeto repetido. Toda URL não canônica é corrigida na carga com `replaceState`, sem criar entrada nova no histórico.

### RF-10 Funcionamento sem JavaScript

Critérios de aceite:
- CA-39: sem JS, o HTML entrega nome, resumo, projetos com título, resumo, stack, ano e links externos reais, e o contato com `mailto:` visível.
- CA-40: sem JS, nenhum controle morto fica visível: campo de busca, tags de filtro, contagem, botão de tema, botão de copiar, botão "Ver montagem" e botão de abrir ficha são ocultados por `html.no-js`; o restante continua navegável.
- CA-41: o conteúdo visível tem uma única fonte: o HTML. `src/data/portfolio.js` guarda apenas o que a linha não carrega (papel, desafio, solução, `featured` e tipo de prévia), indexado por slug. Ano, título, resumo, stack e links nunca são duplicados nos dados.

### RF-11 Publicação sem placeholder

Critérios de aceite:
- CA-42: uma verificação opt-in de publicação falha se `index.html` ou `projectDetails` ainda contiverem `[A preencher]`, `[Nome do projeto]`, `Links a preencher` ou `mailto:` sem endereço; ela não roda no `npm test` padrão e é obrigatória antes de publicar.

## Fora de escopo

- WebGL, 3D, vídeo de fundo, áudio, canvas de partículas ou shaders.
- Scroll horizontal sequestrado, scroll-jacking, cursor nativo escondido na página inteira.
- Backend, CMS, analytics, envio de formulário ou armazenamento remoto.
- Conteúdo real inventado, fotos geradas, depoimentos ou métricas fictícias.
- Dependências novas (React, GSAP, Lenis, Three.js), etapa de build ou teste em navegador automatizado.
- Uma página HTML por projeto, blog, i18n, download de currículo ou parâmetro de busca `?q=`.
- Reescrever a identidade visual do zero; o vocabulário de cor e tipografia é mantido.

## Impacto no que já existe

- `index.html`: hero, índice de projetos com links reais, barra de montagem simplificada, `<dialog>` da ficha, palette, contagem de filtro e `<script>` inline de tema.
- `src/app.js`: o boot deixa de ocultar seções; entram controlador de URL/estado, prévia, filtro, ficha, palette, tema e cópia de e-mail.
- `src/core.js`: entram funções puras de slug, URL, filtro, busca, tema e alvo de foco; saem as funções de montagem por seção não usadas.
- `src/content.js`: passa a ler detalhes por slug e a preencher a ficha; `renderProjectLinks` deixa de existir, porque os links vivem no HTML.
- `src/styles.css`: novos componentes, temas, folhas de ficha e palette, regras `html.no-js`; sai o estado global `page-building`.
- `src/data/portfolio.js`: vira `projectDetails` indexado por slug, sem duplicar título, resumo, stack, ano ou links.
- `tests/`: os testes "blocos não montados ficam ocultos por opacidade", "hover estilo editor" e "a experiência usa 18 cursores" mudam de contrato; entram testes de URL, filtro, busca, tema, markup, CSS e a checagem opt-in de publicação.
- `DESIGN.md` e `.impeccable/surfaces/index-html.md`: atualizar direção e contrato de superfície.
- Risco de regressão: revelações por seção, controles da barra e testes de markup existentes.

## Decisões aprovadas

Aprovadas em 2026-11-16. Valem como requisito, não como sugestão.

- Dados reais ausentes: manter `[A preencher]` no HTML e no `projectDetails`, com prévias blueprint até receber o material. A verificação de publicação (CA-42) bloqueia a entrega com placeholder.
- Tema inicial: seguir o sistema com tinta como fallback e não gravar preferência na primeira visita.
- Cena de montagem: 6 cursores no desktop e 4 no mobile.
- Fonte do conteúdo visível: HTML como fonte única e `data.js` só com detalhes da ficha (CA-41), incluindo ano somente no HTML.

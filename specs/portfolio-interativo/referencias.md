# Referências: interatividade para portfólio

Pesquisa feita em 2026-11-16. Cada item registra o que foi aproveitado e o que foi recusado. Nenhum layout, texto ou efeito assinado será copiado.

## Padrões observados

| Referência | O que observar | Decisão |
|---|---|---|
| [Really Good Designs: 18 interactive portfolio examples](https://reallygooddesigns.com/interactive-portfolio-examples) | Wildy Riftian usa pastas que reagem ao hover e soltam imagens; Valeriia Shchebetovska mostra micro-interações e cursor suave; Dorian Lods usa refração WebGL no hover. | Aproveitar: prévia que responde ao hover sem sair do lugar, micro-interações curtas. Recusar: cursor personalizado na página inteira, WebGL. |
| [Figma: 23 portfolio website examples](https://www.figma.com/resource-library/portfolio-website-examples) | Spencer Gabor oferece troca de paleta e navegação lateral curva; projetos abrem detalhes. | Aproveitar: troca de tema como controle visível. Recusar: rolagem horizontal curva, que atrapalha leitura de recrutador. |
| [Awwwards: G. Colombel, Portfolio 2026](https://www.awwwards.com/sites/g-colombel-portfolio-2026) | Interação fluida de mouse e transições de projeto em site premiado. | Aproveitar: transição de estado com continuidade espacial (prévia para ficha). Recusar: dependência de animação pesada para entender a página. |
| [Codrops: scroll-driven 3D world](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/) | Cena 3D conduzida por rolagem, projeto abrindo como transição, menu com shader. | Aproveitar: a ideia de um projeto emergir da lista. Recusar: Three.js, shaders e GPU obrigatória. |
| [AI CSS Animations: portfolio animation examples 2026](https://www.aicssanimations.com/guides/portfolio-website-animation-examples) | Brittany Chiang v4 é citada como referência de polimento sem truque: movimento discreto e leitura primeiro. | Aproveitar: contenção, uma revelação por vez, foco no conteúdo. |
| [UX Patterns: command palette](https://uxpatterns.dev/patterns/advanced/command-palette) | Palette como superfície de teclado com busca, ranking e ações. | Aproveitar: `Ctrl+K`, lista agrupada, Enter e Esc. |
| [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) | Transições no mesmo documento com `startViewTransition`, com fallback natural. | Aproveitar como melhoria progressiva apenas. |
| [Google Codelabs: scroll-driven animations](https://codelabs.developers.google.com/scroll-driven-animations) | Animações presas à rolagem via CSS. | Recusar como base: cria movimento não solicitado e esconde conteúdo. |
| [flaviocopes: browser APIs replacing libraries (set/2026)](https://flaviocopes.com/browser-apis-replacing-libraries) | `<dialog>` e Popover API substituem bibliotecas; transições entre documentos ainda não têm suporte pleno no Firefox. | Aproveitar `<dialog>` nativo. Recusar transição entre documentos como dependência. |

## Direção que emerge

1. O portfólio premiado de 2025 e 2026 mostra o trabalho na primeira tela e reage ao ponteiro, mas continua legível se o JavaScript falhar.
2. Interatividade percebida vem de resposta rápida (100 a 180 ms) mais do que de cenas longas.
3. O que mais aproxima recrutador do candidato é inspecionar um projeto: abrir, ler o papel exercido, ver stack e sair.
4. Efeitos de assinatura (3D, shader, cursor customizado) pesam contra em página de candidatura: carregam mais do que informam e não funcionam em mobile.
5. O que este projeto tem de próprio é o vocabulário de blueprint técnico. Ele deve virar a linguagem das prévias e da ficha, não uma cortina antes do conteúdo.

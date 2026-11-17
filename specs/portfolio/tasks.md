# Tarefas: Portfólio de desenvolvedor full stack

- [x] T-01 Setup estático: criar estrutura e conteúdo-base legível sem JavaScript; fechar CA-12 (RF-04).
- [x] T-02 Conteúdo e estrutura: criar navegação, perfil, projetos, competências e contato alimentados por conteúdo local; fechar CA-01–CA-03 (RF-01).
- [x] T-03 Motor da montagem: implementar cursores responsivos, duas fases e revelações por bloco/seção; fechar CA-04–CA-06 (RF-02).
- [x] T-04 Controles da montagem: implementar pausa/retomada, velocidade, reinício, pulo e tour com estado acessível; fechar CA-07–CA-09 (RF-02, RF-03).
- [x] T-05 Acessibilidade e responsividade: validar mobile, teclado, movimento reduzido e pulo; fechar CA-10–CA-11 (RF-04).
- [x] T-06 Polimento final: testar no navegador os critérios CA-01–CA-12, verificar performance visual e corrigir regressões.

As tarefas só devem começar depois da aprovação desta spec, da stack proposta e da Constitution.

## Rodada 2 — polimento (sem dados reais)

Base: análise REA rodada 2 (`C:\REA\case-portifolio.md`) e candidatos do checkpoint 2026-11-16.

- [x] T-07 Acessibilidade da montagem: `opacity:0` em vez de `visibility:hidden` nos blocos não montados; foco em bloco oculto revela a seção. Fecha decisão "evitar visibility:hidden".
- [x] T-08 Revelação "neon" (brilho por caractere) nos títulos de seção. Fecha a terceira revelação exigida pelo CA-05.
- [x] T-09 Barra: avatares com inicial + `+N` e mensagem final "Montada por N agentes em X s".
- [x] T-10 Medida WxH na caixa de seleção da fase 1.
- [x] T-11 Aceleração da seção hero quando o usuário rola durante a montagem.
- [x] T-12 Conga: trajetória contínua dos cursores ao concluir, com parada automática e em interação.
- [x] T-13 Hover estilo editor (caixa de seleção no bloco sob o cursor) + parallax leve no diagrama do hero.
- [x] T-14 Bug: seção perdida com scroll rápido / boot abortado — `getSectionAction`, varredura no scroll e no boot, `canCompleteBoot` (bootToken), guarda de esqueleto órfão.

Fora de escopo (rulings): contagem numérica (sem dado real), revelação de foto (sem foto), botões magnéticos (escopo).

## Pendência de conteúdo

A entrega está funcional, mas os dados reais do Nicolas ainda não foram fornecidos. Preencher `src/data/portfolio.js` com nome, resumo, tecnologias, três projetos (título, problema/solução, stack, links) e canal de contato. Nenhum valor foi inventado: todos os campos aparecem como `[A preencher]` na interface.

## Verificação executada

- `npm test`: 14 testes passando (regras de cursores, progresso, distribuição de blocos, pontos de clique, movimento reduzido, conteúdo e links seguros, marcação com fallback).
- Navegador real (REA, Chromium 157): 1365×900, 768×1024 e 390×844; sem erros de console, sem erro de página, sem requisição com falha.
- Movimento reduzido em 390×844: conteúdo completo, sem barra de montagem.
- Controles acionados por clique e por teclado (Enter) no botão de pausa/retomada.


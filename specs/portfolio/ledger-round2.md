# SDD ledger — plan: specs/portfolio/tasks.md (Rodada 2)

Rulings de setup:
- Sem repositório Git em C:\Projects\portfolio → ledger manual; scripts task-start/task-done do executing-plans não se aplicam (exigem commits).
- Pre-flight: shared interfaces — todas as tarefas tocam `src/core.js` (exports novos, sem colisão), `src/app.js`, `src/styles.css` e `tests/`. Nenhuma tarefa consome saída de outra.
- Ruling: contagem numérica fora — inventar métricas viola spec/DESIGN.
- Ruling: revelação de foto cinza→cor fora — não há foto no projeto ainda.
- Ruling: botões magnéticos fora — escopo ("verificar o que falta", não clonar a referência).
- Ruling: `visibility:hidden` → `opacity:0` — decisão do checkpoint (árvore de acessibilidade); CA-04 continua atendido (conteúdo visualmente oculto) e CA-12 intacto (`page-building` só existe com JS).
- Ruling: conga sem botão dedicado — parada automática (10 s) + parada em interação; DESIGN.md diz conclusão colapsa para reiniciar/tour.

## Progresso

- T-07: complete (tests: `npm test` → teste "blocos não montados ficam ocultos por opacidade" RED→GREEN; handler `focusin` em `app.js` revela seção ao focar bloco oculto).
- T-08: complete (tests: `npm test` → teste "títulos podem usar o modo neon" RED→GREEN; `resolveRevealMode` aceita `neon`, `revealNeon` em app.js, 3 `h2` com `data-reveal="neon"`).
- T-09: complete (tests: `npm test` → 19/19; testes "barra mostra no máximo 5 avatares" e "mensagem final informa agentes e duração" RED→GREEN; `getAgentAvatars`/`getCompletionMessage` em core.js, `#build-summary` no HTML, cronômetro via `startedAt`).
- T-10: complete (tests: `npm test` → 20/20; teste "medida do bloco é exibida como largura por altura em pixels" RED→GREEN; `getBlockSizeLabel` em core.js, `.build-measure` dentro da seleção).
- T-11: complete (tests: `npm test` → 21/21; teste "aceleração do hero só entra com deslocamento real de rolagem" RED→GREEN; `getHeroBoost` (delta > 4px → 4×) aplicado via `effectiveSpeed()` em delays/animações, boost zerado em finalizeSection/skip/restart).
- T-12: complete (tests: `npm test` → 22/22; teste "conga calcula trajetória contínua e limitada para cada cursor" RED→GREEN; `getCongaPoint` (Lissajous) em core.js, rAF de 10 s parado por wheel/touch/tecla e por cancelRunningWork).
- T-13: complete (tests: `npm test` → 24/24; testes "hover estilo editor" e "parallax usa transform" RED→GREEN; outline lima em hover só com ponteiro fino, parallax por pointermove (±7px/±5px) desligado em motion-reduced).

## Estado final

- `npm test`: 26/26.
- Final review: dispatched (subagente general, contexto fresco) + fix pass próprio; 3 important fixed (T-14), 3 minor deferred acima.
- Browser validation (2026-11-16, Chromium in-app, 1280×900):
  - Sem erros de console em nenhuma execução.
  - Boot + scroll rápido até o fim: 18/18, sem seção perdida (correção T-14).
  - Medida WxH capturada em fase 1 ("718×87").
  - Avatares `M,L,I,S,D,+13`; mensagem final "Montada por 18 agentes em 69,8 s" / "…em 0,3 s" (conforme duração).
  - Neon nos 3 títulos de seção; parallax e `data-parallax` presentes; zero `visibility:hidden`.
  - Conga em movimento via tour (sem interação); parada por wheel confirmada.
  - Screenshot: cursores em conga + barra completa.

## T-14 (bug encontrado na validação)

- RED: teste `getSectionAction` — seção acima do viewport com scroll rápido nunca montava (IntersectionObserver perdia o salto), deixando conteúdo `opacity:0` para sempre.
- GREEN: `getSectionAction` (reveal/queue/wait) + varredura no `handleSectionExit` (todas as seções) + varredura única no boot + `startNextSection()` após boot (fila presa quando o hero já estava revelado) + `enqueueSection` sempre drena a fila.
- `npm test`: 25/25; recarga no fundo da página com scroll rápido agora completa 18/18.

## Fix pass (revisão final com contexto fresco, 2026-11-16)

Revisão: subagente `general` (26 testes, leitura de código; sem browser no ambiente dele). Re-graduação por efeito:

- **Important — bug 1 (boot gate por runId):** `finalizeSection` bumpava `runId` nos primeiros 520 ms → boot nunca completava (`booted` ficava false) → fila presa, seção em opacity:0, tour em loop. Fix: `canCompleteBoot({token, bootToken, booted})` em core.js (RED→GREEN, teste "aborte de seção não invalida a conclusão do boot"); `state.bootToken` incrementado em `skipBuild`/`restartBuild`; `beginBuild` compara `bootToken`, não `runId`. Validado no navegador: reload + scroll imediato para o fundo → fila drena até 18/18, sem erros.
- **Important — bug 2 (esqueleto órfão):** `drawSelection` sem guarda de runId após o await → `drawSkeleton` criado após aborto ficava flutuando. Fix: `if (runId !== state.runId) return;` antes de `drawSkeleton`. Sem harness DOM no repo → ruling: guarda de1 linha validada por teste manual (3 ciclos reload→seleção→aborto, 0 órfãos) + leitura. Ruling: correção sem RED automatizado por falta de harness de DOM.
- **Important — teste de hover fraco:** só checava strings soltas. Melhorado para exigir a regra dentro do bloco do `@media`. RED demonstrado de verdade: movi a regra para fora do `@media` → teste falhou; restaurei → verde.

`npm test`: **26/26**.

### Deferred minors (não entraram no fix pass)

- **Minor — bug 3:** fallback sem `IntersectionObserver` monta o hero por último (fila `[projects, about, contact]` antes do `enqueueSection(hero)`). Custo se errado: em browser sem IO a primeira tela fica oculta até as outras seções terminarem. Fix futuro: mover `enqueueSection(hero)` para antes de `startObserver()`.
- **Minor — bug 4:** troca de velocidade/boost pausa os waiters depois de mutar a taxa → `remaining` calculado com a taxa nova (dessincronia máx. ~255 ms por delay). Fix futuro: pausar antes de mutar, resumir depois.
- **Minor — bug 5:** ramo de conclusão do `updateProgress` não é idempotente (roda no reveal final e de novo no `finalizeSection` → reescreve `completedAt`/`#build-summary` e reinicia a conga). Efeito visível ~zero no fluxo normal (restart imediato). Fix futuro: flag `completionHandled` resetada em `restartBuild`.

## Rulings adicionais

- Depuração com `window.__dbg` usado e removido.
- Sem tool de emulação de viewport no browser in-app → mobile/reduced-motion herdados da validação da rodada 1; caminho reduzido não foi alterado nesta rodada (revelações só correm com `page-building`).

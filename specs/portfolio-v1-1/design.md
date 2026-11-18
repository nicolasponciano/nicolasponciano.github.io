# Design: Portfólio v1.1

## Stack e restrições

Segue a do projeto: HTML, CSS e JavaScript estáticos, sem build e sem dependência. Nenhuma API nova: o pager usa eventos de ponteiro e teclado nativos; o anúncio usa `aria-live` já presente no vocabulário. `prefers-reduced-motion` continua tratado no bloco global de `src/styles.css`.

Nenhuma imagem, captura, SVG novo, `canvas` ou requisição entra nas prévias. Tudo é HTML/CSS gerado a partir dos dados.

## Fonte de conteúdo das prévias

`projectDetails[slug]` continua guardando só o que a linha do índice não carrega. Ganha um objeto `schematic`, restrito a fatos de prévia:

```js
"projeto-01": {
  role: "…",
  challenge: "…",
  solution: "…",
  featured: true,
  preview: "panel",            // panel | terminal | flow (layout)
  schematic: {
    label: "API REST",
    note: "Esquemático",
    items: [
      { tag: "POST", text: "Cadastro de cliente" },
      { tag: "GET", text: "Consulta e pesquisa" },
      { tag: "PUT", text: "Atualização" },
      { tag: "DELETE", text: "Exclusão" },
    ],
    foot: "CEP validado em serviço externo",
  },
}
```

Regras:

| Situação | Comportamento |
|---|---|
| `schematic` ausente | usa o esquema neutro do tipo (`panel`, `terminal` ou `flow`) |
| `schematic.items` vazio ou item sem `text` | cai no esquema neutro do tipo |
| `preview` desconhecido | cai em `panel` (CA-07 preservado) |
| `preview` conhecido, `schematic` de outro tipo | respeita `preview`; o esquema é só conteúdo |
| texto de esquema | máximo 5 itens e 1 rodapé por projeto |

`src/core.js` ganha funções puras:

| Função | Contrato |
|---|---|
| `normalizeSchematic(value)` | devolve `{ label, note, items, foot }` com `items` filtrados; `null` quando não há item válido |
| `getSchematic(details, fallbackType)` | devolve o esquema normalizado ou o neutro do tipo |
| `movePreviewIndex(index, delta, length)` | índice circular; `length === 0` devolve `-1`; `length === 1` devolve `0` |
| `shouldShowPager(length)` | `true` somente com `length >= 2`; `false` com zero ou um projeto |
| `previewCountLabel(index, length)` | `"01 / 03"`, com dois dígitos e espaço ao redor da barra |

O conteúdo dos três esquemas, aprovado em CA-44:

| Projeto | `label` | Itens (tag + texto) | `foot` |
|---|---|---|---|
| ClienteAPI | API REST | `POST` Cadastro · `GET` Consulta e pesquisa · `PUT` Atualização · `DELETE` Exclusão | CEP validado em serviço externo |
| Open Mind | Sessão de ferramentas | `status` `open_mind_status` · `busca` `open_mind_search` · `leitura` `open_mind_read` · `criação` `open_mind_create` · `atualização` `open_mind_update` | `open_mind_project_context` por sessão · escrita desabilitada por padrão |
| Skill Upgrader | Auditoria de skills | `ok` Atualizado · `upd` Atualização comprovada · `local` Ignorada por alteração local · `gate` Backup e rollback verificados | Sem repositório verificável, sem atualização |

Nada além disso. Métodos HTTP são categorias de operação já descritas no projeto; não são rotas inventadas.

## Markup das prévias

O renderizador monta, para cada item:

```html
<li class="schematic-item">
  <span class="schematic-tag">POST</span>
  <span class="schematic-text">Cadastro de cliente</span>
</li>
```

Palco:

```html
<div class="hero-stage preview-stage" data-preview-stage role="group" aria-label="Prévia de projetos">
  <div class="stage-chrome" aria-hidden="true">
    <span class="stage-title" data-preview-title></span>
    <span class="stage-kind" data-preview-kind></span>
    <span class="stage-note">Esquemático</span>
  </div>
  <div class="stage-canvas" data-preview-canvas aria-hidden="true"></div>
  <div class="stage-foot" aria-hidden="true">
    <span>Tecnologias</span>
    <span data-preview-stack></span>
  </div>
  <div class="stage-pager">
    <button type="button" data-stage-prev aria-label="Prévia anterior"><span aria-hidden="true">←</span></button>
    <p class="stage-count" aria-hidden="true" data-stage-count>01 / 03</p>
    <button type="button" data-stage-next aria-label="Próxima prévia"><span aria-hidden="true">→</span></button>
  </div>
  <p class="sr-only" data-stage-live aria-live="polite" aria-atomic="true"></p>
</div>
```

O palco do índice (`[data-index-stage]`) mantém `aria-hidden="true"` e não ganha pager. A prévia de linha continua `aria-hidden="true"`; o rótulo "Esquemático" é visual.

As setas do pager são caracteres (`←` e `→`) dentro de `span[aria-hidden="true"]`; nenhum SVG novo entra no palco.

## Pager do herói

Estado em memória, um por palco:

```js
stage = { index, slugs, entries }
```

- Inicializa no projeto `featured`; sem `featured`, no primeiro.
- Anterior e próximo usam `movePreviewIndex`.
- O pager só é renderizado com `shouldShowPager(entries.length)`.
- Com um projeto, o esquema e o título aparecem, mas botões, contador e região viva não existem no DOM.
- Com zero projetos, o palco fica vazio, sem título, esquema, contador ou pager, e sem erro no console.
- Não usa `setInterval`, `setTimeout`, `requestIdleCallback` nem `IntersectionObserver`.
- Não escreve na URL e não cria entrada de histórico.
- Não move o foco: o botão acionado continua com foco.
- Anuncia `"<título>, prévia N de M"` em `[data-stage-live]` somente após ação do usuário; o estado inicial não anuncia. Na v1.1, M = 3.
- Não intercepta setas, Home, End ou espaço global.

Transições de estado:

| Ação | Palco | URL | Foco |
|---|---|---|---|
| Clicar próximo | índice + 1, circular | inalterada | permanece no botão |
| Clicar anterior | índice - 1, circular | inalterada | permanece no botão |
| Hover/foco no índice | palco do índice apenas | inalterada | na linha |
| Abrir ficha | nenhum palco muda | `#projeto/<slug>` | na ficha |

## Herói

Ordem visual e de leitura:

1. `p.hero-kicker`: "Desenvolvedor de Software Full Stack", meta caixa alta, turquesa.
2. `h1`: "Nicolas Ponciano", display condensado, dominante.
3. `p.hero-summary`: texto aprovado na v1.0, sem alteração.
4. `ul.hero-facts`: três fatos verificáveis.
5. `.hero-actions`: duas ações existentes.
6. `.hero-search`: inalterado.

Fatos do herói:

- "Backend .NET e SQL Server"
- "Sistemas web corporativos"
- "Pós-graduação em IA em andamento"

Tipografia:

| Elemento | Tamanho | Linha | Tracking |
|---|---|---|---|
| `.hero h1` | `clamp(64px, 9.5vw, 136px)` | 0.84 | -0.03em |
| `.hero-kicker` | 11 px, caixa alta, peso 700 | 1.5 | 0.14em |
| `.hero-facts` | 13 px | 1.45 | 0 |

Em 390 px o `h1` não desce de 60 px, quebra em duas linhas ("NICOLAS" / "PONCIANO") e não usa `overflow-wrap: anywhere`. O bloco de fatos vira coluna com separador de 1 px entre itens. O palco com pager fica abaixo da cópia e da busca, inteiro, sem rolagem horizontal.

Critérios visuais de aceite do herói:

| Largura | Deve acontecer | Falha se |
|---|---|---|
| 390 px | nome em até duas linhas; kicker, resumo, três fatos, duas ações e busca legíveis; palco e pager completos abaixo | qualquer palavra cortada, sobreposição, terceira linha no nome, pager fora da tela ou rolagem horizontal |
| 1024 px | duas colunas; nome sem truncamento; palco com largura mínima de 360 px; pager abaixo do esquema sem cobrir borda ou conteúdo | colunas colidindo, nome invadindo o palco, texto com menos de 15 px ou pager sobreposto |

Em 1024 px o nome pode quebrar em duas linhas, mas não pode encostar no palco. Se o `clamp` de 9.5vw não couber, reduzir para 8.5vw nesse intervalo, sem criar breakpoint novo além dos já existentes.

`<title>` e meta description não mudam.

## Trajetória

Seção `#trajetoria` entre `#projetos` e `#sobre`. O conteúdo vem do currículo fornecido em 2026-11-17 (arquivo local mantido fora do repositório), com o recorte definido em `requirements.md`: só trajetória em desenvolvimento e formação, sem 2023 e sem Plano Santa Casa Saúde.

```html
<section class="path-section section-shell" id="trajetoria" data-section="path" data-section-label="Trajetória">
  <div class="section-heading">
    <h2>Trajetória</h2>
    <p>Experiência em desenvolvimento de software e formação.</p>
  </div>
  <div class="path-layout">
    <div class="path-group">
      <h3>Experiência</h3>
      <ol class="path-list">
        <li class="path-item">
          <p class="path-period">fev. 2026 a atual</p>
          <div class="path-body">
            <p class="path-role">Desenvolvedor de Software Júnior</p>
            <p class="path-org">Empresa do setor de tecnologia · Rio de Janeiro</p>
          </div>
        </li>
        …
      </ol>
    </div>
    <div class="path-group">
      <h3>Formação</h3>
      <ol class="path-list">…</ol>
    </div>
  </div>
</section>
```

Regras:

- Uma linha por item; sem descrição de entrega, resultado ou tecnologia além do que o currículo traz.
- Experiências na ordem da tabela de RF-14 (mais recente primeiro); formações na mesma ordem.
- A pós-graduação leva `path-note` "em andamento"; as outras não têm nota.
- `path-period` usa Atkinson 10 px, caixa alta, tracking 0.09em, cor `--muted`; `path-role` em display 24 a 30 px; `path-org` em corpo 15 px com `--paper-dim`.
- Sem ícone, linha do tempo desenhada, barra de progresso ou cor como único diferenciador.
- Não entra no `site-nav` nesta versão. Entra automaticamente na palette por causa de `data-section-label`.

Layout:

| Largura | Grade |
|---|---|
| ≥ 1024 px | duas colunas iguais, `gap` 44 px |
| 768 a 1023 px | uma coluna, grupos empilhados |
| ≤ 767 px | uma coluna; período acima do cargo |
| ≤ 390 px | padding lateral do gutter, sem reduzir fonte abaixo de 15 px |

## Micro-interações

Auditoria do que já existe, para não duplicar:

| Já existe | Onde |
|---|---|
| Tokens `--dur-1` a `--dur-4`, `--ease-out`, `--ease-in-out` | `:root` |
| Hover, press e foco de botão, tema, filtro, linha, ficha, palette, contato e copiar | `src/styles.css` |
| Troca de prévia em 160 ms | `.preview-stage.is-swapping .stage-canvas` |
| Desligamento global de movimento | `@media (prefers-reduced-motion: reduce)` |

Entra apenas:

- `.stage-pager button` com `transition: background-color, border-color, color, transform` usando `--dur-1`; `:active { transform: scale(0.98) }`; `:focus-visible { outline }`; alvo 44 px.
- `.text-link:active` com mudança de cor, sem transform, para não deslocar a linha.
- `.schematic-item` sem hover: não é interativo.
- `.path-item` sem hover: não é interativo.

Nenhuma transição de `width`, `height`, `top`, `left`, `margin`, `padding`, `gap` ou `all`.

## Acessibilidade

- O palco do herói é `role="group"` com nome acessível; canvas, chrome e rodapé são `aria-hidden`; o pager é a única parte focável.
- Contador visível é `aria-hidden`; a mensagem falada vem de `[data-stage-live]`.
- Botões do pager: 44 × 44 px no mínimo, `aria-label` fixo, foco visível, sem `disabled` no modo circular.
- Ordem de Tab: pager entra depois do palco e antes do `.hero-foot`, seguindo a ordem visual.
- Trajetória usa lista ordenada real, sem `tabindex` e sem `role` artificial.
- Com `prefers-reduced-motion`, a troca de prévia não anima; o anúncio continua.
- Sem JS: `.hero-stage` e pager somem por `html.no-js` (regra existente); a Trajetória é conteúdo estático e continua inteira.

## Responsividade

| Largura | Herói | Palco | Trajetória |
|---|---|---|---|
| 1440 px | duas colunas, nome até 136 px | 4:3 com pager sob o rodapé | duas colunas |
| 1024 px | duas colunas, nome ~96 px, sem truncar | palco ≥360 px, pager compacto de 44 px | duas colunas |
| 768 px | uma coluna | palco abaixo do texto, pager centralizado | uma coluna |
| 390 px | uma coluna, nome 60 px em até duas linhas | todos os itens, fonte 12 px, pager completo | uma coluna |

Todos os itens do esquema continuam no DOM em todas as larguras. Se o espaço apertar, reduz tipografia e padding, nunca remove conteúdo nem cria rolagem interna.

## Testes

| Arquivo | Cobertura nova |
|---|---|
| `tests/core.test.mjs` | `movePreviewIndex` circular e com 0/1 item; `shouldShowPager` com 0, 1 e 3; `previewCountLabel`; `normalizeSchematic` com ausência, item inválido e texto válido; `getSchematic` com fallback |
| `tests/content.test.mjs` | cada projeto tem `schematic` com 4 itens e nota "Esquemático"; `preview` continua no enum; esquema inválido cai no neutro |
| `tests/markup.test.mjs` | `h1` = nome; kicker com o papel; `ul.hero-facts`; palco com `role="group"`, canvas `aria-hidden` e dois botões com `aria-label`; `#trajetoria` com 3 experiências e 3 formações; `path-period` presentes |
| `tests/styles.test.mjs` | `.stage-pager button` com 44 px e `:focus-visible`; `.stage-pager button:active` com `scale(0.98)`; `.schematic-item` sem hover; `#trajetoria` em uma coluna abaixo de 768 px; transições sem propriedade de layout |
| `tests/publicacao.test.mjs` | nenhum "A confirmar" ou placeholder na Trajetória publicada |

Não criar teste com DOM simulado. O que não é função pura vai para verificação manual em navegador.

## Verificação manual

1. 1440 px: nome domina o herói, papel acima, fatos abaixo, sem salto de layout na carga.
2. Pager: próximo três vezes volta ao primeiro; anterior a partir do primeiro vai ao terceiro.
3. Tab até o pager: foco visível, Enter e Espaço trocam, foco permanece no botão.
4. Leitor de tela: anúncio "Open Mind, prévia 2 de 3" uma vez por troca.
5. Sem autoplay: deixar a página 60 s parada e confirmar que a prévia não muda.
6. Movimento reduzido: troca sem animação.
7. 390 px: nome em até duas linhas, kicker, fatos, ações e busca intactos, palco e pager inteiros, sem rolagem horizontal.
8. 1024 px: duas colunas sem colisão, nome não truncado, palco ≥360 px e pager sem cobrir conteúdo.
9. Com um projeto temporário (remover duas linhas do HTML em teste local): nenhum botão, contador ou região viva do pager aparece; com zero, palco vazio e console limpo.
10. Trajetória em 390, 768, 1024 e 1440: sem corte, ordem de leitura correta.
11. Palco do índice continua trocando por hover e foco e não é afetado pelo pager.
12. Ficha, filtro, palette, tema, cópia de e-mail e sem-JS: repetir o roteiro de `specs/portfolio-interativo/verificacao.md` nos itens afetados.

## Documentação

- `README.md`: visão do produto, stack, como rodar, testes, onde editar conteúdo, estrutura de arquivos e acessibilidade, sem cursores obrigatórios.
- `PRODUCT.md`: público, propósito, posicionamento, contexto, capacidades e evidências atuais; remover "18 cursores" e "dados pendentes".
- `DESIGN.md`: acrescentar herói, pager, esquema e Trajetória; ajustar o texto de componentes e movimento; tokens intactos.
- `.impeccable/surfaces/index-html.md`: FIRST VIEWPORT e estados com pager, prévia esquemática e Trajetória.
- `specs/portfolio-interativo/verificacao.md`: não reescrever; se necessário, acrescentar nota datada de que se refere à v1.0.

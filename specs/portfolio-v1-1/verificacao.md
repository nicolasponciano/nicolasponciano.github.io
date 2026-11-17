# Verificação: Portfólio v1.1 (T-09)

Auditoria final da v1.1 na branch `feature/portfolio-v1.1`.

Data: 2026-11-17. Ambiente: Chrome 157 headless via CDP, emulação de viewport em 390x844, 768x1024, 1024x900 e 1440x900, temas tinta e papel, `prefers-reduced-motion` e JavaScript desativado. Não houve Firefox, dispositivo físico nem leitor de tela.

Método: `npm test` e `PUBLICAR=1 npm test`, medição por DOM e estilo computado, capturas de tela em diretório temporário local (fora do repositório), teclado e ponteiro por CDP. Os scripts de auditoria também ficam fora do repositório.

## 1. Testes

| Comando | Resultado |
|---|---|
| `npm test` | 101 testes, 96 aprovados, 0 falhas, 5 skip |
| `PUBLICAR=1 npm test` | 101 aprovados, 0 falhas, 0 skip |

Nenhum arquivo de teste foi alterado na T-09.

## 2. Roteiro de `specs/portfolio-interativo/verificacao.md` (itens afetados)

Itens 1 a 8 (ficha e dialog):

- Abrir os três projetos por "Abrir": ficha preenchida com título, papel, desafio, solução, stack, ano e GitHub; `#projeto/<slug>` gravado; foco no fechar.
- Esc (via evento `cancel`), botão fechar e clique no backdrop fecham, removem o hash e devolvem o foco à linha de origem.
- Voltar fecha em um único passo preservando `?stack=opencode`; Avançar reabre com foco no fechar.
- `/#projeto/nao-existe` fecha a ficha, limpa o hash, mantém a página na seção de projetos e não gera erro.
- Limitação de método: sob CDP o evento `cancel` do `dialog` chega com `cancelable: false`, então o Esc nativo fecha sem passar pelo handler da página. O caminho do app foi exercitado com um evento `cancel` sintético cancelável (mesmo handler de produção); o Esc nativo já havia sido validado em navegador real na v1.0.

Itens 9 a 13 (palette):

- `Ctrl+K` abre e fecha; foco vai ao campo.
- Busca sem caixa e sem acento; "proj" retorna 1 resultado (a seção Projetos, único texto com o termo após o conteúdo real), 16 resultados com o campo vazio.
- Setas, Home, End e seta para cima circular mantêm um único `aria-selected` e `aria-activedescendant` acompanhando.
- Esc fecha no primeiro acionamento com texto no campo e devolve o foco ao campo do hero.
- Enter em "cliente" abre a ficha de ClienteAPI e fecha a palette.
- Com a ficha aberta, `Ctrl+K` é ignorado.

Itens 14 a 24 (responsividade, acessibilidade e sem JS):

- 390, 768, 1024 e 1440 sem rolagem horizontal de página (`scrollWidth` 390, 758, 1014 e 1430).
- 768: herói em uma coluna, palco do índice oculto, prévia dentro da linha.
- 1024: herói em duas colunas (cópia 434 px, palco 392 px), nome em duas linhas sem invadir o palco, palco de 380 px.
- 1440: duas colunas, palco de 380 px, pager no mesmo Y nas três prévias.
- Alvos com 44 px ou mais: pager, tema, filtro, "Abrir", copiar, "Ver montagem", `mailto:`; busca do hero com 52 px e botão primário com 54 px.
- Tab do topo ao rodapé segue a ordem visual: pular-conteúdo, marca, navegação, tema, ações, busca, pager, "Desça para explorar", "Ver montagem", filtros, linhas, e-mail, copiar.
- Movimento reduzido: `html.motion-reduced`, `transition-duration` 1e-05s, botão "Ver montagem" oculto e seções completas.
- Sem JS: hero, 3 projetos, 6 itens de Trajetória, sobre e contato legíveis; busca, palco, filtro, tema, abrir, copiar e cena ocultos; `mailto:` visível.
- Copiar e-mail: `writeText` chamado com `niickponciano@gmail.com`, anúncio "Copiado" e limpeza após 2,4 s.

Itens 25 a 29 (URL e histórico):

- Filtro grava `?stack=`, restaura em recarga e mantém `aria-pressed`.
- Voltar/Avançar restauram lista, contagem, tag e ficha.
- Hash inválido remove o hash com `replaceState`.
- Placeholders: `PUBLICAR=1 npm test` verde, sem ocorrências de `[A preencher]`, `[Nome do projeto]` ou `Links a preencher`.

## 3. Verificação manual de `design.md` (12 itens)

| Item | Resultado |
|---|---|
| 1. 1440 px, nome dominante | passou: `h1` 136 px em duas linhas, kicker acima, fatos abaixo |
| 2. Pager circular | passou: três "próxima" voltam a ClienteAPI; "anterior" do primeiro vai a Skill Upgrader |
| 3. Tab no pager | passou: Enter e Espaço trocam, foco permanece no botão, 44×44 |
| 4. Anúncio do pager | passou: "Open Mind, prévia 2 de 3" em `aria-live="polite"`, só após ação |
| 5. Sem autoplay | parcial: 3 s sem troca nesta execução; nenhum timer no código (60 s cobertos na v1.0) |
| 6. Movimento reduzido | passou: transição 1e-05s e conteúdo completo |
| 7. 390 px | passou: nome em 1 linha a 60 px, tudo legível, palco e pager inteiros |
| 8. 1024 px | passou: duas colunas, palco 392×380, pager sem cobrir conteúdo |
| 9. Um/zero projetos | coberto por teste puro (`shouldShowPager`, `movePreviewIndex`, `previewCountLabel`); não executado em tela |
| 10. Trajetória | passou: duas colunas em 1024/1440, uma em 390/768; período, cargo, organização e local |
| 11. Palco do índice independente | passou: hover em Open Mind e foco em Skill Upgrader trocam só o palco do índice, que segue `aria-hidden` e sem pager |
| 12. Regressões | passou: ficha, filtro, palette, tema, cópia e sem-JS reexecutados |

## 4. Contraste (alfa composto sobre o fundo real)

| Tema | Mínimo | Onde |
|---|---|---|
| Tinta | 6,61:1 | nota do contato "E-mail direto" |
| Papel | 5,53:1 | nota e rodapé do palco, contador do pager |

Extremos: no tinta, título e cargo 15,07:1, resumo 10,88:1, nota do esquema 7,13:1. No papel, título 15,07:1, resumo 8,49:1, metadados 6,13:1. Ficha e palette: mínimo 5,63:1 nas folhas claras, nos dois temas.

Nenhum par abaixo de 4,5:1 (CA-28 e CA-72).

## 5. Responsividade medida

| Largura | Nome | Colunas do herói | Palco | Trajetória |
|---|---|---|---|---|
| 390 | 60 px, 1 linha | 1 | 346×380 | 1 coluna |
| 768 | 72,96 px, 1 linha | 1 | 650×380 | 1 coluna |
| 1024 | 97,28 px, 2 linhas | 2 | 392×380 | 2 colunas |
| 1440 | 136 px, 2 linhas | 2 | 553×380 | 2 colunas |

O palco mantém 380 px de altura e o pager no mesmo Y nas três prévias, em todas as larguras. Nenhuma sobreposição; a barra de filtros rola dentro do próprio contêiner em 390 px (herdado da v1.0).

## 6. Acessibilidade

- Um `h1`, hierarquia sem saltos, `lang="pt-BR"`, `<title>` e meta description preservados.
- Sem ids duplicados; todos os controles com nome acessível.
- Nada focável dentro de `aria-hidden`; palco do índice e prévia de linha seguem ocultos.
- Palco do herói é `role="group"` com nome "Prévia de projetos"; chrome, canvas e rodapé ocultos; contador `aria-hidden`; anúncio em região viva.
- Foco visível no pager; ficha e palette prendem o foco (o Tab pode passar pelo documento do navegador, sem alcançar controles do fundo) e devolvem o foco ao fechar.
- Links externos com `rel="noopener noreferrer"`.
- Verificação automatizada por DOM e teclado simulado. Não houve leitor de tela real.

## 7. Critérios de aceite

### v1.1 (CA-43 a CA-73)

| Critério | Evidência | Resultado |
|---|---|---|
| CA-43 | três esquemas com 4, 5 e 4 itens + rodapé | aprovado |
| CA-44 | itens conferidos contra `requirements.md`; nomes de ferramenta exatos | aprovado |
| CA-45 | "Esquemático" no chrome dos dois palcos e na prévia de linha | aprovado |
| CA-46 | HTML/CSS a partir dos dados; sem imagem, SVG novo, canvas ou requisição | aprovado |
| CA-47 | `normalizeSchematic`/`getSchematic` caem no neutro; console limpo | aprovado |
| CA-48 | troca em 160 ms, sem deslocamento; canvas `aria-hidden` | aprovado |
| CA-49 | `h1` = "Nicolas Ponciano"; papel no kicker; resumo preservado | aprovado |
| CA-50 | três fatos do currículo, sem números | aprovado |
| CA-51 | dois botões e contador com 3 projetos; início no `featured`; circular; sem timer | aprovado |
| CA-52 | Tab, Enter, Espaço, 44 px, foco visível, anúncio `aria-live` | aprovado |
| CA-53 | pager não altera URL nem histórico; palcos independentes | aprovado |
| CA-54 | palco é `group` nomeado; chrome/canvas ocultos | aprovado |
| CA-55 | movimento reduzido sem animação; sem JS o palco fica oculto | aprovado |
| CA-56 | `#trajetoria` com `data-section-label`; fora da navegação; na palette | aprovado |
| CA-57 | período, cargo, organização e local conforme a tabela | aprovado |
| CA-58 | três formações; pós com "em andamento" | aprovado |
| CA-59 | nenhuma métrica, entrega ou senioridade inventada | aprovado |
| CA-60 | `section`, `h2`, `h3`, lista ordenada, texto legível | aprovado |
| CA-61 | 390 px em uma coluna, sem rolagem horizontal | aprovado |
| CA-62 | sem token novo; `--dur-1`/`--dur-2` e `scale(0.98)` | aprovado |
| CA-63 | pager com hover, press e `:focus-visible`; press do link sem deslocar | aprovado |
| CA-64 | nenhuma transição de propriedade de layout | aprovado |
| CA-65 | controles existentes com comportamento e foco inalterados | aprovado |
| CA-66 | README sincronizado com o produto atual | aprovado |
| CA-67 | PRODUCT sem montagem obrigatória nem dados pendentes | aprovado |
| CA-68 | DESIGN e surface com estados reais; tokens preservados | aprovado após correção de contraste e altura |
| CA-69 | v1.0 não reescrita; `verificacao.md` histórico intacto | aprovado |
| CA-70 | `npm test` e `PUBLICAR=1 npm test` verdes; CA-01 a CA-42 válidos | aprovado |
| CA-71 | 4 larguras sem rolagem, corte, sobreposição ou perda de alvo | aprovado |
| CA-72 | mínimo 6,61:1 (tinta) e 5,53:1 (papel) | aprovado |
| CA-73 | sem dependência, build, fonte, imagem ou requisição nova | aprovado |

### v1.0 preservada (CA-01 a CA-42)

Reexecutados os itens afetados: leitura imediata, prévia por hover/foco sem deslocamento, filtro e URL, ficha e histórico, palette e teclado, movimento, temas, acessibilidade, sem-JS e publicação. Todos passaram. A única substituição declarada é a do `h1`, que agora traz o nome e manda o papel para o kicker.

## 8. Correções feitas na T-09

Somente documentação, sem tocar em HTML, CSS, JavaScript, dados ou testes:

1. Contraste mínimo do tema tinta corrigido de 7,13:1 para 6,61:1 em `README.md`, `DESIGN.md` e `.impeccable/surfaces/index-html.md`. 7,13:1 era o mínimo só dos elementos do esquema; a página inteira tem 6,61:1 na nota do contato.
2. `DESIGN.md`: na tabela de responsividade, o palco em 1024 px passou de "≥ 360 px" para "380 px", conforme a altura medida.

## 9. Estado do Git

- Branch `feature/portfolio-v1.1`; `main` em `4505888`, sem alteração.
- 14 arquivos modificados e `specs/portfolio-v1-1/` não rastreado.
- Nada commitado, sem stash, reset, merge ou push.
- Sem arquivos temporários, logs, capturas, segredos ou credenciais no repositório.
- `specs/portfolio-v1-1/requirements.md` e `design.md` citam apenas a data de referência do currículo; caminhos locais foram removidos antes do commit.

## 10. Limitações conhecidas

- Chrome headless apenas; sem Firefox, dispositivo físico ou leitor de tela real.
- O Esc nativo do `dialog` não é reproduzível por CDP; o caminho do app foi validado com evento `cancel` cancelável e o Esc real consta da auditoria da v1.0.
- Estados de zero e um projeto cobertos por funções puras, não em tela.
- O item 5 da verificação manual (60 s parado) foi medido por 3 s nesta execução; a ausência de `setInterval`/`setTimeout` no pager foi confirmada no código.
- A barra de filtros rola na horizontal dentro do contêiner em 390 px, herdado da v1.0.
- `src/core.js` mantém exportações da cena antiga usadas só por testes (`getProgress`, `normalizeSpeed`, `getPauseLabel` e outras). Código morto pré-existente, sem impacto em execução; fora do escopo da v1.1.
- O perfil do LinkedIn não foi confirmado por requisição (bloqueio de bot); os quatro repositórios do GitHub responderam 200.

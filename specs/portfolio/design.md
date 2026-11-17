# Design: Portfólio de desenvolvedor full stack

## Intenção

Recriar a sensação de montagem ao vivo observada em `C:\REA\case-portifolio.md`, agora para um portfólio autoral voltado a recrutadores de vagas full stack. Com movimento normal, a área principal começa sem conteúdo montado; com JavaScript desativado, uma versão estática permanece legível. A animação será protagonista, mas não poderá ocultar por tempo prolongado as informações de candidatura.

## Abordagens

- **Clássica:** página convencional com animação mínima. Mais rápida de ler, mas perde a característica escolhida pelo usuário.
- **Híbrida:** informações e projetos aparecem de imediato; cursores apenas decoram a página. Melhor leitura, mas não entrega o espetáculo solicitado.
- **Espetáculo, escolhida pelo usuário:** os cursores entram e montam blocos/seções em etapas, com barra e controles. Maior memorabilidade; exige limite de duração, acessibilidade e opção de pular para não prejudicar recrutadores.

## Stack

Proposta pendente de aprovação: HTML, CSS e JavaScript sem framework, com arquivos estáticos e sem dependências. A referência analisada usa template HTML, CSS e JavaScript no cliente; uma versão estática também pode ser hospedada sem backend. Se aprovada, o código deve manter conteúdo, estilos e lógica de animação em arquivos separados.

## Dados

Sem banco de dados. Conteúdo local estruturado:

- Perfil: nome profissional, função-alvo, resumo, localização opcional, tecnologias e links.
- Projeto: título, problema/objetivo, contribuição pessoal, tecnologias, repositório e demonstração.
- Contato: canais e URLs públicos escolhidos pelo usuário.

Valores ausentes permanecem como `[A preencher]` até o usuário fornecer o conteúdo.

## Rotas e endpoints

- `/`: portfólio completo em página única; âncoras para as seções (RF-01, RF-02).
- Endpoints: nenhum.

## Páginas e componentes

- Página inicial: navegação, hero/perfil, projetos, competências, trajetória opcional, contato e rodapé (RF-01).
- Camada de montagem: cursores nomeados/coloridos, seleções, esqueletos, revelações e animação de entrada (RF-02).
- Barra de controle: progresso, contagem, velocidade, pausa, repetir, pular e tour (RF-03).
- Adaptação de viewport e modo sem movimento; conteúdo estático como fallback (RF-04).

## Decisões técnicas

- Proposta de animação determinística no cliente, sem IA, API ou rede para coordenar cursores. Motivo: reproduzir a aparência observada sem atribuir capacidades inexistentes. Alternativa descartada: chamar agentes/modelos reais.
- Fontes auto-hospedadas Big Shoulders Display e Atkinson Hyperlegible sob SIL Open Font License 1.1, com licenças junto dos arquivos; sem requisição a serviço de fontes em tempo de execução.
- Seções montadas em ordem e ativadas ao entrar no viewport, com interrupção segura e conclusão do estado quando o usuário navega adiante. Motivo: manter progressão visual sem prender a navegação.
- Preferir `transform` e `opacity` para deslocamento/revelação; evitar animação contínua de layout e limitar efeitos caros. Motivo: reduzir travamentos, especialmente em móvel.
- Respeitar movimento reduzido, oferecer “Pular animação” e disponibilizar o conteúdo sem JS. Motivo: acessibilidade, leitura rápida e resiliência.
- Usar apenas identidade e assets fornecidos pelo usuário. Não reutilizar foto, nome, textos ou projetos da referência.
- Não incluir CV para download até que o usuário forneça o arquivo/link e aprove sua inclusão.

## Segurança e permissões

Não há login, perfis ou pagamento. Não coletar nem enviar dados pessoais; links de contato são públicos e fornecidos pelo usuário.

## Riscos e dependências

- Dados reais e identidade visual não foram enviados ainda; placeholders devem permanecer explícitos.
- 18 cursores e revelações podem causar carga visual ou queda de desempenho. Verificar em viewport móvel e oferecer movimento reduzido/pulo.
- A análise REA descreve o site publicado, não os arquivos-fonte originais. A implementação será uma adaptação independente, não uma cópia do código da Marie.

## Evidência de referência

Com base em `C:\REA\case-portifolio.md`, derivado das evidências REA `ev_db4d3848…`, `ev_52412291…` e `ev_fca7e383…`: 18 cursores em desktop, 8 no modo móvel, montagem em fases, efeitos de digitação/brilho/revelação e barra de progresso. O case também registra que os cursores são uma animação, não agentes reais.

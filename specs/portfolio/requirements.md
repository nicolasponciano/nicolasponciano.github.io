# Requirements: Portfólio de desenvolvedor full stack

## Visão geral

Site pessoal de portfólio para candidatura a vagas full stack. A montagem visual por cursores animados, baseada na análise REA do portfólio da Marie, será o elemento central. Projetos, tecnologias e contato precisam continuar legíveis e acessíveis durante e depois da animação.

## Problema

O usuário precisa apresentar perfil técnico e projetos em uma experiência memorável, sem depender de conteúdo inventado nem da atenção contínua do recrutador.

## Funcionalidades

### RF-01 Perfil e projetos

Apresentar nome profissional, alvo full stack, resumo, tecnologias, projetos selecionados e links de contato fornecidos pelo usuário. Dados não fornecidos ficam marcados como `[A preencher]`.

Critérios de aceite:
- CA-01: a primeira tela identifica o papel full stack e oferece acesso visível aos projetos e ao contato.
- CA-02: cada projeto apresenta título, problema/objetivo, contribuição, tecnologias e apenas os links fornecidos.
- CA-03: campos sem conteúdo real aparecem como `[A preencher]` no conteúdo de autoria e não são substituídos por dados inventados.

### RF-02 Montagem animada

Com movimento normal e JavaScript habilitado, a área da aplicação começa vazia e a interface encena uma equipe de cursores coloridos montando a página, com desenho de caixas/esqueletos e revelação progressiva de blocos, por seção. Os agentes são elementos visuais locais, sem IA ou chamadas de serviço.

Critérios de aceite:
- CA-04: com movimento normal, a área principal começa sem conteúdo montado; em desktop entram 18 cursores e em viewport móvel entram 8.
- CA-05: os blocos animados demonstram seleção/esqueleto e pelo menos três tratamentos de revelação: digitação, brilho por caractere e fade ou recorte da imagem.
- CA-06: as seções seguintes são montadas conforme entram na área visível, e a barra mostra progresso e quantidade atual de cursores.
- CA-07: durante a animação, navegação e controles continuam operáveis; “Pular animação” expõe o conteúdo final e permite acessar projetos e contato sem esperar o tour.

### RF-03 Controles da experiência

Oferecer controles para pausar/retomar cursores, alterar velocidade, reiniciar a montagem, pular para o conteúdo final e iniciar/interromper um tour das seções.

Critérios de aceite:
- CA-08: cada controle altera o estado anunciado e observável da animação sem recarregar a página.
- CA-09: controles têm nome acessível, foco visível e podem ser acionados por teclado.

### RF-04 Responsividade e movimento

Adaptar o layout e a quantidade de cursores ao viewport; permitir reduzir ou dispensar movimento.

Critérios de aceite:
- CA-10: conteúdo e controles cabem em viewport móvel sem rolagem horizontal.
- CA-11: com `prefers-reduced-motion: reduce`, a página apresenta o conteúdo final sem animação contínua; o usuário pode também pular a montagem.
- CA-12: com JavaScript indisponível, uma versão estática do conteúdo principal permanece legível.

## Fora de escopo

- Backend, banco de dados, autenticação, CMS ou painel de edição.
- Envio de formulário para serviço externo; contato por links fornecidos pelo usuário.
- Agentes de IA reais, chamadas a modelos, colaboração multiplayer ou persistência de cursores.
- Copiar assets, conteúdo, identidade ou estrutura textual exclusiva da Marie.
- Publicação automática, compra de domínio ou configuração de hospedagem.
- Redação de currículo ou tradução para outros idiomas.

## Impacto no que já existe

Projeto novo e diretório `C:\Projects\portfolio` inicialmente vazio. Não há código ou comportamento legado a preservar.

## Decisões em aberto

- Aprovação da stack estática HTML/CSS/JavaScript sem framework (recomendação: aprovar para manter a entrega simples e próxima da implementação observada).
- Conteúdo real do perfil, projetos, tecnologias e links (o usuário informou que possui material, mas ainda não enviou os dados).
- Nome/identidade visual própria e imagem pessoal (recomendação: definir após receber os assets; não reutilizar a foto da referência).
- Os critérios desta spec e a Constitution também aguardam aprovação do usuário.

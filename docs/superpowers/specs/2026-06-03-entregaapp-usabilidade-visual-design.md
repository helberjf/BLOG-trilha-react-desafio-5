# EntregaApp Usabilidade Visual Design

## Objetivo

Redesenhar a home (`/`) e o painel de pedidos (`/pedidos`) do EntregaApp com a direcao **Marketplace Operacional**, priorizando usabilidade sobre decoracao visual.

O app deve parecer um produto de trabalho confiavel para empresas e entregadores: claro, rapido de escanear, consistente entre telas e sem blocos promocionais competindo com as acoes principais.

## Direcao Aprovada

A direcao aprovada e **Opcao A - Marketplace Operacional focado em usabilidade**.

Isso significa:

- A home deve levar o usuario rapidamente para a escolha de cidade e visualizacao de pedidos.
- O painel de pedidos deve funcionar como uma tela operacional, nao como landing page.
- Cada elemento visual deve ajudar uma decisao: escolher cidade, filtrar raio, ordenar pedidos, entender uma entrega ou entrar em contato.
- A estetica deve nascer da clareza: menos excesso de cores, menos peso tipografico, menos cards competindo entre si e melhor hierarquia.

## Problemas Atuais

- A home mistura chamada comercial, preview de mural, planos, estatisticas e cards explicativos com peso visual parecido.
- O painel `/pedidos` tem muitas secoes grandes antes da lista, o que atrasa a tarefa principal de avaliar entregas.
- O verde e o ambar aparecem em muitos lugares, reduzindo o poder de destaque.
- Os cards de pedido mostram dados importantes, mas a hierarquia ainda pode ser mais rapida para leitura.
- Algumas areas parecem promocionais mesmo quando deveriam ser controles de trabalho, como busca por raio e ordenacao.
- Em mobile, botoes, filtros e textos precisam de dimensoes mais previsiveis para evitar aperto visual.

## Home

A home deve ter um primeiro viewport mais direto:

- Navegacao simples com marca, entrada e cadastro.
- Titulo curto comunicando o produto como marketplace local de entregas.
- Busca por cidade como acao principal.
- Botao de localizacao como acao secundaria.
- Preview compacto de pedidos ao lado ou abaixo, dependendo do viewport.
- Entradas para empresa e entregador com menor peso visual que a busca.

Planos e explicacao do fluxo permanecem na pagina, mas abaixo da primeira decisao do usuario. Esses blocos devem ter composicao simples, sem parecerem cards dentro de outros cards.

## Painel de Pedidos

O painel deve priorizar tarefas recorrentes:

- Trocar cidade.
- Usar localizacao e raio.
- Ordenar pedidos.
- Publicar novo pedido ou entrar para publicar.
- Avaliar rapidamente cada pedido.

A estrutura proposta:

- Topo compacto com marca, cidade ativa, contadores essenciais e acao de publicacao/login.
- Barra unica de controles com cidade, raio, localizacao e ordenacao quando couber.
- Lista de pedidos logo apos os controles.
- Informacoes comerciais e planos deslocados para areas secundarias, sem interromper a fila de oportunidades.

## Cards de Pedido

Os cards devem ser mais escaneaveis:

- Valor destacado, mas sem dominar o card inteiro.
- Titulo e cidade em primeiro nivel.
- Tempo, data/hora, distancia e empresa em linha compacta.
- Retirada e entrega com contraste baixo, mas leitura clara.
- WhatsApp como acao primaria.
- Rota como acao secundaria.
- Patrocinado em ambar; verificacao em neutro ou verde discreto.

O card deve manter informacoes essenciais existentes: titulo, cidade, valor, tempo estimado, data/hora, retirada, entrega, empresa, distancia quando disponivel e contato via WhatsApp.

## Sistema Visual

- Fundo neutro claro, com pouco ou nenhum gradiente.
- Verde usado principalmente para acao principal e estados positivos.
- Ambar reservado para destaque patrocinado.
- Slate/neutros para estrutura, texto, bordas e superficies.
- Bordas leves e sombras discretas.
- Raio de borda ate `8px`, mantendo consistencia com o design system atual.
- Tipografia mais contida dentro de paineis, filtros e cards.
- Sem textos enormes em areas operacionais.
- Sem cards aninhados desnecessarios.

## Responsividade

Mobile deve ser tratado como uso real, nao apenas adaptacao:

- Busca da home em coluna com botao grande e legivel.
- Filtros do painel empilhados em ordem de uso.
- Botoes com altura estavel e texto que nao estoura.
- Cards com valor, acao e enderecos em layout vertical claro.
- Lista de pedidos deve aparecer cedo na rolagem.

## Componentes Afetados

- `components/delivery/CitySelector.tsx`
- `components/delivery/DeliveryBoard.tsx`
- `components/delivery/DeliveryRequestCard.tsx`
- Possivelmente `components/billing/PricingPlans.tsx`, apenas se for necessario reduzir peso visual quando usado na home ou no painel.
- Possivelmente `app/globals.css`, apenas para pequenos ajustes globais de fundo/tipografia.

## Fora de Escopo

- Alterar regras de negocio.
- Alterar autenticacao, cadastro, billing ou APIs.
- Criar novos fluxos de aceite, avaliacao ou pagamento.
- Trocar framework, biblioteca de UI ou arquitetura do app.
- Reescrever o app inteiro.

## Testes e Verificacao

A implementacao deve preservar os testes de UI existentes e ajustar expectativas somente quando textos acessiveis mudarem por causa da nova hierarquia.

Verificacao esperada:

- Testes relevantes de delivery UI.
- Build ou lint/test disponivel no projeto.
- Verificacao visual em desktop e mobile, garantindo que a home e `/pedidos` carregam, nao tem sobreposicao de texto e deixam as acoes principais evidentes.

## Criterios de Aceite

- A home deixa claro que escolher cidade e ver pedidos e a acao principal.
- O painel `/pedidos` mostra controles e lista sem excesso de blocos promocionais no caminho.
- Cards de pedido ficam mais rapidos de ler e agir.
- Cores e pesos visuais ficam mais consistentes.
- A experiencia mobile nao parece comprimida ou improvisada.
- Nenhuma regra funcional existente e removida.

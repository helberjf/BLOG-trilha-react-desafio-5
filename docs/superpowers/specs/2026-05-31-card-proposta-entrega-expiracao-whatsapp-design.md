# Card compacto de proposta de entrega

## Objetivo

Deixar cada proposta de entrega mais facil de escanear no mural, com card menor, expiracao automatica em um dia e acao direta para falar com a empresa pelo WhatsApp.

## Escopo

- Reduzir a validade visivel das propostas de entrega para 24 horas a partir de `createdAt`.
- Manter propostas expiradas fora da lista publica de pedidos.
- Compactar o `DeliveryRequestCard` atual sem remover informacoes essenciais.
- Exibir um botao pequeno de WhatsApp para contato com a empresa.
- Preservar o link de rota como acao secundaria pequena.

## Regras

- Uma proposta criada ha mais de 24 horas nao deve aparecer em buscas por cidade ou raio.
- O card deve mostrar titulo, cidade, valor, tempo estimado, data/hora, retirada, entrega, empresa e distancia quando disponivel.
- O botao de WhatsApp deve continuar usando o numero da empresa (`posterWhatsapp`) e mensagem com o titulo da entrega.
- O card patrocinado continua visualmente destacado, mas de forma compacta.

## Arquitetura

`lib/delivery/shared.ts` ja concentra a regra de visibilidade por tempo. A constante `DELIVERY_REQUEST_VISIBLE_HOURS` sera alterada de 48 para 24, mantendo `filterVisibleDeliveryRequests`, `getDeliveryRequestVisibilityCutoff` e `searchDeliveryRequests` como pontos unicos da expiracao.

`components/delivery/DeliveryRequestCard.tsx` sera ajustado para uma composicao mais densa: badges menores, descricao limitada, enderecos em linhas compactas e acoes pequenas no rodape. O link do WhatsApp continuara usando `formatWhatsAppUrl`.

## Testes

- Teste unitario para garantir que propostas com mais de 24 horas ficam ocultas.
- Teste de componente para garantir que o card mostra um link pequeno `WhatsApp` apontando para `wa.me`.
- Teste de componente para garantir que dados essenciais continuam presentes no card compacto.

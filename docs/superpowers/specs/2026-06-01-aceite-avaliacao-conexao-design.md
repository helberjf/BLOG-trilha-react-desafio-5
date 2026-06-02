# Aceite, avaliacao e posicionamento de conexao

## Objetivo

Adicionar um fluxo simples de aceite dentro do EntregaApp para registrar qual entregador assumiu uma proposta, permitir que a empresa avalie esse entregador depois da conclusao e ajustar a comunicacao do produto para deixar claro que o app conecta empresas e entregadores, sem executar pagamento, garantia, contrato, suporte operacional ou gestao completa da entrega.

## Escopo

- Permitir que entregadores logados aceitem propostas abertas.
- Remover propostas aceitas do mural publico.
- Permitir que a empresa dona da proposta veja pedidos aceitos.
- Permitir que a empresa marque um pedido aceito como concluido.
- Permitir que a empresa avalie o entregador aceito com nota de 1 a 5 e comentario opcional depois da conclusao.
- Criar persistencia de avaliacao ligada ao pedido, empresa e entregador.
- Atualizar textos da home, mural, cadastro, README e analise para comunicar o app como ponte de conexao.

## Fora do Escopo

- Pagamento dentro do app.
- Contrato formal entre empresa e entregador.
- Seguro, garantia, disputa, chargeback ou repasse financeiro.
- Rastreamento em tempo real.
- Chat interno.
- Avaliacao feita por entregador sobre empresa.
- Multiplos entregadores disputando a mesma entrega depois do primeiro aceite.

## Regras de Aceite

- Somente usuario com `role = COURIER` pode aceitar uma proposta.
- Usuario anonimo deve ser orientado a entrar como entregador.
- Empresa nao pode aceitar proposta.
- Uma proposta so pode ser aceita se estiver com status `OPEN`.
- Ao aceitar, o sistema grava `acceptedById`, `acceptedAt` e muda `status` para `TAKEN`.
- Depois do aceite, a proposta deixa de aparecer no mural publico de oportunidades.
- O WhatsApp continua disponivel para alinhar detalhes entre empresa e entregador.

## Regras de Conclusao

- Somente a empresa que criou a proposta pode marcar o pedido como concluido.
- A conclusao so pode ocorrer em pedido `TAKEN`.
- Ao concluir, o sistema muda `status` para `DONE`.
- O app nao valida se a entrega ocorreu fisicamente; ele apenas registra o estado informado pela empresa.

## Regras de Avaliacao

- Somente a empresa que criou a proposta pode avaliar.
- A avaliacao so pode ser criada para pedido `DONE`.
- A avaliacao deve estar ligada ao pedido, empresa avaliadora e entregador aceito.
- A nota deve ser um inteiro de 1 a 5.
- O comentario e opcional e deve ter no maximo 280 caracteres.
- Cada pedido pode ter no maximo uma avaliacao da empresa.
- A nota media exibida para um entregador deve ser calculada a partir das avaliacoes recebidas.

## Arquitetura

O schema Prisma deve ganhar um modelo `DeliveryReview` com relacoes para `DeliveryRequest`, empresa avaliadora e entregador avaliado. O modelo `DeliveryRequest` ja possui `status`, `acceptedById` e `acceptedAt`; esses campos serao usados para registrar o aceite sem criar outra entidade de candidatura.

Novas rotas de API ficarao sob `/api/delivery-requests/[id]/...`:

- `POST /accept` para entregador aceitar.
- `POST /complete` para empresa marcar concluido.
- `POST /review` para empresa avaliar o entregador aceito.

As rotas devem usar `auth()` para validar sessao e Prisma para garantir propriedade, papel do usuario e status correto.

## UI

O card do pedido aberto deve mostrar:

- `Aceitar entrega` para entregador logado.
- Chamada para login/cadastro quando anonimo.
- WhatsApp como contato direto, deixando claro que ele serve para alinhar detalhes.

O mural deve ganhar uma area simples para empresa logada acompanhar seus pedidos aceitos/concluidos e avaliar entregadores. O foco e MVP: nao precisa dashboard completo, apenas acoes essenciais no contexto de pedidos.

## Comunicacao do Produto

Textos devem evitar promessas de substituicao completa do WhatsApp ou de garantia operacional. O posicionamento recomendado e:

- "O EntregaApp conecta empresas e entregadores locais."
- "O aceite fica registrado no app; os detalhes operacionais sao combinados diretamente entre as partes."
- "O WhatsApp ajuda no alinhamento rapido, e a empresa pode avaliar o entregador depois da entrega."

## Testes

- Testes de permissao para aceitar: anonimo, empresa, entregador e pedido ja aceito.
- Testes de API para `accept`, `complete` e `review`.
- Teste de schema/validador para nota de avaliacao.
- Teste de UI para botao de aceite no card.
- Teste de UI/copy garantindo que o app se descreve como conexao, nao como operador da entrega.
- Build final para garantir schema, rotas e componentes compilando.

# Analise do Webapp EntregaApp

Data da analise: 2026-06-22

## Resumo executivo

O EntregaApp esta em nivel de MVP funcional para conectar empresas que precisam de entregas locais com entregadores. O produto cobre os fluxos centrais: cadastro por tipo de usuario, login, mural por cidade, criacao de pedidos por empresa assinante, busca por localizacao/raio para entregadores, aceite dentro do app, contato por WhatsApp, avaliacao pela empresa e base de monetizacao com Stripe.

Nota geral atual: **7.5/10 para MVP local**.

Viabilidade para pessoas usarem: **alta para piloto controlado** em uma ou poucas cidades, desde que o Supabase, NextAuth, Stripe e politicas basicas de suporte estejam configurados. Para producao aberta, ainda faltam historico completo por entregador, moderacao, disputa operacional e controles antifraude.

## Funcionalidades atuais

| Funcionalidade | Status | Nota | Viabilidade | Observacao |
| --- | --- | ---: | --- | --- |
| Escolha de cidade antes do mural | Implementada | 9/10 | Alta | Ajuda entregadores e empresas a entrarem direto no mercado local. |
| Mural de pedidos por cidade | Implementado | 8/10 | Alta | Funciona com dados reais via Supabase ou fallback quando o banco nao esta configurado. |
| Ordenacao por recentes, valor, tempo e distancia | Implementada | 8/10 | Alta | Distancia depende de latitude/longitude nos pedidos e localizacao do entregador. |
| Busca por localizacao e raio em km | Implementada e melhorada | 8/10 | Alta | Usa geolocation gratuita do navegador e filtra pedidos por retirada proxima. |
| Cadastro por perfil Empresario/Entregador | Implementado | 8/10 | Alta | Empresario exige CNPJ, CPF do responsavel e CEP; entregador exige CPF. |
| Login com credentials | Implementado | 8/10 | Alta | Usa NextAuth e bcryptjs. |
| Login Google para entregadores | Implementado | 7/10 | Media | Empresas nao podem entrar com Google para preservar CNPJ, CPF e assinatura. |
| Publicacao de pedido por empresa | Implementada | 8/10 | Alta | Apenas empresa com CNPJ valido e assinatura ativa/trial publica. |
| Formulario de pedido em aba e modal | Implementado | 8/10 | Alta | Inclui retirada, entrega, data, horario, valor, WhatsApp e dimensoes do pacote. |
| Localizacao da retirada no formulario | Implementada | 7/10 | Media | Captura coordenadas via navegador; geocoding por endereco ainda nao existe. |
| Pedidos expiram em 24 horas | Implementado | 8/10 | Alta | Reduz mural vencido e melhora confianca. |
| Aceite de entrega no app | Implementado | 8/10 | Alta | Entregador logado aceita e o pedido sai da vitrine publica. |
| Conclusao e avaliacao pela empresa | Implementada | 7/10 | Alta | Empresa dona do pedido conclui e avalia o entregador aceito. |
| Link para WhatsApp | Implementado | 9/10 | Alta | Apoia o combinado direto entre empresa e entregador. |
| Link de rota gratuita | Implementado | 8/10 | Alta | Usa Google Maps sem custo de API. |
| Stripe Checkout, Portal e Webhook | Implementados | 7/10 | Media | Requer env vars, produtos/price IDs e webhook configurado. |
| Planos Empresa e Patrocinado | Implementados | 7/10 | Media | Boa base comercial, mas ainda faltam limites, recibos e relatorios. |
| Testes automatizados | Ampliados | 8/10 | Alta | Rotas API, validacoes, UI, billing e busca estao cobertos. |

## Melhorias implementadas nesta rodada

- Criados testes de API para todas as rotas:
  - `GET/POST /api/auth/[...nextauth]`
  - `POST /api/register`
  - `GET/POST /api/delivery-requests`
  - `POST /api/billing/checkout`
  - `POST /api/billing/portal`
  - `POST /api/billing/webhook`
- A busca por ofertas com GPS agora atualiza a URL com `lat`, `lng`, `raio` e `ordenar` mesmo quando a cidade mais proxima e a mesma que ja esta aberta.
- Ao alterar o raio depois de ativar a localizacao, o app tambem atualiza a URL para permitir nova busca no servidor.
- O fluxo ficou mais confiavel para entregadores que querem buscar por localizacao real, nao apenas pelos pedidos ja carregados na pagina.
- O aceite agora fica registrado no app; o EntregaApp segue sendo uma ponte de conexao, nao operador da entrega, pagamento ou garantia.
- Empresas conseguem concluir entregas aceitas e avaliar o entregador depois.

## Cobertura de testes de API

| Rota | Cenarios cobertos |
| --- | --- |
| Auth | Exporta handlers `GET` e `POST` do NextAuth. |
| Register | Retorna erro quando Supabase nao esta configurado; cria usuario entregador normalizando email, CPF e WhatsApp. |
| Delivery requests GET | Repassa cidade, ordenacao, coordenadas e raio para a busca. |
| Delivery requests POST | Bloqueia usuario deslogado, bloqueia entregador e cria pedido para empresa ativa. |
| Delivery accept/complete/review | Registra aceite do entregador, conclusao pela empresa dona e avaliacao pos-entrega. |
| Billing checkout | Bloqueia nao empresa e cria sessao Stripe para empresa. |
| Billing portal | Abre portal para usuario com `stripeCustomerId`. |
| Billing webhook | Rejeita webhook sem assinatura e atualiza assinatura no evento de checkout concluido. |

## Analise de produto

### Pontos fortes

- Proposta clara: mural local de entregas com aceite registrado e contato direto por WhatsApp.
- Baixa dependencia de APIs pagas para a etapa de localizacao: usa navegador e Google Maps por link.
- Modelo comercial simples com assinatura para empresas e plano patrocinado.
- Separacao correta de papeis: entregador procura; empresa publica.
- Bom ponto de partida para portfolio porque mistura Next.js, auth, banco, validacao, billing, testes e UX.

### Pontos de risco

- O aceite existe, mas ainda nao ha disputa, comprovante, cancelamento ou mediacao operacional.
- Avaliacoes existem pela empresa, mas ainda nao ha media consolidada exibida no perfil do entregador.
- Status operacional ainda e enxuto: aberto, aceito, concluido ou cancelado.
- Falta painel da empresa para editar, cancelar ou acompanhar pedidos publicados com mais filtros.
- Falta painel do entregador com historico de conversas, candidaturas ou entregas aceitas.
- Falta moderacao/denuncia para evitar spam, golpes ou dados indevidos.
- A validacao de CNPJ/CPF e local, mas nao consulta uma fonte oficial.
- O banco precisa receber o schema Prisma no Supabase antes do uso real.

## Roadmap sugerido

| Prioridade | Melhoria | Impacto | Esforco | Viabilidade |
| --- | --- | --- | --- | --- |
| Alta | Dashboard da empresa com pedidos publicados | Alto | Medio | Alta |
| Alta | Dashboard do entregador com pedidos aceitos | Alto | Medio | Alta |
| Alta | Cancelamento e disputa operacional | Alto | Medio | Alta |
| Media | Media publica das avaliacoes recebidas pelo entregador | Alto | Medio | Media |
| Media | Denuncia e bloqueio de usuarios | Alto | Medio | Alta |
| Media | Geocoding de endereco para coordenadas | Medio | Medio | Media |
| Media | Notificacoes por email/WhatsApp | Alto | Medio/alto | Media |
| Media | Painel administrativo | Alto | Medio | Alta |
| Baixa | Chat interno | Medio | Alto | Media |
| Baixa | App mobile/PWA com instalacao | Medio | Medio | Alta |
| Baixa | Relatorios comerciais por cidade | Medio | Medio | Alta |

## Nota por area

| Area | Nota | Justificativa |
| --- | ---: | --- |
| Utilidade para empresas | 8/10 | Publicar pedido e receber contato rapido resolve uma dor real. |
| Utilidade para entregadores | 8/10 | Buscar por cidade, raio, valor e tempo ajuda a escolher melhor. |
| Monetizacao | 7/10 | Stripe e planos existem, mas falta limite por plano e painel financeiro. |
| Confianca e seguranca | 6/10 | Tem CNPJ/CPF e assinatura, mas falta verificacao externa, moderacao e historico. |
| Experiencia mobile | 7/10 | Layout responsivo e direto, ainda precisa teste real em aparelhos. |
| Escalabilidade tecnica | 7/10 | Next.js + Supabase + Prisma sustentam MVP; faltam filas, logs e cache para escala. |
| Prontidao para producao | 6.5/10 | Bom piloto; producao publica exige operacao, suporte e antifraude. |

## Checklist antes de lancar para usuarios reais

- Configurar `DATABASE_URL`, `AUTH_SECRET`, Google OAuth, Stripe keys e webhook.
- Rodar `npm run db:push` ou migracao Prisma equivalente no Supabase.
- Testar cadastro de empresa, cadastro de entregador, login, checkout e webhook em ambiente de homologacao.
- Criar politica de privacidade e termos de uso.
- Definir regras de publicacao, cancelamento e disputa.
- Criar rotina de suporte para empresas e entregadores.
- Monitorar logs de erro e eventos de pagamento.

## Conclusao

O EntregaApp ja tem uma base comercial convincente para demonstracao e piloto: empresas publicam necessidades de entrega, entregadores filtram oportunidades, aceitam no app e alinham detalhes pelo WhatsApp. O produto deve ser comunicado como ponte de conexao e registro leve, nao como operador completo da entrega.

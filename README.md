# EntregaApp

Marketplace local de conexao para entregas. Empresas com CNPJ assinam um plano, publicam pedidos por cidade e entregadores comparam valor, tempo e rota antes de aceitar no app e alinhar detalhes pelo WhatsApp. O EntregaApp registra a conexao, mas nao opera pagamento, garantia ou execucao da entrega.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- Supabase Postgres
- NextAuth v5 com credentials
- Stripe Billing + Checkout
- bcryptjs
- Zod + React Hook Form
- Vitest + Testing Library

## Funcionalidades

- Selecao de cidade antes de ver pedidos.
- Mural de pedidos por cidade.
- Ordenacao por mais recentes, avaliacoes, valor e tempo estimado.
- Cadastro com tipo de conta: Empresario ou Entregador.
- Empresario precisa de CNPJ valido e assinatura ativa para publicar pedido.
- Plano Empresa: R$ 35,90/mes com 2 meses gratis.
- Plano Patrocinado: R$ 69,90/mes com pedidos aparecendo primeiro e selo Patrocinado.
- Checkout, portal e webhook Stripe prontos para configuracao por variaveis de ambiente.
- Formulario de pedido em aba e modal.
- Pedidos abertos expiram em 24 horas.
- Aceite de entrega registrado no app para entregadores logados.
- Painel simples para a empresa acompanhar aceites, concluir entrega e avaliar o entregador.
- Link direto para WhatsApp para combinar detalhes entre empresa e entregador.
- Dados de exemplo quando `DATABASE_URL` ainda nao esta configurado.

## Analise do produto

O documento [docs/analise-webapp-entregaapp.md](docs/analise-webapp-entregaapp.md) resume funcionalidades, notas por area, viabilidade para uso real e roadmap de melhorias.

## Configuracao

Copie `.env.example` para `.env.local` e preencha:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="gere-um-secret-forte"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_GOOGLE_ID="seu-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="seu-google-client-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_EMPRESA_PRICE_ID="price_..."
STRIPE_PATROCINADO_PRICE_ID="price_..."
```

Com Supabase configurado:

```bash
npm run db:push
```

## Comandos

```bash
npm install
npm test -- --run
npm run build
npm run dev
```

## Stripe

Crie dois produtos recorrentes mensais no Stripe:

- `Empresa`: R$ 35,90/mes. Use o Price ID em `STRIPE_EMPRESA_PRICE_ID`.
- `Patrocinado`: R$ 69,90/mes. Use o Price ID em `STRIPE_PATROCINADO_PRICE_ID`.

O trial de 2 meses do plano Empresa e aplicado pelo codigo no Checkout Session. Configure o webhook para:

```text
POST https://seu-dominio.com/api/billing/webhook
```

Eventos necessarios:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Depois de configurar os env vars no Vercel/Supabase, rode `npm run db:push` ou uma migracao Prisma equivalente para aplicar os campos de assinatura no banco.

Neste ambiente, foi necessario rodar instalacao/build com certificados relaxados por erro local de cadeia TLS:

```powershell
npm install --strict-ssl=false
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npm run build
```

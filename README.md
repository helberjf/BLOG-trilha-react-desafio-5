# Entregador

Mural de pedidos de entrega para empresas e motoboys. Empresas com CNPJ publicam uma necessidade de entrega; entregadores escolhem a cidade, comparam valor/tempo e chamam o anunciante pelo WhatsApp.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- Supabase Postgres
- NextAuth v5 com credentials
- bcryptjs
- Zod + React Hook Form
- Vitest + Testing Library

## Funcionalidades

- Selecao de cidade antes de ver pedidos.
- Mural de pedidos por cidade.
- Ordenacao por mais recentes, avaliacoes, valor e tempo estimado.
- Cadastro com tipo de conta: Empresario ou Entregador.
- Empresario precisa de CNPJ valido para publicar pedido.
- Formulario de pedido em aba e modal.
- Link direto para WhatsApp de quem publicou.
- Dados de exemplo quando `DATABASE_URL` ainda nao esta configurado.

## Configuracao

Copie `.env.example` para `.env.local` e preencha:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="gere-um-secret-forte"
NEXTAUTH_URL="http://localhost:3000"
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

Neste ambiente, foi necessario rodar instalacao/build com certificados relaxados por erro local de cadeia TLS:

```powershell
npm install --strict-ssl=false
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npm run build
```

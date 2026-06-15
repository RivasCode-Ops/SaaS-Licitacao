# SaaS Licitação

**Plataforma SaaS para gestão de licitações públicas.**

---

| Campo | Valor |
|-------|-------|
| **Estado** | Funcional (prototype) |
| **Stack** | Next.js 15 (App Router) + Tailwind 4 + TypeScript |
| **Database** | PostgreSQL + Drizzle ORM (Neon) |
| **Auth** | JWT + bcryptjs + cookies httpOnly |
| **Email** | Resend (transacional) |
| **Repo** | [github.com/RivasCode-Ops/SaaS-Licitacao](https://github.com/RivasCode-Ops/SaaS-Licitacao) |

## Deploy na Vercel

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório
3. Configure as variáveis de ambiente:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `POSTGRES_URL` | String de conexão Neon (com `sslmode=require`) | `postgresql://...` |
| `AUTH_SECRET` | Chave secreta para JWT | `openssl rand -base64 32` |
| `CRON_SECRET` | Token para proteger o endpoint cron | `qualquer-string-segura` |
| `RESEND_API_KEY` | API key do Resend | `re_xxxxx` |
| `EMAIL_FROM` | Remetente dos emails | `SaaS Licitação <noreply@seudominio.com>` |
| `NEXT_PUBLIC_APP_URL` | URL pública do app | `https://seu-app.vercel.app` |
| `BASE_URL` | URL base (mesmo valor) | `https://seu-app.vercel.app` |

4. Execute as migrations e seed:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   (Ou execute via terminal da Vercel/Neon)

5. Para o cron automático de etapas, configure um cron job apontando para:
   `https://seu-app.vercel.app/api/cron` com header `Authorization: Bearer <CRON_SECRET>`

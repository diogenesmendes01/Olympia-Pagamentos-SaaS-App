# Olympia Pagamentos

SaaS de gestão financeira — contas a receber, contas a pagar, notas fiscais e relatórios.

**Status:** Fase 2 — backend + auth + multi-tenancy em produção.

## Stack

### Frontend (`apps/web`)

- **Build:** Vite 6 · TypeScript 5
- **UI:** React 18 · Tailwind CSS v4 · shadcn/ui (Radix)
- **Roteamento:** React Router 7
- **Forms:** React Hook Form + Zod
- **Auth client:** Better Auth 1.6 (`organizationClient` + `magicLinkClient`)
- **Charts:** Recharts

### Backend (`apps/api`)

- **HTTP:** Fastify 5
- **DB:** PostgreSQL 16 + Drizzle ORM
- **Auth:** Better Auth 1.6 (email/senha + magic link + Google/Microsoft SSO + organization plugin)
- **Filas:** BullMQ + Redis 7
- **Email:** Nodemailer + MailPit (dev) / SMTP real (prod)

### Compartilhado (`packages/shared`)

- Schemas Zod compartilhados (auth, organization)
- Tipos derivados via `z.infer`

### Qualidade

- **ESLint 9** (flat config compartilhado)
- **Prettier** + **Husky** + **lint-staged**
- **Vitest** + **Testing Library**
- **Turborepo** (cache de tasks por workspace)
- **CI:** GitHub Actions com matrix (lint/typecheck/test/build) + service containers postgres + redis

## Pré-requisitos

- Node.js 20.x (ver `.nvmrc`)
- pnpm 9.x
- Docker (pra subir Postgres + Redis + MailPit em dev)

## Rodando localmente

1. `docker compose up -d` (sobe Postgres, Redis, MailPit)
2. `cp .env.example .env` e gere `BETTER_AUTH_SECRET` com `openssl rand -base64 32`
3. `pnpm install`
4. `pnpm db:migrate`
5. `pnpm dev` (sobe web `:5173` + api `:3000` + worker)
6. Acesse `http://localhost:5173`, crie uma conta, verifique o email em `http://localhost:8025`

## Scripts

| Comando              | Ação                                          |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | Sobe web + api + worker em paralelo (Turbo)   |
| `pnpm build`         | Build de produção de todos os workspaces      |
| `pnpm lint`          | ESLint em todos os workspaces                 |
| `pnpm typecheck`     | `tsc --noEmit` em todos os workspaces         |
| `pnpm test`          | Vitest watch mode em todos os workspaces      |
| `pnpm test -- --run` | Vitest single run (usado no CI)               |
| `pnpm format`        | Prettier `--write` em todo o repo             |
| `pnpm format:check`  | Prettier `--check` (CI)                       |
| `pnpm db:migrate`    | Aplica migrations Drizzle no banco            |
| `pnpm db:studio`     | Abre Drizzle Studio (GUI do banco) em `:4983` |

Filtrando por workspace: `pnpm --filter @olympia/web dev`, `pnpm --filter @olympia/api dev`, etc.

## Workers

`pnpm --filter @olympia/api dev:worker` sobe o worker BullMQ que processa a fila `email`. Em produção, rode como processo separado.

Dashboard de filas: `http://localhost:3000/admin/queues` (header `Authorization: Bearer $BULL_BOARD_TOKEN`).

## Estrutura

```
.
├── apps/
│   ├── web/                 # Vite + React (Fase 1 + Fase G/H)
│   │   └── src/app/
│   │       ├── pages/       # Login, Signup, Dashboard, Users, OrgSettings, ...
│   │       ├── guards/      # RequireAuth, RequireSession, RequireOrgRole
│   │       ├── layouts/     # MainLayout (sidebar + header + OrgSwitcher)
│   │       ├── components/  # OrgSwitcher + shadcn/ui
│   │       └── lib/auth.ts  # Better Auth client (organization + magicLink)
│   └── api/                 # Fastify + Drizzle + Better Auth
│       └── src/
│           ├── auth/        # instance + plugin Fastify
│           ├── db/          # schema + client + migrations
│           ├── queues/      # BullMQ producers
│           ├── workers/     # BullMQ consumers (email)
│           └── routes/      # rotas custom (além das geradas pelo BA)
├── packages/
│   ├── shared/              # schemas Zod + tipos compartilhados
│   └── tsconfig/            # base configs (base, react, node)
├── docker-compose.yml       # postgres + redis + mailpit
├── .github/workflows/ci.yml # CI com matrix + service containers
└── turbo.json               # pipeline Turbo
```

## Convenção de commits

[Conventional Commits](https://www.conventionalcommits.org/) em português:

```
feat: ...
fix: ...
chore: ...
refactor: ...
docs: ...
test: ...
ci: ...
build: ...
```

## Roadmap

- ✅ **Fase 1** — Frontend navegável (Figma Make → Vite + React Router)
- ✅ **Fase 2** — Backend (Fastify + Drizzle) + Auth (Better Auth) + Multi-tenancy (organization plugin)
- **Fase 3** — Contas a Receber + Notas Fiscais + gateway de pagamento (Pix, boleto, cartão)
- **Fase 4** — Contas a Pagar
- **Fase 5** — Relatórios + Dashboard com dados reais
- **Fase 6** — Integrações + Settings avançados + billing do SaaS

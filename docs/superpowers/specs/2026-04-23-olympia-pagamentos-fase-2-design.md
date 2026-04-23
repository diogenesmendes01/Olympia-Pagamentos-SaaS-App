# Olympia Pagamentos — Fase 2 Design

**Data:** 2026-04-23
**Escopo:** Backend + Auth + Multi-tenancy (consolida o que era originalmente Fase 2 + 2.1 + 2.2 + 2.3 do roadmap)

## Contexto

A Fase 1 entregou um frontend navegável com dados mockados, gate de auth via `localStorage`, 11 rotas e CI verde. Esta fase substitui o mock por uma stack real: API autenticada, multi-tenancy por organização, e migração pra monorepo.

Ao fim dessa fase, o usuário consegue:

- Fazer signup com email/senha (com verificação) ou SSO (Google/Microsoft) ou Magic Link
- Recuperar senha por email
- Criar uma organização ou aceitar convite pra uma existente
- Convidar membros com roles `owner | admin | member`
- Trocar de organização ativa
- Acessar todas as rotas protegidas da Fase 1 com sessão real (não mais `localStorage`)

## Objetivo

Substituir o gate mock da Fase 1 por autenticação e autorização reais, com multi-tenancy por organização, rodando em monorepo Turborepo.

## Decisões de escopo

**Dentro:**

- Signup self-service + aceitação de convites (padrão SaaS B2B)
- Auth: email/senha, Google SSO, Microsoft SSO, Magic Link, password reset, email verification
- Organizations com roles `owner | admin | member` + invite flow
- Email entrega: MailPit em dev, Resend via SMTP em prod
- Migração do frontend existente pra monorepo sem quebra visual
- CI ajustado pro monorepo com service containers de Postgres + Redis

**Fora:**

- Billing do SaaS (Fase 6)
- 2FA/TOTP (avaliar em fase futura)
- Audit log (avaliar em fase futura)
- Observabilidade além de logs estruturados (Sentry, Datadog — Fase 5+)
- Data fetching layer client-side tipo React Query/SWR (YAGNI por ora)

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Backend:** Fastify 5 + Drizzle ORM + Zod + Better Auth + Pino + BullMQ + Nodemailer
- **Database:** Postgres 16 self-hosted
- **Queue:** BullMQ sobre Redis 7
- **Email dev:** MailPit (SMTP local, UI em `:8025`)
- **Email prod:** Resend via SMTP
- **Frontend:** stack atual mantida (Vite 6 + React 18 + Tailwind v4 + React Router 7)

## Seção 1 — Arquitetura & layout do monorepo

Três workspaces:

```
olympia-pagamentos/
├── apps/
│   ├── web/                      # frontend atual migra inteiro pra cá
│   │   ├── src/                  # app/, pages/, lib/, test/, styles/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json          # @olympia/web
│   └── api/
│       ├── src/
│       │   ├── server.ts         # entry HTTP
│       │   ├── worker.ts         # entry BullMQ
│       │   ├── app.ts            # buildApp() — Fastify reusável em testes
│       │   ├── config.ts         # env validado por Zod
│       │   ├── db/               # Drizzle client, schema, migrations/
│       │   ├── auth/             # Better Auth instance + Fastify plugin
│       │   ├── email/            # nodemailer transport + templates
│       │   ├── queues/           # BullMQ queues + workers
│       │   ├── modules/          # health, organizations, invitations
│       │   └── lib/              # logger (Pino), utilities
│       ├── drizzle.config.ts
│       ├── vitest.config.ts
│       └── package.json          # @olympia/api
├── packages/
│   ├── shared/                   # @olympia/shared — Zod schemas compartilhados
│   │   └── src/schemas/
│   └── tsconfig/                 # bases de tsconfig (react, node, base)
├── docker-compose.yml            # Postgres 16 + Redis 7 + MailPit
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                  # scripts orquestradores + devDeps root
├── .env.example
└── .github/workflows/ci.yml
```

### Fluxo de dados

```
Browser ──► apps/web (Vite :5173)
             │ proxy /api/*
             ▼
          apps/api server (Fastify :3000)
             │           │
             ▼           ▼
         Postgres      Redis (BullMQ)
         :5432         :6379
                         │
                         ▼
                      apps/api worker
                         │
                         ▼
                 MailPit :1025 (dev)
                 Resend SMTP (prod)
```

### Convenções

- **Workspaces:** `@olympia/web`, `@olympia/api`, `@olympia/shared`, `@olympia/tsconfig`
- **Node:** 20.x (mantém `.nvmrc`)
- **Package manager:** pnpm 9.x
- **Orquestração:** todos os scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `format`) via Turbo
- **Migração:** `git mv src/ apps/web/src/` preserva histórico

## Seção 2 — Backend (`apps/api`)

### Entry points

Três distintos pra separar preocupações:

- **`server.ts`** — carrega config, chama `buildApp()`, inicia HTTP em :3000, registra shutdown hooks (SIGTERM/SIGINT → fecha Fastify + pool Postgres + conexões Redis)
- **`worker.ts`** — carrega config, instancia `Worker` BullMQ pra fila `email`, sem HTTP. Escala independente em produção
- **`app.ts`** — exporta `buildApp()` que registra plugins, rotas, Better Auth. Reusado nos testes via `app.inject()` sem subir porta

### Config (`config.ts`)

Zod schema valida `process.env` no startup. Campos obrigatórios:

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (base URL da API)
- `WEB_ORIGIN` (origem do frontend, pra CORS)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Opcionais:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (se ausente, esconde botão no frontend + loga warning)
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` (idem)
- `RESEND_API_KEY` (apenas em prod; dev usa MailPit)

Se qualquer obrigatório falta, servidor não sobe e loga o campo. `.env.example` versionado.

### Database (`db/`)

- **`client.ts`** — `drizzle(new Pool({ connectionString }))` exportando `db` singleton
- **`schema/auth.ts`** — tabelas do Better Auth core: `user`, `session`, `account`, `verification`
- **`schema/organization.ts`** — tabelas do plugin organization: `organization`, `member`, `invitation`
- **`migrations/`** — SQL gerado por `drizzle-kit generate`, versionado. Script raiz `pnpm db:migrate` aplica

**Fonte dos schemas do Better Auth:** as tabelas em `schema/auth.ts` e `schema/organization.ts` são geradas via `npx @better-auth/cli generate --output src/db/schema/`. O CLI lê a config de `auth/instance.ts` e emite Drizzle schema coerente com o que Better Auth espera em runtime. A saída é commitada e vira source of truth — não escreve à mão contra docs do plugin (diverge silenciosamente em upgrades). Quando mudar config do Better Auth (novo plugin, novo campo), roda o CLI de novo, roda `drizzle-kit generate` pra produzir migration, revisa e commita.

### Better Auth (`auth/`)

- **`instance.ts`** — `betterAuth({ database: drizzleAdapter(db), ... })` com:
  - `emailAndPassword` habilitado + `requireEmailVerification: true`
  - `socialProviders.google` + `socialProviders.microsoft` com credentials de config
  - Plugin `magicLink` — `sendMagicLink` → enqueue BullMQ
  - Plugin `organization` com roles `owner | admin | member` e invite flow
  - `sendVerificationEmail` + `sendResetPassword` → enqueue BullMQ
  - Cookie config: `sameSite: "lax"`, `secure` em prod, domínio via config
- **`plugin.ts`** — Fastify plugin que monta `/api/auth/*` e expõe `req.auth.user` / `req.auth.session` via decorator

### Módulos (`modules/`)

Cada módulo é um Fastify plugin com suas rotas:

- **`health/`** — `GET /health` (liveness) + `GET /ready` (checa Postgres + Redis)
- **`organizations/`** — CRUD delegando pra Better Auth organization API; permission checks via role
- **`invitations/`** — aceitar/recusar convite, listar pendentes (envio já coberto pelo Better Auth)

Rotas protegidas usam `preHandler` que valida `req.auth.session` (401 sem sessão) e, pra endpoints org-scoped, `req.auth.session.activeOrganizationId` (403 se não pertence).

### Email (`email/`)

- **`transport.ts`** — `nodemailer.createTransport({ host, port, auth })` lido do config. Dev aponta pra MailPit (`localhost:1025`, sem auth); prod aponta pro SMTP da Resend
- **`templates/`** — funções que recebem props e retornam `{ subject, html, text }`. Quatro templates mínimos:
  - `verifyEmail`
  - `resetPassword`
  - `magicLink`
  - `orgInvite`
- **Uso** — callers não mandam direto; sempre via `emailQueue.add()`

### Queues (`queues/`)

- **`email.queue.ts`** — `new Queue("email", { connection: redis })` com jobs tipados via Zod (`verifyEmail`, `resetPassword`, `magicLink`, `orgInvite`)
- **`email.worker.ts`** — `new Worker("email", processor, { connection, concurrency: 5 })`. Processor seleciona template pelo job name, renderiza, chama `transport.sendMail`. Retries com backoff exponencial (3 tentativas)

### Logger (`lib/logger.ts`)

Pino com `pino-pretty` em dev e JSON estruturado em prod. Redaction pra `req.headers.authorization`, `req.headers.cookie`, `password`, `*.secret`. Fastify recebe a instância em `buildApp({ logger })`.

### CORS

`@fastify/cors` com:

- `origin: config.WEB_ORIGIN` (`http://localhost:5173` em dev, domínio real em prod)
- `credentials: true` (cookies cross-origin pro Better Auth)

### Testes do backend

Vitest + Fastify `app.inject()`. Três categorias:

- **Unit** — validação Zod, helpers puros (sem DB)
- **Integration** — rotas full contra **DB dedicado `olympia_test`** no mesmo container Postgres do dev. `DATABASE_URL` de teste é variável separada no `.env` (`DATABASE_URL_TEST`), commitada no `.env.example`
- **Auth flow** — signup → verify email → login → invite → accept, end-to-end via `inject()`, com transport stubado capturando emails em array in-memory

**Reset entre testes:** `TRUNCATE` das tabelas no `beforeEach` em vez de transactions (Better Auth usa transactions internamente, não aninha). Helper `resetDb()` em `src/db/test-utils.ts` emite um único `TRUNCATE TABLE user, session, account, verification, organization, member, invitation RESTART IDENTITY CASCADE` — `CASCADE` resolve ordem de FKs sem precisar listar manualmente. Migrations rodam uma vez antes da suíte via `globalSetup` do Vitest.

## Seção 3 — Frontend (`apps/web`)

### Migração do código atual

`git mv src/ apps/web/src/` preserva histórico. `vite.config.ts`, `tsconfig.json`, `index.html`, `eslint.config.js`, `postcss.config.js`, `vitest.config.ts` migram pra `apps/web/`. Ajusta `vite.config.ts` com `server.proxy` pra `/api` → `http://localhost:3000` (dev) — cookies ficam same-origin, evita CORS preflight.

### Better Auth client

Novo módulo `apps/web/src/lib/auth.ts` instancia:

```typescript
createAuthClient({
  baseURL: "/api/auth",
  plugins: [organizationClient(), magicLinkClient()],
});
```

Exporta `signIn`, `signUp`, `signOut`, `useSession`, `organization`. `@olympia/shared` exporta Zod schemas usados por forms (mesma validação cliente/servidor).

### Gate de autenticação real

`localStorage` mock morre. Novo `RequireAuth` lê `useSession()`:

- `isPending` → skeleton da `MainLayout`
- `!session` → `<Navigate to="/login" replace />` com `state.from` pra redirect pós-login
- `session && !session.user.emailVerified` → `<Navigate to="/verify-email" />`
- `session && !session.activeOrganizationId` → `<Navigate to="/onboarding/organization" />`
- caso contrário, `<Outlet />`

`RequireOrgRole` (usado em `/users`, `/settings`, `/integrations`) lê `session.activeOrganizationRole` e redireciona se não for `owner`/`admin`.

### Rotas novas — públicas

- **`/signup`** — email + senha + nome; cria user + org inicial em one-shot via `signUp` + `organization.create`
- **`/verify-email`** — "verifique seu inbox" + botão de reenvio; hit em `/auth/verify-email/:token` resolve e redireciona pra `/dashboard`
- **`/forgot-password`** — form envia email
- **`/reset-password`** — lê token da query string, valida, aplica nova senha
- **`/magic-link`** — form de email + estado "enviado"
- **`/invitation/:id`** — público (token assinado). Três branches:
  - sem sessão → redireciona pra `/signup?invitation=:id` (preenche email do convite no form, bloqueia edição); após signup+verify, aceita automaticamente
  - com sessão **e** email do usuário bate com o do convite → aceita, seta `activeOrganizationId`, redireciona pra `/dashboard`
  - com sessão **mas** email divergente → mostra página com mensagem "Este convite é pra `invite@example.com`. Faça logout e entre com essa conta, ou peça um novo convite." + botão "Sair e entrar com `invite@example.com`" (chama `signOut` + redireciona pra `/login?email=invite@example.com`). Não deixa aceitar com conta errada — convite é vinculado ao email

Rota `/login` existente ganha botões "Continuar com Google" e "Continuar com Microsoft" + link pra magic link.

### Rotas novas — protegidas

- **`/onboarding/organization`** — usuário vindo de SSO sem org cria uma (nome + slug gerado + CNPJ opcional). Entra no `MainLayout` após
- **`/users`** (mockada na Fase 1) passa a chamar `organization.listMembers()` + `organization.inviteMember()`. Tabela mostra invites pendentes + membros ativos. Dropdown pra mudar role/remover (só owner/admin)
- **`/settings/organization`** — rename + slug + transferência de ownership + delete org (destrutivo, só owner, confirmação por nome)

### Header — switcher de organização

`MainLayout` ganha um `OrgSwitcher` no header (dropdown ao lado do avatar) que:

- Lista organizações do usuário via `organization.list()`
- Marca a `activeOrganizationId` atual
- Ao trocar, chama `organization.setActive({ organizationId })` e força re-fetch de dados org-scoped da página atual (via `router.revalidate()` ou reload leve)
- Mostra link "Criar nova organização" no rodapé do dropdown → `/onboarding/organization?mode=additional`

### Data fetching

Não introduz React Query/SWR agora. Better Auth `useSession` já é reativo; páginas de org chamam `organization.listMembers()` em `useEffect` + `useState`. Reavalia na Fase 3 quando começar a ter endpoints de negócio.

### Testes do frontend

Smoke atual continua. Adiciona teste de integração por rota pública (renderiza form, submete mock, verifica navigate). Better Auth client mockado via `vi.mock` — não vale subir API nos testes de `apps/web`.

## Seção 4 — Infra dev, CI, testes

### `docker-compose.yml` (raiz)

Três serviços com volumes nomeados e healthchecks:

- **`postgres`** — `postgres:16-alpine`, porta `5432`, db `olympia`, user/pass `olympia`, volume `pgdata`
- **`redis`** — `redis:7-alpine`, porta `6379`, volume `redisdata`
- **`mailpit`** — `axllent/mailpit`, SMTP `1025`, UI `8025`

`.env.example` na raiz documenta todas as variáveis. `apps/api` e `apps/web` leem do `.env` local. README: `docker compose up -d` sobe tudo; `pnpm db:migrate` aplica schema.

### Turborepo (`turbo.json`)

Pipeline tasks:

- `build` (depends `^build`, outputs `dist/**`)
- `dev` (persistent, sem cache)
- `lint`
- `typecheck`
- `test` (depends `^build` pra compilar `shared` antes)

`globalDependencies: ["pnpm-lock.yaml", ".env.example"]`. Cache remoto desligado por ora (YAGNI — liga se CI ficar lento).

### Scripts da raiz (`package.json`)

`dev`, `build`, `lint`, `typecheck`, `test`, `format` → `turbo run <task>`. Scripts de DB:

- `db:migrate` → `pnpm --filter @olympia/api db:migrate`
- `db:generate` → `pnpm --filter @olympia/api db:generate`
- `db:studio` → `pnpm --filter @olympia/api db:studio`
- `compose:up` / `compose:down` wrappers

### CI (`.github/workflows/ci.yml`)

Matrix continua (`lint | typecheck | test | build`) com ajustes:

- Postgres 16 + Redis 7 como **service containers** do GitHub Actions só no job `test`
- Cache do Turbo em `~/.turbo` chaveado por `${{ github.sha }}` com fallback por branch
- `pnpm install --frozen-lockfile` no root resolve todas as workspaces
- Migrations rodam antes do `test` contra Postgres do service

MailPit não sobe no CI — testes que tocam email stubam o transport.

### Estratégia de testes

**`apps/web`** — Vitest + Testing Library + jsdom. Better Auth client mockado. Smoke + renderização + redirect de guard.

**`apps/api`** — Vitest + Fastify `inject()`. Unit + Integration + Auth flow (detalhes na Seção 2).

**`packages/shared`** — Vitest com testes de schema (inputs válidos/inválidos).

### Observabilidade local

- Pino com `pino-pretty` colore logs em dev
- BullMQ tem dashboard via `bull-board` em `/admin/queues`, protegido por header básico configurável (off em prod por padrão)
- MailPit UI em `localhost:8025` pra inspecionar emails

### Segredos

- `BETTER_AUTH_SECRET` gerado com `openssl rand -base64 32`
- CI usa GitHub Secrets; dev usa `.env` gitignored
- Google/Microsoft OAuth opcionais em dev — app loga warning e esconde os botões se ausentes (devs novos não ficam bloqueados)

## Itens fora de escopo (diferidos)

Itens herdados da Fase 1 que continuam abertos:

- **I-2** — reativar `noUnusedLocals`/`noUnusedParameters` em `tsconfig.app.json`
- **I-3** — apertar override ESLint em `src/app/**` (remover `no-non-null-assertion`, `no-unsafe-argument`)

Podem ser endereçados durante a Fase 2 já que o layout vai mudar (src/ → apps/web/src/), mas não são requisito.

## Riscos & mitigações

- **Better Auth é nova relativamente.** Mitigação: ficar na versão stable, ler release notes, cobrir auth flow com testes end-to-end
- **Migração do frontend pode quebrar imports.** Mitigação: `git mv` preserva conteúdo; ajustes são só nos config files. CI pega regressão
- **Cookies cross-origin em dev.** Mitigação: Vite proxy resolve; testa cedo
- **SSO em dev precisa de credenciais reais.** Mitigação: credenciais opcionais; botões escondem quando ausentes

## Sucesso

Fase 2 é considerada entregue quando:

- [ ] `pnpm dev` sobe web + api + docker-compose e o signup funciona end-to-end (signup → email de verificação na MailPit UI → verify → login → dashboard)
- [ ] SSO Google e Microsoft funcionam local com credentials de teste
- [ ] Magic Link funciona e aparece na MailPit
- [ ] Owner consegue convidar membro, membro aceita, aparece em `/users`
- [ ] Owner troca role e remove membro
- [ ] Usuário troca de org ativa via menu no header
- [ ] CI verde com service containers
- [ ] Todas as rotas da Fase 1 continuam funcionando com sessão real

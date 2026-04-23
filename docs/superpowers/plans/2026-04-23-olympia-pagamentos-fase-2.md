# Olympia Pagamentos — Fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o projeto pra monorepo Turborepo e entregar backend completo com auth real (email/senha + SSO + magic link), multi-tenancy por organização, e frontend 100% integrado — substituindo o gate mock da Fase 1 por sessões reais do Better Auth.

**Architecture:** Monorepo pnpm + Turborepo com `apps/web`, `apps/api`, `packages/shared` e `packages/tsconfig`. API Fastify com Drizzle (Postgres 16), Better Auth com plugins `organization` e `magicLink`, BullMQ sobre Redis pra emails. Frontend migrado preservando histórico via `git mv`, com `RequireAuth`/`RequireOrgRole` guards lendo sessão real via Better Auth client.

**Tech Stack:** pnpm 9 · Turborepo · TypeScript 5 · Fastify 5 · Drizzle ORM · Zod · Better Auth · Postgres 16 · Redis 7 · BullMQ · Pino · Nodemailer · MailPit (dev) · Resend (prod) · Docker Compose · Vitest · GitHub Actions

**Spec:** [`docs/superpowers/specs/2026-04-23-olympia-pagamentos-fase-2-design.md`](../specs/2026-04-23-olympia-pagamentos-fase-2-design.md)

---

## Pré-requisitos

- Node 20.x instalado (`.nvmrc` já existe)
- pnpm 9.x instalado
- Docker Desktop rodando (Postgres + Redis + MailPit)
- Git configurado
- Shell bash (Git Bash no Windows)
- CWD: `C:\Users\PC Di\Desktop\CODIGO\Olympia-Pagamentos-SaaS-App`

**Convenção de commits:** Conventional Commits em português. Commit por task completa. Migrations Drizzle commitadas junto com a task que introduz schema.

**Ordem:** Tasks são ordenadas por dependência — não pule. Fases A–C montam a fundação; D–F cobrem backend; G–H cobrem frontend; I fecha CI + verificação.

---

## Mapa de arquivos criados/modificados

### Raiz do repo

| Arquivo                           | Responsabilidade                                          |
| --------------------------------- | --------------------------------------------------------- |
| `package.json`                    | Scripts orquestradores via Turbo + devDeps compartilhadas |
| `pnpm-workspace.yaml`             | Declaração dos workspaces                                 |
| `turbo.json`                      | Pipeline tasks + caching                                  |
| `docker-compose.yml`              | Postgres 16 + Redis 7 + MailPit                           |
| `.env.example`                    | Documenta todas as env vars                               |
| `.gitignore`                      | Adiciona `.turbo/`, `.env`, `pgdata/`, `redisdata/`       |
| `.prettierrc`, `eslint.config.js` | Removidos da raiz — migram pra cada workspace             |

### `apps/web/`

| Arquivo                                | Responsabilidade                         |
| -------------------------------------- | ---------------------------------------- |
| `package.json`                         | `@olympia/web` (deps web atuais)         |
| `vite.config.ts`                       | + proxy `/api` → `http://localhost:3000` |
| `tsconfig.json`                        | Extende `@olympia/tsconfig/react.json`   |
| `src/...`                              | Migrado via `git mv src/ apps/web/src/`  |
| `src/lib/auth.ts`                      | **Novo** — Better Auth client            |
| `src/app/guards/RequireAuth.tsx`       | **Novo** — substitui gate mock           |
| `src/app/guards/RequireOrgRole.tsx`    | **Novo**                                 |
| `src/app/components/OrgSwitcher.tsx`   | **Novo** — dropdown no header            |
| `src/app/pages/SignupPage.tsx`         | **Novo**                                 |
| `src/app/pages/VerifyEmailPage.tsx`    | **Novo**                                 |
| `src/app/pages/ForgotPasswordPage.tsx` | **Novo**                                 |
| `src/app/pages/ResetPasswordPage.tsx`  | **Novo**                                 |
| `src/app/pages/MagicLinkPage.tsx`      | **Novo**                                 |
| `src/app/pages/InvitationPage.tsx`     | **Novo**                                 |
| `src/app/pages/OrgOnboardingPage.tsx`  | **Novo**                                 |
| `src/app/pages/OrgSettingsPage.tsx`    | **Novo** (substitui mock)                |
| `src/app/pages/UsersPage.tsx`          | Modificado — dados reais                 |
| `src/app/pages/LoginPage.tsx`          | Modificado — real auth + SSO buttons     |
| `src/app/routes.tsx`                   | Modificado — rotas novas + guards reais  |
| `src/app/layouts/MainLayout.tsx`       | Modificado — embute `OrgSwitcher`        |

### `apps/api/`

| Arquivo                                | Responsabilidade                             |
| -------------------------------------- | -------------------------------------------- |
| `package.json`                         | `@olympia/api`                               |
| `tsconfig.json`                        | Extende `@olympia/tsconfig/node.json`        |
| `vitest.config.ts`                     | Setup de testes (globalSetup pra migrations) |
| `drizzle.config.ts`                    | Config do drizzle-kit                        |
| `.env.example`                         | Exemplo específico da API                    |
| `src/server.ts`                        | Entry HTTP                                   |
| `src/worker.ts`                        | Entry BullMQ                                 |
| `src/app.ts`                           | `buildApp()`                                 |
| `src/config.ts`                        | Zod env validation                           |
| `src/db/client.ts`                     | `drizzle(Pool)`                              |
| `src/db/schema/auth.ts`                | Gerado via Better Auth CLI                   |
| `src/db/schema/organization.ts`        | Gerado via Better Auth CLI                   |
| `src/db/schema/index.ts`               | Re-exports                                   |
| `src/db/migrations/*.sql`              | Geradas por drizzle-kit                      |
| `src/db/test-utils.ts`                 | `resetDb()`                                  |
| `src/auth/instance.ts`                 | Better Auth instance                         |
| `src/auth/plugin.ts`                   | Fastify plugin monta `/api/auth/*`           |
| `src/email/transport.ts`               | Nodemailer                                   |
| `src/email/templates/verifyEmail.ts`   | Template                                     |
| `src/email/templates/resetPassword.ts` | Template                                     |
| `src/email/templates/magicLink.ts`     | Template                                     |
| `src/email/templates/orgInvite.ts`     | Template                                     |
| `src/queues/redis.ts`                  | Cliente Redis compartilhado                  |
| `src/queues/email.queue.ts`            | Queue                                        |
| `src/queues/email.worker.ts`           | Worker                                       |
| `src/queues/email.types.ts`            | Zod job schemas                              |
| `src/lib/logger.ts`                    | Pino                                         |
| `src/modules/health/routes.ts`         | `/health` e `/ready`                         |
| `src/modules/organizations/routes.ts`  | CRUD wrappers                                |
| `src/modules/invitations/routes.ts`    | Listar/aceitar/recusar                       |

### `packages/shared/`

| Arquivo                       | Responsabilidade                     |
| ----------------------------- | ------------------------------------ |
| `package.json`                | `@olympia/shared`                    |
| `tsconfig.json`               | Extende base                         |
| `src/index.ts`                | Re-exports                           |
| `src/schemas/auth.ts`         | Zod: signup, login, reset, magicLink |
| `src/schemas/organization.ts` | Zod: create, invite, updateMember    |

### `packages/tsconfig/`

| Arquivo        | Responsabilidade    |
| -------------- | ------------------- |
| `package.json` | `@olympia/tsconfig` |
| `base.json`    | Strict base         |
| `react.json`   | Para apps/web       |
| `node.json`    | Para apps/api       |

### `.github/workflows/ci.yml`

Reescrito pra monorepo com service containers de Postgres/Redis no job `test`, cache do Turbo, filters por workspace.

---

# Fase A — Monorepo foundation

## Task A1: Scaffold workspaces + Turborepo

Mover tooling da raiz pros workspaces. Começa quebrando e só volta verde no fim da Fase A.

**Files:**

- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `packages/tsconfig/package.json`
- Create: `packages/tsconfig/base.json`
- Create: `packages/tsconfig/react.json`
- Create: `packages/tsconfig/node.json`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["pnpm-lock.yaml", ".env.example"],
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL_TEST", "REDIS_URL"]
    },
    "format:check": {}
  }
}
```

- [ ] **Step 3: Create `packages/tsconfig/package.json`**

```json
{
  "name": "@olympia/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "react.json", "node.json"]
}
```

- [ ] **Step 4: Create `packages/tsconfig/base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 5: Create `packages/tsconfig/react.json`**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "useDefineForClassFields": true,
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

- [ ] **Step 6: Create `packages/tsconfig/node.json`**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "outDir": "dist",
    "sourceMap": true,
    "declaration": false
  }
}
```

- [ ] **Step 7: Replace `package.json`** (substitui por versão raiz do monorepo)

```json
{
  "name": "olympia-pagamentos",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": "20.x"
  },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:generate": "pnpm --filter @olympia/api db:generate",
    "db:migrate": "pnpm --filter @olympia/api db:migrate",
    "db:studio": "pnpm --filter @olympia/api db:studio",
    "compose:up": "docker compose up -d",
    "compose:down": "docker compose down",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  },
  "devDependencies": {
    "@olympia/tsconfig": "workspace:*",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0",
    "prettier": "^3.8.3",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "turbo": "^2.3.0",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 8: Update `.gitignore`** — adiciona linhas:

```gitignore
# Turborepo
.turbo/

# Docker volumes
pgdata/
redisdata/
```

- [ ] **Step 9: Install**

Run: `pnpm install`
Expected: pnpm cria `pnpm-lock.yaml` renovado, resolve `@olympia/tsconfig` como workspace. Warnings sobre deps não removidas (eslint etc) são esperados — removidas na Task A3.

- [ ] **Step 10: Commit**

```bash
git add pnpm-workspace.yaml turbo.json packages/ package.json pnpm-lock.yaml .gitignore
git commit -m "chore: scaffold monorepo com turborepo e tsconfigs compartilhados"
```

## Task A2: Migrar frontend pra `apps/web/`

Preserva histórico via `git mv`. O projeto fica **quebrado** neste ponto — restaurado na Task A3.

**Files:**

- Move: `src/` → `apps/web/src/`
- Move: `public/` → `apps/web/public/` (se existir)
- Move: `index.html` → `apps/web/index.html`
- Move: `vite.config.ts` → `apps/web/vite.config.ts`
- Move: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` → `apps/web/`
- Move: `eslint.config.js` → `apps/web/eslint.config.js`
- Move: `postcss.config.js` (se existir) → `apps/web/`

- [ ] **Step 1: Criar diretório**

```bash
mkdir -p apps/web
```

- [ ] **Step 2: Mover arquivos (preserva git history)**

```bash
git mv src apps/web/src
git mv index.html apps/web/index.html
git mv vite.config.ts apps/web/vite.config.ts
git mv tsconfig.json apps/web/tsconfig.json
git mv tsconfig.app.json apps/web/tsconfig.app.json
git mv tsconfig.node.json apps/web/tsconfig.node.json
git mv eslint.config.js apps/web/eslint.config.js
[ -d public ] && git mv public apps/web/public || true
[ -f postcss.config.js ] && git mv postcss.config.js apps/web/postcss.config.js || true
```

- [ ] **Step 3: Verificar estrutura**

Run: `ls apps/web/`
Expected: vê `src/`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`.

- [ ] **Step 4: Commit intermediário**

```bash
git add apps/web/
git commit -m "refactor: move frontend para apps/web/"
```

## Task A3: Finalizar `apps/web/` como workspace

Configurar `apps/web/package.json` e ajustar imports.

**Files:**

- Create: `apps/web/package.json`
- Modify: `apps/web/tsconfig.json` — extende `@olympia/tsconfig/react.json`
- Modify: `apps/web/tsconfig.app.json` — alinha com tsconfig compartilhado
- Modify: `apps/web/vite.config.ts` — adiciona `server.proxy`
- Modify: `apps/web/src/main.tsx` — nada (mantém)
- Delete: raiz `package.json` no estado antigo (já substituído na A1)

- [ ] **Step 1: Create `apps/web/package.json`** — herda deps que estavam na raiz

```json
{
  "name": "@olympia/web",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@olympia/shared": "workspace:*",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "better-auth": "^1.2.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react": "18.3.1",
    "react-day-picker": "8.10.1",
    "react-dom": "18.3.1",
    "react-hook-form": "7.55.0",
    "react-resizable-panels": "2.1.7",
    "react-router": "7.13.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@olympia/tsconfig": "workspace:*",
    "@tailwindcss/vite": "4.1.12",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20.11.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "4.7.0",
    "@vitest/ui": "^4.1.5",
    "eslint": "^9",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "jsdom": "^29.0.2",
    "tailwindcss": "4.1.12",
    "typescript-eslint": "^8.59.0",
    "vite": "6.3.5",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 2: Modify `apps/web/vite.config.ts`** — adiciona proxy (preserva plugins existentes)

Abra o arquivo e adicione `server` ao `defineConfig`:

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: false,
      },
    },
  },
});
```

- [ ] **Step 3: Install**

Run: `pnpm install`
Expected: resolução de `@olympia/web` e `@olympia/tsconfig` ok. `@olympia/shared` ainda não existe — ignora warning por enquanto (criado na A4).

- [ ] **Step 4: Typecheck isolado**

Run: `pnpm --filter @olympia/web typecheck`
Expected: PASS (apenas workspace web compilado).

- [ ] **Step 5: Smoke test**

Run: `pnpm --filter @olympia/web test -- --run`
Expected: mesmos testes da Fase 1 passando.

- [ ] **Step 6: Build**

Run: `pnpm --filter @olympia/web build`
Expected: `apps/web/dist/` gerado sem erros.

- [ ] **Step 7: Commit**

```bash
git add apps/web/ pnpm-lock.yaml
git commit -m "feat: configura apps/web como workspace @olympia/web"
```

## Task A4: Scaffold `packages/shared`

Placeholder com schemas Zod compartilhados. Preenchido ao longo das fases.

**Files:**

- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/schemas/auth.ts`
- Create: `packages/shared/src/schemas/organization.ts`

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@olympia/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schemas/auth": "./src/schemas/auth.ts",
    "./schemas/organization": "./src/schemas/organization.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@olympia/tsconfig": "workspace:*",
    "typescript": "^5.9.3",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "@olympia/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `packages/shared/src/schemas/auth.ts`**

```typescript
import { z } from "zod";

export const emailSchema = z.string().email("Email inválido");

export const passwordSchema = z.string().min(8, "Senha precisa ter ao menos 8 caracteres");

export const signupSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
```

- [ ] **Step 4: Create `packages/shared/src/schemas/organization.ts`**

```typescript
import { z } from "zod";

export const slugSchema = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífen");

export const createOrgSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  slug: slugSchema,
  cnpj: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export const updateMemberSchema = z.object({
  memberId: z.string(),
  role: z.enum(["admin", "member"]),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
```

- [ ] **Step 5: Create `packages/shared/src/index.ts`**

```typescript
export * from "./schemas/auth.js";
export * from "./schemas/organization.js";
```

- [ ] **Step 6: Install + typecheck**

Run: `pnpm install && pnpm --filter @olympia/shared typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/ pnpm-lock.yaml
git commit -m "feat: scaffold @olympia/shared com schemas Zod de auth e org"
```

## Task A5: Scaffold `apps/api` skeleton

Só estrutura + `package.json` + tsconfig. Implementação vem nas fases B+.

**Files:**

- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/.gitkeep`

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "@olympia/api",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "dev:worker": "tsx watch src/worker.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:worker": "node dist/worker.js",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@fastify/cors": "^10.0.0",
    "@olympia/shared": "workspace:*",
    "better-auth": "^1.2.0",
    "bullmq": "^5.25.0",
    "drizzle-orm": "^0.36.0",
    "fastify": "^5.1.0",
    "ioredis": "^5.4.0",
    "nodemailer": "^6.9.16",
    "pg": "^8.13.0",
    "pino": "^9.5.0",
    "pino-pretty": "^11.3.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@olympia/tsconfig": "workspace:*",
    "@types/node": "^20.11.0",
    "@types/nodemailer": "^6.4.17",
    "@types/pg": "^8.11.0",
    "drizzle-kit": "^0.28.0",
    "eslint": "^9",
    "tsx": "^4.19.0",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.59.0",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 2: Create `apps/api/tsconfig.json`**

```json
{
  "extends": "@olympia/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create placeholder**

```bash
mkdir -p apps/api/src && touch apps/api/src/.gitkeep
```

- [ ] **Step 4: Install**

Run: `pnpm install`
Expected: resolve deps do api. Nenhum lint/typecheck ainda pq src/ tá vazio.

- [ ] **Step 5: Commit**

```bash
git add apps/api/ pnpm-lock.yaml
git commit -m "chore: scaffold apps/api skeleton (deps + tsconfig)"
```

## Task A6: Mover tooling + Prettier config pra raiz

Husky + Prettier continuam na raiz (afetam o monorepo inteiro). ESLint por workspace.

**Files:**

- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `.husky/pre-commit` se existir

- [ ] **Step 1: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 2: Create `.prettierignore`**

```
node_modules/
dist/
build/
coverage/
pnpm-lock.yaml
.turbo/
pgdata/
redisdata/
apps/*/dist/
```

- [ ] **Step 3: Verificar Husky**

Run: `cat .husky/pre-commit`
Expected: `pnpm lint-staged` ou similar. Se não existir, criar:

```bash
echo 'pnpm lint-staged' > .husky/pre-commit
```

- [ ] **Step 4: Rodar format check**

Run: `pnpm format:check`
Expected: PASS ou mostrar arquivos a formatar. Se houver, rode `pnpm format` e verifique novamente.

- [ ] **Step 5: Commit**

```bash
git add .prettierrc .prettierignore .husky/
git commit -m "chore: configura prettier e husky na raiz do monorepo"
```

---

# Fase B — Dev infra

## Task B1: docker-compose.yml + .env.example

**Files:**

- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `.gitignore` (já coberto em A1)

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: olympia-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: olympia
      POSTGRES_PASSWORD: olympia
      POSTGRES_DB: olympia
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/postgres-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "olympia", "-d", "olympia"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: olympia-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailpit:
    image: axllent/mailpit:latest
    container_name: olympia-mailpit
    restart: unless-stopped
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  pgdata:
  redisdata:
```

- [ ] **Step 2: Create `docker/postgres-init.sql`** — cria DB de teste

```sql
CREATE DATABASE olympia_test;
```

- [ ] **Step 3: Create `.env.example`** (raiz)

```bash
# Postgres
DATABASE_URL=postgresql://olympia:olympia@localhost:5432/olympia
DATABASE_URL_TEST=postgresql://olympia:olympia@localhost:5432/olympia_test

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# Better Auth
BETTER_AUTH_SECRET=replace-me-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3000

# Frontend origin (CORS)
WEB_ORIGIN=http://localhost:5173

# SMTP (MailPit em dev)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@olympia.local

# OAuth — opcionais em dev
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Prod-only
# RESEND_API_KEY=
NODE_ENV=development
LOG_LEVEL=debug

# BullMQ admin UI header (dev)
BULL_BOARD_TOKEN=dev-only
```

- [ ] **Step 4: Copiar .env**

```bash
cp .env.example .env
```

- [ ] **Step 5: Subir compose**

Run: `docker compose up -d`
Expected: três containers sobem. Verifica com `docker compose ps` — status `healthy` em Postgres/Redis após ~10s.

- [ ] **Step 6: Verificar Postgres**

Run: `docker exec olympia-postgres psql -U olympia -d olympia -c "\l"`
Expected: lista os databases `olympia` e `olympia_test`.

- [ ] **Step 7: Verificar MailPit UI**

Abrir `http://localhost:8025` no browser — tela vazia da caixa de entrada.

- [ ] **Step 8: Commit**

```bash
git add docker-compose.yml docker/postgres-init.sql .env.example
git commit -m "feat: docker-compose com postgres 16 + redis 7 + mailpit"
```

## Task B2: `apps/api/src/config.ts` — Zod env validation

**Files:**

- Create: `apps/api/src/config.ts`
- Create: `apps/api/.env.example` (específico da API, symlink conceitual)

- [ ] **Step 1: Create `apps/api/src/config.ts`**

```typescript
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),
  DATABASE_URL_TEST: z.string().url().optional(),
  REDIS_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32, "Gere com: openssl rand -base64 32"),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),

  BULL_BOARD_TOKEN: z.string().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Config inválida:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = result.data;
export type Config = typeof config;

export const hasGoogleSSO = Boolean(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET);
export const hasMicrosoftSSO = Boolean(
  config.MICROSOFT_CLIENT_ID && config.MICROSOFT_CLIENT_SECRET,
);
```

- [ ] **Step 2: Criar link do .env pra apps/api**

No monorepo, API lê `.env` da raiz via `process.env` (Turbo + dotenv-flow). Garantir que config local não vaza:

Run: `ls -la apps/api/.env*` (esperado: vazio)

- [ ] **Step 3: Validar boot**

```bash
cd apps/api && pnpm exec tsx -e "import('./src/config.ts').then(m => console.log(m.config))"
```

Expected: loga objeto com env válido.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/config.ts
git commit -m "feat(api): valida env vars com zod no startup"
```

## Task B3: Logger (Pino)

**Files:**

- Create: `apps/api/src/lib/logger.ts`

- [ ] **Step 1: Create `apps/api/src/lib/logger.ts`**

```typescript
import { pino } from "pino";
import { config } from "../config.js";

const isDev = config.NODE_ENV === "development";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "*.password",
      "*.secret",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, singleLine: false },
      }
    : undefined,
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/lib/logger.ts
git commit -m "feat(api): adiciona logger pino com redaction"
```

## Task B4: Fastify `buildApp()` + server.ts + /health

Servidor mínimo funcional com health check. Auth integrado na Fase C.

**Files:**

- Create: `apps/api/src/modules/health/routes.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`

- [ ] **Step 1: Create `apps/api/src/modules/health/routes.ts`**

```typescript
import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/ready", async (req, reply) => {
    // placeholder — checagens reais (pg + redis) na Task C1/D1
    return reply.send({ status: "ok", db: "pending", redis: "pending" });
  });
};
```

- [ ] **Step 2: Create `apps/api/src/app.ts`**

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./modules/health/routes.js";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  app.register(healthRoutes);

  return app;
}
```

- [ ] **Step 3: Create `apps/api/src/server.ts`**

```typescript
import { buildApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";

async function main() {
  const app = buildApp();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
  } catch (err) {
    logger.error(err, "Failed to start");
    process.exit(1);
  }
}

void main();
```

- [ ] **Step 4: Rodar dev server**

Run: `pnpm --filter @olympia/api dev`
Expected: Fastify sobe em `:3000`, log "Server listening".

- [ ] **Step 5: Testar /health (em outro terminal)**

Run: `curl http://localhost:3000/health`
Expected: `{"status":"ok"}`

- [ ] **Step 6: Parar servidor** (Ctrl+C — deve fechar limpo)

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/app.ts apps/api/src/server.ts apps/api/src/modules/
git commit -m "feat(api): fastify buildApp com cors e /health"
```

---

# Fase C — Database & Better Auth core

## Task C1: Drizzle client + migrate script

**Files:**

- Create: `apps/api/src/db/client.ts`
- Create: `apps/api/src/db/migrate.ts`
- Create: `apps/api/drizzle.config.ts`

- [ ] **Step 1: Create `apps/api/src/db/client.ts`**

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool);

export type DB = typeof db;
```

- [ ] **Step 2: Create `apps/api/drizzle.config.ts`**

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
```

- [ ] **Step 3: Create `apps/api/src/db/schema/index.ts`** — placeholder

```typescript
// Schemas geradas pelo Better Auth CLI na Task C3.
// Depois dessa task, reexporta tudo de ./auth.js e ./organization.js.
export {};
```

- [ ] **Step 4: Create `apps/api/src/db/migrate.ts`**

```typescript
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { logger } from "../lib/logger.js";

async function main() {
  logger.info("Rodando migrations...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  logger.info("Migrations OK");
  await pool.end();
}

main().catch((err) => {
  logger.error(err, "Migration falhou");
  process.exit(1);
});
```

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/db/ apps/api/drizzle.config.ts
git commit -m "feat(api): drizzle client + migrate script"
```

## Task C2: Better Auth instance (mínimo — apenas email/senha sem verificação)

Começa com o mais simples pra validar fluxo. Verificação/reset adicionados na Fase D depois que o email worker tá pronto.

**Files:**

- Create: `apps/api/src/auth/instance.ts`
- Create: `apps/api/src/auth/plugin.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Create `apps/api/src/auth/instance.ts`**

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import { config } from "../config.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  trustedOrigins: [config.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // ativado na Task D5
    autoSignIn: true,
  },
  advanced: {
    cookiePrefix: "olympia",
    useSecureCookies: config.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
    },
  },
});

export type Auth = typeof auth;
```

- [ ] **Step 2: Create `apps/api/src/auth/plugin.ts`**

```typescript
import type { FastifyPluginAsync } from "fastify";
import { auth } from "./instance.js";

export const authPlugin: FastifyPluginAsync = async (app) => {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (req, reply) => {
      const url = new URL(req.url, `${req.protocol}://${req.hostname}:${req.port ?? ""}`);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers.set(k, v);
        else if (Array.isArray(v)) headers.set(k, v.join(","));
      }
      const fetchReq = new Request(url.toString(), {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
      });

      const res = await auth.handler(fetchReq);

      reply.status(res.status);
      for (const [k, v] of res.headers.entries()) reply.header(k, v);
      return reply.send(await res.text());
    },
  });

  app.decorateRequest("auth", null);
  app.addHook("preHandler", async (req) => {
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers.set(k, v);
    }
    const session = await auth.api.getSession({ headers });
    // @ts-expect-error — decorated
    req.auth = session;
  });
};
```

- [ ] **Step 3: Modify `apps/api/src/app.ts`** — registra plugin

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./modules/health/routes.js";
import { authPlugin } from "./auth/plugin.js";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  app.register(authPlugin);
  app.register(healthRoutes);

  return app;
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/auth/ apps/api/src/app.ts
git commit -m "feat(api): better auth instance (email/senha) + fastify plugin"
```

## Task C3: Gerar schema Drizzle via Better Auth CLI + migration inicial

**Files:**

- Create: `apps/api/src/db/schema/auth.ts` (gerado)
- Create: `apps/api/src/db/schema/organization.ts` (placeholder — plugin ativado na F1)
- Modify: `apps/api/src/db/schema/index.ts`
- Create: `apps/api/src/db/migrations/0000_initial.sql` (gerado por drizzle-kit)

- [ ] **Step 1: Rodar Better Auth CLI**

```bash
cd apps/api && pnpm exec @better-auth/cli generate --config src/auth/instance.ts --output src/db/schema/auth.ts
```

Expected: arquivo `src/db/schema/auth.ts` gerado com tabelas `user`, `session`, `account`, `verification`.

- [ ] **Step 2: Modify `apps/api/src/db/schema/index.ts`**

```typescript
export * from "./auth.js";
```

- [ ] **Step 3: Gerar migration Drizzle**

Run: `pnpm --filter @olympia/api db:generate`
Expected: arquivo SQL em `apps/api/src/db/migrations/0000_*.sql` com `CREATE TABLE` para as 4 tabelas.

- [ ] **Step 4: Revisar migration**

Abrir o SQL gerado. Verifica `user`, `session`, `account`, `verification` com colunas esperadas pelo Better Auth.

- [ ] **Step 5: Rodar migration**

Run: `pnpm --filter @olympia/api db:migrate`
Expected: log "Migrations OK", tabelas criadas no DB `olympia`.

- [ ] **Step 6: Verificar no Postgres**

Run: `docker exec olympia-postgres psql -U olympia -d olympia -c "\dt"`
Expected: lista `user`, `session`, `account`, `verification`.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/db/schema/ apps/api/src/db/migrations/
git commit -m "feat(api): schema e migration inicial do better auth (core)"
```

## Task C4: Smoke test — signup + login via HTTP

Valida auth core funcionando. Sem frontend ainda.

**Files:**

- Create: `apps/api/src/test/setup.ts`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/db/test-utils.ts`
- Create: `apps/api/src/auth/auth.integration.test.ts`

- [ ] **Step 1: Create `apps/api/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/test/global-setup.ts"],
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
```

- [ ] **Step 2: Create `apps/api/src/test/global-setup.ts`**

```typescript
import { execSync } from "node:child_process";

export async function setup() {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ?? "postgresql://olympia:olympia@localhost:5432/olympia_test";
  execSync("pnpm db:migrate", {
    stdio: "inherit",
    env: { ...process.env },
  });
}
```

- [ ] **Step 3: Create `apps/api/src/test/setup.ts`**

```typescript
import { beforeEach } from "vitest";
import { pool } from "../db/client.js";
import { resetDb } from "../db/test-utils.js";

beforeEach(async () => {
  await resetDb();
});

process.on("beforeExit", async () => {
  await pool.end();
});
```

- [ ] **Step 4: Create `apps/api/src/db/test-utils.ts`**

```typescript
import { pool } from "./client.js";

const TABLES_TO_TRUNCATE = [
  "session",
  "account",
  "verification",
  "user",
  // Task F1 adiciona: "invitation", "member", "organization"
];

export async function resetDb() {
  const tables = TABLES_TO_TRUNCATE.map((t) => `"${t}"`).join(", ");
  await pool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
}
```

- [ ] **Step 5: Create `apps/api/src/auth/auth.integration.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

describe("auth — email/password", () => {
  it("signup + login + session", async () => {
    const app = buildApp();

    const signup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        name: "Diogo",
        email: "diogo@test.com",
        password: "password123",
      },
    });
    expect(signup.statusCode).toBe(200);

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "diogo@test.com", password: "password123" },
    });
    expect(login.statusCode).toBe(200);

    const cookie = login.headers["set-cookie"];
    expect(cookie).toBeDefined();

    const session = await app.inject({
      method: "GET",
      url: "/api/auth/get-session",
      headers: { cookie: Array.isArray(cookie) ? cookie.join("; ") : cookie! },
    });
    expect(session.statusCode).toBe(200);
    const body = session.json();
    expect(body.user.email).toBe("diogo@test.com");

    await app.close();
  });

  it("login com senha errada → 401", async () => {
    const app = buildApp();
    await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: { name: "X", email: "x@test.com", password: "password123" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "x@test.com", password: "wrong-wrong" },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
```

- [ ] **Step 6: Rodar testes**

Run: `pnpm --filter @olympia/api test -- --run`
Expected: PASS. Se falhar com "no tables", verifica que `olympia_test` existe (`docker exec olympia-postgres psql -U olympia -c "\l"`).

- [ ] **Step 7: Commit**

```bash
git add apps/api/vitest.config.ts apps/api/src/test/ apps/api/src/db/test-utils.ts apps/api/src/auth/auth.integration.test.ts
git commit -m "test(api): integração do fluxo signup+login do better auth"
```

---

# Fase D — Email infrastructure

## Task D1: Redis client compartilhado + queue

**Files:**

- Create: `apps/api/src/queues/redis.ts`
- Create: `apps/api/src/queues/email.types.ts`
- Create: `apps/api/src/queues/email.queue.ts`

- [ ] **Step 1: Create `apps/api/src/queues/redis.ts`**

```typescript
import IORedis from "ioredis";
import { config } from "../config.js";

export const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});
```

- [ ] **Step 2: Create `apps/api/src/queues/email.types.ts`**

```typescript
import { z } from "zod";

export const verifyEmailJob = z.object({
  type: z.literal("verifyEmail"),
  to: z.string().email(),
  name: z.string(),
  verifyUrl: z.string().url(),
});

export const resetPasswordJob = z.object({
  type: z.literal("resetPassword"),
  to: z.string().email(),
  name: z.string(),
  resetUrl: z.string().url(),
});

export const magicLinkJob = z.object({
  type: z.literal("magicLink"),
  to: z.string().email(),
  linkUrl: z.string().url(),
});

export const orgInviteJob = z.object({
  type: z.literal("orgInvite"),
  to: z.string().email(),
  inviterName: z.string(),
  organizationName: z.string(),
  inviteUrl: z.string().url(),
});

export const emailJobSchema = z.discriminatedUnion("type", [
  verifyEmailJob,
  resetPasswordJob,
  magicLinkJob,
  orgInviteJob,
]);

export type EmailJob = z.infer<typeof emailJobSchema>;
```

- [ ] **Step 3: Create `apps/api/src/queues/email.queue.ts`**

```typescript
import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";
import type { EmailJob } from "./email.types.js";

export const EMAIL_QUEUE_NAME = "email";

export const emailQueue = new Queue<EmailJob>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export async function enqueueEmail(job: EmailJob) {
  return emailQueue.add(job.type, job);
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/queues/redis.ts apps/api/src/queues/email.queue.ts apps/api/src/queues/email.types.ts
git commit -m "feat(api): bullmq queue e tipos dos jobs de email"
```

## Task D2: Nodemailer transport + templates

**Files:**

- Create: `apps/api/src/email/transport.ts`
- Create: `apps/api/src/email/templates/verifyEmail.ts`
- Create: `apps/api/src/email/templates/resetPassword.ts`
- Create: `apps/api/src/email/templates/magicLink.ts`
- Create: `apps/api/src/email/templates/orgInvite.ts`

- [ ] **Step 1: Create `apps/api/src/email/transport.ts`**

```typescript
import nodemailer from "nodemailer";
import { config } from "../config.js";

export const transport = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS ?? "" } : undefined,
});

export const FROM = config.SMTP_FROM;
```

- [ ] **Step 2: Create `apps/api/src/email/templates/verifyEmail.ts`**

```typescript
export function verifyEmail(props: { name: string; verifyUrl: string }) {
  return {
    subject: "Confirme seu email — Olympia",
    text: `Olá, ${props.name}!\n\nConfirme seu email clicando no link:\n${props.verifyUrl}\n\nO link expira em 24 horas.`,
    html: `<p>Olá, <strong>${props.name}</strong>!</p>
<p>Confirme seu email clicando no link:</p>
<p><a href="${props.verifyUrl}">${props.verifyUrl}</a></p>
<p><small>O link expira em 24 horas.</small></p>`,
  };
}
```

- [ ] **Step 3: Create `apps/api/src/email/templates/resetPassword.ts`**

```typescript
export function resetPassword(props: { name: string; resetUrl: string }) {
  return {
    subject: "Resetar sua senha — Olympia",
    text: `Olá, ${props.name}!\n\nPara resetar sua senha, clique no link:\n${props.resetUrl}\n\nSe você não pediu, ignore este email.`,
    html: `<p>Olá, <strong>${props.name}</strong>!</p>
<p>Para resetar sua senha, clique no link:</p>
<p><a href="${props.resetUrl}">${props.resetUrl}</a></p>
<p><small>Se você não pediu, ignore este email.</small></p>`,
  };
}
```

- [ ] **Step 4: Create `apps/api/src/email/templates/magicLink.ts`**

```typescript
export function magicLink(props: { linkUrl: string }) {
  return {
    subject: "Seu link de acesso — Olympia",
    text: `Clique pra entrar:\n${props.linkUrl}\n\nO link expira em 10 minutos.`,
    html: `<p>Clique pra entrar:</p>
<p><a href="${props.linkUrl}">${props.linkUrl}</a></p>
<p><small>O link expira em 10 minutos.</small></p>`,
  };
}
```

- [ ] **Step 5: Create `apps/api/src/email/templates/orgInvite.ts`**

```typescript
export function orgInvite(props: {
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
}) {
  return {
    subject: `Convite para ${props.organizationName} — Olympia`,
    text: `${props.inviterName} convidou você pra ${props.organizationName}.\n\nAceite clicando no link:\n${props.inviteUrl}`,
    html: `<p><strong>${props.inviterName}</strong> convidou você pra <strong>${props.organizationName}</strong>.</p>
<p><a href="${props.inviteUrl}">Aceitar convite</a></p>`,
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/email/
git commit -m "feat(api): nodemailer transport + 4 templates (verify/reset/magic/invite)"
```

## Task D3: Email worker + `worker.ts`

**Files:**

- Create: `apps/api/src/queues/email.worker.ts`
- Create: `apps/api/src/worker.ts`

- [ ] **Step 1: Create `apps/api/src/queues/email.worker.ts`**

```typescript
import { Worker, type Job } from "bullmq";
import { redisConnection } from "./redis.js";
import { EMAIL_QUEUE_NAME } from "./email.queue.js";
import { emailJobSchema, type EmailJob } from "./email.types.js";
import { transport, FROM } from "../email/transport.js";
import { verifyEmail } from "../email/templates/verifyEmail.js";
import { resetPassword } from "../email/templates/resetPassword.js";
import { magicLink } from "../email/templates/magicLink.js";
import { orgInvite } from "../email/templates/orgInvite.js";
import { logger } from "../lib/logger.js";

function render(job: EmailJob) {
  switch (job.type) {
    case "verifyEmail":
      return { to: job.to, ...verifyEmail(job) };
    case "resetPassword":
      return { to: job.to, ...resetPassword(job) };
    case "magicLink":
      return { to: job.to, ...magicLink(job) };
    case "orgInvite":
      return { to: job.to, ...orgInvite(job) };
  }
}

async function processor(job: Job<EmailJob>) {
  const data = emailJobSchema.parse(job.data);
  const { to, subject, text, html } = render(data);
  await transport.sendMail({ from: FROM, to, subject, text, html });
  logger.info({ jobId: job.id, type: data.type, to }, "Email enviado");
}

export function createEmailWorker() {
  return new Worker<EmailJob>(EMAIL_QUEUE_NAME, processor, {
    connection: redisConnection,
    concurrency: 5,
  });
}
```

- [ ] **Step 2: Create `apps/api/src/worker.ts`**

```typescript
import { createEmailWorker } from "./queues/email.worker.js";
import { redisConnection } from "./queues/redis.js";
import { logger } from "./lib/logger.js";

async function main() {
  const worker = createEmailWorker();
  logger.info("Email worker iniciado");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down worker");
    await worker.close();
    await redisConnection.quit();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Job falhou");
  });
}

void main();
```

- [ ] **Step 3: Testar worker manualmente**

Terminal 1: `pnpm --filter @olympia/api dev:worker`
Terminal 2:

```bash
cd apps/api
pnpm exec tsx -e "import('./src/queues/email.queue.js').then(m => m.enqueueEmail({ type: 'magicLink', to: 'dev@test.com', linkUrl: 'http://localhost/magic?token=abc' }))"
```

Expected: worker loga "Email enviado". Abre MailPit em `http://localhost:8025` e vê o email.

- [ ] **Step 4: Parar worker (Ctrl+C)**

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/queues/email.worker.ts apps/api/src/worker.ts
git commit -m "feat(api): bullmq worker de email + entry point worker.ts"
```

## Task D4: Ativar email verification + password reset no Better Auth

**Files:**

- Modify: `apps/api/src/auth/instance.ts`

- [ ] **Step 1: Modify `apps/api/src/auth/instance.ts`** — conecta callbacks à queue

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import { config } from "../config.js";
import { enqueueEmail } from "../queues/email.queue.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  trustedOrigins: [config.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await enqueueEmail({
        type: "resetPassword",
        to: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await enqueueEmail({
        type: "verifyEmail",
        to: user.email,
        name: user.name,
        verifyUrl: url,
      });
    },
  },
  advanced: {
    cookiePrefix: "olympia",
    useSecureCookies: config.NODE_ENV === "production",
    defaultCookieAttributes: { sameSite: "lax" },
  },
});

export type Auth = typeof auth;
```

- [ ] **Step 2: Atualizar teste de integração**

Edite `apps/api/src/auth/auth.integration.test.ts`:

- O teste atual de signup+login vai falhar pq agora `requireEmailVerification` tá true
- Adicionar stub da queue nos testes:

```typescript
import { vi } from "vitest";
vi.mock("../queues/email.queue.js", () => ({
  enqueueEmail: vi.fn(async () => ({ id: "stub" })),
  emailQueue: { add: vi.fn() },
  EMAIL_QUEUE_NAME: "email",
}));
```

Ajusta o teste "signup + login + session" pra:

1. Signup (retorna 200 mas sem sessão porque precisa verificar)
2. Login deve retornar erro "email não verificado"
3. Teste de verificação será adicionado na próxima task

- [ ] **Step 3: Rodar testes**

Run: `pnpm --filter @olympia/api test -- --run`
Expected: PASS (com testes atualizados).

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/auth/
git commit -m "feat(api): email verification e reset de senha via bullmq"
```

## Task D5: Teste end-to-end — signup → verificação → login

**Files:**

- Modify: `apps/api/src/auth/auth.integration.test.ts`

- [ ] **Step 1: Adicionar teste de fluxo completo**

Extrair token da fila (mock captura o job) e bater no endpoint de verificação:

```typescript
import { describe, expect, it, vi } from "vitest";
import { buildApp } from "../app.js";

const capturedEmails: any[] = [];
vi.mock("../queues/email.queue.js", () => ({
  enqueueEmail: vi.fn(async (job) => {
    capturedEmails.push(job);
    return { id: "stub" };
  }),
  emailQueue: { add: vi.fn() },
  EMAIL_QUEUE_NAME: "email",
}));

describe("auth — fluxo completo signup + verify + login", () => {
  it("captura token do email e verifica", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    // 1. Signup → email de verificação enfileirado
    await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        name: "Flow",
        email: "flow@test.com",
        password: "password123",
      },
    });

    const verifyJob = capturedEmails.find((j) => j.type === "verifyEmail");
    expect(verifyJob).toBeDefined();
    expect(verifyJob.to).toBe("flow@test.com");

    // 2. Login antes de verificar → falha
    const loginBefore = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "flow@test.com", password: "password123" },
    });
    expect(loginBefore.statusCode).toBe(403);

    // 3. Extrai token da URL do email
    const token = new URL(verifyJob.verifyUrl).searchParams.get("token");
    expect(token).toBeTruthy();

    // 4. Verifica
    const verify = await app.inject({
      method: "GET",
      url: `/api/auth/verify-email?token=${token}&callbackURL=/dashboard`,
    });
    expect([200, 302]).toContain(verify.statusCode);

    // 5. Login agora funciona
    const loginAfter = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "flow@test.com", password: "password123" },
    });
    expect(loginAfter.statusCode).toBe(200);

    await app.close();
  });
});
```

- [ ] **Step 2: Rodar teste**

Run: `pnpm --filter @olympia/api test -- --run`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/auth/auth.integration.test.ts
git commit -m "test(api): fluxo e2e signup → verify email → login"
```

---

# Fase E — SSO + Magic Link

## Task E1: Google SSO

**Files:**

- Modify: `apps/api/src/auth/instance.ts`

- [ ] **Step 1: Modify `apps/api/src/auth/instance.ts`** — adiciona socialProviders

Dentro de `betterAuth({...})`:

```typescript
socialProviders: {
  ...(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
},
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 3: Smoke manual** (se tiver credentials Google dev)

Setar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env`.
Run: `pnpm --filter @olympia/api dev`
Curl: `curl -I http://localhost:3000/api/auth/sign-in/social/google`
Expected: 302 redirect pra accounts.google.com.

Sem credentials, pula — essa rota retorna 404 e tá OK.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/auth/instance.ts
git commit -m "feat(api): google sso (opcional por env vars)"
```

## Task E2: Microsoft SSO

**Files:**

- Modify: `apps/api/src/auth/instance.ts`

- [ ] **Step 1: Modify `apps/api/src/auth/instance.ts`** — adiciona microsoft ao `socialProviders`

```typescript
socialProviders: {
  ...(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: config.GOOGLE_CLIENT_ID, clientSecret: config.GOOGLE_CLIENT_SECRET } }
    : {}),
  ...(config.MICROSOFT_CLIENT_ID && config.MICROSOFT_CLIENT_SECRET
    ? {
        microsoft: {
          clientId: config.MICROSOFT_CLIENT_ID,
          clientSecret: config.MICROSOFT_CLIENT_SECRET,
          tenantId: "common",
        },
      }
    : {}),
},
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/auth/instance.ts
git commit -m "feat(api): microsoft sso (opcional)"
```

## Task E3: Magic Link plugin

**Files:**

- Modify: `apps/api/src/auth/instance.ts`

- [ ] **Step 1: Modify `apps/api/src/auth/instance.ts`**

Adicionar import:

```typescript
import { magicLink } from "better-auth/plugins";
```

Adicionar dentro de `betterAuth({...})`:

```typescript
plugins: [
  magicLink({
    sendMagicLink: async ({ email, url }) => {
      await enqueueEmail({
        type: "magicLink",
        to: email,
        linkUrl: url,
      });
    },
  }),
],
```

- [ ] **Step 2: Regenerar schema Better Auth**

Run: `cd apps/api && pnpm exec @better-auth/cli generate --config src/auth/instance.ts --output src/db/schema/auth.ts`
Expected: schema atualizado se plugin introduzir tabelas (magic link usa a `verification` existente; nenhuma nova tabela esperada).

- [ ] **Step 3: Gerar migration se schema mudou**

Run: `pnpm --filter @olympia/api db:generate`
Expected: nenhuma migration nova pq nenhum schema mudou. Se houver, revisar e aplicar.

- [ ] **Step 4: Test integration — magic link**

Em `auth.integration.test.ts`, adiciona:

```typescript
it("magic link — pede link → captura token → autentica", async () => {
  capturedEmails.length = 0;
  const app = buildApp();

  // Usuário precisa existir primeiro (magic link não cria)
  await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    payload: { name: "Magic", email: "magic@test.com", password: "password123" },
  });

  const res = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/magic-link",
    payload: { email: "magic@test.com" },
  });
  expect(res.statusCode).toBe(200);

  const linkJob = capturedEmails.find((j) => j.type === "magicLink");
  expect(linkJob).toBeDefined();

  await app.close();
});
```

- [ ] **Step 5: Rodar testes**

Run: `pnpm --filter @olympia/api test -- --run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/auth/instance.ts apps/api/src/auth/auth.integration.test.ts apps/api/src/db/schema/
git commit -m "feat(api): magic link plugin via bullmq"
```

---

# Fase F — Organizations + Invitations

## Task F1: Ativar organization plugin + schema + migration

**Files:**

- Modify: `apps/api/src/auth/instance.ts`
- Modify: `apps/api/src/db/schema/auth.ts` (regenerado)
- Create: `apps/api/src/db/schema/organization.ts` (se Better Auth separar)
- Create: `apps/api/src/db/migrations/0001_*.sql` (nova migration)
- Modify: `apps/api/src/db/test-utils.ts`

- [ ] **Step 1: Modify `apps/api/src/auth/instance.ts`** — adiciona organization ao array de plugins

```typescript
import { organization } from "better-auth/plugins";
// ...
plugins: [
  organization({
    allowUserToCreateOrganization: true,
    organizationLimit: 10,
    invitationExpiresIn: 60 * 60 * 24 * 7, // 7 dias
    sendInvitationEmail: async ({ email, inviter, organization, inviteLink }) => {
      await enqueueEmail({
        type: "orgInvite",
        to: email,
        inviterName: inviter.user.name,
        organizationName: organization.name,
        inviteUrl: inviteLink,
      });
    },
  }),
  magicLink({ ... }),
],
```

- [ ] **Step 2: Regenerar schema**

Run: `cd apps/api && pnpm exec @better-auth/cli generate --config src/auth/instance.ts --output src/db/schema/auth.ts`
Expected: schema agora inclui `organization`, `member`, `invitation`.

- [ ] **Step 3: Gerar migration**

Run: `pnpm --filter @olympia/api db:generate`
Expected: nova migration SQL com 3 tabelas.

- [ ] **Step 4: Aplicar no dev**

Run: `pnpm --filter @olympia/api db:migrate`
Expected: tabelas criadas.

- [ ] **Step 5: Modify `apps/api/src/db/test-utils.ts`** — adiciona tabelas novas

```typescript
const TABLES_TO_TRUNCATE = [
  "invitation",
  "member",
  "organization",
  "session",
  "account",
  "verification",
  "user",
];
```

- [ ] **Step 6: Aplicar migration no DB de teste**

Ao rodar testes, `globalSetup` já roda `db:migrate` contra `DATABASE_URL_TEST`. Verifica:

Run: `pnpm --filter @olympia/api test -- --run`
Expected: PASS. Se quebrar, inspeciona se `DATABASE_URL_TEST` tá correto no `.env`.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/auth/instance.ts apps/api/src/db/
git commit -m "feat(api): organization plugin (multi-tenancy)"
```

## Task F2: Módulo organizations — rotas complementares

Better Auth expõe `/api/auth/organization/*` nativo. Só adicionamos endpoints agregadores se necessário. Pra Fase 2, o nativo cobre tudo — esse módulo fica como placeholder pra Fase 3.

**Files:**

- Create: `apps/api/src/modules/organizations/routes.ts`

- [ ] **Step 1: Create `apps/api/src/modules/organizations/routes.ts`**

```typescript
import type { FastifyPluginAsync } from "fastify";

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  // Placeholder — Better Auth organization plugin expõe /api/auth/organization/*
  // Endpoints agregadores/relatórios org-scoped virão na Fase 3.
  app.get("/api/organizations/_placeholder", async () => ({ ok: true }));
};
```

- [ ] **Step 2: Modify `apps/api/src/app.ts`** — registra

```typescript
import { organizationRoutes } from "./modules/organizations/routes.js";
// ...
app.register(organizationRoutes);
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/organizations/ apps/api/src/app.ts
git commit -m "feat(api): placeholder do módulo organizations"
```

## Task F3: Módulo invitations — agregador

Igual ao F2 — Better Auth cobre aceitar/recusar. Endpoint agregador pra listar convites do usuário logado.

**Files:**

- Create: `apps/api/src/modules/invitations/routes.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Create `apps/api/src/modules/invitations/routes.ts`**

```typescript
import type { FastifyPluginAsync } from "fastify";
import { auth } from "../../auth/instance.js";

export const invitationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/invitations/me", async (req, reply) => {
    // @ts-expect-error — decorated
    const session = req.auth;
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers.set(k, v);
    }
    const invites = await auth.api.listUserInvitations({ headers });
    return reply.send(invites);
  });
};
```

- [ ] **Step 2: Registrar em `app.ts`**

```typescript
import { invitationRoutes } from "./modules/invitations/routes.js";
// ...
app.register(invitationRoutes);
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @olympia/api typecheck`
Expected: PASS. Se `listUserInvitations` não existir, substituir por chamada direta ao Drizzle filtrando `invitation` por email.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/invitations/ apps/api/src/app.ts
git commit -m "feat(api): placeholder do módulo invitations"
```

## Task F4: Test — fluxo de convite e aceitação

**Files:**

- Create: `apps/api/src/modules/invitations/invitations.integration.test.ts`

- [ ] **Step 1: Create `apps/api/src/modules/invitations/invitations.integration.test.ts`**

```typescript
import { describe, expect, it, vi } from "vitest";
import { buildApp } from "../../app.js";

const capturedEmails: any[] = [];
vi.mock("../../queues/email.queue.js", () => ({
  enqueueEmail: vi.fn(async (job) => {
    capturedEmails.push(job);
    return { id: "stub" };
  }),
  emailQueue: { add: vi.fn() },
  EMAIL_QUEUE_NAME: "email",
}));

async function signupAndVerify(app: any, email: string, password = "password123") {
  await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    payload: { name: email.split("@")[0], email, password },
  });
  const job = capturedEmails.find((j) => j.type === "verifyEmail" && j.to === email);
  const token = new URL(job.verifyUrl).searchParams.get("token");
  await app.inject({
    method: "GET",
    url: `/api/auth/verify-email?token=${token}`,
  });
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    payload: { email, password },
  });
  const cookies = login.headers["set-cookie"] as string | string[];
  return Array.isArray(cookies) ? cookies.join("; ") : cookies;
}

describe("invitations", () => {
  it("owner convida → membro aceita → vira member", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    const ownerCookie = await signupAndVerify(app, "owner@test.com");
    // cria org
    const createOrg = await app.inject({
      method: "POST",
      url: "/api/auth/organization/create",
      headers: { cookie: ownerCookie },
      payload: { name: "Acme", slug: "acme" },
    });
    expect(createOrg.statusCode).toBe(200);

    // convida membro
    const invite = await app.inject({
      method: "POST",
      url: "/api/auth/organization/invite-member",
      headers: { cookie: ownerCookie },
      payload: { email: "member@test.com", role: "member" },
    });
    expect(invite.statusCode).toBe(200);

    const inviteJob = capturedEmails.find((j) => j.type === "orgInvite");
    expect(inviteJob).toBeDefined();

    // extrai invitation id do inviteUrl
    const inviteId = new URL(inviteJob.inviteUrl).pathname.split("/").pop();

    // membro faz signup (pelo /accept invitation fluxo)
    const memberCookie = await signupAndVerify(app, "member@test.com");
    const accept = await app.inject({
      method: "POST",
      url: `/api/auth/organization/accept-invitation`,
      headers: { cookie: memberCookie },
      payload: { invitationId: inviteId },
    });
    expect(accept.statusCode).toBe(200);

    await app.close();
  });
});
```

- [ ] **Step 2: Rodar teste**

Run: `pnpm --filter @olympia/api test -- --run invitations`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/invitations/invitations.integration.test.ts
git commit -m "test(api): fluxo e2e de convite de organization"
```

---

# Fase G — Frontend auth integration

## Task G1: Better Auth client + schema types

**Files:**

- Create: `apps/web/src/lib/auth.ts`

- [ ] **Step 1: Create `apps/web/src/lib/auth.ts`**

```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient, magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "/api/auth",
  plugins: [organizationClient(), magicLinkClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  forgetPassword,
  resetPassword,
  verifyEmail,
  organization,
} = authClient;
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @olympia/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/auth.ts
git commit -m "feat(web): better auth client com plugins organization e magicLink"
```

## Task G2: RequireAuth guard substitui gate mock

**Files:**

- Create: `apps/web/src/app/guards/RequireAuth.tsx`
- Create: `apps/web/src/app/guards/RequireOrgRole.tsx`
- Modify: `apps/web/src/app/routes.tsx`

- [ ] **Step 1: Create `apps/web/src/app/guards/RequireAuth.tsx`**

```tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../../lib/auth";

export function RequireAuth() {
  const { data, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <div className="p-8">Carregando...</div>;

  if (!data?.session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!data.user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!data.session.activeOrganizationId) {
    return <Navigate to="/onboarding/organization" replace />;
  }

  return <Outlet />;
}
```

- [ ] **Step 2: Create `apps/web/src/app/guards/RequireOrgRole.tsx`**

```tsx
import { Navigate, Outlet } from "react-router";
import { useSession } from "../../lib/auth";

export function RequireOrgRole({
  roles = ["owner", "admin"],
}: {
  roles?: Array<"owner" | "admin" | "member">;
}) {
  const { data } = useSession();
  // @ts-expect-error — activeOrganizationRole está na sessão do plugin
  const role = data?.session?.activeOrganizationRole;
  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
```

- [ ] **Step 3: Modify `apps/web/src/app/routes.tsx`** — remove o gate de `localStorage`, usa `RequireAuth`

Substitua a lógica antiga por algo como:

```tsx
import { RequireAuth } from "./guards/RequireAuth";
// ...
{
  element: <RequireAuth />,
  children: [
    {
      element: <MainLayout />,
      children: [
        { path: "/dashboard", element: <DashboardPage /> },
        { path: "/receivables", element: <ReceivablesPage /> },
        // ... demais rotas protegidas
      ],
    },
  ],
}
```

- [ ] **Step 4: Typecheck + build**

Run: `pnpm --filter @olympia/web typecheck && pnpm --filter @olympia/web build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/guards/ apps/web/src/app/routes.tsx
git commit -m "feat(web): RequireAuth e RequireOrgRole substituindo gate mock"
```

## Task G3: Atualizar LoginPage com auth real + SSO buttons

**Files:**

- Modify: `apps/web/src/app/pages/LoginPage.tsx`

- [ ] **Step 1: Modify `apps/web/src/app/pages/LoginPage.tsx`**

Substitua o handler de submit por:

```tsx
import { signIn } from "../../lib/auth";
import { loginSchema } from "@olympia/shared/schemas/auth";

async function onSubmit(values: unknown) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    // show errors
    return;
  }
  const { error } = await signIn.email({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    toast.error(error.message ?? "Falha no login");
    return;
  }
  navigate("/dashboard");
}
```

Adicionar botões condicionais (meta do `import.meta.env` não ajuda — flag vem da sessão API `/api/auth/providers` OR detecção via try/catch):

```tsx
async function loginGoogle() {
  await signIn.social({ provider: "google", callbackURL: "/dashboard" });
}
async function loginMicrosoft() {
  await signIn.social({ provider: "microsoft", callbackURL: "/dashboard" });
}
```

Renderiza os botões sempre — se provider não configurado, server retorna 404 e frontend mostra toast de erro.

- [ ] **Step 2: Adicionar link "Entrar com link mágico" e "Esqueci a senha"**

```tsx
<Link to="/magic-link">Entrar com link mágico</Link>
<Link to="/forgot-password">Esqueci minha senha</Link>
<Link to="/signup">Criar conta</Link>
```

- [ ] **Step 3: Build + smoke manual**

Run: `pnpm --filter @olympia/web dev` (com API rodando em `:3000`)
Abrir `http://localhost:5173/login`, tentar login com user criado via teste de integração.
Expected: redirect pra `/dashboard` se email verificado.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/pages/LoginPage.tsx
git commit -m "feat(web): LoginPage integrada com better auth + sso + links"
```

## Task G4: SignupPage

**Files:**

- Create: `apps/web/src/app/pages/SignupPage.tsx`
- Modify: `apps/web/src/app/routes.tsx`

- [ ] **Step 1: Create `apps/web/src/app/pages/SignupPage.tsx`**

Form react-hook-form + zod (resolver) com campos nome/email/senha, submetendo via `signUp.email()`. Após sucesso, navega pra `/verify-email`.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "../../lib/auth";
import { signupSchema, type SignupInput } from "@olympia/shared/schemas/auth";
// ... componentes UI

export function SignupPage() {
  const form = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });
  const navigate = useNavigate();

  async function onSubmit(values: SignupInput) {
    const { error } = await signUp.email(values);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/verify-email");
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* campos nome, email, password */}</form>;
}
```

**Nota:** `@hookform/resolvers` precisa ser adicionado em `apps/web/package.json`:

```bash
pnpm --filter @olympia/web add @hookform/resolvers
```

- [ ] **Step 2: Modify `apps/web/src/app/routes.tsx`** — adiciona rota pública

```tsx
{ path: "/signup", element: <SignupPage /> },
```

- [ ] **Step 3: Typecheck + smoke**

Run: `pnpm --filter @olympia/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/pages/SignupPage.tsx apps/web/src/app/routes.tsx apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): SignupPage integrada"
```

## Task G5: Verify/Forgot/Reset/MagicLink pages

**Files:**

- Create: `apps/web/src/app/pages/VerifyEmailPage.tsx`
- Create: `apps/web/src/app/pages/ForgotPasswordPage.tsx`
- Create: `apps/web/src/app/pages/ResetPasswordPage.tsx`
- Create: `apps/web/src/app/pages/MagicLinkPage.tsx`
- Modify: `apps/web/src/app/routes.tsx`

- [ ] **Step 1: Create `VerifyEmailPage.tsx`**

```tsx
import { useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "verifying" | "error" | "sent">(
    params.get("token") ? "verifying" : "idle",
  );

  useEffect(() => {
    const token = params.get("token");
    if (!token) return;
    authClient.verifyEmail({ query: { token } }).then(({ error }) => {
      if (error) setState("error");
      else navigate("/dashboard");
    });
  }, [params, navigate]);

  async function resend() {
    // chama sendVerificationEmail via Better Auth client
    await authClient.sendVerificationEmail({ email: "" /* from session */ });
    setState("sent");
  }

  if (state === "verifying") return <div>Verificando...</div>;
  if (state === "error") return <div>Link inválido ou expirado.</div>;
  return (
    <div>
      <h1>Verifique seu email</h1>
      <p>Enviamos um link pro seu email. Clique pra ativar a conta.</p>
      <button onClick={resend}>Reenviar</button>
    </div>
  );
}
```

- [ ] **Step 2: Create `ForgotPasswordPage.tsx`**

Form com email → `authClient.forgetPassword({ email, redirectTo: "/reset-password" })` → mostra "email enviado".

- [ ] **Step 3: Create `ResetPasswordPage.tsx`**

Lê token da query, form com nova senha → `authClient.resetPassword({ newPassword, token })` → navega `/login`.

- [ ] **Step 4: Create `MagicLinkPage.tsx`**

Form com email → `signIn.magicLink({ email, callbackURL: "/dashboard" })` → mostra "link enviado".

- [ ] **Step 5: Modify `routes.tsx`** — registra 4 rotas públicas

```tsx
{ path: "/verify-email", element: <VerifyEmailPage /> },
{ path: "/forgot-password", element: <ForgotPasswordPage /> },
{ path: "/reset-password", element: <ResetPasswordPage /> },
{ path: "/magic-link", element: <MagicLinkPage /> },
```

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @olympia/web typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/pages/VerifyEmailPage.tsx apps/web/src/app/pages/ForgotPasswordPage.tsx apps/web/src/app/pages/ResetPasswordPage.tsx apps/web/src/app/pages/MagicLinkPage.tsx apps/web/src/app/routes.tsx
git commit -m "feat(web): páginas verify-email, forgot/reset password, magic-link"
```

---

# Fase H — Frontend multi-tenancy

## Task H1: OrgOnboardingPage

**Files:**

- Create: `apps/web/src/app/pages/OrgOnboardingPage.tsx`
- Modify: `apps/web/src/app/routes.tsx`

- [ ] **Step 1: Create `OrgOnboardingPage.tsx`**

Form com nome + slug auto-gerado (kebab-case do nome) + CNPJ opcional. Submete via `organization.create`. Após sucesso, `organization.setActive({ organizationId })` → navega `/dashboard`.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organization } from "../../lib/auth";
import { createOrgSchema, type CreateOrgInput } from "@olympia/shared/schemas/organization";

export function OrgOnboardingPage() {
  const form = useForm<CreateOrgInput>({ resolver: zodResolver(createOrgSchema) });
  const navigate = useNavigate();

  async function onSubmit(values: CreateOrgInput) {
    const { data, error } = await organization.create(values);
    if (error) {
      toast.error(error.message);
      return;
    }
    await organization.setActive({ organizationId: data.id });
    navigate("/dashboard");
  }
  // ... form UI
}
```

- [ ] **Step 2: Modify `routes.tsx`** — rota protegida (pós-login, pré-org)

Envolver com um gate minimal que só requer sessão + emailVerified (não activeOrg):

```tsx
{ path: "/onboarding/organization", element: <OrgOnboardingPage /> },
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/pages/OrgOnboardingPage.tsx apps/web/src/app/routes.tsx
git commit -m "feat(web): OrgOnboardingPage"
```

## Task H2: OrgSwitcher no header

**Files:**

- Create: `apps/web/src/app/components/OrgSwitcher.tsx`
- Modify: `apps/web/src/app/layouts/MainLayout.tsx`

- [ ] **Step 1: Create `OrgSwitcher.tsx`**

```tsx
import { useEffect, useState } from "react";
import { organization, useSession } from "../../lib/auth";
import { useNavigate } from "react-router";

type Org = { id: string; name: string; slug: string };

export function OrgSwitcher() {
  const { data } = useSession();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    organization.list().then(({ data }) => setOrgs(data ?? []));
  }, []);

  async function switchOrg(id: string) {
    await organization.setActive({ organizationId: id });
    window.location.reload(); // força refetch de tudo org-scoped
  }

  const active = orgs.find((o) => o.id === data?.session?.activeOrganizationId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{active?.name ?? "Organização"}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {orgs.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onSelect={() => switchOrg(o.id)}
            className={o.id === active?.id ? "font-bold" : ""}
          >
            {o.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/onboarding/organization?mode=additional")}>
          + Criar nova organização
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Modify `MainLayout.tsx`** — adiciona `OrgSwitcher` no topo direito do header

```tsx
<header>
  {/* conteúdo existente */}
  <OrgSwitcher />
  {/* avatar etc */}
</header>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/components/OrgSwitcher.tsx apps/web/src/app/layouts/MainLayout.tsx
git commit -m "feat(web): OrgSwitcher no header do MainLayout"
```

## Task H3: InvitationPage (três branches)

**Files:**

- Create: `apps/web/src/app/pages/InvitationPage.tsx`
- Modify: `apps/web/src/app/routes.tsx`

- [ ] **Step 1: Create `InvitationPage.tsx`**

```tsx
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { authClient, useSession, signOut, organization } from "../../lib/auth";

type InviteData = { email: string; organizationName: string };

export function InvitationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isPending } = useSession();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    authClient.organization.getInvitation({ query: { id } }).then(({ data, error }) => {
      if (error) {
        setError(error.message);
        return;
      }
      setInvite(data);
    });
  }, [id]);

  useEffect(() => {
    if (isPending || !invite || !id) return;
    if (!session) {
      navigate(`/signup?invitation=${id}&email=${encodeURIComponent(invite.email)}`);
      return;
    }
    if (session.user.email === invite.email) {
      organization.acceptInvitation({ invitationId: id }).then(() => {
        navigate("/dashboard");
      });
    }
  }, [session, invite, id, navigate, isPending]);

  if (error) return <p>Convite inválido ou expirado.</p>;
  if (!invite) return <p>Carregando...</p>;

  // terceiro branch: sessão existe mas email diverge
  if (session && session.user.email !== invite.email) {
    return (
      <div>
        <h1>Convite para outra conta</h1>
        <p>
          Este convite é pra <strong>{invite.email}</strong>. Sua sessão atual é{" "}
          <strong>{session.user.email}</strong>.
        </p>
        <button
          onClick={async () => {
            await signOut();
            navigate(`/login?email=${encodeURIComponent(invite.email)}`);
          }}
        >
          Sair e entrar com {invite.email}
        </button>
      </div>
    );
  }

  return <p>Processando convite...</p>;
}
```

- [ ] **Step 2: Modify `routes.tsx`**

```tsx
{ path: "/invitation/:id", element: <InvitationPage /> },
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/pages/InvitationPage.tsx apps/web/src/app/routes.tsx
git commit -m "feat(web): InvitationPage com 3 branches (sem sessão, email OK, email divergente)"
```

## Task H4: UsersPage real

**Files:**

- Modify: `apps/web/src/app/pages/UsersPage.tsx`

- [ ] **Step 1: Substituir mockData por Better Auth organization API**

```tsx
import { useEffect, useState } from "react";
import { organization } from "../../lib/auth";

export function UsersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [m, i] = await Promise.all([
      organization.listMembers(),
      organization.listInvitations({ query: { status: "pending" } }),
    ]);
    setMembers(m.data ?? []);
    setInvites(i.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function invite(email: string, role: "admin" | "member") {
    await organization.inviteMember({ email, role });
    await refresh();
  }

  async function updateRole(memberId: string, role: "admin" | "member") {
    await organization.updateMemberRole({ memberId, role });
    await refresh();
  }

  async function remove(memberId: string) {
    await organization.removeMember({ memberIdOrEmail: memberId });
    await refresh();
  }

  if (loading) return <p>Carregando...</p>;

  // render tabela com abas: Membros ativos | Convites pendentes
}
```

- [ ] **Step 2: Envolver seções restritas com `RequireOrgRole`**

Invite/updateRole/remove só aparecem se owner ou admin — ou a rota inteira vira protegida por `RequireOrgRole`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/pages/UsersPage.tsx
git commit -m "feat(web): UsersPage com dados reais do organization plugin"
```

## Task H5: OrgSettingsPage

**Files:**

- Create: `apps/web/src/app/pages/OrgSettingsPage.tsx`
- Modify: `apps/web/src/app/routes.tsx`

- [ ] **Step 1: Create `OrgSettingsPage.tsx`**

Formulário com:

- Campo nome editável (`organization.update({ name })`)
- Campo slug editável (`organization.update({ slug })`)
- Botão "transferir ownership" (dropdown com membros admin+) → `organization.updateMemberRole` com role "owner" + atual vira "admin"
- Zona perigosa: botão "Deletar organização" abrindo dialog que pede digitação do nome da org pra confirmar → `organization.delete({ organizationId })`

Restringir via `RequireOrgRole({ roles: ["owner"] })`.

- [ ] **Step 2: Modify `routes.tsx`** — registra rota protegida

```tsx
{
  element: <RequireOrgRole roles={["owner"]} />,
  children: [{ path: "/settings/organization", element: <OrgSettingsPage /> }],
},
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/pages/OrgSettingsPage.tsx apps/web/src/app/routes.tsx
git commit -m "feat(web): OrgSettingsPage com rename/transfer/delete"
```

## Task H6: Remover localStorage mock + documentar DevTools

**Files:**

- Remove: referências a `olympia_auth`/`olympia_onboarding` em `apps/web/src/app/`
- Modify: `README.md`

- [ ] **Step 1: Buscar referências**

```bash
grep -rn "olympia_auth\|olympia_onboarding" apps/web/src/
```

Expected: lista todas. Remover uma por uma (inclui `LoginPage` que setava `localStorage.setItem("olympia_auth", "true")`).

- [ ] **Step 2: Modify `README.md`** — remove seção "Rotas protegidas" que falava do mock

Substituir por:

```markdown
## Rodando localmente

1. `docker compose up -d` (sobe Postgres, Redis, MailPit)
2. `cp .env.example .env` e gere `BETTER_AUTH_SECRET` com `openssl rand -base64 32`
3. `pnpm install`
4. `pnpm db:migrate`
5. `pnpm dev` (sobe web `:5173` + api `:3000` + worker)
6. Acesse `http://localhost:5173`, crie uma conta, verifique o email em `http://localhost:8025`
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/ README.md
git commit -m "chore(web): remove gate mock via localStorage + atualiza docs"
```

---

# Fase I — CI + verificação final

## Task I1: Atualizar `.github/workflows/ci.yml` pro monorepo

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Substituir por:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        task: [lint, typecheck, test, build]

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: olympia
          POSTGRES_PASSWORD: olympia
          POSTGRES_DB: olympia_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U olympia -d olympia_test"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10

    env:
      DATABASE_URL: postgresql://olympia:olympia@localhost:5432/olympia_test
      DATABASE_URL_TEST: postgresql://olympia:olympia@localhost:5432/olympia_test
      REDIS_URL: redis://localhost:6379
      BETTER_AUTH_SECRET: ci-secret-at-least-32-chars-long-placeholder
      BETTER_AUTH_URL: http://localhost:3000
      WEB_ORIGIN: http://localhost:5173
      SMTP_HOST: localhost
      SMTP_PORT: 1025
      SMTP_FROM: ci@olympia.local
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Cache Turbo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ matrix.task }}-${{ github.sha }}
          restore-keys: |
            turbo-${{ matrix.task }}-

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Run ${{ matrix.task }}
        run: |
          case "${{ matrix.task }}" in
            lint) pnpm lint ;;
            typecheck) pnpm typecheck ;;
            test) pnpm test ;;
            build) pnpm build ;;
          esac
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: adapta pra monorepo com service containers de postgres e redis"
```

## Task I2: Verificação final — todas as rotas + build completo

- [ ] **Step 1: Build geral**

Run: `pnpm build`
Expected: `apps/web/dist/` + `apps/api/dist/` gerados sem erro.

- [ ] **Step 2: Lint geral**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 3: Typecheck geral**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Tests geral**

Run: `pnpm test`
Expected: PASS. Todos os workspaces rodam via Turbo.

- [ ] **Step 5: Smoke manual end-to-end**

Subir tudo:

```bash
docker compose up -d
pnpm db:migrate
pnpm dev
```

Em 3 abas (web em `:5173`, api em `:3000`, worker rodando) + MailPit em `:8025`:

- [ ] Cria conta em `/signup`
- [ ] Vê email de verificação no MailPit, clica, redireciona pra `/dashboard`
- [ ] É redirecionado pra `/onboarding/organization`, cria org, entra no dashboard
- [ ] Vai em `/users`, convida novo membro
- [ ] Vê email de convite no MailPit
- [ ] Abre o link em janela anônima → `/invitation/:id` → fluxo sem sessão → redireciona pra `/signup?invitation=...`
- [ ] Faz signup com o email convidado, verifica, aceita convite
- [ ] Troca de org no `OrgSwitcher` do header
- [ ] Testa `/forgot-password` → email → reset → login com nova senha
- [ ] Testa `/magic-link` → email → link → logado

- [ ] **Step 6: Commit final + push**

```bash
git add .
git status   # confere que está limpo
git push origin main
```

Verifica CI no GitHub. Todos os 4 jobs (lint/typecheck/test/build) devem passar.

## Task I3: Atualizar docs — README + status da fase

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Atualizar seção de status**

```markdown
**Status:** Fase 2 — backend + auth + multi-tenancy em produção.
```

Atualizar a seção "Estrutura" pra refletir layout do monorepo.

- [ ] **Step 2: Adicionar seção "Workers + filas"**

```markdown
## Workers

`pnpm --filter @olympia/api dev:worker` sobe o worker BullMQ que processa a fila `email`. Em produção, rode como processo separado.

Dashboard de filas: `http://localhost:3000/admin/queues` (header `Authorization: Bearer $BULL_BOARD_TOKEN`).
```

- [ ] **Step 3: Atualizar roadmap** — marca Fase 2 como concluída

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: atualiza readme com status da fase 2 + workers"
```

---

# Resumo de commits esperados

Cada task acima produz ao menos 1 commit. Total esperado: ~35-40 commits na Fase 2, todos em Portuguese conventional commits.

Ordem recomendada de execução (dependências):

```
A1 → A2 → A3 → A4 → A5 → A6
B1 → B2 → B3 → B4
C1 → C2 → C3 → C4
D1 → D2 → D3 → D4 → D5
E1 → E2 → E3
F1 → F2 → F3 → F4
G1 → G2 → G3 → G4 → G5
H1 → H2 → H3 → H4 → H5 → H6
I1 → I2 → I3
```

# Notas de execução

- **TDD:** cada task de feature tem seu teste antes do commit. Integration tests usam `app.inject()` + stub de email queue.
- **Frequent commits:** uma task = um commit. Subagents devem commitar ao fim de cada task.
- **Rollback:** se uma migration Drizzle der ruim em dev, `docker compose down -v` reseta volumes; rode `pnpm db:migrate` de novo.
- **SSO em dev:** credenciais Google/Microsoft são opcionais — app funciona sem elas, só esconde os botões (ou mostra e falha com toast).
- **Better Auth CLI:** regenerar schema sempre que adicionar plugin novo ou mudar config que afete tabelas.
- **pnpm 9 quirk:** usar `pnpm test -- --run` (separador `--`) pra passar flag pro Vitest.

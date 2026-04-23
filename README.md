# Olympia Pagamentos

SaaS de gestão financeira — contas a receber, contas a pagar, notas fiscais e relatórios.

**Status:** Fase 1 — frontend navegável com dados mockados. Backend virá na Fase 2.

## Stack

- **Build:** Vite 6 · TypeScript 5
- **UI:** React 18 · Tailwind CSS v4 · shadcn/ui (Radix)
- **Roteamento:** React Router 7
- **Estado:** React Hook Form · Sonner (toasts) · motion (animações)
- **Charts:** Recharts
- **Qualidade:** ESLint 9 (flat) · Prettier · Husky · lint-staged · Vitest · Testing Library
- **CI:** GitHub Actions (lint + typecheck + test + build em paralelo)

## Pré-requisitos

- Node.js 20.x (ver `.nvmrc`)
- pnpm 9.x

## Setup

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:5173`.

### Rotas protegidas

O gate de autenticação na Fase 1 é mock via `localStorage`. Pra acessar rotas autenticadas:

```js
// DevTools console
localStorage.setItem("olympia_auth", "true");
```

Depois, visite `/dashboard`, `/receivables`, `/payables`, `/invoices`, `/users`, `/reports`, `/integrations`, `/settings`, `/profile`.

### Onboarding

```js
// DevTools console — dispara o fluxo Owner
localStorage.setItem("olympia_onboarding", "owner");

// Ou o fluxo de convidado
localStorage.setItem("olympia_onboarding", "invited");
```

## Scripts

| Comando              | Ação                                |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento com HMR |
| `pnpm build`         | Build de produção em `dist/`        |
| `pnpm preview`       | Serve o build local pra revisão     |
| `pnpm lint`          | ESLint em todo o projeto            |
| `pnpm lint:fix`      | ESLint com auto-fix                 |
| `pnpm typecheck`     | `tsc --noEmit`                      |
| `pnpm format`        | Prettier `--write` em tudo          |
| `pnpm format:check`  | Prettier `--check` (CI)             |
| `pnpm test`          | Vitest watch mode                   |
| `pnpm test:ui`       | Vitest com UI no browser            |
| `pnpm test -- --run` | Vitest single run (CI)              |

## Estrutura

```
src/
├── main.tsx           # entry do Vite
├── app/               # código portado do Figma Make (manter intacto)
│   ├── App.tsx        # monta RouterProvider + Toaster
│   ├── routes.tsx     # definição de rotas (React Router 7)
│   ├── components/
│   │   ├── figma/     # wrappers do Figma (ImageWithFallback)
│   │   ├── onboarding/# OwnerOnboarding, InvitedOnboarding
│   │   └── ui/        # shadcn/ui components
│   ├── data/mockData.ts
│   ├── layouts/MainLayout.tsx
│   ├── pages/         # 11 páginas da aplicação
│   └── styles/tokens.ts
├── styles/            # CSS globais (Tailwind, tema, fontes)
├── imports/           # material de referência do Figma (md)
└── test/setup.ts      # Testing Library setup
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

## Roadmap (fora da Fase 1)

- **Fase 2** — Backend + Auth + Multi-tenancy
- **Fase 3** — Contas a Receber + Notas Fiscais + gateway de pagamento (Pix, boleto, cartão)
- **Fase 4** — Contas a Pagar
- **Fase 5** — Relatórios + Dashboard com dados reais
- **Fase 6** — Integrações + Settings avançados + billing do SaaS

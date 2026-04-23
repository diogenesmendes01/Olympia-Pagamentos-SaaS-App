# Olympia Pagamentos — Fase 1: Frontend navegável

**Data:** 2026-04-22
**Status:** Aprovado para implementação
**Autor:** diogenes.mendes01@gmail.com + Claude

---

## 1. Contexto e objetivo

Olympia Pagamentos é um SaaS financeiro brasileiro (contas a receber, contas a pagar, notas fiscais, relatórios, integrações) cujo design foi gerado em Figma Make. O objetivo de longo prazo é construir o SaaS completo (frontend + backend + pagamentos reais + notas fiscais + multi-tenancy).

**Escopo desta fase (Fase 1 de 6):** portar o export do Figma Make para um projeto Vite + React + TypeScript limpo, com todo o tooling profissional pronto (ESLint, Prettier, Husky, Vitest, CI), rodando em modo navegável 100% com `mockData` — sem backend, sem auth real, sem integrações.

### Fases futuras (fora do escopo desta spec)

- **Fase 2** — Backend + Auth + Multi-tenancy
- **Fase 3** — Contas a Receber + Notas Fiscais + gateway de pagamento
- **Fase 4** — Contas a Pagar
- **Fase 5** — Relatórios + Dashboard com dados reais
- **Fase 6** — Integrações + Settings avançados + billing do SaaS

### Critério de sucesso da Fase 1

1. `pnpm install` + `pnpm dev` sobem o app em < 30s
2. Todas as 11 rotas renderizam sem erros (Landing, Login, Dashboard, Receivables, Payables, Invoices, Users, Reports, Integrations, Settings, Profile)
3. `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, `pnpm build` passam
4. CI do GitHub verde no primeiro push
5. Onboarding (Owner e Invited) dispara via `localStorage` e encerra

---

## 2. Estado inicial (entrada)

Export do Figma Make foi descompactado em `src/`. O estado atual tem problemas que precisam ser corrigidos:

**Estrutura atual:**
```
Olympia-Pagamentos-SaaS-App/
├── .git/
└── src/
    ├── ATTRIBUTIONS.md
    ├── package.json         # ⚠️ deveria estar na raiz
    ├── postcss.config.mjs   # ⚠️ deveria estar na raiz
    ├── vite.config.ts       # ⚠️ deveria estar na raiz
    ├── app/                 # código-fonte real (manter)
    ├── guidelines/
    ├── imports/
    └── styles/
```

**Problemas identificados no `package.json` inicial:**
- `react` e `react-dom` estão em `peerDependencies` com `optional: true` (não instalam)
- Só tem script `build` — falta `dev`, `preview`, `lint`, `typecheck`, `test`, `format`
- Sem `typescript`, sem `@types/react*`
- 11 dependências não-importadas em nenhum lugar do código:
  - `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
  - `react-slick`, `react-responsive-masonry`
  - `react-popper`, `@popperjs/core`
  - `canvas-confetti`
  - `react-dnd`, `react-dnd-html5-backend`

**Arquivos faltantes:** `index.html`, `src/main.tsx`, `tsconfig.json`, `tsconfig.node.json`, `.gitignore`.

---

## 3. Stack tecnológico

Preservado do Figma Make (escolha validada):

| Camada | Tecnologia | Versão |
|---|---|---|
| Bundler | Vite | 6.3.5 |
| Framework | React | 18.3.1 |
| Linguagem | TypeScript | latest 5.x |
| Estilo | Tailwind CSS v4 (plugin `@tailwindcss/vite`) | 4.1.12 |
| Componentes | shadcn/ui (Radix primitives) | versões do Figma Make |
| Roteamento | React Router | 7.13.0 |
| Ícones | lucide-react | 0.487.0 |
| Animação | motion (Framer Motion) | 12.23.24 |
| Toasts | sonner | 2.0.3 |
| Charts | recharts | 2.15.2 |
| Forms | react-hook-form | 7.55.0 |
| CVA / utils | class-variance-authority, clsx, tailwind-merge | latest |

### Adições (tooling)

| Propósito | Pacotes |
|---|---|
| Lint | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` |
| Formatação | `prettier`, `prettier-plugin-tailwindcss` |
| Git hooks | `husky`, `lint-staged` |
| Testes | `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` |
| Tipos | `typescript`, `@types/react`, `@types/react-dom`, `@types/node` |

**Gerenciador de pacotes:** pnpm (sinalizado pelo `pnpm.overrides` já presente).

---

## 4. Estrutura de arquivos alvo

```
Olympia-Pagamentos-SaaS-App/
├── .editorconfig
├── .gitignore
├── .husky/
│   └── pre-commit
├── .nvmrc                    # 20.x
├── .prettierignore
├── .prettierrc.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── ATTRIBUTIONS.md
├── README.md
├── docs/
│   └── superpowers/specs/
│       └── 2026-04-22-olympia-pagamentos-fase-1-design.md
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public/
├── src/
│   ├── main.tsx              # novo — entry
│   ├── app/                  # código do Figma Make, estrutura preservada
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   ├── components/
│   │   │   ├── figma/
│   │   │   ├── onboarding/
│   │   │   └── ui/
│   │   ├── data/mockData.ts
│   │   ├── layouts/MainLayout.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── IntegrationsPage.tsx
│   │   │   ├── InvoicesPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── PayablesPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ReceivablesPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── UsersPage.tsx
│   │   └── styles/tokens.ts
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   ├── imports/pasted_text/
│   │   ├── olympia-visuals-copy.md
│   │   └── olympia-erp-design-rules.md
│   └── test/
│       └── setup.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

### Princípios de organização

- **Configs de build e metadados** na raiz (padrão Vite).
- **`src/app/` intacto** pra preservar fidelidade com o Figma Make e facilitar re-importações futuras.
- **`src/styles/`** (global) separado de **`src/app/styles/`** (tokens compartilhados do Figma Make) — preservado como vem.
- **Testes co-locados** como `*.test.tsx` ao lado do componente testado.

---

## 5. Transformações do `package.json`

**Remover** de `dependencies`:
```
@emotion/react, @emotion/styled,
@mui/icons-material, @mui/material,
@popperjs/core, canvas-confetti,
react-dnd, react-dnd-html5-backend,
react-popper, react-responsive-masonry, react-slick
```

**Mover** de `peerDependencies` → `dependencies`:
```
react@18.3.1, react-dom@18.3.1
```
Remove a seção `peerDependenciesMeta.optional`.

**Adicionar** em `devDependencies`: lista completa na seção 3.

**Scripts alvo:**
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "prepare": "husky"
}
```

**lint-staged:**
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

---

## 6. Configurações concretas

### `index.html`
Na raiz. Title "Olympia Pagamentos", favicon em `public/`, carrega `/src/main.tsx` como módulo ES.

### `src/main.tsx`
```tsx
import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode><App /></StrictMode>
);
```

### `tsconfig.json`
- `target: ES2022`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`
- `module: ESNext`, `moduleResolution: bundler`
- `jsx: react-jsx`
- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `types: ["vitest/globals", "@testing-library/jest-dom"]`
- `paths: { "@/*": ["./src/*"] }` (alinhado ao `alias` do `vite.config.ts`)

### `tsconfig.node.json`
Para `vite.config.ts` / `vitest.config.ts` (tipos de Node).

### `eslint.config.js` (flat)
- `@eslint/js.configs.recommended`
- `typescript-eslint.configs.strictTypeChecked` + `stylisticTypeChecked`
- `eslint-plugin-react-hooks/recommended`
- `eslint-plugin-react-refresh` (warn)
- Regras custom: `@typescript-eslint/consistent-type-imports: "warn"`, `no-console: "warn"`
- Override pra `src/app/components/ui/**/*.tsx`: desliga `react-refresh/only-export-components`
- Ignores: `dist/`, `node_modules/`, `coverage/`, `public/`

### `.prettierrc.json`
```json
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100,
  "trailingComma": "all",
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `vitest.config.ts`
```ts
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
}));
```

### `src/test/setup.ts`
```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

### `.github/workflows/ci.yml`
- Trigger: push em `main`, PRs pra `main`
- Jobs paralelos: `lint`, `typecheck`, `test`, `build`
- Cada job: `setup-node@v4` com `cache: pnpm`, `pnpm install --frozen-lockfile`, rodar script correspondente
- Node 20, pnpm 9

### `.husky/pre-commit`
```
pnpm lint-staged
```

### `.gitignore`
Padrão Node + Vite + pnpm: `node_modules/`, `dist/`, `.env*`, `coverage/`, `.vite/`, `.DS_Store`, etc.

### `.editorconfig`
UTF-8, LF, 2 espaços, `insert_final_newline`, `trim_trailing_whitespace`.

### `.nvmrc`
```
20
```

---

## 7. Smoke test da Fase 1

Um único teste pra validar que toda a cadeia (Vite + React + Router + Vitest + RTL) está amarrada:

```tsx
// src/app/App.test.tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza landing page em /", () => {
  render(<App />);
  expect(screen.getByText(/Olympia/i)).toBeInTheDocument();
});
```

Fase 2+ adiciona cobertura real.

---

## 8. Sequência de commits planejada

Convenção: **Conventional Commits em português**.

1. `chore: adiciona .gitignore, .editorconfig, .nvmrc`
2. `chore: move configs de build pra raiz do projeto`
3. `build: corrige package.json (react deps, scripts dev/preview/build)`
4. `chore: remove dependências não utilizadas`
5. `build: adiciona tsconfig.json + tsconfig.node.json`
6. `feat: adiciona index.html e src/main.tsx`
7. `chore: adiciona README.md e move ATTRIBUTIONS.md pra raiz`
8. `build: instala dependências e gera pnpm-lock.yaml`
9. `build: adiciona ESLint 9 (flat config) e Prettier`
10. `chore: aplica prettier --write em todos os arquivos`
11. `chore: corrige avisos do eslint --fix`
12. `build: adiciona husky + lint-staged`
13. `test: adiciona infraestrutura Vitest + Testing Library`
14. `test: adiciona smoke test do App`
15. `ci: adiciona GitHub Actions workflow (lint + typecheck + test + build)`
16. `docs: README com instruções de setup e scripts`

Um commit por passo lógico facilita reverter pontualmente se algo quebrar. Commits 10 e 11 (normalização cega via `prettier --write` e `eslint --fix`) ficam isolados pra ruído de diff não poluir commits de conteúdo.

---

## 9. Verificação final (definição de pronto)

Antes de declarar a Fase 1 completa, executar e confirmar:

- [ ] `pnpm install` sem erros
- [ ] `pnpm dev` sobe servidor em http://localhost:5173 (ou porta padrão do Vite)
- [ ] Visita manual via Playwright/webapp-testing a cada rota:
  - `/` (Landing) renderiza sem erro no console
  - `/login` renderiza
  - Com `localStorage.setItem("olympia_auth", "true")`:
    - `/dashboard`, `/receivables`, `/payables`, `/invoices`, `/users`, `/reports`, `/integrations`, `/settings`, `/profile` renderizam
  - Sidebar navega entre páginas
  - Header (search, notificações, user menu) abre e fecha
- [ ] Onboarding: com `localStorage.setItem("olympia_onboarding", "owner")` aparece overlay; "finish" limpa e sai
- [ ] `pnpm lint` — 0 erros, warnings aceitáveis (react-refresh em ui/ estão suprimidos por override)
- [ ] `pnpm typecheck` — 0 erros
- [ ] `pnpm test --run` — smoke test passa
- [ ] `pnpm build` — gera `dist/` sem erros, tamanho razoável
- [ ] `git push` pra `main` faz CI ficar verde

---

## 10. Decisões explícitas (não-óbvias)

| Decisão | Alternativa considerada | Motivo |
|---|---|---|
| Manter `src/app/` do Figma Make intacto | Achatar tudo em `src/` | Re-importar do Figma Make fica trivial; evita rename em cascata |
| Preto-em-branco no Prettier (`printWidth: 100`, `semi: true`) | Config mais agressiva | Minimiza diff ao rodar `prettier --write` pela primeira vez |
| `no-console: warn` (não erro) | `error` | Durante porte + dev cedo, `console.log` é ferramenta legítima |
| Smoke test único na Fase 1 | Suíte completa desde já | Não há lógica testável ainda — mock estático |
| Sem `@vitest/coverage-v8` agora | Adicionar já | Barulho no `package.json` sem payoff antes da Fase 2 |
| Commits diretos em `main` | Feature branches + PRs | Dev solo, projeto novo — fricção sem valor |
| Conventional Commits em português | Inglês | Público-alvo e mensagens de erro do produto são pt-BR |

---

## 11. Fora do escopo (explícito)

Esta Fase **não** inclui:

- Qualquer backend, API, banco de dados, ORM
- Autenticação real (fica no `localStorage` mock)
- Integração com gateway de pagamento (Pix, boleto, cartão)
- Emissão de NFSe/NFe
- Upload/storage real
- Email transacional
- Notificações reais (ficam mockadas)
- Multi-tenancy de dados
- Dashboards com dados reais (tudo via `mockData`)
- Testes E2E com Playwright
- Docker/containerização
- Deploy (Vercel/Netlify/etc) — CI só valida build

Tudo isso é responsabilidade das Fases 2 a 6.

# Olympia Pagamentos — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar o export do Figma Make (atualmente em `src/`) para um projeto Vite + React + TypeScript limpo, com ESLint 9, Prettier, Husky, Vitest e GitHub Actions CI configurados, rodando 100% navegável com mockData.

**Architecture:** Configs de build sobem de `src/` pra raiz. `src/app/` permanece intacto (fidelidade com Figma Make). `src/main.tsx` é o novo entry que importa estilos globais e monta `<App />`. Tooling (lint/format/test/CI) inteiramente novo, versionado junto.

**Tech Stack:** Vite 6 · React 18 · TypeScript 5 · Tailwind v4 (plugin `@tailwindcss/vite`) · shadcn/ui · React Router 7 · ESLint 9 (flat) · Prettier · Vitest · Testing Library · Husky · lint-staged · pnpm · GitHub Actions

**Spec:** [`docs/superpowers/specs/2026-04-22-olympia-pagamentos-fase-1-design.md`](../specs/2026-04-22-olympia-pagamentos-fase-1-design.md)

---

## Pré-requisitos

- Node 20.x instalado
- pnpm 9.x instalado (`npm i -g pnpm` se necessário)
- Git configurado com `user.name` e `user.email`
- Shell bash (Git Bash no Windows)
- CWD fixo: `C:\Users\PC Di\Desktop\CODIGO\Olympia-Pagamentos-SaaS-App`

**Convenção de commits:** Conventional Commits em português. Um commit por task completa (marcado explicitamente em cada task).

---

## Task 1: Hygiene files (.gitignore, .editorconfig, .nvmrc)

Sem esses arquivos, qualquer próximo commit já vaza `node_modules/` e normaliza finais de linha de forma inconsistente.

**Files:**

- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `.nvmrc`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
*.tsbuildinfo

# Vite
.vite/

# Tests / coverage
coverage/
.nyc_output/

# Env
.env
.env.local
.env.*.local

# Editors / OS
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
```

- [ ] **Step 2: Create `.editorconfig`**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 3: Create `.nvmrc`**

```
20
```

- [ ] **Step 4: Verify** — confirm the three files exist at repo root:

```bash
ls -la .gitignore .editorconfig .nvmrc
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore .editorconfig .nvmrc
git commit -m "chore: adiciona .gitignore, .editorconfig, .nvmrc"
```

---

## Task 2: Move build configs from `src/` to repo root

Vite expects `package.json`, `vite.config.ts`, `postcss.config.mjs` at repo root. The Figma Make export put them inside `src/`.

**Files:**

- Move: `src/package.json` → `package.json`
- Move: `src/vite.config.ts` → `vite.config.ts`
- Move: `src/postcss.config.mjs` → `postcss.config.mjs`

- [ ] **Step 1: Move the three files**

```bash
mv src/package.json package.json
mv src/vite.config.ts vite.config.ts
mv src/postcss.config.mjs postcss.config.mjs
```

- [ ] **Step 2: Update `vite.config.ts` alias**

The current file uses `path.resolve(__dirname, './src')`. After the move, `__dirname` is the repo root and the alias `@` → `./src` is already correct. **Open `vite.config.ts` and confirm the alias block reads exactly:**

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

If not, fix it.

- [ ] **Step 3: Verify no stale configs remain under `src/`**

```bash
ls src/package.json src/vite.config.ts src/postcss.config.mjs 2>&1 | grep -i "no such"
```

Expected: three "No such file or directory" lines (bash-friendly confirmation).

- [ ] **Step 4: Commit**

```bash
git add package.json vite.config.ts postcss.config.mjs src/
git commit -m "chore: move configs de build pra raiz do projeto"
```

---

## Task 3: Rewrite `package.json`

Fix multiple issues in one commit: put `react`/`react-dom` in `dependencies`, add proper scripts, add TS devDeps. Do **not** touch unused deps yet (Task 4 handles those).

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Replace `package.json` contents**

```json
{
  "name": "olympia-pagamentos",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
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
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
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
    "canvas-confetti": "1.9.4",
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
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-dom": "18.3.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router": "7.13.0",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@types/node": "^20.11.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "typescript": "^5.4.0",
    "vite": "6.3.5"
  },
  "pnpm": {
    "overrides": {
      "vite": "6.3.5"
    }
  }
}
```

Note: `peerDependencies` / `peerDependenciesMeta` removed. ESLint / Prettier / Vitest / Husky devDeps are added in later tasks to keep commits atomic.

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "build: corrige package.json (react deps, scripts dev/preview/build)"
```

---

## Task 4: Remove unused dependencies

Remove the 11 deps audited and confirmed as never-imported. Pure `package.json` edit (deps aren't installed yet).

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Remove these entries from `dependencies` in `package.json`**

```
@emotion/react
@emotion/styled
@mui/icons-material
@mui/material
@popperjs/core
canvas-confetti
react-dnd
react-dnd-html5-backend
react-popper
react-responsive-masonry
react-slick
```

Verify the result still has valid JSON (no trailing commas).

- [ ] **Step 2: Sanity-check no remaining import references them**

```bash
grep -rE "from ['\"](@mui|@emotion|react-slick|react-responsive-masonry|react-popper|@popperjs|canvas-confetti|react-dnd)" src/ || echo "CLEAN"
```

Expected: `CLEAN`

- [ ] **Step 3: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('OK')"
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: remove dependências não utilizadas"
```

---

## Task 5: TypeScript configs

Project references setup: `tsconfig.json` is root (references app + node), `tsconfig.app.json` builds app code, `tsconfig.node.json` builds Vite/Vitest config files. This is the modern Vite + TS pattern.

**Files:**

- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 2: Create `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Validate all three**

```bash
for f in tsconfig.json tsconfig.app.json tsconfig.node.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f INVALID"
done
```

Expected: three `OK` lines.

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json tsconfig.app.json tsconfig.node.json
git commit -m "build: adiciona tsconfig.json + tsconfig.node.json"
```

---

## Task 6: Entry points (`index.html` + `src/main.tsx`)

Vite needs an `index.html` at repo root with a script tag pointing at the module entry, and a `src/main.tsx` that bootstraps React.

**Files:**

- Create: `index.html`
- Create: `src/main.tsx`

- [ ] **Step 1: Create `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Olympia Pagamentos</title>
    <meta
      name="description"
      content="SaaS de gestão financeira — contas a receber, contas a pagar, notas fiscais e relatórios."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `src/main.tsx`**

```tsx
import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("#root not found in index.html");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Verify `src/styles/index.css` actually imports the other CSS files**

Open `src/styles/index.css` and confirm it imports `tailwind.css`, `theme.css`, `fonts.css` (any order). If it doesn't, add import lines at the top. Example expected content:

```css
@import "./tailwind.css";
@import "./theme.css";
@import "./fonts.css";
```

If the file already has content that pulls everything together, leave it. If it's empty or missing any of the three, add the `@import` lines.

- [ ] **Step 4: Commit**

```bash
git add index.html src/main.tsx src/styles/index.css
git commit -m "feat: adiciona index.html e src/main.tsx"
```

---

## Task 7: Top-level docs (README stub + ATTRIBUTIONS)

Move `ATTRIBUTIONS.md` from `src/` to root and create a minimal `README.md` stub. The fuller README comes in Task 15 after everything works.

**Files:**

- Move: `src/ATTRIBUTIONS.md` → `ATTRIBUTIONS.md`
- Create: `README.md`

- [ ] **Step 1: Move ATTRIBUTIONS**

```bash
mv src/ATTRIBUTIONS.md ATTRIBUTIONS.md
```

- [ ] **Step 2: Create minimal `README.md`**

```markdown
# Olympia Pagamentos

SaaS de gestão financeira — contas a receber, contas a pagar, notas fiscais e relatórios.

**Status:** Fase 1 (frontend navegável com dados mockados).

Instruções completas de setup e contribuição virão ao fim da Fase 1.
```

- [ ] **Step 3: Commit**

```bash
git add README.md ATTRIBUTIONS.md src/
git commit -m "chore: adiciona README.md e move ATTRIBUTIONS.md pra raiz"
```

---

## Task 8: Install dependencies

First real `pnpm install`. This generates `pnpm-lock.yaml` — commit it separately so the diff is isolated.

**Files:**

- Create: `pnpm-lock.yaml` (generated)

- [ ] **Step 1: Install**

```bash
pnpm install
```

Expected: Finishes without errors. May emit peer-dep warnings for Radix packages — OK as long as nothing is marked as unresolved.

- [ ] **Step 2: Smoke-check dev server boots**

```bash
pnpm dev
```

Expected: Vite prints `Local: http://localhost:5173/`. Press **Ctrl+C** to stop. Don't test routes yet — we do that in Task 16.

- [ ] **Step 3: Verify build works**

```bash
pnpm build
```

Expected: `dist/` directory appears with assets. If TypeScript errors appear here that block the build, fix them **within this task** (they're pre-existing issues that must be resolved before any lint is useful).

Common fix patterns:

- Missing `@/` alias resolution → check `tsconfig.app.json` `paths`
- Missing `React` import in `.tsx` files → `jsx: "react-jsx"` should make this unnecessary; verify `tsconfig.app.json`
- Any type error in Figma Make code → add the narrowest possible `// @ts-expect-error: Figma Make generated` with a short note, and open a follow-up in memory as a small task for later

- [ ] **Step 4: Commit lockfile + any fixups**

```bash
git add pnpm-lock.yaml
# If Task 8/Step 3 required fixups in src/, add those files too
git commit -m "build: instala dependências e gera pnpm-lock.yaml"
```

---

## Task 9: ESLint 9 flat config

Add ESLint, Prettier, and their configs as a single cohesive setup. No linting runs yet — just install + config. Normalization happens in Task 10.

**Files:**

- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `package.json` (add devDeps)

- [ ] **Step 1: Install ESLint + Prettier devDeps**

```bash
pnpm add -D eslint@^9 @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier prettier-plugin-tailwindcss
```

- [ ] **Step 2: Create `eslint.config.js`**

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "public/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["src/app/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["vite.config.ts", "vitest.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
```

- [ ] **Step 3: Create `.prettierrc.json`**

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

- [ ] **Step 4: Create `.prettierignore`**

```
dist/
node_modules/
coverage/
pnpm-lock.yaml
.husky/_/
```

- [ ] **Step 5: Verify ESLint config parses (don't lint yet)**

```bash
pnpm exec eslint --print-config src/app/App.tsx > /dev/null && echo "CONFIG OK"
```

Expected: `CONFIG OK`

- [ ] **Step 6: Commit**

```bash
git add eslint.config.js .prettierrc.json .prettierignore package.json pnpm-lock.yaml
git commit -m "build: adiciona ESLint 9 (flat config) e Prettier"
```

---

## Task 10: Normalization (prettier --write + eslint --fix)

Two separate commits — Prettier first (formatting ruído), then ESLint auto-fixes (semantic fixups). Isolating both keeps future `git blame` useful.

**Files:**

- Modify: `src/**/*.{ts,tsx,css,md,json}` (formatting only)

- [ ] **Step 1: Run Prettier on everything**

```bash
pnpm format
```

Expected: A list of files rewritten.

- [ ] **Step 2: Verify format passes**

```bash
pnpm format:check
```

Expected: `All matched files use Prettier code style!`

- [ ] **Step 3: Commit Prettier normalization**

```bash
git add -A
git commit -m "chore: aplica prettier --write em todos os arquivos"
```

- [ ] **Step 4: Run ESLint auto-fix**

```bash
pnpm lint:fix
```

Expected: Some warnings may remain (those require manual intervention). No errors should remain.

- [ ] **Step 5: Run `pnpm lint` and assess**

```bash
pnpm lint
```

- If **0 errors** (warnings OK): proceed to Step 6.
- If **errors** remain: they're pre-existing issues in Figma Make code. Fix the minimum set to get to 0 errors. Common cases:
  - `@typescript-eslint/no-explicit-any` → replace `any` with `unknown` or a narrower type
  - `@typescript-eslint/no-unused-vars` → prefix with `_` or remove
  - Floating promise rules → add `void` or `await`
  - **If a fix would change runtime behavior, add a targeted `// eslint-disable-next-line` with a short justification instead of a blind rewrite.**

- [ ] **Step 6: Commit ESLint fixups**

```bash
git add -A
git commit -m "chore: corrige avisos do eslint --fix"
```

---

## Task 11: Husky + lint-staged

Pre-commit hook runs lint-staged on staged files. Push-hook-free for now.

**Files:**

- Create: `.husky/pre-commit`
- Modify: `package.json` (add `lint-staged` config)

- [ ] **Step 1: Install devDeps**

```bash
pnpm add -D husky lint-staged
```

- [ ] **Step 2: Initialize Husky**

```bash
pnpm exec husky init
```

This creates `.husky/pre-commit` with default content and adds a `prepare` script (already present from Task 3).

- [ ] **Step 3: Replace `.husky/pre-commit` contents**

```bash
pnpm exec lint-staged
```

(Just that one line — no shebang needed for Husky 9.)

- [ ] **Step 4: Add `lint-staged` block to `package.json`**

Append at top level of `package.json` (alongside `dependencies`, `devDependencies`):

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 5: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('OK')"
```

- [ ] **Step 6: Smoke-test hook fires**

Make a trivial whitespace change in any `src/**/*.tsx`, `git add` it, `git commit -m "test: husky"`. Expect lint-staged to run, format, and the commit to go through. Then run `git reset --soft HEAD~1` + `git restore --staged .` + `git checkout -- .` to undo the test commit and unchanged state.

Actually — **skip the manual smoke test if it's fragile**. The CI job catches broken hooks on next push.

- [ ] **Step 7: Commit**

```bash
git add .husky/ package.json pnpm-lock.yaml
git commit -m "build: adiciona husky + lint-staged"
```

---

## Task 12: Vitest + Testing Library infrastructure

Install test deps, create `vitest.config.ts`, create `src/test/setup.ts`. No tests yet — that's Task 13.

**Files:**

- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install test devDeps**

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
  }),
);
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Confirm `tsconfig.app.json` includes `vitest/globals` and `@testing-library/jest-dom` in `types`** (it should already — Task 5 did this).

- [ ] **Step 5: Run vitest to verify infra boots (even without tests)**

```bash
pnpm test --run
```

Expected: Vitest finds 0 test files and exits cleanly, **not** with an error about missing config. If it errors about no tests, that's fine — the infra works.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/test/ package.json pnpm-lock.yaml
git commit -m "test: adiciona infraestrutura Vitest + Testing Library"
```

---

## Task 13: Smoke test (`App.test.tsx`) — TDD-lite

One test that validates the whole stack is wired. Written TDD-style: red first, then already-green because App already exists.

**Files:**

- Create: `src/app/App.test.tsx`

- [ ] **Step 1: Write the test (it should pass immediately since App already renders the landing page)**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  test("renderiza o branding Olympia na landing page", () => {
    render(<App />);
    // A landing renderiza o texto "Olympia" em múltiplos lugares (logo, título).
    // Pegar o primeiro é suficiente pra provar que a cadeia (Vite + React + Router
    // + Tailwind + mockData + sonner + motion) está amarrada.
    expect(screen.getAllByText(/Olympia/i).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test**

```bash
pnpm test --run
```

Expected: **1 passed**. If it fails:

- **"window is not defined"** → setupFiles wasn't picked up; re-check `vitest.config.ts` path
- **"Cannot find module"** → `@/` alias not resolving in Vitest; confirm `vitest.config.ts` merges `viteConfig` correctly
- **"useNavigate() may be used only in the context of a <Router>"** → `App` is supposed to own `RouterProvider`; re-check `src/app/App.tsx`
- **"getAllByText: Unable to find"** → inspect what the landing actually renders; adjust the matcher (this is Figma Make code — if copy changed, follow the actual text on screen)

- [ ] **Step 3: Commit**

```bash
git add src/app/App.test.tsx
git commit -m "test: adiciona smoke test do App"
```

---

## Task 14: GitHub Actions CI

Four parallel jobs: lint, typecheck, test, build. Cached pnpm store.

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

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
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ${{ matrix.task }}
        run: |
          case "${{ matrix.task }}" in
            lint) pnpm lint ;;
            typecheck) pnpm typecheck ;;
            test) pnpm test --run ;;
            build) pnpm build ;;
          esac
```

- [ ] **Step 2: Verify YAML parses**

```bash
node -e "const yaml = require('fs').readFileSync('.github/workflows/ci.yml','utf8'); if(!/^name:\s*CI/m.test(yaml)) throw new Error('not CI'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/
git commit -m "ci: adiciona GitHub Actions workflow (lint + typecheck + test + build)"
```

---

## Task 15: Final README

Now the project is actually runnable — README can be honest.

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Replace `README.md` contents**

````markdown
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
````

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

| Comando             | Ação                                |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Servidor de desenvolvimento com HMR |
| `pnpm build`        | Build de produção em `dist/`        |
| `pnpm preview`      | Serve o build local pra revisão     |
| `pnpm lint`         | ESLint em todo o projeto            |
| `pnpm lint:fix`     | ESLint com auto-fix                 |
| `pnpm typecheck`    | `tsc --noEmit`                      |
| `pnpm format`       | Prettier `--write` em tudo          |
| `pnpm format:check` | Prettier `--check` (CI)             |
| `pnpm test`         | Vitest watch mode                   |
| `pnpm test:ui`      | Vitest com UI no browser            |
| `pnpm test --run`   | Vitest single run (CI)              |

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

````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README com instruções de setup e scripts"
````

---

## Task 16: Full verification pass

All scripts green + manual click-through every route. This is the "definition of done" gate from the spec.

**Files:** none

- [ ] **Step 1: Clean install test**

```bash
rm -rf node_modules dist
pnpm install --frozen-lockfile
```

Expected: no errors.

- [ ] **Step 2: All scripts green**

```bash
pnpm lint && pnpm typecheck && pnpm test --run && pnpm build
```

Expected: **all four commands exit 0**. If any fail, fix within this task before declaring Phase 1 complete.

- [ ] **Step 3: Boot dev server in background**

```bash
pnpm dev &
sleep 5
```

(If implementing with subagent-driven-development, use `run_in_background: true` on the dev-server command instead of `&`.)

- [ ] **Step 4: Manual route verification**

Use `webapp-testing` (Playwright) to visit each route and confirm no console errors. Route checklist:

**Public:**

- [ ] `/` — Landing page renders with Olympia branding
- [ ] `/login` — Login form visible

**Authenticated (set `localStorage.setItem("olympia_auth", "true")` first):**

- [ ] `/dashboard` — Dashboard with sidebar + header
- [ ] `/receivables` — Contas a Receber table
- [ ] `/payables` — Contas a Pagar table
- [ ] `/invoices` — Faturas / NF-e
- [ ] `/users` — Usuários list
- [ ] `/reports` — Relatórios
- [ ] `/integrations` — Integrações
- [ ] `/settings` — Configurações
- [ ] `/profile` — Perfil

**Interactive elements (at least sanity-tap on one page):**

- [ ] Sidebar navigation works (click one nav item, URL changes, page renders)
- [ ] Header search input is focusable
- [ ] Notifications dropdown opens and closes
- [ ] User menu dropdown opens and closes
- [ ] Logout button returns to `/login` and clears `olympia_auth`

**Onboarding (separate test):**

- [ ] `localStorage.setItem("olympia_onboarding", "owner")` → reload `/dashboard` → OwnerOnboarding overlay appears
- [ ] Completing it (click through) removes the overlay

- [ ] **Step 5: Stop dev server**

```bash
# Whatever stops the background `pnpm dev`
```

- [ ] **Step 6: Push to GitHub and confirm CI goes green**

This assumes a GitHub remote already exists. If not, this step is deferred until the user configures one.

```bash
git push -u origin main
```

Then check the Actions tab — all four matrix jobs (`lint`, `typecheck`, `test`, `build`) should be green.

- [ ] **Step 7: Phase 1 done**

No commit for this task. Declare Phase 1 complete and surface the result to the user with:

- Summary of what changed
- Link to the live dev URL
- Next step: Phase 2 (backend + auth + multi-tenancy)

---

## Troubleshooting appendix

### Tailwind v4 specifics

The `@tailwindcss/vite` plugin handles Tailwind compilation directly. The `postcss.config.mjs` in this repo is kept but likely unused — do not delete (harmless and future-proof).

### React Router 7 in test env

React Router 7's `createBrowserRouter` requires a DOM. `jsdom` provides it. If test hangs or errors, ensure `vitest.config.ts` has `environment: "jsdom"`.

### Husky on Windows

Git Bash runs `.husky/pre-commit` fine. If it fails with "command not found" for `pnpm`, ensure pnpm is in PATH for the Git Bash session.

### TypeScript + `strictTypeChecked` + Figma Make code

The Figma Make export wasn't written with strict linting in mind. Expect some fixups in Task 10. Prefer:

1. Narrow type fixes (replace `any` with `unknown`, add type guards)
2. `// eslint-disable-next-line <rule> -- <why>` for specific lines we don't want to refactor
3. Only disable a rule globally if it's producing nothing but noise (document why in `eslint.config.js`)

### "No TypeScript errors but lint reports type issues"

`typescript-eslint` uses `strictTypeChecked` rules that go beyond `tsc`. This is intentional. Fix or suppress per above.

---

## Success signal

Phase 1 is done when:

- All 16 tasks are checked off
- CI is green on `main`
- Dev server renders all 11 routes without console errors
- A fresh clone + `pnpm install` + `pnpm dev` reproduces the working app

/* eslint-disable react-refresh/only-export-components */
// Test utility module — fast refresh não se aplica (rodado só pelo Vitest).

import type { ReactElement } from "react";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";

export interface RouteEntry {
  path: string;
  element: ReactElement;
}

export interface RenderRouteOptions extends Omit<RenderOptions, "wrapper"> {
  /** Path pattern do route a ser testado (default: "/"). */
  path?: string;
  /** Initial entry — string OU `{ pathname, state }` pra setar location.state. */
  initialEntry?:
    | string
    | { pathname: string; state?: unknown; search?: string };
  /** Routes auxiliares — útil pra renderizar sentinels que provam navigate(). */
  extraRoutes?: RouteEntry[];
}

export function renderWithRoute(
  element: ReactElement,
  options: RenderRouteOptions = {},
): RenderResult {
  const path = options.path ?? "/";
  const entry = options.initialEntry ?? path;
  const extraRoutes = options.extraRoutes ?? [];

  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={path} element={element} />
        {extraRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
    </MemoryRouter>,
    options,
  );
}

// Sentinel renderizado em rotas auxiliares pra provar navegação.
// O texto inclui pathname + ?search pra checar query.
export function NavSentinel({ label }: { label: string }) {
  return <div data-testid="nav-sentinel">{label}</div>;
}

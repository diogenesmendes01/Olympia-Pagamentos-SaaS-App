import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Polyfills for jsdom: a LandingPage do Figma Make usa canvas animado e
// IntersectionObserver pra animações de scroll. Sem isso, cada render()
// cospe stack traces (embora o teste passe).
class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe = (): void => undefined;
  unobserve = (): void => undefined;
  disconnect = (): void => undefined;
  takeRecords = (): IntersectionObserverEntry[] => [];
}
globalThis.IntersectionObserver = IntersectionObserverMock;

// Retorna um Proxy que aceita qualquer chamada/atribuição como no-op.
// Suficiente pro canvas animado da landing sem instalar `canvas`.
const canvasContextStub = new Proxy(
  {},
  {
    get: () => () => undefined,
    set: () => true,
  },
);
HTMLCanvasElement.prototype.getContext = ((): unknown =>
  canvasContextStub) as HTMLCanvasElement["getContext"];

afterEach(() => {
  cleanup();
});

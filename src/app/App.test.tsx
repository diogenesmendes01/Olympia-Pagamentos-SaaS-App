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

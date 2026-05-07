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
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        include: [
          "src/app/pages/**/*.{ts,tsx}",
          "src/app/guards/**/*.{ts,tsx}",
          "src/app/components/**/*.{ts,tsx}",
          "src/lib/**/*.{ts,tsx}",
        ],
        exclude: [
          "src/**/*.{test,spec}.{ts,tsx}",
          "src/**/__tests__/**",
          "src/test/**",
          "src/imports/**",
        ],
        thresholds: {
          lines: 60,
          branches: 60,
          functions: 60,
          statements: 60,
        },
      },
    },
  }),
);

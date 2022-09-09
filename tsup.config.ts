import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: "esm",
  minify: isProduction,
  target: "node16",
  sourcemap: true,
  onSuccess: 'node dist/index.mjs'
});
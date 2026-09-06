import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` makes the built site work from any path — a subfolder, a file://
// open, or the root of a domain. Without it a subfolder deploy loads a blank
// page with 404s on its own assets, which is the single most common way a first
// static deploy appears broken.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist", sourcemap: false },
});

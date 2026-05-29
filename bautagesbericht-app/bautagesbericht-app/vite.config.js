import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Wenn du auf GitHub Pages deployst, hier den Repo-Namen eintragen:
  // base: "/bautagesbericht-app/",
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 1000000, // Logo als Base64 inline lassen
  },
});

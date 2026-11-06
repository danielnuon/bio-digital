import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Library build: emits dist-lib/bio-digital.js + bio-digital.css.
// React and Motion stay external so consumers share a single copy.
export default defineConfig({
  plugins: [react()],
  css: { modules: { localsConvention: "camelCaseOnly" } },
  build: {
    outDir: "dist-lib",
    lib: { entry: "src/bio/index.ts", formats: ["es"], fileName: () => "bio-digital.js", cssFileName: "bio-digital" },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "motion", "motion/react"],
    },
  },
});

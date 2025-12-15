import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    /**
     * Base path for assets.
     *
     * - On the web (Netlify) we want absolute paths ("/") so that routes like
     *   "/daily/2025-12-15" can still load "/assets/..." correctly.
     * - For Electron/desktop builds that need relative paths, set VITE_BASE="./"
     *   in the environment when running the build.
     */
    base: process.env.VITE_BASE || "/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: false,
        minify: "esbuild",
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    resolve: {
        alias: {
            "@shared": "../shared",
        },
    },
});

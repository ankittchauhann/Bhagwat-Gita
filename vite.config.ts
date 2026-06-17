import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Loaded from .env.local for dev only; never bundled into client code.
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			TanStackRouterVite({ autoCodeSplitting: true }),
			viteReact(),
			tailwindcss(),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			proxy: {
				"/api": {
					target:
						env.RAPIDAPI_BASE_URL || "https://bhagavad-gita3.p.rapidapi.com/v2",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
					configure: (proxy) => {
						proxy.on("proxyReq", (proxyReq) => {
							// Add RapidAPI headers to the proxied request
							proxyReq.setHeader("x-rapidapi-host", env.RAPIDAPI_HOST || "");
							proxyReq.setHeader("x-rapidapi-key", env.RAPIDAPI_KEY || "");
						});
					},
				},
			},
		},
		test: {
			environment: "jsdom",
			globals: true,
		},
	};
});

import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { configDefaults, defineConfig } from "vitest/config";
import { DATA_VERSION, IMAGE_CACHE } from "./src/lib/dataPaths";

const GROUND = "#eeecea";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({ autoCodeSplitting: true }),
		viteReact(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			injectRegister: false,
			includeManifestIcons: false,
			manifest: {
				id: "/",
				name: "Bhagavad Gita",
				short_name: "Gita",
				description:
					"Read all 18 chapters and 701 verses of the Bhagavad Gita (श्रीमद्भगवद्गीता) in Sanskrit, with transliteration, translations and commentaries, online or offline.",
				lang: "en",
				dir: "ltr",
				start_url: "/",
				scope: "/",
				display: "standalone",
				theme_color: GROUND,
				background_color: GROUND,
				categories: ["books", "education"],
				icons: [
					{
						src: "/Bhagwat-Gita-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/Bhagwat-Gita-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/Bhagwat-Gita-maskable-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				globPatterns: [
					"**/*.{js,css,html}",
					"assets/*-{devanagari,latin}-*.woff2",
					`data/${DATA_VERSION}/{chapters,credits,sizes}.json`,
					"Bhagwat-Gita-{32x32,192x192}.png",
				],
				navigateFallback: "/index.html",
				navigateFallbackDenylist: [/^\/data\//, /^\/images\//, /\.\w+$/],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				runtimeCaching: [
					{
						// The page saves chapters, commentaries and search files itself (src/lib/gitaData.ts); the worker only reads them back.
						urlPattern: new RegExp(
							`/data/${DATA_VERSION}/(chapter|commentary|search)/`,
						),
						handler: async ({ request }) =>
							(await caches.match(request)) ?? fetch(request),
					},
					{
						urlPattern: /\/images\/.+\.jpg$/,
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: IMAGE_CACHE,
							expiration: { maxEntries: 40 },
							cacheableResponse: { statuses: [200] },
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		exclude: [...configDefaults.exclude, "e2e/**"],
	},
});

import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Runs against the production build. Install the browser once with `bunx playwright install chromium`.
export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: "retain-on-failure",
		// A service worker would answer requests that tests mock with page.route; e2e/offline.spec.ts turns it on.
		serviceWorkers: "block",
	},
	projects: [
		{ name: "phone", use: { ...devices["Pixel 7"] } },
		{
			name: "desktop",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1440, height: 900 },
			},
		},
	],
	webServer: {
		command: `bun run build && bun run serve --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});

import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

test.use({ serviceWorkers: "allow" });

async function waitForServiceWorker(page: Page) {
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
		if (!navigator.serviceWorker.controller) {
			await new Promise((resolve) =>
				navigator.serviceWorker.addEventListener("controllerchange", resolve, {
					once: true,
				}),
			);
		}
	});
}

function verseHeading(page: Page, chapter: number, verse: number) {
	return page.getByRole("heading", {
		level: 1,
		name: `Chapter ${chapter}, verse ${verse}`,
	});
}

async function expectNoViolations(page: Page) {
	const { violations } = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
		.analyze();
	expect(violations.map((violation) => violation.id)).toEqual([]);
}

test("the app can be installed from its manifest", async ({ page }) => {
	const manifest = await (
		await page.request.get("/manifest.webmanifest")
	).json();
	expect(manifest).toMatchObject({
		name: "Bhagavad Gita",
		short_name: "Gita",
		start_url: "/",
		scope: "/",
		display: "standalone",
		theme_color: "#eeecea",
	});
	expect(manifest.icons).toContainEqual(
		expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
	);
	for (const icon of manifest.icons) {
		const response = await page.request.get(icon.src);
		expect(response.headers()["content-type"]).toBe("image/png");
	}

	await page.goto("/");
	await waitForServiceWorker(page);
	const cdp = await page.context().newCDPSession(page);
	const { installabilityErrors } = await cdp.send(
		"Page.getInstallabilityErrors",
	);
	expect(installabilityErrors).toEqual([]);
});

test("a chapter opened before reads without a connection", async ({
	page,
	context,
}) => {
	await page.goto("/chapter/2/verse/1");
	await expect(verseHeading(page, 2, 1)).toBeVisible();
	await waitForServiceWorker(page);

	await context.setOffline(true);
	await page.goto("/chapter/2/verse/47");
	await expect(verseHeading(page, 2, 47)).toBeVisible();
	await expect(page.locator("p.verse-sanskrit")).toContainText("॥ २.४७ ॥");
	const fontStatus = await page.evaluate(async () =>
		(await document.fonts.load('24px "Tiro Devanagari Sanskrit"', "क")).map(
			(face) => face.status,
		),
	);
	expect(fontStatus).toContain("loaded");

	await page.keyboard.press("ArrowRight");
	await expect(verseHeading(page, 2, 48)).toBeVisible();

	await page.getByRole("button", { name: /^Commentary/ }).click();
	await expect(
		page.getByText("This commentary isn't saved on this device."),
	).toBeVisible();
});

test("a chapter that is not saved says so, links to saved ones and opens once back online", async ({
	page,
	context,
}) => {
	await page.goto("/chapter/2");
	await expect(
		page.getByRole("heading", { level: 1, name: "Sankhya Yoga" }),
	).toBeVisible();
	await waitForServiceWorker(page);

	await context.setOffline(true);
	await page.goto("/chapter/5");
	await expect(
		page.getByRole("heading", { level: 1, name: "You're offline" }),
	).toBeVisible();
	await expect(
		page.getByText("Chapter 5 isn't saved on this device"),
	).toBeVisible();
	const saved = page.getByRole("navigation", { name: "Saved on this device" });
	await expect(saved.getByRole("link", { name: "Chapter 2" })).toBeVisible();
	await expect(saved.getByRole("link", { name: "Chapter 5" })).toHaveCount(0);
	await expectNoViolations(page);

	await context.setOffline(false);
	await expect(
		page.getByRole("heading", { level: 1, name: "Karma Sanyasa Yoga" }),
	).toBeVisible();
});

test("a chapter's commentaries download with their size and then open offline", async ({
	page,
	context,
}) => {
	const sizes = JSON.parse(readFileSync("public/data/v2/sizes.json", "utf8"));
	const megabytes = (sizes.chapters[2].commentary / 1_000_000).toFixed(1);

	await page.goto("/chapter/3");
	await waitForServiceWorker(page);
	const offline = page.getByRole("region", { name: "Offline reading" });
	await expect(offline.getByText("Text saved")).toBeVisible();
	await offline
		.getByRole("button", {
			name: `Download the commentaries · ${megabytes} MB`,
		})
		.click();
	await expect(
		offline.getByText("Saved with all 43 commentaries."),
	).toBeVisible();

	const commentary = JSON.parse(
		readFileSync("public/data/v2/commentary/3/10.json", "utf8"),
	) as Record<string, string>;
	await context.setOffline(true);
	await page.goto("/chapter/3/verse/10");
	await page.getByRole("button", { name: /^Commentary/ }).click();
	await expect(
		page.getByText(commentary["16"].slice(0, 40), { exact: false }),
	).toBeVisible();
});

test("the chapter list downloads every chapter, shows what is saved offline and removes downloads", async ({
	page,
	context,
}) => {
	await page.goto("/chapters");
	await waitForServiceWorker(page);
	const library = page.getByRole("region", { name: "Offline reading" });
	await expect(library.getByText("0 of 18 saved")).toBeVisible();

	await context.setOffline(true);
	await expect(
		page.getByText("No chapters are saved on this device yet"),
	).toBeVisible();
	await expect(page.getByText("Not saved", { exact: true })).toHaveCount(18);
	await expectNoViolations(page);
	await context.setOffline(false);

	await library.getByRole("button", { name: /^Download · 1\.8 MB$/ }).click();
	await expect(library.getByText("18 of 18 saved")).toBeVisible();
	await expect(library.getByText("All saved")).toBeVisible();

	await context.setOffline(true);
	await expect(
		page.getByText("18 chapters are saved on this device"),
	).toBeVisible();
	await expect(page.getByText("Not saved", { exact: true })).toHaveCount(0);
	await page.goto("/chapter/7/verse/3");
	await expect(verseHeading(page, 7, 3)).toBeVisible();
	await context.setOffline(false);

	await page.goto("/chapters");
	await library.getByRole("button", { name: "Remove downloads" }).click();
	await expect(library.getByRole("button", { name: "Remove" })).toBeFocused();
	await library.getByRole("button", { name: "Remove" }).click();
	await expect(library.getByText("0 of 18 saved")).toBeVisible();
});

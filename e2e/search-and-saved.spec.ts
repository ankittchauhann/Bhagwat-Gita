import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

async function expectNoViolations(page: Page) {
	const { violations } = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
		.analyze();
	expect(
		violations.map(
			(violation) =>
				`${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
		),
	).toEqual([]);
}

function verseHeading(page: Page, chapter: number, verse: number) {
	return page.getByRole("heading", {
		level: 1,
		name: `Chapter ${chapter}, verse ${verse}`,
	});
}

function searchBox(page: Page) {
	return page.getByRole("searchbox", { name: "Search the Gita" });
}

test("searching words lists matching verses with the words marked", async ({
	page,
}) => {
	await page.goto("/search");
	await expect(searchBox(page)).toBeFocused();
	await searchBox(page).fill("action without attachment");

	const results = page.getByRole("heading", { name: /^\d+ verses$/ });
	await expect(results).toBeVisible();
	await expect(page.getByRole("link", { name: /^3\.19/ })).toBeVisible();
	await expect(page.locator("mark").first()).toBeVisible();
	await expect(page).toHaveURL(
		/\?q=action\+without\+attachment|\?q=action%20without%20attachment/,
	);
	await expectNoViolations(page);

	await page.getByRole("link", { name: /^3\.19/ }).click();
	await expect(verseHeading(page, 3, 19)).toBeVisible();
});

test("search and Saved are reachable from the home page", async ({ page }) => {
	await page.goto("/");
	const nav = page.getByRole("navigation", { name: "On this site" });
	await nav.getByRole("link", { name: "Search" }).click();
	await expect(searchBox(page)).toBeFocused();
	await page.goto("/");
	await nav.getByRole("link", { name: "Saved" }).click();
	await expect(
		page.getByRole("heading", { level: 1, name: "Saved verses" }),
	).toBeVisible();
});

test("a reference goes straight to the verse on Enter", async ({ page }) => {
	// A slow chapter load keeps the search page open while the address would update; it must not pull the reader back.
	await page.route("**/data/*/chapter/2.json", async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		await route.continue();
	});
	await page.goto("/search");
	await searchBox(page).fill("ch 2 v 47");
	await expect(
		page.getByRole("link", { name: /Go to verse.*2\.47/ }),
	).toBeVisible();
	await searchBox(page).press("Enter");
	await expect(verseHeading(page, 2, 47)).toBeVisible();
});

test("Devanagari searches the Sanskrit and Hindi", async ({ page }) => {
	await page.goto("/search?q=कर्मण्येवाधिकारस्ते");
	await expect(page.getByRole("link", { name: /^2\.47/ })).toBeVisible();
});

test("a search with no match says so", async ({ page }) => {
	await page.goto("/search?q=qwxzyv");
	await expect(
		page.getByRole("heading", { name: /No verses match/ }),
	).toBeVisible();
});

test("the slash key opens search from any page", async ({ page, isMobile }) => {
	test.skip(isMobile, "phones have no hardware keyboard shortcut");
	await page.goto("/chapter/2");
	await expect(
		page.getByRole("heading", { level: 1, name: "Sankhya Yoga" }),
	).toBeVisible();
	await page.keyboard.press("/");
	await expect(page).toHaveURL(/\/search/);
	await expect(searchBox(page)).toBeFocused();
});

test("a verse saved with a note is listed on Saved, kept after reload and removable with undo", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/47");
	const save = page.getByRole("button", { name: "Save", exact: true }).first();
	await save.click();
	await expect(
		page.getByRole("button", { name: "Saved", exact: true }).first(),
	).toHaveAttribute("aria-pressed", "true");
	await expect(page.getByText("Saved 2.47.")).toBeVisible();

	await page
		.getByRole("button", { name: /Add a note/ })
		.first()
		.click();
	await page.getByLabel("Your note").fill("Do the work; let the result be.");
	await page.getByRole("button", { name: "Save note" }).click();
	await expect(
		page.getByRole("region", { name: "Your note on 2.47" }),
	).toContainText("Do the work; let the result be.");

	await page.goto("/saved");
	await page.reload();
	const saved = page.getByRole("article", { name: "2.47" });
	await expect(saved).toContainText("कर्मण्येवाधिकारस्ते");
	await expect(saved).toContainText("Do the work; let the result be.");
	await expect(page.getByText("1 verse, 1 with a note")).toBeVisible();
	await expectNoViolations(page);

	await saved.getByRole("button", { name: "Remove 2.47 from Saved" }).click();
	await expect(page.getByText("Nothing saved yet")).toBeVisible();
	await page.getByRole("button", { name: "Undo" }).click();
	await expect(page.getByRole("article", { name: "2.47" })).toBeVisible();
});

test("Copy puts the verse, translation, translator and link on the clipboard", async ({
	page,
	context,
}) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/chapter/2/verse/47");
	await page.getByRole("button", { name: "Copy" }).first().click();
	await expect(
		page.getByText("Copied 2.47 with its translation and link."),
	).toBeVisible();

	const translation = JSON.parse(
		readFileSync("public/data/v2/chapter/2.json", "utf8"),
	).verses[46].translations["16"] as string;
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("कर्मण्येवाधिकारस्ते");
	expect(copied).toContain("॥ २.४७ ॥");
	expect(copied).toContain(translation);
	expect(copied).toContain(
		"— Bhagavad Gita 2.47, translated by Swami Sivananda",
	);
	expect(copied).toContain("/chapter/2/verse/47");
});

test("Share opens the system share sheet with the verse", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: async (data: ShareData) => {
				(window as unknown as { shared: ShareData }).shared = data;
			},
		});
	});
	await page.goto("/chapter/18/verse/66");
	await page.getByRole("button", { name: "Share" }).first().click();
	const shared = await page.evaluate(
		() => (window as unknown as { shared: ShareData }).shared,
	);
	expect(shared.title).toBe("Bhagavad Gita 18.66");
	expect(shared.url).toMatch(/\/chapter\/18\/verse\/66$/);
	expect(shared.text).toContain("सर्वधर्मान्परित्यज्य");
});

test("the chapter list shows today's reading: streak, the last 7 days and the total", async ({
	page,
}) => {
	await page.goto("/chapter/4/verse/1");
	await page.getByRole("link", { name: /^Next verse/ }).click();
	await expect(verseHeading(page, 4, 2)).toBeVisible();

	await page.goto("/chapters");
	const reading = page.getByRole("region", { name: "Your reading" });
	await expect(reading.getByText("1 day", { exact: true })).toBeVisible();
	await expect(reading.getByText("2 verses", { exact: true })).toBeVisible();
	await expect(reading.getByText("2 of 701 verses · 0%")).toBeVisible();
	await expectNoViolations(page);
});

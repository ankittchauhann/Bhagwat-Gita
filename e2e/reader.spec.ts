import { readFileSync } from "node:fs";
import { type Page, expect, test } from "@playwright/test";

const SITE_URL = "https://bhagwat-gita-iota.vercel.app";

function verseHeading(page: Page, verseNumber: number) {
	return page.getByText(`Verse ${verseNumber}`, { exact: true });
}

function nextButton(page: Page) {
	return page.getByRole("button", { name: /^Next/ });
}

test("next verse appears with no network request and no loading screen", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/47");
	await expect(verseHeading(page, 47)).toBeVisible();

	const dataRequests: string[] = [];
	page.on("request", (request) => {
		if (request.url().includes("/data/")) dataRequests.push(request.url());
	});
	await page.evaluate(() => {
		const flags = window as unknown as { sawLoading: boolean };
		flags.sawLoading = false;
		new MutationObserver(() => {
			if (document.body.innerText.includes("Loading chapter")) {
				flags.sawLoading = true;
			}
		}).observe(document.body, { childList: true, subtree: true });
	});

	await nextButton(page).click();

	await expect(page).toHaveURL(/\/chapter\/2\/verse\/48$/);
	await expect(verseHeading(page, 48)).toBeVisible();
	expect(dataRequests).toEqual([]);
	expect(
		await page.evaluate(
			() => (window as unknown as { sawLoading: boolean }).sawLoading,
		),
	).toBe(false);

	const box = await verseHeading(page, 48).boundingBox();
	const viewport = page.viewportSize();
	expect(box).not.toBeNull();
	expect(box && viewport && box.y >= 0 && box.y < viewport.height).toBe(true);
});

test("the chosen translator stays across verses and reloads", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/47");
	const translator = page.getByRole("combobox", { name: "English translator" });
	await expect(translator).toHaveText("Swami Sivananda");

	await translator.click();
	await page.getByRole("option", { name: "Swami Gambirananda" }).click();
	await expect(translator).toHaveText("Swami Gambirananda");

	await nextButton(page).click();
	await expect(page).toHaveURL(/\/verse\/48$/);
	await expect(translator).toHaveText("Swami Gambirananda");

	await page.reload();
	await expect(translator).toHaveText("Swami Gambirananda");
});

test("commentary loads when opened, English first, and any commentator can be chosen", async ({
	page,
}) => {
	const commentary = JSON.parse(
		readFileSync("public/data/v1/commentary/2/47.json", "utf8"),
	) as Record<string, string>;

	await page.goto("/chapter/2/verse/47");
	await page.getByRole("button", { name: /Show commentary/ }).click();

	const commentator = page.getByRole("combobox", { name: "Commentator" });
	await expect(commentator).toHaveText("Swami Sivananda");
	await expect(
		page.getByText(commentary["16"].slice(0, 40), { exact: false }),
	).toBeVisible();

	await commentator.click();
	await page.getByRole("option", { name: "Sri Shankaracharya" }).click();
	await expect(
		page.getByText(commentary["14"].slice(0, 20), { exact: false }),
	).toBeVisible();
});

test("arrow keys move between verses", async ({ page }) => {
	await page.goto("/chapter/2/verse/1");
	await expect(verseHeading(page, 1)).toBeVisible();
	await page.keyboard.press("ArrowRight");
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/2$/);
	await page.keyboard.press("ArrowLeft");
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
});

test("the verse picker opens the chosen verse", async ({ page, isMobile }) => {
	await page.goto("/chapter/2/verse/1");
	if (isMobile) {
		await page.getByRole("combobox", { name: /Select Verse/ }).click();
		await page.getByRole("option", { name: "श्लोक 10", exact: true }).click();
	} else {
		await page.getByRole("button", { name: "श्लोक 10", exact: true }).click();
	}
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/10$/);
	await expect(verseHeading(page, 10)).toBeVisible();
});

test("old links redirect to the verse URL", async ({ page }) => {
	await page.goto("/chapter/2?verse=47");
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/47$/);
	await expect(verseHeading(page, 47)).toBeVisible();

	await page.goto("/chapter/3");
	await expect(page).toHaveURL(/\/chapter\/3\/verse\/1$/);
});

for (const path of [
	"/chapter/99",
	"/chapter/2/verse/80",
	"/chapter/abc/verse/1",
	"/no-such-page",
]) {
	test(`${path} shows the not-found page`, async ({ page }) => {
		await page.goto(path);
		await expect(
			page.getByRole("heading", { name: "Page not found" }),
		).toBeVisible();
		await expect(page).toHaveTitle(/^Page not found/);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
			"content",
			"noindex",
		);
	});
}

test("each verse has its own title and canonical URL", async ({ page }) => {
	await page.goto("/chapter/2/verse/47");
	await expect(page).toHaveTitle(/^Bhagavad Gita 2\.47 · Sankhya Yoga/);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		"href",
		`${SITE_URL}/chapter/2/verse/47`,
	);
});

test("a saved dark theme applies on a direct visit to any page", async ({
	page,
}) => {
	await page.addInitScript(() => localStorage.setItem("theme", "dark"));
	for (const path of ["/chapters", "/chapter/2/verse/47"]) {
		await page.goto(path);
		await expect(page.locator("html")).toHaveClass(/\bdark\b/);
		await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
			"content",
			"#020617",
		);
	}
});

test("opening a verse directly keeps earlier reading history", async ({
	page,
}) => {
	await page.addInitScript(() => {
		if (sessionStorage.getItem("seeded")) return;
		sessionStorage.setItem("seeded", "1");
		localStorage.setItem(
			"gita_reading_history",
			JSON.stringify(
				[1, 2, 3].map((verseNumber) => ({
					chapterId: 1,
					verseNumber,
					chapterName: "अर्जुनविषादयोग",
					chapterNameTranslated: "Arjuna Visada Yoga",
					timestamp: Date.now() - verseNumber * 1000,
				})),
			),
		);
		localStorage.setItem(
			"gita_reading_stats",
			JSON.stringify({
				versesRead: ["1-1", "1-2", "1-3"],
				totalTimeSpent: 0,
				lastReadDate: new Date().toISOString().slice(0, 10),
				readingStreak: 1,
			}),
		);
	});

	await page.goto("/chapter/2/verse/47");
	await expect(verseHeading(page, 47)).toBeVisible();

	const saved = await page.evaluate(() => ({
		history: (
			JSON.parse(localStorage.getItem("gita_reading_history") ?? "[]") as {
				chapterId: number;
				verseNumber: number;
			}[]
		).map((entry) => `${entry.chapterId}.${entry.verseNumber}`),
		versesRead: JSON.parse(localStorage.getItem("gita_reading_stats") ?? "{}")
			.versesRead,
	}));
	expect(saved.history).toEqual(["2.47", "1.1", "1.2", "1.3"]);
	expect(saved.versesRead).toEqual(["1-1", "1-2", "1-3", "2-47"]);
});

test("home, chapter list and continue reading work together", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByRole("button", { name: /Namaste/ }).click();
	await expect(page).toHaveURL(/\/chapters$/);
	await expect(page.getByRole("link", { name: /Read Chapter/ })).toHaveCount(
		18,
	);

	await page
		.getByRole("searchbox", { name: "Search chapters" })
		.fill("Sankhya");
	await expect(page.getByRole("link", { name: /Read Chapter/ })).toHaveCount(1);
	await page.getByRole("link", { name: /Read Chapter/ }).click();
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
	await expect(verseHeading(page, 1)).toBeVisible();

	await page.goto("/");
	await expect(page.getByText("Chapter 2: Verse 1")).toBeVisible();
	await page.getByRole("button", { name: "Continue Reading" }).click();
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
});

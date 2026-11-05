import { readFileSync } from "node:fs";
import { type Page, expect, test } from "@playwright/test";

const SITE_URL = "https://bhagwat-gita-iota.vercel.app";

function verseHeading(page: Page, chapter: number, verse: number) {
	return page.getByRole("heading", {
		level: 1,
		name: `Chapter ${chapter}, verse ${verse}`,
	});
}

function nextLink(page: Page) {
	return page.getByRole("link", { name: /^Next verse/ });
}

function previousLink(page: Page) {
	return page.getByRole("link", { name: /^Previous verse/ });
}

test("next verse appears with no network request and no loading screen", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/47");
	await expect(verseHeading(page, 2, 47)).toBeVisible();

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

	await nextLink(page).click();

	await expect(page).toHaveURL(/\/chapter\/2\/verse\/48$/);
	await expect(verseHeading(page, 2, 48)).toBeVisible();
	expect(dataRequests).toEqual([]);
	expect(
		await page.evaluate(
			() => (window as unknown as { sawLoading: boolean }).sawLoading,
		),
	).toBe(false);
	await expect(
		page.getByText("Chapter 2, verse 48", { exact: true }).last(),
	).toBeAttached();

	const box = await verseHeading(page, 2, 48).boundingBox();
	const viewport = page.viewportSize();
	expect(box && viewport && box.y >= 0 && box.y < viewport.height).toBe(true);
});

test("the whole Sanskrit verse is on the first screen of a 390 × 844 phone", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/chapter/2/verse/47");
	const verse = page.locator("p.verse-sanskrit");
	await expect(verse).toBeVisible();
	const box = await verse.boundingBox();
	const bottomBar = await page
		.getByRole("navigation", { name: "Previous and next verse" })
		.boundingBox();
	expect(box && bottomBar && box.y + box.height <= bottomBar.y).toBe(true);
});

test("the speaker is named on every verse and the speech opening is shown", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/11");
	await expect(page.getByText("Krishna said")).toBeVisible();
	await expect(page.getByText("श्री भगवानुवाच")).toBeVisible();

	await page.goto("/chapter/2/verse/47");
	await expect(page.getByText("Krishna said")).toBeVisible();
	await expect(page.getByText("श्री भगवानुवाच")).toHaveCount(0);
	await expect(page.locator("p.verse-sanskrit")).toContainText("॥ २.४७ ॥");
	await expect(page.locator("p.verse-sanskrit")).not.toContainText("2.47");
});

test("the chosen translator stays across verses and reloads", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/47");
	const main = page.locator("main");
	await expect(
		main.getByText("Swami Sivananda", { exact: true }).first(),
	).toBeVisible();

	await page
		.getByRole("button", { name: "Change English translation" })
		.click();
	await page.getByRole("radio", { name: "Swami Gambirananda" }).check();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(
		main.getByText("Swami Gambirananda", { exact: true }).first(),
	).toBeVisible();

	await nextLink(page).click();
	await expect(page).toHaveURL(/\/verse\/48$/);
	await expect(
		main.getByText("Swami Gambirananda", { exact: true }).first(),
	).toBeVisible();

	await page.reload();
	await expect(
		main.getByText("Swami Gambirananda", { exact: true }).first(),
	).toBeVisible();
});

test("on a laptop the verse, both translations and the word meanings share the first screen", async ({
	page,
	isMobile,
}) => {
	test.skip(isMobile, "Laptop layout");
	await page.goto("/chapter/2/verse/47");
	const firstScreen = page.viewportSize()?.height ?? 0;
	for (const text of [
		"Your right is only to work, but not to its results;",
		"कर्तव्य-कर्म करनेमें ही तेरा अधिकार है,",
		"Word meanings",
	]) {
		const box = await page.getByText(text).first().boundingBox();
		expect(box && box.y + 20 < firstScreen, text).toBe(true);
	}
	await expect(
		page.getByRole("navigation", { name: "Previous and next verse" }),
	).toHaveCount(1);
	const commentary = page.getByRole("button", { name: /^Commentary/ });
	await expect(commentary).toBeVisible();

	await page.locator('a[title="2.50"]').click();
	await expect(verseHeading(page, 2, 50)).toBeVisible();
});

test("a long-metre verse keeps its four quarter-lines on a phone and pairs them on a laptop", async ({
	page,
	isMobile,
}) => {
	await page.goto("/chapter/11/verse/32");
	await expect(page.locator("p.verse-sanskrit > span")).toHaveCount(
		isMobile ? 4 : 2,
	);
	await expect(page.locator("p.verse-sanskrit")).toContainText("॥ ११.३२ ॥");
});

test("commentary loads when opened, English first, and any commentator can be chosen", async ({
	page,
}) => {
	const commentary = JSON.parse(
		readFileSync("public/data/v2/commentary/2/47.json", "utf8"),
	) as Record<string, string>;

	await page.goto("/chapter/2/verse/47");
	await page.getByRole("button", { name: /^Commentary/ }).click();

	const commentator = page.getByRole("combobox", { name: "Commentator" });
	await expect(commentator).toHaveValue("16");
	await expect(
		page.getByText(commentary["16"].slice(0, 40), { exact: false }),
	).toBeVisible();

	await commentator.selectOption({ label: "Sri Shankaracharya" });
	await expect(
		page.getByText(commentary["14"].slice(0, 20), { exact: false }),
	).toBeVisible();
});

test("open sections and text sizes are remembered across verses and reloads", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/47");
	const commentary = page.getByRole("button", { name: /^Commentary/ });
	await commentary.click();
	await expect(commentary).toHaveAttribute("aria-expanded", "true");
	await expect(
		page.getByRole("combobox", { name: "Commentator" }),
	).toBeVisible();

	await page.getByRole("button", { name: "Reading settings" }).click();
	await page
		.getByRole("group", { name: "Sanskrit text size" })
		.getByText("Largest")
		.click();
	await page.getByRole("switch", { name: "Transliteration" }).uncheck();
	await page.getByRole("button", { name: "Close" }).click();

	await expect(page.locator("main")).toHaveAttribute("data-sanskrit-size", "3");
	await expect(page.locator(".transliteration-text")).toHaveCount(0);

	await nextLink(page).click();
	await page.reload();
	await expect(
		page.getByRole("button", { name: /^Commentary/ }),
	).toHaveAttribute("aria-expanded", "true");
	await expect(page.locator("main")).toHaveAttribute("data-sanskrit-size", "3");
	await expect(page.locator(".transliteration-text")).toHaveCount(0);
});

test("arrow keys move between verses and across chapters, but not while a sheet is open", async ({
	page,
}) => {
	await page.goto("/chapter/1/verse/47");
	await expect(verseHeading(page, 1, 47)).toBeVisible();
	await page.keyboard.press("ArrowRight");
	await expect(verseHeading(page, 2, 1)).toBeVisible();
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
	await page.keyboard.press("ArrowLeft");
	await expect(verseHeading(page, 1, 47)).toBeVisible();
	await expect(page).toHaveURL(/\/chapter\/1\/verse\/47$/);

	await page.getByRole("button", { name: "Reading settings" }).click();
	await page.keyboard.press("ArrowRight");
	await expect(page).toHaveURL(/\/chapter\/1\/verse\/47$/);
});

test("a second step while the next chapter loads is ignored, not taken from the old verse", async ({
	page,
}) => {
	await page.route("**/data/*/chapter/2.json", async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1500));
		await route.continue();
	});
	await page.goto("/chapter/1/verse/47");
	await expect(verseHeading(page, 1, 47)).toBeVisible();

	await page.keyboard.press("ArrowRight");
	await page.keyboard.press("ArrowLeft");
	await nextLink(page).click();

	await expect(verseHeading(page, 2, 1)).toBeVisible();
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
});

test("previous and next name their target and stop at the ends of the Gita", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/72");
	await expect(nextLink(page)).toHaveAccessibleName("Next verse, 3.1");
	await nextLink(page).click();
	await expect(verseHeading(page, 3, 1)).toBeVisible();
	await expect(previousLink(page)).toHaveAccessibleName("Previous verse, 2.72");

	await page.goto("/chapter/1/verse/1");
	await expect(verseHeading(page, 1, 1)).toBeVisible();
	await expect(previousLink(page)).toHaveCount(0);

	await page.goto("/chapter/18/verse/78");
	await expect(verseHeading(page, 18, 78)).toBeVisible();
	await expect(nextLink(page)).toHaveCount(0);
});

test("the verse grid opens the chosen verse and returns focus", async ({
	page,
}) => {
	await page.goto("/chapter/2/verse/1");
	const opener = page.getByRole("button", { name: /choose a verse/ });
	await opener.click();
	const grid = page.getByRole("dialog", { name: "Chapter 2 · 72 verses" });
	await expect(
		grid.getByRole("link", { name: "Verse 1, read" }),
	).toHaveAttribute("aria-current", "page");
	await grid.getByRole("link", { name: "Verse 10", exact: true }).click();

	await expect(page).toHaveURL(/\/chapter\/2\/verse\/10$/);
	await expect(verseHeading(page, 2, 10)).toBeVisible();
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("a swipe changes verse on a touch screen", async ({ page, isMobile }) => {
	test.skip(!isMobile, "Swipe is a touch gesture");
	await page.goto("/chapter/2/verse/47");
	await expect(verseHeading(page, 2, 47)).toBeVisible();

	const swipe = (from: number, to: number) =>
		page.evaluate(
			([start, end]) => {
				const main = document.querySelector("main") as HTMLElement;
				const touch = (x: number) =>
					new Touch({ identifier: 1, target: main, clientX: x, clientY: 400 });
				main.dispatchEvent(
					new TouchEvent("touchstart", {
						touches: [touch(start)],
						changedTouches: [touch(start)],
						bubbles: true,
					}),
				);
				main.dispatchEvent(
					new TouchEvent("touchend", {
						touches: [],
						changedTouches: [touch(end)],
						bubbles: true,
					}),
				);
			},
			[from, to],
		);

	await swipe(320, 120);
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/48$/);
	await swipe(120, 320);
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/47$/);
	await swipe(200, 180);
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/47$/);
});

test("a keyboard alone can reach every control, use the settings sheet and turn pages", async ({
	page,
	isMobile,
}) => {
	test.skip(isMobile, "Keyboard run-through is for desktop");
	await page.goto("/chapter/2/verse/47");
	await expect(verseHeading(page, 2, 47)).toBeVisible();

	const names: string[] = [];
	for (let step = 0; step < 12; step++) {
		await page.keyboard.press("Tab");
		names.push(
			await page.evaluate(() => {
				const element = document.activeElement as HTMLElement;
				return element.getAttribute("aria-label") ?? element.innerText.trim();
			}),
		);
	}
	expect(names).toEqual([
		"Skip to verse",
		"Chapter 2 overview",
		"Search",
		"Reading settings",
		"Previous verse, 2.46",
		"Next verse, 2.48",
		"Save",
		"Copy",
		"47 of 72, choose a verse",
		"Change English translation",
		"Change Hindi translation",
		"Commentary\nSwami Sivananda",
	]);

	await nextLink(page).focus();
	await page.keyboard.press("Enter");
	await expect(verseHeading(page, 2, 48)).toBeVisible();
	await expect(nextLink(page)).toBeFocused();
	await expect(nextLink(page)).toHaveAccessibleName("Next verse, 2.49");

	const settings = page.getByRole("button", { name: "Reading settings" });
	await settings.focus();
	await page.keyboard.press("Enter");
	const dialog = page.getByRole("dialog", { name: "Reading settings" });
	await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
	// A modal dialog lets Tab reach the browser's own controls (body is focused then), but never the page behind it.
	let insideDialog = 0;
	for (let step = 0; step < 30; step++) {
		await page.keyboard.press("Tab");
		const focus = await page.evaluate(() => {
			const element = document.activeElement;
			if (!element || element === document.body) return "browser";
			return element.closest("dialog") ? "dialog" : "page";
		});
		expect(focus).not.toBe("page");
		if (focus === "dialog") insideDialog += 1;
	}
	expect(insideDialog).toBeGreaterThan(20);
	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	await expect(settings).toBeFocused();
});

test("verse changes do not animate when reduced motion is requested", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/chapter/2/verse/47");
	await nextLink(page).click();
	await expect(verseHeading(page, 2, 48)).toBeVisible();
	expect(
		await page
			.locator(".verse-enter-next")
			.evaluate((element) => getComputedStyle(element).animationName),
	).toBe("none");
});

test("old links with ?verse= still open the verse", async ({ page }) => {
	await page.goto("/chapter/2?verse=47");
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/47$/);
	await expect(verseHeading(page, 2, 47)).toBeVisible();

	await page.goto("/chapter/3");
	await expect(page).toHaveURL(/\/chapter\/3$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Karma Yoga" }),
	).toBeVisible();
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
	for (const path of ["/", "/chapters", "/chapter/2/verse/47"]) {
		await page.goto(path);
		await expect(page.locator("html")).toHaveClass(/\bdark\b/);
		await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
			"content",
			"#121212",
		);
	}
});

test("the theme setting offers System, Light and Dark", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/chapter/2/verse/47");
	await expect(page.locator("html")).toHaveClass(/\bdark\b/);

	await page.getByRole("button", { name: "Reading settings" }).click();
	const theme = page.getByRole("group", { name: "Theme" });
	await expect(theme.getByRole("radio", { name: "System" })).toBeChecked();

	await theme.getByText("Light").click();
	await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
	expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
		"light",
	);

	await theme.getByText("System").click();
	await expect(page.locator("html")).toHaveClass(/\bdark\b/);
	expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
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
	await expect(verseHeading(page, 2, 47)).toBeVisible();

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
	await page
		.getByRole("navigation", { name: "On this site" })
		.getByRole("link", { name: "Chapters" })
		.click();
	await expect(page).toHaveURL(/\/chapters$/);
	const chapters = page.locator("main ol > li > a");
	await expect(chapters).toHaveCount(18);

	await page
		.getByRole("searchbox", { name: "Search chapters" })
		.fill("Sankhya");
	await expect(chapters).toHaveCount(1);
	await chapters.click();
	await expect(page).toHaveURL(/\/chapter\/2$/);
	await page.getByRole("link", { name: "Start reading at 2.1" }).click();
	await expect(verseHeading(page, 2, 1)).toBeVisible();

	await page.goto("/");
	await page.getByRole("link", { name: "Continue at 2.1" }).click();
	await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
});

test("a first visit starts reading at 1.1", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Start reading" }).click();
	await expect(verseHeading(page, 1, 1)).toBeVisible();
	await expect(
		page.getByText("Dhritarashtra said", { exact: true }).first(),
	).toBeVisible();
});

test("chapters and verses open even when the browser's storage stalls", async ({
	page,
}) => {
	await page.addInitScript(() => {
		const never = () => new Promise(() => {});
		Object.defineProperty(window, "caches", {
			configurable: true,
			value: { open: never, keys: never, match: never, delete: never },
		});
	});
	await page.goto("/chapter/3");
	await expect(
		page.getByRole("heading", { level: 1, name: "Karma Yoga" }),
	).toBeVisible();
	await page.goto("/chapter/3/verse/5");
	await expect(verseHeading(page, 3, 5)).toBeVisible();
});

import { readFileSync } from "node:fs";
import { type Page, expect, test } from "@playwright/test";
import type { ChaptersIndex, Credits } from "../src/lib/gitaData";
import { verseForDate } from "../src/lib/todaysVerse";

const chaptersIndex = JSON.parse(
	readFileSync("public/data/v2/chapters.json", "utf8"),
) as ChaptersIndex;
const credits = JSON.parse(
	readFileSync("public/data/v2/credits.json", "utf8"),
) as Credits;

async function readVerses(page: Page, chapter: number, verses: number[]) {
	for (const verse of verses) {
		await page.goto(`/chapter/${chapter}/verse/${verse}`);
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: `Chapter ${chapter}, verse ${verse}`,
			}),
		).toBeVisible();
	}
}

test.describe("chapter page", () => {
	test("introduces the chapter and starts at its first verse on a first visit", async ({
		page,
	}) => {
		await page.goto("/chapter/2");
		await expect(page).toHaveTitle(/^Chapter 2 · Sankhya Yoga/);
		await expect(
			page.getByRole("heading", { level: 1, name: "Sankhya Yoga" }),
		).toBeVisible();
		await expect(page.getByText("सांख्ययोग", { exact: true })).toBeVisible();
		await expect(page.getByText("0 of 72 read")).toBeVisible();
		await expect(page.getByText("63 verses", { exact: true })).toBeVisible();
		await expect(page.locator("main ol > li > a")).toHaveCount(72);

		await page.getByRole("link", { name: "Start reading at 2.1" }).click();
		await expect(page).toHaveURL(/\/chapter\/2\/verse\/1$/);
	});

	test("continues where you stopped and marks the verses you read", async ({
		page,
	}) => {
		await readVerses(page, 2, [5, 6]);
		await page.getByRole("link", { name: "Chapter 2 overview" }).click();
		await expect(page).toHaveURL(/\/chapter\/2$/);

		await expect(page.getByText("2 of 72 read")).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Verse 6, read, where you stopped" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Verse 5, read" }),
		).toBeVisible();
		await page.getByRole("link", { name: "Continue at 2.6" }).click();
		await expect(page).toHaveURL(/\/chapter\/2\/verse\/6$/);
	});

	test("shows the summary in English or Hindi", async ({ page, isMobile }) => {
		await page.goto("/chapter/2");
		const summary = page.locator("#chapter-summary");
		await expect(summary).toHaveAttribute("lang", "en");
		if (isMobile) {
			const more = page.getByRole("button", { name: "Read the whole summary" });
			await expect(more).toHaveAttribute("aria-expanded", "false");
			await more.click();
			await expect(
				page.getByRole("button", { name: "Show less" }),
			).toHaveAttribute("aria-expanded", "true");
		}
		await expect(summary).toContainText("Description of a Perfect Man");

		await page
			.getByRole("group", { name: "Summary language" })
			.getByText("Hindi")
			.click();
		await expect(summary).toHaveAttribute("lang", "hi");
		await expect(summary).toContainText("सांख्य योग");
	});

	test("links to the chapters before and after", async ({ page }) => {
		await page.goto("/chapter/1");
		await expect(page.getByRole("link", { name: /^Previous/ })).toHaveCount(0);
		await page.getByRole("link", { name: /^Next · Chapter 2/ }).click();
		await expect(page).toHaveURL(/\/chapter\/2$/);

		await page.goto("/chapter/18");
		await expect(page.getByRole("link", { name: /^Next/ })).toHaveCount(0);
	});
});

test.describe("chapter list", () => {
	test("groups the chapters in three sets of six and shows progress", async ({
		page,
	}) => {
		await readVerses(page, 1, [1, 2]);
		await page.goto("/chapters");

		for (const name of [
			"Karma · chapters 1–6",
			"Bhakti · chapters 7–12",
			"Jñāna · chapters 13–18",
		]) {
			await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
		}
		await expect(page.getByText("2 of 47 verses read")).toBeAttached();
		await expect(page.getByText("· 2 read")).toBeVisible();

		await page
			.getByRole("link", { name: /Continue where you stopped/ })
			.click();
		await expect(page).toHaveURL(/\/chapter\/1\/verse\/2$/);
	});

	test("says so when a search matches nothing", async ({ page }) => {
		await page.goto("/chapters");
		await page.getByRole("searchbox", { name: "Search chapters" }).fill("zzz");
		await expect(page.getByText("No chapters match “zzz”.")).toBeVisible();
	});
});

test.describe("home", () => {
	test("shows today's verse, the same one this test computes for today", async ({
		page,
	}) => {
		const today = verseForDate(new Date(), chaptersIndex.chapters);
		await page.goto("/");
		await expect(
			page.getByRole("heading", {
				name: `Today's verse, ${today.chapter}.${today.verse}`,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("link", {
				name: `Open ${today.chapter}.${today.verse} in the reader`,
			}),
		).toHaveAttribute("href", `/chapter/${today.chapter}/verse/${today.verse}`);
	});

	test("today's verse arrives after the first screen and comes into view when scrolled to", async ({
		page,
	}) => {
		await page.goto("/");
		const title = page.getByRole("heading", { name: /^Today's verse, / });
		await title.scrollIntoViewIfNeeded();
		await expect(title).toBeVisible();
		await expect
			.poll(() =>
				title.evaluate(
					(element) =>
						getComputedStyle(element.parentElement as Element).opacity,
				),
			)
			.toBe("1");
	});

	test("today's verse tabs work with the keyboard", async ({ page }) => {
		await page.goto("/");
		const tabs = page.getByRole("tablist", { name: "Show today's verse as" });
		const sanskrit = tabs.getByRole("tab", { name: "Sanskrit" });
		await expect(sanskrit).toHaveAttribute("aria-selected", "true");
		await expect(page.getByRole("tabpanel").locator("[lang=sa]")).toBeVisible();

		await sanskrit.focus();
		await page.keyboard.press("ArrowRight");
		await expect(
			tabs.getByRole("tab", { name: "Transliteration" }),
		).toBeFocused();
		await expect(
			page.getByRole("tabpanel").locator("[lang=sa-Latn]"),
		).toBeVisible();

		await page.keyboard.press("End");
		await expect(
			tabs.getByRole("tab", { name: "Translation" }),
		).toHaveAttribute("aria-selected", "true");
		await page.keyboard.press("ArrowRight");
		await expect(sanskrit).toHaveAttribute("aria-selected", "true");
	});

	test("the contents sheet lists all 18 chapters and opens their pages", async ({
		page,
	}) => {
		await page.goto("/");
		const contents = page.getByRole("region", { name: "Contents" });
		await expect(contents.getByRole("link")).toHaveCount(18);
		await contents
			.getByRole("link", { name: /^18 Moksha Sanyaas Yoga/ })
			.click();
		await expect(page).toHaveURL(/\/chapter\/18$/);
	});

	test("shows at least four real pictures, each described", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator(".crossfade img")).toHaveCount(3, {
			timeout: 6000,
		});
		await expect(
			page.getByRole("heading", { name: /^Today's verse, / }),
		).toBeVisible();
		const pictures = page.locator("main img:not([alt=''])");
		expect(await pictures.count()).toBeGreaterThanOrEqual(4);
		for (const alt of await pictures.evaluateAll((images) =>
			images.map((image) => image.getAttribute("alt") ?? ""),
		)) {
			expect(alt.length).toBeGreaterThan(20);
		}
	});

	test("the other manuscript pictures arrive after the first screen and then take turns", async ({
		page,
	}) => {
		await page.goto("/");
		const pictures = page.locator(".crossfade img");
		await expect(pictures).toHaveCount(1);
		await expect(pictures).toHaveCount(3, { timeout: 6000 });
		await expect(page.locator(".crossfade img[data-active=true]")).toHaveCount(
			1,
		);
	});

	test("figures come from the data", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByText(
				`verses: ${credits.speakers.krishna} spoken by Krishna, ${credits.speakers.arjuna} by Arjuna`,
			),
		).toBeAttached();
	});

	test("nothing is hidden waiting to animate when reduced motion is requested", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		const opacity = await page
			.getByRole("heading", { name: "Contents" })
			.evaluate((element) => getComputedStyle(element).opacity);
		expect(opacity).toBe("1");
		const shown = await page
			.locator(".crossfade img")
			.evaluateAll((images) =>
				images.map((image) => image.getAttribute("data-active")),
			);
		expect(shown).toEqual(["true"]);
	});
});

test.describe("about and sources", () => {
	test("credits every translator, commentator, picture and font", async ({
		page,
	}) => {
		await page.goto("/about");
		await expect(page).toHaveTitle(/^About and sources/);
		for (const author of [...credits.translators, ...credits.commentators]) {
			await expect(
				page.getByText(author.name, { exact: true }).first(),
			).toBeAttached();
		}
		const pictures = page
			.getByRole("region", { name: "Pictures" })
			.getByRole("listitem")
			.getByRole("link");
		await expect(pictures).toHaveCount(6);
		for (const href of await pictures.evaluateAll((links) =>
			links.map((link) => link.getAttribute("href") ?? ""),
		)) {
			expect(href).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
		}
		for (const font of [
			"Tiro Devanagari Sanskrit",
			"Source Serif 4",
			"Libre Franklin",
		]) {
			await expect(page.getByText(font, { exact: true })).toBeVisible();
		}
	});
});

test("the sitemap lists 722 addresses", async ({ request }) => {
	const response = await request.get("/sitemap.xml");
	expect(response.ok()).toBe(true);
	expect((await response.text()).match(/<url>/g)).toHaveLength(722);
});

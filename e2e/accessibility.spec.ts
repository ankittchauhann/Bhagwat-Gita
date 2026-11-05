import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page) {
	const { violations } = await new AxeBuilder({ page })
		.withTags(WCAG_TAGS)
		.analyze();
	expect(
		violations.map(
			(violation) =>
				`${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
		),
	).toEqual([]);
}

for (const colorScheme of ["light", "dark"] as const) {
	test.describe(`${colorScheme} theme`, () => {
		test.beforeEach(async ({ page }) => {
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		});

		test("home has no accessibility violations", async ({ page }) => {
			await page.goto("/");
			await expect(page.locator("figure").first()).toBeVisible();
			await expectNoViolations(page);
		});

		test("chapter list has no accessibility violations", async ({ page }) => {
			await page.goto("/chapters");
			await expect(page.locator("main ol > li")).toHaveCount(18);
			await expectNoViolations(page);
		});

		test("reader with every section open has no accessibility violations", async ({
			page,
		}) => {
			await page.goto("/chapter/2/verse/11");
			await expect(page.locator("p.verse-sanskrit")).toBeVisible();
			for (const name of [
				/^Word meanings/,
				/^Hindi translation/,
				/^Commentary/,
			]) {
				const section = page.getByRole("button", { name });
				if ((await section.count()) > 0) {
					await section.click();
				}
			}
			await expect(
				page.getByRole("combobox", { name: "Commentator" }),
			).toBeVisible();
			await expect(
				page.locator("[lang=en].reading-text, p.reading-text").last(),
			).toBeVisible();
			await expectNoViolations(page);
		});

		test("chapter page has no accessibility violations", async ({ page }) => {
			await page.goto("/chapter/2");
			await expect(
				page.getByRole("heading", { level: 1, name: "Sankhya Yoga" }),
			).toBeVisible();
			await expectNoViolations(page);
		});

		test("about page has no accessibility violations", async ({ page }) => {
			await page.goto("/about");
			await expect(
				page.getByRole("heading", { level: 1, name: "About and sources" }),
			).toBeVisible();
			await expectNoViolations(page);
		});

		test("settings sheet has no accessibility violations", async ({ page }) => {
			await page.goto("/chapter/2/verse/47");
			await page.getByRole("button", { name: "Reading settings" }).click();
			await expect(page.getByRole("dialog")).toBeVisible();
			await expectNoViolations(page);
		});

		test("verse grid has no accessibility violations", async ({ page }) => {
			await page.goto("/chapter/2/verse/47");
			await page.getByRole("button", { name: /choose a verse/ }).click();
			await expect(page.getByRole("dialog")).toBeVisible();
			await expectNoViolations(page);
		});

		test("not-found page has no accessibility violations", async ({ page }) => {
			await page.goto("/chapter/99");
			await expect(
				page.getByRole("heading", { name: "Page not found" }),
			).toBeVisible();
			await expectNoViolations(page);
		});
	});
}

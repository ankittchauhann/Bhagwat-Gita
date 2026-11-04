import { afterEach, describe, expect, it, vi } from "vitest";

describe("useReadingHistory on a fresh page load", () => {
	afterEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	it("starts from saved history, so visiting a verse adds to it instead of replacing it", async () => {
		localStorage.setItem(
			"gita_reading_history",
			JSON.stringify(
				[1, 2, 3].map((verseNumber) => ({
					chapterId: 1,
					verseNumber,
					chapterName: "अर्जुनविषादयोग",
					chapterNameTranslated: "Arjuna Visada Yoga",
					timestamp: 1,
				})),
			),
		);
		localStorage.setItem(
			"gita_reading_stats",
			JSON.stringify({
				versesRead: ["1-1", "1-2", "1-3"],
				totalTimeSpent: 0,
				lastReadDate: "2026-01-01",
				readingStreak: 1,
			}),
		);
		vi.resetModules();

		const { useReadingHistory } = await import("./readingHistoryStore");
		const store = useReadingHistory.getState();
		store.addToHistory({
			chapterId: 2,
			verseNumber: 47,
			chapterName: "सांख्ययोग",
			chapterNameTranslated: "Sankhya Yoga",
			timestamp: 2,
		});
		store.markVerseAsRead(2, 47);

		const history = JSON.parse(
			localStorage.getItem("gita_reading_history") ?? "[]",
		) as { chapterId: number; verseNumber: number }[];
		expect(
			history.map((entry) => `${entry.chapterId}.${entry.verseNumber}`),
		).toEqual(["2.47", "1.1", "1.2", "1.3"]);
		expect(
			JSON.parse(localStorage.getItem("gita_reading_stats") ?? "{}").versesRead,
		).toEqual(["1-1", "1-2", "1-3", "2-47"]);
	});
});

import { describe, expect, it } from "vitest";
import { CHAPTER_GROUPS, groupOf, groupRange } from "./chapterGroups";
import type { ChapterInfo } from "./gitaData";
import { continueVerse, readCount, verseKey } from "./progress";
import { verseForDate } from "./todaysVerse";

function chapter(number: number, versesCount: number): ChapterInfo {
	return {
		number,
		name: "",
		nameTransliterated: "",
		nameTranslation: "",
		nameMeaning: "",
		summary: "",
		summaryHindi: "",
		versesCount,
	};
}

const GITA = [
	47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78,
].map((count, index) => chapter(index + 1, count));

describe("chapter groups", () => {
	it("puts each of the 18 chapters in exactly one group of six", () => {
		const covered = CHAPTER_GROUPS.flatMap((group) =>
			Array.from(
				{ length: group.last - group.first + 1 },
				(_, i) => group.first + i,
			),
		);
		expect(covered).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
		expect(groupOf(2).name).toBe("Karma");
		expect(groupOf(12).name).toBe("Bhakti");
		expect(groupOf(13).name).toBe("Jñāna");
		expect(groupRange(groupOf(18))).toBe("chapters 13–18");
	});
});

describe("progress", () => {
	const read = new Set([
		verseKey(2, 1),
		verseKey(2, 2),
		verseKey(2, 5),
		verseKey(3, 1),
	]);

	it("counts only the verses read in that chapter", () => {
		expect(readCount(read, 2, 72)).toBe(3);
		expect(readCount(read, 4, 42)).toBe(0);
	});

	it("continues at the last verse opened in the chapter", () => {
		expect(
			continueVerse(
				read,
				{
					chapterId: 2,
					verseNumber: 47,
					chapterName: "",
					chapterNameTranslated: "",
					timestamp: 0,
				},
				2,
				72,
			),
		).toEqual({ verse: 47, started: true });
	});

	it("otherwise continues at the first unread verse, or starts at 1", () => {
		expect(continueVerse(read, null, 2, 72)).toEqual({
			verse: 3,
			started: true,
		});
		expect(continueVerse(read, null, 4, 42)).toEqual({
			verse: 1,
			started: false,
		});
		const all = new Set(
			Array.from({ length: 20 }, (_, i) => verseKey(12, i + 1)),
		);
		expect(continueVerse(all, null, 12, 20)).toEqual({
			verse: 1,
			started: false,
		});
	});
});

describe("today's verse", () => {
	it("is the same all day and moves one verse a day through the whole Gita", () => {
		const morning = verseForDate(new Date(2026, 10, 5, 6, 0), GITA);
		const night = verseForDate(new Date(2026, 10, 5, 23, 59), GITA);
		const tomorrow = verseForDate(new Date(2026, 10, 6, 6, 0), GITA);
		expect(night).toEqual(morning);
		const next =
			morning.verse < GITA[morning.chapter - 1].versesCount
				? { chapter: morning.chapter, verse: morning.verse + 1 }
				: { chapter: (morning.chapter % 18) + 1, verse: 1 };
		expect(tomorrow).toEqual(next);
	});

	it("visits every one of the 701 verses once every 701 days", () => {
		const seen = new Set<string>();
		for (let day = 0; day < 701; day++) {
			const { chapter, verse } = verseForDate(new Date(2026, 0, 1 + day), GITA);
			expect(verse).toBeGreaterThanOrEqual(1);
			expect(verse).toBeLessThanOrEqual(GITA[chapter - 1].versesCount);
			seen.add(`${chapter}.${verse}`);
		}
		expect(seen.size).toBe(701);
	});
});

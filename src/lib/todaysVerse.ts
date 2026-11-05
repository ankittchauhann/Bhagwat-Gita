import type { ChapterInfo } from "./gitaData";

const DAY = 86_400_000;

// The same verse for everyone on a calendar day, moving one verse a day through the whole Gita.
export function verseForDate(date: Date, chapters: ChapterInfo[]) {
	const total = chapters.reduce((sum, chapter) => sum + chapter.versesCount, 0);
	const day = Math.floor(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY,
	);
	let index = ((day % total) + total) % total;
	for (const chapter of chapters) {
		if (index < chapter.versesCount) {
			return { chapter: chapter.number, verse: index + 1 };
		}
		index -= chapter.versesCount;
	}
	return { chapter: 1, verse: 1 };
}

import type { ReadingPosition } from "@/store/readingHistoryStore";

export function verseKey(chapter: number, verse: number) {
	return `${chapter}-${verse}`;
}

export function readCount(
	versesRead: Set<string>,
	chapter: number,
	versesCount: number,
) {
	let count = 0;
	for (let verse = 1; verse <= versesCount; verse++) {
		if (versesRead.has(verseKey(chapter, verse))) {
			count += 1;
		}
	}
	return count;
}

// Where "Continue" in a chapter leads: the last verse opened there, else the first unread one.
export function continueVerse(
	versesRead: Set<string>,
	lastPosition: ReadingPosition | null,
	chapter: number,
	versesCount: number,
): { verse: number; started: boolean } {
	if (
		lastPosition?.chapterId === chapter &&
		lastPosition.verseNumber <= versesCount
	) {
		return { verse: lastPosition.verseNumber, started: true };
	}
	for (let verse = 1; verse <= versesCount; verse++) {
		if (!versesRead.has(verseKey(chapter, verse))) {
			return { verse, started: verse > 1 };
		}
	}
	return { verse: 1, started: false };
}

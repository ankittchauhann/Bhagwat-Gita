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

// A calendar day where the reader is, as "2026-11-05".
export function localDay(date = new Date()) {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(day: string, days: number) {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, date + days))
		.toISOString()
		.slice(0, 10);
}

// Days in a row with reading, up to today; a streak stays alive until today ends.
export function readingStreak(readDays: Record<string, number>, today: string) {
	const readToday = today in readDays;
	let day = readToday ? today : addDays(today, -1);
	let days = 0;
	while (day in readDays) {
		days += 1;
		day = addDays(day, -1);
	}
	return { days, readToday };
}

export function lastSevenDays(readDays: Record<string, number>, today: string) {
	return Array.from({ length: 7 }, (_, index) => {
		const day = addDays(today, index - 6);
		return { day, read: day in readDays, verses: readDays[day] ?? 0 };
	});
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

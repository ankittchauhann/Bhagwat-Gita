import type { ChapterInfo, Speaker } from "@/lib/gitaData";

export interface VerseTarget {
	chapter: number;
	verse: number;
}

export function adjacentVerses(
	chapters: ChapterInfo[],
	chapter: number,
	verse: number,
): { previous: VerseTarget | null; next: VerseTarget | null } {
	const count = chapters[chapter - 1]?.versesCount ?? 0;
	const previousChapter = chapters[chapter - 2];
	const nextChapter = chapters[chapter];

	return {
		previous:
			verse > 1
				? { chapter, verse: verse - 1 }
				: previousChapter
					? { chapter: chapter - 1, verse: previousChapter.versesCount }
					: null,
		next:
			verse < count
				? { chapter, verse: verse + 1 }
				: nextChapter
					? { chapter: chapter + 1, verse: 1 }
					: null,
	};
}

export function reference({ chapter, verse }: VerseTarget) {
	return `${chapter}.${verse}`;
}

export function verseParams({ chapter, verse }: VerseTarget) {
	return { chapterId: String(chapter), verseNumber: String(verse) };
}

const DEVANAGARI_DIGITS = "०१२३४५६७८९";

export function devanagariNumber(value: number | string) {
	return String(value).replace(
		/\d/g,
		(digit) => DEVANAGARI_DIGITS[Number(digit)],
	);
}

export const SPEAKER_NAMES: Record<Speaker, string> = {
	krishna: "Krishna",
	arjuna: "Arjuna",
	sanjaya: "Sanjaya",
	dhritarashtra: "Dhritarashtra",
};

// A long-metre verse has four quarter-lines; a wide screen sets each pair on one line, as printed editions do.
export function halfVerses(lines: string[]) {
	return lines.length === 4
		? [`${lines[0]} ${lines[1]}`, `${lines[2]} ${lines[3]}`]
		: lines;
}

// The traditional division of the Gita into three groups of six chapters.
export const CHAPTER_GROUPS = [
	{ name: "Karma", first: 1, last: 6 },
	{ name: "Bhakti", first: 7, last: 12 },
	{ name: "Jñāna", first: 13, last: 18 },
] as const;

export type ChapterGroup = (typeof CHAPTER_GROUPS)[number];

export function groupOf(chapterNumber: number): ChapterGroup {
	return (
		CHAPTER_GROUPS.find(
			(group) => chapterNumber >= group.first && chapterNumber <= group.last,
		) ?? CHAPTER_GROUPS[0]
	);
}

export function groupRange(group: ChapterGroup) {
	return `chapters ${group.first}–${group.last}`;
}

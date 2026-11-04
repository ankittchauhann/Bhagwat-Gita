import { parseChapterNumber } from "@/lib/gitaData";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

interface ChapterSearch {
	verse?: number;
}

// Keeps old links (/chapter/2 and /chapter/2?verse=47) working by sending them to the verse URL.
export const Route = createFileRoute("/chapter/$chapterId/")({
	validateSearch: (search: Record<string, unknown>): ChapterSearch => {
		const verse = Number(search.verse);
		return Number.isInteger(verse) && verse > 0 ? { verse } : {};
	},
	beforeLoad: ({ params, search }) => {
		const chapterNumber = parseChapterNumber(params.chapterId);
		if (chapterNumber === null) {
			throw notFound();
		}

		const { lastPosition } = useReadingHistory.getState();
		const verseNumber =
			search.verse ??
			(lastPosition?.chapterId === chapterNumber
				? lastPosition.verseNumber
				: 1);

		throw redirect({
			to: "/chapter/$chapterId/verse/$verseNumber",
			params: {
				chapterId: String(chapterNumber),
				verseNumber: String(verseNumber),
			},
			replace: true,
		});
	},
});

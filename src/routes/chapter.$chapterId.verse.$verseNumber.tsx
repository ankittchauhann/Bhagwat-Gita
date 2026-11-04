import {
	loadChapter,
	parseChapterNumber,
	parseVerseNumber,
} from "@/lib/gitaData";
import { SITE_TITLE } from "@/lib/site";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ChapterPage } from "../components/ChapterPage";
import {
	NotFoundPage,
	PageLoading,
	RouteError,
} from "../components/RouteStatus";

export const Route = createFileRoute("/chapter/$chapterId/verse/$verseNumber")({
	loader: async ({ params }) => {
		const chapterNumber = parseChapterNumber(params.chapterId);
		if (chapterNumber === null) {
			throw notFound();
		}

		const chapterFile = await loadChapter(chapterNumber);
		const verseNumber = parseVerseNumber(
			params.verseNumber,
			chapterFile.chapter.versesCount,
		);
		if (verseNumber === null) {
			throw notFound();
		}

		return { chapterFile, verseNumber };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {};
		}
		const { chapter } = loaderData.chapterFile;
		const reference = `${chapter.number}.${loaderData.verseNumber}`;
		return {
			meta: [
				{
					title: `Bhagavad Gita ${reference} · ${chapter.nameTranslation} · ${SITE_TITLE}`,
				},
				{
					name: "description",
					content: `Bhagavad Gita chapter ${chapter.number}, verse ${loaderData.verseNumber} (${chapter.nameMeaning}) in Sanskrit, with transliteration, word meanings, translations and commentaries.`,
				},
			],
		};
	},
	pendingComponent: () => <PageLoading label="Loading chapter…" />,
	errorComponent: RouteError,
	notFoundComponent: NotFoundPage,
	component: ChapterPage,
});

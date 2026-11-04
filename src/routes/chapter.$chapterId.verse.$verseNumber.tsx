import {
	loadChapter,
	loadChapters,
	parseChapterNumber,
	parseVerseNumber,
} from "@/lib/gitaData";
import { SITE_TITLE } from "@/lib/site";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { NotFoundPage, RouteError } from "../components/RouteStatus";
import { ReaderPage } from "../components/reader/ReaderPage";
import { ReaderSkeleton } from "../components/reader/ReaderSkeleton";

export const Route = createFileRoute("/chapter/$chapterId/verse/$verseNumber")({
	loader: async ({ params }) => {
		const chapterNumber = parseChapterNumber(params.chapterId);
		if (chapterNumber === null) {
			throw notFound();
		}

		const [chapterFile, { chapters }] = await Promise.all([
			loadChapter(chapterNumber),
			loadChapters(),
		]);
		const verseNumber = parseVerseNumber(
			params.verseNumber,
			chapterFile.chapter.versesCount,
		);
		if (verseNumber === null) {
			throw notFound();
		}

		return { chapterFile, verseNumber, chapters };
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
	pendingComponent: ReaderSkeleton,
	errorComponent: RouteError,
	notFoundComponent: NotFoundPage,
	component: ReaderPage,
});

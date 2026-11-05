import { loadChapter, loadChapters, parseChapterNumber } from "@/lib/gitaData";
import { SITE_TITLE } from "@/lib/site";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ChapterOverview } from "../components/ChapterOverview";
import {
	NotFoundPage,
	PageLoading,
	RouteError,
} from "../components/RouteStatus";

interface ChapterSearch {
	verse?: number;
}

export const Route = createFileRoute("/chapter/$chapterId/")({
	validateSearch: (search: Record<string, unknown>): ChapterSearch => {
		const verse = Number(search.verse);
		return Number.isInteger(verse) && verse > 0 ? { verse } : {};
	},
	// Old links such as /chapter/2?verse=47 still open the verse.
	beforeLoad: ({ params, search }) => {
		const chapterNumber = parseChapterNumber(params.chapterId);
		if (chapterNumber === null) {
			throw notFound();
		}
		if (search.verse) {
			throw redirect({
				to: "/chapter/$chapterId/verse/$verseNumber",
				params: {
					chapterId: String(chapterNumber),
					verseNumber: String(search.verse),
				},
				replace: true,
			});
		}
	},
	loader: async ({ params }) => {
		const chapterNumber = parseChapterNumber(params.chapterId);
		if (chapterNumber === null) {
			throw notFound();
		}
		const [chapterFile, { chapters }] = await Promise.all([
			loadChapter(chapterNumber),
			loadChapters(),
		]);
		return { chapterFile, chapters };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {};
		}
		const { chapter } = loaderData.chapterFile;
		return {
			meta: [
				{
					title: `Chapter ${chapter.number} · ${chapter.nameTranslation} · ${SITE_TITLE}`,
				},
				{
					name: "description",
					content: `Bhagavad Gita chapter ${chapter.number}, ${chapter.nameTranslation} (${chapter.nameMeaning}): ${chapter.versesCount} verses, with a summary in English and Hindi.`,
				},
			],
		};
	},
	pendingComponent: () => <PageLoading label="Loading chapter…" />,
	errorComponent: RouteError,
	notFoundComponent: NotFoundPage,
	component: ChapterOverview,
});

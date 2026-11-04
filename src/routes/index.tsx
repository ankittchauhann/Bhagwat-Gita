import { loadChapter } from "@/lib/gitaData";
import { DEFAULT_ENGLISH_TRANSLATOR_ID } from "@/store/preferencesStore";
import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "../components/Dashboard";
import { PageLoading, RouteError } from "../components/RouteStatus";

const FEATURED_VERSES = [
	[2, 47],
	[2, 48],
	[3, 35],
	[4, 7],
	[9, 22],
	[9, 27],
	[18, 65],
	[18, 66],
] as const;

export const Route = createFileRoute("/")({
	loader: async () => {
		const [chapterNumber, verseNumber] =
			FEATURED_VERSES[Math.floor(Math.random() * FEATURED_VERSES.length)];
		const { verses, translators } = await loadChapter(chapterNumber);
		const verse = verses[verseNumber - 1];
		const translator =
			translators.find(
				(author) => author.id === DEFAULT_ENGLISH_TRANSLATOR_ID,
			) ?? translators[0];
		return {
			featured: {
				chapterNumber,
				verseNumber,
				lines: verse.lines,
				translation: verse.translations[translator.id],
				translatorName: translator.name,
			},
		};
	},
	pendingComponent: () => <PageLoading label="Loading…" />,
	errorComponent: RouteError,
	component: Dashboard,
});

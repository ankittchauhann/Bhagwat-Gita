import {
	type ChapterInfo,
	loadChapter,
	loadChapters,
	loadCredits,
} from "@/lib/gitaData";
import { verseForDate } from "@/lib/todaysVerse";
import { usePreferences } from "@/store/preferencesStore";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoading, RouteError } from "../components/RouteStatus";
import { HomePage } from "../components/home/HomePage";
import type { TodaysVerseData } from "../components/home/TodaysVerse";

async function loadTodaysVerse(
	chapters: ChapterInfo[],
): Promise<TodaysVerseData> {
	const today = verseForDate(new Date(), chapters);
	const { verses, translators } = await loadChapter(today.chapter);
	const verse = verses[today.verse - 1];
	const { englishTranslatorId } = usePreferences.getState();
	const translator =
		translators.find((author) => author.id === englishTranslatorId) ??
		translators[0];
	return {
		...today,
		lines: verse.lines,
		transliteration: verse.transliteration,
		translation: verse.translations[translator.id],
		translatorName: translator.name,
	};
}

export const Route = createFileRoute("/")({
	loader: async () => {
		const [{ chapters }, credits] = await Promise.all([
			loadChapters(),
			loadCredits(),
		]);
		// Not awaited: the first screen should not wait for a chapter file it does not show.
		const todaysVerse = loadTodaysVerse(chapters).catch(() => null);
		return { chapters, credits, todaysVerse };
	},
	pendingComponent: () => <PageLoading label="Loading…" />,
	errorComponent: RouteError,
	component: HomePage,
});

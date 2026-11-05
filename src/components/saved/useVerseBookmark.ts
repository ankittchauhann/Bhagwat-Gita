import type { Author, ChapterInfo, Verse } from "@/lib/gitaData";
import { verseKey } from "@/lib/progress";
import { useNotices } from "@/store/noticeStore";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { useNavigate } from "@tanstack/react-router";

export function useVerseBookmark(
	chapter: ChapterInfo,
	verse: Verse,
	translator: Author | undefined,
) {
	const id = verseKey(chapter.number, verse.number);
	const bookmark = useReadingHistory((state) =>
		state.bookmarks.find((entry) => entry.id === id),
	);
	const { addBookmark, removeBookmark } = useReadingHistory.getState();
	const notify = useNotices((state) => state.notify);
	const navigate = useNavigate();
	const reference = `${chapter.number}.${verse.number}`;

	const toggle = () => {
		if (bookmark) {
			removeBookmark(id);
			notify(`Removed ${reference} from Saved.`, {
				label: "Undo",
				run: () => useReadingHistory.getState().addBookmark(bookmark),
			});
			return;
		}
		addBookmark({
			id,
			chapterId: chapter.number,
			verseNumber: verse.number,
			chapterName: chapter.nameTranslation,
			sanskrit: verse.lines.join("\n"),
			translation: translator ? verse.translations[translator.id] : undefined,
			translatorName: translator?.name,
			timestamp: Date.now(),
		});
		notify(`Saved ${reference}.`, {
			label: "View saved",
			run: () => navigate({ to: "/saved" }),
		});
	};

	return { bookmark, toggle };
}

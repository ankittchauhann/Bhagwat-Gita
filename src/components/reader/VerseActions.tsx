import { useVerseBookmark } from "@/components/saved/useVerseBookmark";
import { verseCitation } from "@/lib/citation";
import type { Author, ChapterInfo, Verse } from "@/lib/gitaData";
import { verseKey } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useNotices } from "@/store/noticeStore";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Bookmark, BookmarkCheck, Copy, Share } from "lucide-react";

function canShare() {
	return (
		typeof navigator !== "undefined" && typeof navigator.share === "function"
	);
}

export function VerseActions({
	chapter,
	verse,
	translator,
	wide,
	onEditNote,
}: {
	chapter: ChapterInfo;
	verse: Verse;
	translator: Author | undefined;
	wide: boolean;
	onEditNote: () => void;
}) {
	const { bookmark, toggle } = useVerseBookmark(chapter, verse, translator);
	const notify = useNotices((state) => state.notify);
	const reference = `${chapter.number}.${verse.number}`;
	const citation = () =>
		verseCitation({
			chapter: chapter.number,
			verse: verse.number,
			lines: verse.lines,
			translation: translator ? verse.translations[translator.id] : undefined,
			translatorName: translator?.name,
		});

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(citation().clipboard);
			notify(`Copied ${reference} with its translation and link.`);
		} catch {
			notify("Couldn't copy. Select the verse to copy it instead.");
		}
	};

	const share = async () => {
		const { title, text, url } = citation();
		try {
			await navigator.share({ title, text, url });
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) {
				await copy();
			}
		}
	};

	const buttonClass = cn(
		"inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-3.5 text-[15px] font-semibold text-ink hover:bg-surface [&_svg]:size-[18px] [&_svg]:shrink-0",
		!wide && "flex-1 px-2",
	);
	const SaveIcon = bookmark ? BookmarkCheck : Bookmark;

	return (
		<div
			role="toolbar"
			aria-label={`Actions for ${reference}`}
			className={cn("flex items-center", wide ? "gap-1" : "gap-0")}
		>
			<button
				type="button"
				aria-pressed={Boolean(bookmark)}
				onClick={toggle}
				className={buttonClass}
			>
				<SaveIcon aria-hidden="true" className={cn(bookmark && "fill-ink")} />
				{bookmark ? "Saved" : "Save"}
			</button>
			{wide && bookmark && (
				<button type="button" onClick={onEditNote} className={buttonClass}>
					{bookmark.note ? "Edit note" : "Add a note"}
				</button>
			)}
			{canShare() && (
				<button type="button" onClick={share} className={buttonClass}>
					<Share aria-hidden="true" />
					Share
				</button>
			)}
			<button type="button" onClick={copy} className={buttonClass}>
				<Copy aria-hidden="true" />
				Copy
			</button>
		</div>
	);
}

export function VerseNote({
	chapter,
	verse,
	wide,
	onEditNote,
}: {
	chapter: ChapterInfo;
	verse: Verse;
	wide: boolean;
	onEditNote: () => void;
}) {
	const id = verseKey(chapter.number, verse.number);
	const bookmark = useReadingHistory((state) =>
		state.bookmarks.find((entry) => entry.id === id),
	);
	if (!bookmark) {
		return null;
	}
	if (!bookmark.note) {
		return wide ? null : (
			<button
				type="button"
				onClick={onEditNote}
				className="-ml-1 mt-2 min-h-11 rounded-[6px] px-1 text-[15px] font-semibold underline decoration-control underline-offset-4 hover:bg-surface"
			>
				Add a note to {chapter.number}.{verse.number}
			</button>
		);
	}
	return (
		<section
			aria-label={`Your note on ${chapter.number}.${verse.number}`}
			className="mt-4 rounded-r-[8px] border-l-[3px] border-rubric bg-leaf px-5 py-4"
		>
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-[14px] font-semibold text-muted">Your note</h2>
				<button
					type="button"
					onClick={onEditNote}
					className="-mr-3 min-h-11 rounded-[6px] px-3 text-[14px] font-semibold underline decoration-control underline-offset-4 hover:bg-surface"
				>
					Edit note
				</button>
			</div>
			<p className="reading-text study-text mt-1 whitespace-pre-line">
				{bookmark.note}
			</p>
		</section>
	);
}

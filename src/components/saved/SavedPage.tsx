import { AppHeader } from "@/components/AppHeader";
import { buttonClass } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/choice";
import { useNotices } from "@/store/noticeStore";
import { type Bookmark, useReadingHistory } from "@/store/readingHistoryStore";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { NoteSheet } from "./NoteSheet";

type Order = "book" | "recent";

const savedOn = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
});

const quietButton =
	"min-h-11 rounded-[6px] px-3 text-[15px] font-semibold underline decoration-control underline-offset-4 hover:bg-surface";

function sorted(bookmarks: Bookmark[], order: Order) {
	return [...bookmarks].sort((a, b) =>
		order === "recent"
			? b.timestamp - a.timestamp
			: a.chapterId - b.chapterId || a.verseNumber - b.verseNumber,
	);
}

function SavedVerse({
	bookmark,
	onEditNote,
}: {
	bookmark: Bookmark;
	onEditNote: () => void;
}) {
	const notify = useNotices((state) => state.notify);
	const reference = `${bookmark.chapterId}.${bookmark.verseNumber}`;
	const headingId = `saved-${bookmark.id}`;

	return (
		<li className="flex">
			<article
				aria-labelledby={headingId}
				className="flex w-full flex-col rounded-[8px] bg-leaf px-5 pt-5 pb-2 lg:px-6"
			>
				<div className="flex items-baseline justify-between gap-4">
					<h2 id={headingId} className="text-[20px] font-bold tabular-nums">
						<Link
							to="/chapter/$chapterId/verse/$verseNumber"
							params={{
								chapterId: String(bookmark.chapterId),
								verseNumber: String(bookmark.verseNumber),
							}}
							className="underline decoration-control underline-offset-4 hover:decoration-ink"
						>
							{reference}
						</Link>
					</h2>
					<p className="text-right text-[14px] text-muted">
						Chapter {bookmark.chapterId} · {bookmark.chapterName}
					</p>
				</div>
				<p
					lang="sa"
					className="mt-2.5 font-sanskrit text-[19px] leading-relaxed whitespace-pre-line"
				>
					{bookmark.sanskrit}
				</p>
				{bookmark.translation && (
					<p lang="en" className="reading-text study-text mt-2">
						{bookmark.translation}
					</p>
				)}
				<p className="mt-1.5 text-[14px] text-muted">
					{bookmark.translatorName && `${bookmark.translatorName} · `}saved{" "}
					{savedOn.format(bookmark.timestamp)}
				</p>
				{bookmark.note && (
					<div className="mt-3.5 rounded-r-[6px] border-l-[3px] border-rubric bg-ground px-3.5 py-2.5">
						<p className="text-[13px] font-semibold text-muted">Your note</p>
						<p className="reading-text study-text mt-0.5 whitespace-pre-line">
							{bookmark.note}
						</p>
					</div>
				)}
				<div className="mt-auto flex gap-1 pt-2.5">
					<button
						type="button"
						onClick={onEditNote}
						className={`-ml-3 ${quietButton}`}
						aria-label={`${bookmark.note ? "Edit note on" : "Add a note to"} ${reference}`}
					>
						{bookmark.note ? "Edit note" : "Add a note"}
					</button>
					<button
						type="button"
						aria-label={`Remove ${reference} from Saved`}
						className={quietButton}
						onClick={() => {
							useReadingHistory.getState().removeBookmark(bookmark.id);
							notify(`Removed ${reference} from Saved.`, {
								label: "Undo",
								run: () => useReadingHistory.getState().addBookmark(bookmark),
							});
						}}
					>
						Remove
					</button>
				</div>
			</article>
		</li>
	);
}

export function SavedPage() {
	const bookmarks = useReadingHistory((state) => state.bookmarks);
	const [order, setOrder] = useState<Order>("book");
	const [noteFor, setNoteFor] = useState<string | null>(null);
	const withNotes = bookmarks.filter((bookmark) => bookmark.note).length;

	return (
		<div className="min-h-dvh bg-ground">
			<AppHeader backTo="/" current="saved" />
			<main className="mx-auto max-w-[760px] px-4 pt-2 pb-16 lg:max-w-[1208px] lg:px-6 lg:pt-4">
				<div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
					<div>
						<h1 className="text-[24px] font-bold lg:text-[28px]">
							Saved verses
						</h1>
						<p className="mt-1 text-[15px] text-muted tabular-nums">
							{bookmarks.length === 0
								? "Kept in this browser"
								: `${bookmarks.length} ${bookmarks.length === 1 ? "verse" : "verses"}${withNotes > 0 ? `, ${withNotes} with ${withNotes === 1 ? "a note" : "notes"}` : ""} · kept in this browser`}
						</p>
					</div>
					{bookmarks.length > 1 && (
						<SegmentedControl
							legend="Order"
							compact
							options={[
								{ value: "book", label: "In book order" },
								{ value: "recent", label: "Recently saved" },
							]}
							value={order}
							onChange={setOrder}
						/>
					)}
				</div>

				{bookmarks.length === 0 ? (
					<div className="mt-8 grid gap-4 lg:grid-cols-2">
						<div className="rounded-[8px] bg-leaf px-6 py-8">
							<p className="text-[18px] font-semibold">Nothing saved yet</p>
							<p className="mt-2 max-w-[48ch] text-[16px] leading-normal text-muted">
								Press Save on any verse to keep it here, with a note of your own
								if you like. Saved verses stay in this browser and work offline.
							</p>
							<div className="mt-5 flex flex-wrap gap-3">
								<Link to="/chapters" className={buttonClass("primary")}>
									Open a chapter
								</Link>
								<Link to="/search" className={buttonClass("secondary")}>
									Search the Gita
								</Link>
							</div>
						</div>
						<section
							aria-labelledby="what-saved-keeps"
							className="rounded-[8px] border px-6 py-7"
						>
							<h2 id="what-saved-keeps" className="text-[16px] font-bold">
								What a saved verse keeps
							</h2>
							<ul className="mt-3 space-y-2.5 text-[16px] leading-normal">
								<li>
									The verse in Sanskrit and the translation you were reading.
								</li>
								<li>A note of your own, if you add one.</li>
								<li>
									Where to find it: here, in book order or by when you saved it.
								</li>
							</ul>
							<p className="mt-4 text-[14px] leading-normal text-muted">
								Saved verses stay in this browser, with no account. Clearing
								this site's data in the browser removes them.
							</p>
						</section>
					</div>
				) : (
					<ol className="mt-6 grid gap-4 lg:mt-7 lg:grid-cols-2">
						{sorted(bookmarks, order).map((bookmark) => (
							<SavedVerse
								key={bookmark.id}
								bookmark={bookmark}
								onEditNote={() => setNoteFor(bookmark.id)}
							/>
						))}
					</ol>
				)}
			</main>
			<NoteSheet
				bookmark={bookmarks.find((bookmark) => bookmark.id === noteFor)}
				open={noteFor !== null}
				onClose={() => setNoteFor(null)}
			/>
		</div>
	);
}

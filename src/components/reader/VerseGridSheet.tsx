import { buttonClass } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { ChapterInfo } from "@/lib/gitaData";
import { cn } from "@/lib/utils";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link } from "@tanstack/react-router";

export function VerseGridSheet({
	open,
	onClose,
	chapter,
	currentVerse,
}: {
	open: boolean;
	onClose: () => void;
	chapter: ChapterInfo;
	currentVerse: number;
}) {
	const versesRead = useReadingHistory((state) => state.stats.versesRead);
	const verses = Array.from({ length: chapter.versesCount }, (_, i) => i + 1);
	const readCount = verses.filter((verse) =>
		versesRead.has(`${chapter.number}-${verse}`),
	).length;

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title={`Chapter ${chapter.number} · ${chapter.versesCount} verses`}
		>
			<p className="mb-4 text-[14px] text-muted tabular-nums">
				{readCount} of {chapter.versesCount} read
			</p>
			<ol className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
				{verses.map((verse) => {
					const isCurrent = verse === currentVerse;
					const isRead = versesRead.has(`${chapter.number}-${verse}`);
					return (
						<li key={verse}>
							<Link
								to="/chapter/$chapterId/verse/$verseNumber"
								params={{
									chapterId: String(chapter.number),
									verseNumber: String(verse),
								}}
								replace
								resetScroll={false}
								onClick={onClose}
								aria-current={isCurrent ? "page" : undefined}
								aria-label={`Verse ${verse}${isRead ? ", read" : ""}`}
								className={cn(
									"flex h-11 items-center justify-center rounded-[6px] text-[15px] tabular-nums hover:bg-rule",
									isRead && "bg-surface",
									isCurrent && "font-bold ring-2 ring-rubric ring-inset",
								)}
							>
								{verse}
							</Link>
						</li>
					);
				})}
			</ol>
			<Link
				to="/chapters"
				className={buttonClass("secondary", "mt-6 w-full")}
				onClick={onClose}
			>
				All chapters
			</Link>
		</Sheet>
	);
}

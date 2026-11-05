import { verseKey } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link } from "@tanstack/react-router";

export function VerseGrid({
	chapterNumber,
	versesCount,
	marked,
	markedLabel,
	inReader = false,
	onSelect,
	className,
}: {
	chapterNumber: number;
	versesCount: number;
	marked: number | null;
	markedLabel: string;
	inReader?: boolean;
	onSelect?: () => void;
	className?: string;
}) {
	const versesRead = useReadingHistory((state) => state.stats.versesRead);
	const verses = Array.from({ length: versesCount }, (_, i) => i + 1);

	return (
		<ol
			className={cn(
				"grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5",
				className,
			)}
		>
			{verses.map((verse) => {
				const isMarked = verse === marked;
				const isRead = versesRead.has(verseKey(chapterNumber, verse));
				return (
					<li key={verse}>
						<Link
							to="/chapter/$chapterId/verse/$verseNumber"
							params={{
								chapterId: String(chapterNumber),
								verseNumber: String(verse),
							}}
							replace={inReader}
							resetScroll={!inReader}
							onClick={onSelect}
							aria-current={isMarked && inReader ? "page" : undefined}
							aria-label={`Verse ${verse}${isRead ? ", read" : ""}${isMarked && markedLabel ? `, ${markedLabel}` : ""}`}
							className={cn(
								"flex h-11 items-center justify-center rounded-[6px] text-[15px] tabular-nums hover:bg-rule",
								isRead ? "bg-surface" : !inReader && "bg-leaf",
								isMarked && "font-bold ring-2 ring-rubric ring-inset",
							)}
						>
							{verse}
						</Link>
					</li>
				);
			})}
		</ol>
	);
}

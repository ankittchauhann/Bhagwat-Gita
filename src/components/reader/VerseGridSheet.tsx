import { VerseGrid } from "@/components/VerseGrid";
import { buttonClass } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { ChapterInfo } from "@/lib/gitaData";
import { readCount } from "@/lib/progress";
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

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title={`Chapter ${chapter.number} · ${chapter.versesCount} verses`}
		>
			<p className="mb-4 text-[14px] text-muted tabular-nums">
				{readCount(versesRead, chapter.number, chapter.versesCount)} of{" "}
				{chapter.versesCount} read
			</p>
			<VerseGrid
				chapterNumber={chapter.number}
				versesCount={chapter.versesCount}
				marked={currentVerse}
				markedLabel=""
				inReader
				onSelect={onClose}
			/>
			<Link
				to="/chapter/$chapterId"
				params={{ chapterId: String(chapter.number) }}
				className={buttonClass("secondary", "mt-6 w-full")}
				onClick={onClose}
			>
				About chapter {chapter.number}
			</Link>
		</Sheet>
	);
}

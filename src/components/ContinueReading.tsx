import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

function relativeTime(timestamp: number) {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return "Just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
	return new Date(timestamp).toLocaleDateString();
}

export function ContinueReading() {
	const history = useReadingHistory((state) => state.history);

	if (history.length === 0) {
		return null;
	}

	return (
		<section aria-labelledby="recent-title" className="mt-14">
			<h2 id="recent-title" className="text-[20px] font-bold">
				Recently read
			</h2>
			<ol className="mt-3 divide-y border-y md:max-w-[760px]">
				{history.slice(0, 5).map((entry) => (
					<li key={`${entry.chapterId}.${entry.verseNumber}`}>
						<Link
							to="/chapter/$chapterId/verse/$verseNumber"
							params={{
								chapterId: String(entry.chapterId),
								verseNumber: String(entry.verseNumber),
							}}
							className="flex min-h-14 items-center gap-4 py-2 hover:bg-surface/60"
						>
							<span className="w-14 shrink-0 text-[16px] font-semibold tabular-nums">
								{entry.chapterId}.{entry.verseNumber}
							</span>
							<span className="min-w-0 flex-1 truncate text-[15px] text-muted">
								{entry.chapterNameTranslated}
							</span>
							<span className="shrink-0 text-[14px] text-muted tabular-nums">
								{relativeTime(entry.timestamp)}
							</span>
							<ChevronRight
								aria-hidden="true"
								className="size-4 shrink-0 text-muted"
							/>
						</Link>
					</li>
				))}
			</ol>
		</section>
	);
}

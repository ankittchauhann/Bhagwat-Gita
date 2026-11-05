import { Button } from "@/components/ui/button";
import type { ChapterInfo } from "@/lib/gitaData";
import { formatBytes } from "@/lib/offline";
import { cn } from "@/lib/utils";
import { useOfflineLibrary } from "@/store/offlineStore";
import { Link } from "@tanstack/react-router";
import { Check, Download } from "lucide-react";
import { DownloadProgress } from "./DownloadProgress";

export function ChapterDownload({
	chapter,
	inSheet = false,
	className,
}: {
	chapter: ChapterInfo;
	inSheet?: boolean;
	className?: string;
}) {
	const library = useOfflineLibrary();
	if (!library.supported || !library.loaded) {
		return null;
	}

	const textSaved = library.text.has(chapter.number);
	const commentariesSaved = library.commentary.get(chapter.number) ?? 0;
	const complete = textSaved && commentariesSaved >= chapter.versesCount;
	const job = library.job;
	const ownJob =
		job?.target.kind === "chapter" && job.target.chapter === chapter.number
			? job
			: null;
	const otherRunning = job?.status === "running" && !ownJob;
	const size = library.sizes?.chapters.find(
		(entry) => entry.number === chapter.number,
	);
	const bytesLeft = size
		? (textSaved ? 0 : size.text) +
			(size.commentary * (chapter.versesCount - commentariesSaved)) /
				chapter.versesCount
		: null;
	const Heading = inSheet ? "h3" : "h2";

	let status: string;
	if (ownJob?.status === "running") {
		status = `Saving chapter ${chapter.number} for offline reading.`;
	} else if (ownJob?.status === "failed") {
		status = "The download stopped. Check your connection and try again.";
	} else if (complete) {
		status = `Saved with all ${chapter.versesCount} commentaries. The whole chapter reads without a connection.`;
	} else if (textSaved) {
		status = `The verses and translations open without a connection. ${
			commentariesSaved === 0
				? `Download the ${chapter.versesCount} commentaries to read them offline too.`
				: `${commentariesSaved} of the ${chapter.versesCount} commentaries are saved too.`
		}`;
	} else {
		status = "Download this chapter to read it without a connection.";
	}

	return (
		<section
			aria-labelledby={`offline-chapter-${chapter.number}`}
			className={cn(
				inSheet
					? "border-t pt-6"
					: "rounded-[8px] bg-leaf px-5 py-[18px] lg:max-w-[460px]",
				className,
			)}
		>
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<Heading
					id={`offline-chapter-${chapter.number}`}
					className={cn(
						inSheet ? "text-[14px] font-semibold" : "text-[16px] font-bold",
					)}
				>
					Offline reading
				</Heading>
				{textSaved && (
					<span className="inline-flex items-center gap-1.5 text-[14px] text-muted">
						<Check aria-hidden="true" className="size-4" strokeWidth={2.25} />
						{complete ? "Saved" : "Text saved"}
					</span>
				)}
			</div>
			<output className="mt-1.5 block text-[15px] leading-normal text-muted">
				{status}
			</output>

			{ownJob?.status === "running" ? (
				<DownloadProgress
					label={`Saving chapter ${chapter.number}`}
					done={ownJob.done}
					total={ownJob.total}
					onStop={library.stop}
				/>
			) : (
				!complete && (
					<div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
						<Button
							disabled={otherRunning}
							onClick={() => library.downloadChapter(chapter)}
						>
							<Download aria-hidden="true" />
							{ownJob?.status === "failed"
								? "Try again"
								: textSaved
									? "Download the commentaries"
									: `Download chapter ${chapter.number}`}
							{bytesLeft !== null && ` · ${formatBytes(bytesLeft)}`}
						</Button>
						{otherRunning && (
							<span className="text-[14px] text-muted">
								Another download is running.
							</span>
						)}
					</div>
				)
			)}

			{inSheet && (
				<p className="mt-4 text-[14px] leading-normal text-muted">
					{library.usage !== null &&
						`This site uses ${formatBytes(library.usage)} on this device. `}
					<Link
						to="/chapters"
						hash="offline-reading"
						className="font-semibold text-ink underline decoration-control underline-offset-4 hover:decoration-ink"
					>
						All downloads
					</Link>
				</p>
			)}
		</section>
	);
}

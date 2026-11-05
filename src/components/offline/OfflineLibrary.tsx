import { Button } from "@/components/ui/button";
import type { ChapterInfo, Credits } from "@/lib/gitaData";
import { commentaryBytesLeft, formatBytes, textBytesLeft } from "@/lib/offline";
import { type DownloadTarget, useOfflineLibrary } from "@/store/offlineStore";
import { Check, Download } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { DownloadProgress } from "./DownloadProgress";

function Row({
	title,
	detail,
	status,
	action,
}: {
	title: string;
	detail: string;
	status: string;
	action: ReactNode;
}) {
	return (
		<div className="grid gap-x-6 gap-y-3 border-b py-[18px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
			<div>
				<h3 className="text-[16px] font-semibold">{title}</h3>
				<p className="mt-0.5 text-[14px] leading-normal text-muted">{detail}</p>
				<p className="mt-1 text-[14px] text-muted tabular-nums">{status}</p>
			</div>
			<div>{action}</div>
		</div>
	);
}

export function OfflineLibrary({
	chapters,
	credits,
}: {
	chapters: ChapterInfo[];
	credits: Credits;
}) {
	const library = useOfflineLibrary();
	const [confirming, setConfirming] = useState(false);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const removeRef = useRef<HTMLButtonElement>(null);
	const confirmRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (confirming) {
			confirmRef.current?.focus();
		}
	}, [confirming]);

	if (!library.supported) {
		return null;
	}

	const { job, sizes } = library;
	const textSaved = chapters.filter((chapter) =>
		library.text.has(chapter.number),
	).length;
	const commentarySaved = chapters.filter(
		(chapter) =>
			(library.commentary.get(chapter.number) ?? 0) >= chapter.versesCount,
	).length;
	const anythingSaved = library.text.size > 0 || library.commentary.size > 0;

	const action = (
		target: DownloadTarget["kind"],
		complete: boolean,
		bytesLeft: number | null,
		label: string,
		start: () => void,
		primary: boolean,
	) => {
		if (job?.target.kind === target && job.status === "running") {
			return (
				<DownloadProgress
					label={label}
					done={job.done}
					total={job.total}
					onStop={library.stop}
				/>
			);
		}
		if (complete) {
			return (
				<span className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold">
					<Check aria-hidden="true" className="size-5" />
					All saved
				</span>
			);
		}
		const failed = job?.target.kind === target && job.status === "failed";
		return (
			<Button
				variant={primary ? "primary" : "secondary"}
				disabled={job?.status === "running"}
				onClick={start}
			>
				<Download aria-hidden="true" />
				{failed ? "Try again" : "Download"}
				{bytesLeft !== null && ` · ${formatBytes(bytesLeft)}`}
			</Button>
		);
	};

	const failedJob = job?.status === "failed" ? job : null;

	return (
		<section
			id="offline-reading"
			aria-labelledby="offline-reading-title"
			className="mt-14 grid scroll-mt-4 gap-4 border-t pt-8 lg:grid-cols-[22.5rem_minmax(0,1fr)] lg:gap-12"
		>
			<div>
				<h2
					ref={headingRef}
					id="offline-reading-title"
					tabIndex={-1}
					className="text-[18px] font-bold"
				>
					Offline reading
				</h2>
				<p className="mt-1.5 text-[15px] leading-normal text-muted">
					Every chapter you open stays on this device. Download the rest and the
					whole Gita reads with no connection.
				</p>
			</div>
			<div className="rounded-[8px] bg-leaf px-5 pt-1 lg:px-6">
				<Row
					title={`All ${chapters.length} chapters`}
					detail={`Sanskrit, transliteration, word meanings and the ${credits.counts.translators} translations`}
					status={`${textSaved} of ${chapters.length} saved`}
					action={action(
						"text",
						textSaved === chapters.length,
						sizes ? textBytesLeft(sizes, library) : null,
						"Saving the chapters",
						() => library.downloadAllText(chapters),
						true,
					)}
				/>
				<Row
					title={`All ${credits.counts.commentators} commentaries`}
					detail="For every verse, in English, Hindi and Sanskrit"
					status={`Saved for ${commentarySaved} of ${chapters.length} chapters`}
					action={action(
						"commentary",
						commentarySaved === chapters.length,
						sizes ? commentaryBytesLeft(sizes, chapters, library) : null,
						"Saving the commentaries",
						() => library.downloadAllCommentary(chapters),
						false,
					)}
				/>
				<div className="py-3.5">
					<output className="block text-[14px] leading-normal text-muted">
						{failedJob
							? "The download stopped. Check your connection and try again."
							: library.usage !== null && (
									<>
										This site uses{" "}
										<strong className="font-semibold text-ink">
											{formatBytes(library.usage)}
										</strong>{" "}
										on this device
										{library.persisted
											? " and keeps it until you remove it."
											: ". Your browser may clear it if space runs low."}
									</>
								)}
					</output>
					{anythingSaved &&
						(confirming ? (
							<div className="mt-2 flex flex-wrap items-center gap-2">
								<span className="mr-1 text-[15px] font-semibold">
									Remove every saved chapter?
								</span>
								<Button
									ref={confirmRef}
									variant="primary"
									onClick={async () => {
										setConfirming(false);
										await library.removeAll();
										headingRef.current?.focus();
									}}
								>
									Remove
								</Button>
								<Button
									variant="quiet"
									onClick={() => {
										setConfirming(false);
										requestAnimationFrame(() => removeRef.current?.focus());
									}}
								>
									Cancel
								</Button>
							</div>
						) : (
							<Button
								ref={removeRef}
								variant="quiet"
								className="-ml-3 mt-1 underline decoration-control underline-offset-4"
								onClick={() => setConfirming(true)}
							>
								Remove downloads
							</Button>
						))}
				</div>
			</div>
		</section>
	);
}

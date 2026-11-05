import { cn } from "@/lib/utils";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type VerseTarget, reference, verseParams } from "./verseNavigation";

export function StepLink({
	target,
	direction,
	blocked,
	className,
}: {
	target: VerseTarget | null;
	direction: "previous" | "next";
	blocked: () => boolean;
	className?: string;
}) {
	if (!target) {
		return <span className={className} />;
	}
	const label = reference(target);
	return (
		<Link
			to="/chapter/$chapterId/verse/$verseNumber"
			params={verseParams(target)}
			replace
			resetScroll={false}
			onClick={(event) => blocked() && event.preventDefault()}
			aria-label={`${direction === "next" ? "Next" : "Previous"} verse, ${label}`}
			className={cn(
				"inline-flex min-h-11 min-w-28 items-center gap-1 rounded-[6px] px-2 text-[16px] font-semibold tabular-nums hover:bg-surface",
				direction === "next" && "justify-end",
				className,
			)}
		>
			{direction === "previous" && (
				<ChevronLeft aria-hidden="true" className="size-5" />
			)}
			{label}
			{direction === "next" && (
				<ChevronRight aria-hidden="true" className="size-5" />
			)}
		</Link>
	);
}

function useTicks(chapterNumber: number, versesCount: number, current: number) {
	const versesRead = useReadingHistory((state) => state.stats.versesRead);
	return Array.from({ length: versesCount }, (_, index) => {
		const verse = index + 1;
		return {
			verse,
			isCurrent: verse === current,
			isRead: versesRead.has(`${chapterNumber}-${verse}`),
		};
	});
}

function tickClass(isCurrent: boolean, isRead: boolean) {
	return cn(
		"block w-full rounded-[1px]",
		isCurrent ? "bg-rubric" : isRead ? "bg-control" : "bg-rule",
	);
}

// The chapter as a strip of its verses: read ones in ink, the current one in red. Pointer shortcut only; the verse grid is the accessible route.
export function ChapterRuler({
	chapterNumber,
	versesCount,
	current,
	previous,
	next,
	blocked,
}: {
	chapterNumber: number;
	versesCount: number;
	current: number;
	previous: VerseTarget | null;
	next: VerseTarget | null;
	blocked: () => boolean;
}) {
	const ticks = useTicks(chapterNumber, versesCount, current);

	return (
		<nav
			aria-label="Previous and next verse"
			className="mx-auto flex max-w-[1208px] items-center gap-4 px-6 pt-5"
		>
			<StepLink target={previous} direction="previous" blocked={blocked} />
			<ol
				aria-hidden="true"
				className="grid h-8 flex-1 items-end gap-[3px]"
				style={{
					gridTemplateColumns: `repeat(${versesCount}, minmax(0, 1fr))`,
				}}
			>
				{ticks.map((tick) => (
					<li key={tick.verse} className="flex h-full items-end">
						<Link
							to="/chapter/$chapterId/verse/$verseNumber"
							params={{
								chapterId: String(chapterNumber),
								verseNumber: String(tick.verse),
							}}
							replace
							resetScroll={false}
							tabIndex={-1}
							title={`${chapterNumber}.${tick.verse}`}
							onClick={(event) => blocked() && event.preventDefault()}
							className="group flex h-full w-full items-end"
						>
							<span
								className={cn(
									tickClass(tick.isCurrent, tick.isRead),
									tick.isCurrent
										? "h-7"
										: tick.isRead
											? "h-3.5 group-hover:h-5"
											: "h-2 group-hover:h-5",
								)}
							/>
						</Link>
					</li>
				))}
			</ol>
			<StepLink target={next} direction="next" blocked={blocked} />
		</nav>
	);
}

export function ProgressStrip({
	chapterNumber,
	versesCount,
	current,
	onOpen,
}: {
	chapterNumber: number;
	versesCount: number;
	current: number;
	onOpen: () => void;
}) {
	const ticks = useTicks(chapterNumber, versesCount, current);

	return (
		<button
			type="button"
			tabIndex={-1}
			aria-hidden="true"
			onClick={onOpen}
			className="mt-3 grid h-4 w-full cursor-pointer items-end gap-px"
			style={{ gridTemplateColumns: `repeat(${versesCount}, minmax(0, 1fr))` }}
		>
			{ticks.map((tick) => (
				<span
					key={tick.verse}
					className={cn(
						tickClass(tick.isCurrent, tick.isRead),
						tick.isCurrent ? "h-4" : tick.isRead ? "h-2.5" : "h-1.5",
					)}
				/>
			))}
		</button>
	);
}

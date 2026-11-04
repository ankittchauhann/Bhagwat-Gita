import { ChapterHeader } from "@/components/chapter/ChapterHeader";
import { ChapterSummaryCard } from "@/components/chapter/ChapterSummaryCard";
import { VerseDisplay } from "@/components/chapter/VerseDisplay";
import { VerseSelector } from "@/components/chapter/VerseSelector";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

const route = getRouteApi("/chapter/$chapterId/verse/$verseNumber");

function isTypingTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	return (
		target.isContentEditable ||
		["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
		target.closest('[role="listbox"], [role="combobox"]') !== null
	);
}

export function ChapterPage() {
	const navigate = useNavigate();
	const { chapterFile, verseNumber } = route.useLoaderData();
	const { chapter, verses, translators, commentators } = chapterFile;
	const verse = verses[verseNumber - 1];
	const { setLastPosition, addToHistory, markVerseAsRead } =
		useReadingHistory();
	const verseRef = useRef<HTMLDivElement>(null);
	const shownVerse = useRef(`${chapter.number}.${verseNumber}`);

	const goToVerse = useCallback(
		(targetVerse: number) => {
			if (targetVerse < 1 || targetVerse > chapter.versesCount) {
				return;
			}
			navigate({
				to: "/chapter/$chapterId/verse/$verseNumber",
				params: {
					chapterId: String(chapter.number),
					verseNumber: String(targetVerse),
				},
				replace: true,
				resetScroll: false,
			});
		},
		[chapter.number, chapter.versesCount, navigate],
	);

	const handleBackToChapters = useCallback(() => {
		navigate({ to: "/chapters" });
	}, [navigate]);

	useEffect(() => {
		const key = `${chapter.number}.${verseNumber}`;
		if (shownVerse.current === key) {
			return;
		}
		shownVerse.current = key;
		verseRef.current?.scrollIntoView({ block: "start" });
	}, [chapter.number, verseNumber]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				event.shiftKey ||
				isTypingTarget(event.target)
			) {
				return;
			}
			if (event.key === "ArrowLeft") {
				goToVerse(verseNumber - 1);
			} else if (event.key === "ArrowRight") {
				goToVerse(verseNumber + 1);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goToVerse, verseNumber]);

	useEffect(() => {
		const position = {
			chapterId: chapter.number,
			verseNumber: verse.number,
			chapterName: chapter.name,
			chapterNameTranslated: chapter.nameTranslation,
			timestamp: Date.now(),
		};
		setLastPosition(position);
		addToHistory({ ...position, versePreview: verse.text.substring(0, 100) });
		markVerseAsRead(chapter.number, verse.number);
	}, [chapter, verse, setLastPosition, addToHistory, markVerseAsRead]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 w-full">
			<ChapterHeader chapter={chapter} onBack={handleBackToChapters} />
			<div className="w-full max-w-7xl mx-auto px-4 py-6 pt-24">
				<div className="grid lg:grid-cols-4 gap-6">
					<VerseSelector
						versesCount={chapter.versesCount}
						selectedVerse={verseNumber}
						onSelect={goToVerse}
					/>

					<div className="lg:col-span-3 w-full min-w-0">
						<div className="space-y-6">
							<ChapterSummaryCard chapter={chapter} />
							<div ref={verseRef} className="scroll-mt-36 md:scroll-mt-28">
								<VerseDisplay
									key={`${chapter.number}.${verse.number}`}
									chapterNumber={chapter.number}
									verse={verse}
									translators={translators}
									commentators={commentators}
									versesCount={chapter.versesCount}
									onPreviousVerse={() => goToVerse(verseNumber - 1)}
									onNextVerse={() => goToVerse(verseNumber + 1)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

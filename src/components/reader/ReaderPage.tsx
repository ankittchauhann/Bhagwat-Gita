import { Button, IconButton, iconButtonClass } from "@/components/ui/button";
import { loadChapter } from "@/lib/gitaData";
import { WIDE_SCREEN, useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/store/preferencesStore";
import { useReadingHistory } from "@/store/readingHistoryStore";
import {
	Link,
	getRouteApi,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { ALargeSmall, ArrowLeft, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ChapterRuler, ProgressStrip, StepLink } from "./ChapterRuler";
import {
	HINDI_SECTION_ID,
	SettingsSheet,
	TRANSLATION_SECTION_ID,
} from "./SettingsSheet";
import { TranslationColumns } from "./TranslationColumns";
import { VerseGridSheet } from "./VerseGridSheet";
import { VerseLeaf } from "./VerseLeaf";
import { VerseStudy, WideStudy } from "./VerseStudy";
import { useSwipe } from "./useSwipe";
import {
	SPEAKER_NAMES,
	type VerseTarget,
	adjacentVerses,
	reference,
	verseParams,
} from "./verseNavigation";

const route = getRouteApi("/chapter/$chapterId/verse/$verseNumber");

type OpenSheet =
	| { kind: "settings"; section: string | null }
	| { kind: "verses" }
	| null;

function isTypingTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	return (
		target.isContentEditable ||
		["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
	);
}

export function ReaderPage() {
	const navigate = useNavigate();
	const router = useRouter();
	const { chapterFile, verseNumber, chapters } = route.useLoaderData();
	const { chapter, verses, translators, commentators } = chapterFile;
	const verse = verses[verseNumber - 1];
	const current = { chapter: chapter.number, verse: verseNumber };
	const { previous, next } = adjacentVerses(
		chapters,
		chapter.number,
		verseNumber,
	);

	const preferences = usePreferences(
		useShallow((state) => ({
			englishTranslatorId: state.englishTranslatorId,
			hindiTranslatorId: state.hindiTranslatorId,
			sanskritSize: state.sanskritSize,
			translationSize: state.translationSize,
			showHindi: state.showHindi,
		})),
	);
	const wide = useMediaQuery(WIDE_SCREEN);
	const { setLastPosition, addToHistory, markVerseAsRead } =
		useReadingHistory();
	const [sheet, setSheet] = useState<OpenSheet>(null);
	const [scrolled, setScrolled] = useState(false);
	const mainRef = useRef<HTMLElement>(null);

	const [shown, setShown] = useState({
		key: reference(current),
		direction: null as "next" | "previous" | null,
	});
	if (shown.key !== reference(current)) {
		const [shownChapter, shownVerse] = shown.key.split(".").map(Number);
		const forward =
			chapter.number > shownChapter ||
			(chapter.number === shownChapter && verseNumber > shownVerse);
		setShown({
			key: reference(current),
			direction: forward ? "next" : "previous",
		});
	}

	const englishTranslators = translators.filter(
		(author) => author.language === "english",
	);
	const translator =
		englishTranslators.find(
			(author) => author.id === preferences.englishTranslatorId,
		) ?? englishTranslators[0];
	const hindiTranslators = translators.filter(
		(author) => author.language === "hindi",
	);
	const hindiTranslator =
		hindiTranslators.find(
			(author) => author.id === preferences.hindiTranslatorId,
		) ?? hindiTranslators[0];
	const verseCommentators = commentators.filter((author) =>
		verse.commentators.includes(author.id),
	);

	// While another chapter loads, the old verse is still on screen; a second step from it would skip a verse.
	const isNavigating = useCallback(
		() => router.state.status === "pending",
		[router],
	);

	const goTo = useCallback(
		(target: VerseTarget | null) => {
			if (target && !isNavigating()) {
				navigate({
					to: "/chapter/$chapterId/verse/$verseNumber",
					params: verseParams(target),
					replace: true,
					resetScroll: false,
				});
			}
		},
		[navigate, isNavigating],
	);

	useEffect(() => {
		const neighbours = adjacentVerses(chapters, chapter.number, verseNumber);
		for (const target of [neighbours.previous, neighbours.next]) {
			if (target && target.chapter !== chapter.number) {
				loadChapter(target.chapter).catch(() => {});
			}
		}
	}, [chapters, chapter.number, verseNumber]);

	useSwipe(mainRef, {
		onSwipeLeft: () => goTo(next),
		onSwipeRight: () => goTo(previous),
	});

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				event.shiftKey ||
				isTypingTarget(event.target) ||
				document.querySelector("dialog[open]")
			) {
				return;
			}
			if (event.key === "ArrowLeft") {
				goTo(previous);
			} else if (event.key === "ArrowRight") {
				goTo(next);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [goTo, previous, next]);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 0);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (shown.direction && window.scrollY > 0) {
			window.scrollTo({ top: 0 });
		}
	}, [shown]);

	useEffect(() => {
		const position = {
			chapterId: chapter.number,
			verseNumber: verse.number,
			chapterName: chapter.name,
			chapterNameTranslated: chapter.nameTranslation,
			timestamp: Date.now(),
		};
		setLastPosition(position);
		addToHistory({
			...position,
			versePreview: verse.lines.join(" ").substring(0, 100),
		});
		markVerseAsRead(chapter.number, verse.number);
	}, [chapter, verse, setLastPosition, addToHistory, markVerseAsRead]);

	return (
		<div className="min-h-dvh bg-ground">
			<header
				className={cn(
					"sticky top-0 z-20 border-b bg-ground",
					!scrolled && "border-transparent",
				)}
			>
				<div
					className={cn(
						"relative mx-auto flex items-center gap-1",
						wide
							? "h-14 max-w-[1208px] px-4"
							: "h-12 max-w-[720px] px-2 md:px-4",
					)}
				>
					<a
						href="#verse"
						className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-2 focus:z-30 focus:rounded-[6px] focus:bg-ink focus:px-4 focus:py-2.5 focus:font-semibold focus:text-ground"
					>
						Skip to verse
					</a>
					<Link
						to="/chapters"
						aria-label="All chapters"
						className={iconButtonClass()}
					>
						<ArrowLeft aria-hidden="true" />
					</Link>
					<p className="min-w-0 flex-1 truncate text-[15px] font-semibold">
						Chapter {chapter.number}
						<span className="text-muted">
							{" "}
							· {chapter.nameTranslation}
							{wide && ` · ${chapter.nameMeaning}`}
						</span>
					</p>
					{wide ? (
						<Button
							onClick={() => setSheet({ kind: "settings", section: null })}
						>
							<ALargeSmall aria-hidden="true" />
							Reading settings
						</Button>
					) : (
						<IconButton
							label="Reading settings"
							onClick={() => setSheet({ kind: "settings", section: null })}
						>
							<ALargeSmall aria-hidden="true" />
						</IconButton>
					)}
				</div>
				{wide && (
					<ChapterRuler
						chapterNumber={chapter.number}
						versesCount={chapter.versesCount}
						current={verseNumber}
						previous={previous}
						next={next}
						blocked={isNavigating}
					/>
				)}
			</header>

			<main
				id="verse"
				ref={mainRef}
				tabIndex={-1}
				data-sanskrit-size={preferences.sanskritSize}
				data-translation-size={preferences.translationSize}
				className={cn(
					"mx-auto w-full",
					wide
						? "max-w-[1208px] px-6 pt-4 pb-20"
						: "max-w-[720px] px-4 pt-3 pb-[calc(var(--bottom-bar)+2.5rem)] md:px-6",
				)}
			>
				<div
					className={cn(
						"flex justify-between gap-4",
						wide ? "items-center" : "items-start",
					)}
				>
					<div className={cn("min-w-0", wide && "flex items-baseline gap-4")}>
						<h1
							className={cn(
								"leading-7 font-bold tabular-nums",
								wide ? "text-[24px]" : "text-[20px]",
							)}
						>
							<span aria-hidden="true">{reference(current)}</span>
							<span className="sr-only">
								Chapter {chapter.number}, verse {verseNumber}
							</span>
						</h1>
						<p className="text-[15px] text-muted">
							{SPEAKER_NAMES[verse.speaker]} said
						</p>
					</div>
					<button
						type="button"
						onClick={() => setSheet({ kind: "verses" })}
						aria-label={`${verseNumber} of ${chapter.versesCount}, choose a verse`}
						className="-mr-2 inline-flex min-h-11 items-center gap-1 rounded-[6px] px-2 text-[15px] font-semibold tabular-nums hover:bg-surface"
					>
						{verseNumber} of {chapter.versesCount}
						<ChevronDown aria-hidden="true" className="size-4 text-muted" />
					</button>
				</div>
				{!wide && (
					<ProgressStrip
						chapterNumber={chapter.number}
						versesCount={chapter.versesCount}
						current={verseNumber}
						onOpen={() => setSheet({ kind: "verses" })}
					/>
				)}

				<div
					key={shown.key}
					className={
						shown.direction ? `verse-enter-${shown.direction}` : undefined
					}
				>
					<VerseLeaf
						chapterNumber={chapter.number}
						verse={verse}
						wide={wide}
						translator={translator}
						onChangeTranslator={() =>
							setSheet({ kind: "settings", section: TRANSLATION_SECTION_ID })
						}
					/>
					{wide ? (
						<>
							<TranslationColumns
								verse={verse}
								englishTranslator={translator}
								hindiTranslator={hindiTranslator}
								showHindi={preferences.showHindi}
								onChange={(language) =>
									setSheet({
										kind: "settings",
										section:
											language === "Hindi"
												? HINDI_SECTION_ID
												: TRANSLATION_SECTION_ID,
									})
								}
							/>
							<WideStudy
								chapterNumber={chapter.number}
								verse={verse}
								commentators={verseCommentators}
							/>
						</>
					) : (
						<VerseStudy
							chapterNumber={chapter.number}
							verse={verse}
							hindiTranslator={hindiTranslator}
							commentators={verseCommentators}
						/>
					)}
				</div>
			</main>

			{!wide && (
				<nav
					aria-label="Previous and next verse"
					className="fixed inset-x-0 bottom-0 z-20 border-t bg-ground pb-[env(safe-area-inset-bottom)]"
				>
					<div className="mx-auto flex h-14 max-w-[720px] items-stretch justify-between px-2 md:px-4">
						<StepLink
							target={previous}
							direction="previous"
							blocked={isNavigating}
						/>
						<StepLink target={next} direction="next" blocked={isNavigating} />
					</div>
				</nav>
			)}

			<p aria-live="polite" className="sr-only">
				{shown.direction
					? `Chapter ${chapter.number}, verse ${verseNumber}`
					: ""}
			</p>

			<SettingsSheet
				open={sheet?.kind === "settings"}
				onClose={() => setSheet(null)}
				translators={translators}
				focusSection={sheet?.kind === "settings" ? sheet.section : null}
			/>
			<VerseGridSheet
				open={sheet?.kind === "verses"}
				onClose={() => setSheet(null)}
				chapter={chapter}
				currentVerse={verseNumber}
			/>
		</div>
	);
}

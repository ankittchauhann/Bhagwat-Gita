import { AppHeader } from "@/components/AppHeader";
import { VerseGrid } from "@/components/VerseGrid";
import { ChapterDownload } from "@/components/offline/ChapterDownload";
import { SPEAKER_NAMES } from "@/components/reader/verseNavigation";
import { buttonClass } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/choice";
import { groupOf, groupRange } from "@/lib/chapterGroups";
import { SPEAKERS } from "@/lib/gitaData";
import { continueVerse, readCount } from "@/lib/progress";
import { WIDE_SCREEN, useMediaQuery } from "@/lib/useMediaQuery";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";

const route = getRouteApi("/chapter/$chapterId/");

type SummaryLanguage = "english" | "hindi";

function paragraphs(text: string) {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export function ChapterOverview() {
	const { chapterFile, chapters } = route.useLoaderData();
	const { chapter, verses } = chapterFile;
	const wide = useMediaQuery(WIDE_SCREEN);
	const versesRead = useReadingHistory((state) => state.stats.versesRead);
	const lastPosition = useReadingHistory((state) => state.lastPosition);
	const [language, setLanguage] = useState<SummaryLanguage>("english");
	const [expanded, setExpanded] = useState(false);

	const group = groupOf(chapter.number);
	const read = readCount(versesRead, chapter.number, chapter.versesCount);
	const next = continueVerse(
		versesRead,
		lastPosition,
		chapter.number,
		chapter.versesCount,
	);
	const marked =
		lastPosition?.chapterId === chapter.number
			? lastPosition.verseNumber
			: null;
	const speakers = SPEAKERS.map((speaker) => ({
		speaker,
		count: verses.filter((verse) => verse.speaker === speaker).length,
	})).filter(({ count }) => count > 0);
	const summary = paragraphs(
		language === "hindi" ? chapter.summaryHindi : chapter.summary,
	);
	const previous = chapters[chapter.number - 2];
	const following = chapters[chapter.number];
	const showAll = wide || expanded;

	return (
		<div className="min-h-dvh bg-ground">
			<AppHeader backTo="/chapters" />
			<main className="mx-auto max-w-[720px] px-4 pt-4 pb-16 lg:max-w-[1208px] lg:px-6 lg:pt-6">
				<div className="grid items-start gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-8">
					<div>
						<p className="text-[15px] text-muted">
							Chapter {chapter.number} of {chapters.length} · {group.name},{" "}
							{groupRange(group)}
						</p>
						<p
							lang="sa"
							className="mt-3 font-sanskrit text-[40px] leading-[1.3] lg:text-[52px]"
						>
							{chapter.name}
						</p>
						<h1 className="mt-1 text-[28px] font-bold tracking-[-0.02em] lg:text-[32px]">
							{chapter.nameTranslation}
						</h1>
						<p className="mt-1 text-[17px] text-muted lg:text-[18px]">
							{chapter.nameMeaning}
						</p>

						<div className="mt-7 flex flex-wrap gap-3">
							<Link
								to="/chapter/$chapterId/verse/$verseNumber"
								params={{
									chapterId: String(chapter.number),
									verseNumber: String(next.verse),
								}}
								className={buttonClass("primary", "px-6")}
							>
								{next.started
									? `Continue at ${chapter.number}.${next.verse}`
									: `Start reading at ${chapter.number}.1`}
							</Link>
							{next.started && (
								<Link
									to="/chapter/$chapterId/verse/$verseNumber"
									params={{
										chapterId: String(chapter.number),
										verseNumber: "1",
									}}
									className={buttonClass("secondary", "px-6")}
								>
									Start at {chapter.number}.1
								</Link>
							)}
						</div>

						<div className="mt-7 max-w-[460px]">
							<p className="flex justify-between text-[14px] tabular-nums">
								<span className="font-semibold">
									{read} of {chapter.versesCount} read
								</span>
								<span className="text-muted">
									{Math.round((read / chapter.versesCount) * 100)}%
								</span>
							</p>
							<div
								aria-hidden="true"
								className="mt-2 h-2 rounded-full bg-surface"
							>
								<div
									className="h-full rounded-full bg-ink"
									style={{ width: `${(read / chapter.versesCount) * 100}%` }}
								/>
							</div>
						</div>

						<dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 tabular-nums">
							{speakers.map(({ speaker, count }) => (
								<div key={speaker}>
									<dt className="text-[14px] text-muted">
										{SPEAKER_NAMES[speaker]}
									</dt>
									<dd className="mt-0.5 text-[22px] font-bold">
										{count} {count === 1 ? "verse" : "verses"}
									</dd>
								</div>
							))}
						</dl>
					</div>

					<section
						aria-labelledby="summary-title"
						className="rounded-[8px] bg-leaf px-5 py-6 lg:row-span-2 lg:px-8 lg:py-7"
					>
						<div className="flex flex-wrap items-center justify-between gap-3">
							<h2 id="summary-title" className="text-[18px] font-bold">
								Summary
							</h2>
							<SegmentedControl
								legend="Summary language"
								compact
								options={[
									{ value: "english", label: "English" },
									{ value: "hindi", label: "Hindi" },
								]}
								value={language}
								onChange={setLanguage}
							/>
						</div>
						<div
							id="chapter-summary"
							lang={language === "hindi" ? "hi" : "en"}
							className="reading-text study-text mt-4"
						>
							{showAll ? (
								<div className="space-y-2.5">
									{summary.map((paragraph) => (
										<p key={paragraph}>{paragraph}</p>
									))}
								</div>
							) : (
								<p className="line-clamp-5">{summary.join(" ")}</p>
							)}
						</div>
						{!wide && (
							<button
								type="button"
								aria-expanded={expanded}
								aria-controls="chapter-summary"
								onClick={() => setExpanded(!expanded)}
								className="-ml-3 mt-2 min-h-11 rounded-[6px] px-3 text-[15px] font-semibold underline decoration-control underline-offset-4 hover:bg-surface"
							>
								{expanded ? "Show less" : "Read the whole summary"}
							</button>
						)}
					</section>

					<ChapterDownload chapter={chapter} className="lg:col-start-1" />
				</div>

				<section
					aria-labelledby="verses-title"
					className="mt-12 border-t pt-5 lg:mt-14"
				>
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<h2 id="verses-title" className="text-[18px] font-bold">
							{chapter.versesCount} verses
						</h2>
						{read > 0 && (
							<p className="text-[14px] text-muted">
								Shaded: read{marked ? " · red ring: where you stopped" : ""}
							</p>
						)}
					</div>
					<VerseGrid
						chapterNumber={chapter.number}
						versesCount={chapter.versesCount}
						marked={marked}
						markedLabel="where you stopped"
						className="mt-4"
					/>
				</section>

				<nav
					aria-label="Other chapters"
					className="mt-12 grid gap-3 sm:grid-cols-2 lg:mt-14"
				>
					{previous ? (
						<Link
							to="/chapter/$chapterId"
							params={{ chapterId: String(previous.number) }}
							className="block rounded-[8px] bg-surface px-5 py-4 hover:bg-rule"
						>
							<span className="text-[14px] text-muted">
								Previous · Chapter {previous.number}
							</span>
							<span className="mt-1 block text-[18px] font-bold">
								{previous.nameTranslation}
							</span>
						</Link>
					) : (
						<span />
					)}
					{following && (
						<Link
							to="/chapter/$chapterId"
							params={{ chapterId: String(following.number) }}
							className="block rounded-[8px] bg-surface px-5 py-4 text-right hover:bg-rule sm:col-start-2"
						>
							<span className="text-[14px] text-muted">
								Next · Chapter {following.number}
							</span>
							<span className="mt-1 block text-[18px] font-bold">
								{following.nameTranslation}
							</span>
						</Link>
					)}
				</nav>
			</main>
		</div>
	);
}

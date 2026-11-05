import { devanagariNumber } from "@/components/reader/verseNavigation";
import { buttonClass } from "@/components/ui/button";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link, getRouteApi } from "@tanstack/react-router";
import { ContinueReading } from "./ContinueReading";
import { ThemeToggle } from "./ThemeToggle";

const route = getRouteApi("/");

export function Dashboard() {
	const { featured } = route.useLoaderData();
	const lastPosition = useReadingHistory((state) => state.lastPosition);
	const start = lastPosition
		? { chapter: lastPosition.chapterId, verse: lastPosition.verseNumber }
		: { chapter: 1, verse: 1 };
	const lastLine = featured.lines.length - 1;

	return (
		<div className="min-h-dvh bg-ground">
			<header className="mx-auto flex h-12 max-w-[1088px] items-center justify-between gap-4 px-4">
				<span lang="sa" className="font-sanskrit text-[19px]">
					श्रीमद्भगवद्गीता
				</span>
				<nav aria-label="Main" className="flex items-center gap-1">
					<Link to="/chapters" className={buttonClass("quiet", "px-3")}>
						Chapters
					</Link>
					<ThemeToggle />
				</nav>
			</header>

			<main className="mx-auto max-w-[1088px] px-4 pb-16">
				<section className="grid gap-10 pt-10 md:grid-cols-[1fr_1fr] md:items-end md:pt-20">
					<div>
						<h1 className="max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.02] font-bold tracking-[-0.035em]">
							The Bhagavad Gita, verse by verse
						</h1>
						<p className="mt-5 max-w-[46ch] text-[18px] leading-relaxed text-muted">
							All 18 chapters and 701 verses in Sanskrit, with transliteration,
							word meanings, seven translations and sixteen commentaries.
						</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								to="/chapter/$chapterId/verse/$verseNumber"
								params={{
									chapterId: String(start.chapter),
									verseNumber: String(start.verse),
								}}
								className={buttonClass("primary", "px-6")}
							>
								{lastPosition
									? `Continue at ${start.chapter}.${start.verse}`
									: "Start reading"}
							</Link>
							<Link to="/chapters" className={buttonClass("secondary", "px-6")}>
								All chapters
							</Link>
						</div>
					</div>

					<figure className="rounded-[8px] bg-leaf p-6 md:p-8">
						<blockquote>
							<p lang="sa" className="verse-sanskrit verse-lines">
								{featured.lines.map((line, index) => (
									<span key={line}>
										{line}
										{index === lastLine && (
											<span
												aria-hidden="true"
												className="whitespace-nowrap text-rubric"
											>
												{" ॥ "}
												{devanagariNumber(
													`${featured.chapterNumber}.${featured.verseNumber}`,
												)}
												{" ॥"}
											</span>
										)}
									</span>
								))}
							</p>
							<p className="reading-text mt-5 border-t pt-5">
								{featured.translation}
							</p>
						</blockquote>
						<figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-4 text-[14px] text-muted">
							<span>
								Bhagavad Gita {featured.chapterNumber}.{featured.verseNumber},
								translated by {featured.translatorName}
							</span>
							<Link
								to="/chapter/$chapterId/verse/$verseNumber"
								params={{
									chapterId: String(featured.chapterNumber),
									verseNumber: String(featured.verseNumber),
								}}
								className="inline-flex min-h-11 items-center font-semibold text-ink underline decoration-control underline-offset-4"
							>
								Read {featured.chapterNumber}.{featured.verseNumber}
							</Link>
						</figcaption>
					</figure>
				</section>

				<ContinueReading />
			</main>

			<footer className="border-t">
				<div className="mx-auto max-w-[1088px] px-4 py-8 text-[14px] text-muted">
					<p>
						Sanskrit text, translations and commentaries from the open{" "}
						<a
							href="https://github.com/gita/gita"
							className="text-ink underline decoration-control underline-offset-4"
						>
							gita/gita
						</a>{" "}
						dataset, free to read, non-commercial, and with the wording
						unchanged. Each translator and commentator is named beside their
						text.
					</p>
					<p className="mt-2">Made by Ankit.</p>
				</div>
			</footer>
		</div>
	);
}

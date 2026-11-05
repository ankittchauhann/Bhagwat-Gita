import { AppHeader } from "@/components/AppHeader";
import { SPEAKER_NAMES } from "@/components/reader/verseNavigation";
import { Button } from "@/components/ui/button";
import type { ChapterInfo } from "@/lib/gitaData";
import {
	type Reference,
	type Segment,
	parseReference,
	scriptOf,
	verseResult,
} from "@/lib/search";
import { useVerseSearch } from "@/lib/useVerseSearch";
import { usePreferences } from "@/store/preferencesStore";
import {
	Link,
	getRouteApi,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { ChevronRight, Search, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

const route = getRouteApi("/search");

const PAGE_SIZE = 20;
const EXAMPLES = ["duty", "steady mind", "surrender", "yoga", "18.66"];
const SEARCH_INPUT_ID = "search-input";

function Marked({ segments }: { segments: Segment[] }) {
	return segments.map((segment, index) =>
		segment.match ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: segments never reorder.
			<mark key={index} className="rounded-[2px] bg-field px-0.5 text-ink">
				{segment.text}
			</mark>
		) : (
			segment.text
		),
	);
}

function matchingChapters(chapters: ChapterInfo[], query: string) {
	const text = query.trim().toLowerCase();
	if (text.length < 3) {
		return [];
	}
	return chapters
		.filter((chapter) =>
			[
				chapter.name,
				chapter.nameTransliterated,
				chapter.nameTranslation,
				chapter.nameMeaning,
			].some((field) => field.toLowerCase().includes(text)),
		)
		.slice(0, 3);
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="rounded-[8px] bg-leaf p-5">
			<h2 className="text-[16px] font-bold">{title}</h2>
			<div className="mt-1.5 text-[15px] leading-normal text-muted">
				{children}
			</div>
		</section>
	);
}

function ReferenceCard({
	reference,
	chapters,
}: {
	reference: Reference;
	chapters: ChapterInfo[];
}) {
	const chapter = chapters[reference.chapter - 1];
	const className =
		"block rounded-[8px] bg-ink px-5 py-4 text-ground hover:opacity-90";
	const label = (
		<span className="flex justify-between gap-4 text-[14px] opacity-80">
			<span>{reference.verse ? "Go to verse" : "Go to chapter"}</span>
			<span aria-hidden="true">Enter ↵</span>
		</span>
	);
	return reference.verse ? (
		<Link
			to="/chapter/$chapterId/verse/$verseNumber"
			params={{
				chapterId: String(reference.chapter),
				verseNumber: String(reference.verse),
			}}
			className={className}
		>
			{label}
			<span className="mt-1 block text-[22px] font-bold">
				{reference.chapter}.{reference.verse} · {chapter.nameTranslation}
			</span>
		</Link>
	) : (
		<Link
			to="/chapter/$chapterId"
			params={{ chapterId: String(reference.chapter) }}
			className={className}
		>
			{label}
			<span className="mt-1 block text-[22px] font-bold">
				Chapter {reference.chapter} · {chapter.nameTranslation}
			</span>
		</Link>
	);
}

function ChapterLink({ chapter }: { chapter: ChapterInfo }) {
	return (
		<Link
			to="/chapter/$chapterId"
			params={{ chapterId: String(chapter.number) }}
			className="flex items-center justify-between gap-4 rounded-[8px] bg-leaf px-5 py-3.5 hover:bg-surface"
		>
			<span className="min-w-0">
				<span className="block text-[14px] text-muted">
					Chapter {chapter.number}
				</span>
				<span className="block text-[17px] font-semibold">
					{chapter.nameTranslation}
				</span>
				<span className="block text-[14px] text-muted">
					{chapter.nameMeaning}
				</span>
			</span>
			<ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
		</Link>
	);
}

function Tips() {
	return (
		<>
			<Panel title="Go straight to a verse">
				Type a reference: <strong className="text-ink">2.47</strong>,{" "}
				<strong className="text-ink">2 47</strong> or{" "}
				<strong className="text-ink">ch 2 v 47</strong>.
			</Panel>
			<Panel title="What is searched">
				The five English translations and the transliteration. Type in
				Devanagari to search the Sanskrit and the two Hindi translations.
			</Panel>
			<Panel title="Try">
				<ul className="mt-2 flex flex-wrap gap-2">
					{EXAMPLES.map((example) => (
						<li key={example}>
							<Link
								to="/search"
								search={{ q: example }}
								className="inline-flex min-h-11 items-center rounded-[6px] bg-surface px-3.5 text-[15px] font-semibold text-ink hover:bg-rule"
							>
								{example}
							</Link>
						</li>
					))}
				</ul>
			</Panel>
		</>
	);
}

function BrowseChapters({ chapters }: { chapters: ChapterInfo[] }) {
	return (
		<nav aria-labelledby="browse-chapters">
			<h2 id="browse-chapters" className="text-[16px] font-bold">
				Or open a chapter
			</h2>
			<ol className="mt-3 grid border-t sm:grid-cols-2 sm:gap-x-8">
				{chapters.map((chapter) => (
					<li key={chapter.number} className="border-b">
						<Link
							to="/chapter/$chapterId"
							params={{ chapterId: String(chapter.number) }}
							className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 py-3 hover:bg-surface/60"
						>
							<span className="text-right text-[16px] font-bold tabular-nums">
								{chapter.number}
							</span>
							<span className="min-w-0">
								<span className="block text-[15px] font-semibold">
									{chapter.nameTranslation}
								</span>
								<span className="block truncate text-[14px] text-muted">
									{chapter.nameMeaning}
								</span>
							</span>
						</Link>
					</li>
				))}
			</ol>
		</nav>
	);
}

export function SearchPage() {
	const { chapters } = route.useLoaderData();
	const { q } = route.useSearch();
	const navigate = useNavigate();
	const router = useRouter();
	const [text, setText] = useState(q ?? "");
	const [shown, setShown] = useState(PAGE_SIZE);
	const [attempt, setAttempt] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const state = useVerseSearch(text, attempt);
	const script = scriptOf(text);
	const preferredAuthor = usePreferences((preferences) =>
		script === "devanagari"
			? preferences.hindiTranslatorId
			: preferences.englishTranslatorId,
	);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// The address follows the box; only a change from elsewhere (a "Try" link, Back) refills the box.
	const pushed = useRef(q);
	useEffect(() => {
		if (q !== pushed.current) {
			pushed.current = q;
			setText(q ?? "");
			setShown(PAGE_SIZE);
		}
	}, [q]);

	useEffect(() => {
		const query = text.trim() || undefined;
		if (query === pushed.current) {
			return;
		}
		const timer = setTimeout(() => {
			// The reader may already be on the way to a verse; replacing the address would pull them back.
			if (router.state.location.pathname !== "/search") {
				return;
			}
			pushed.current = query;
			navigate({ to: "/search", search: { q: query }, replace: true });
		}, 400);
		return () => clearTimeout(timer);
	}, [text, navigate, router]);

	const query = text.trim();
	const reference = parseReference(query, chapters);
	const chapterMatches = reference ? [] : matchingChapters(chapters, query);
	const done = state.status === "done" && state.query === query ? state : null;
	const hits = done && !reference ? done.hits : [];
	const results = useMemo(
		() =>
			done
				? hits
						.slice(0, shown)
						.map((hit) =>
							verseResult(
								done.file,
								hit,
								preferredAuthor,
								script === "devanagari" ? "Sanskrit" : "Transliteration",
							),
						)
						.filter((result) => result !== null)
				: [],
		[done, hits, shown, preferredAuthor, script],
	);

	const summary = !done
		? ""
		: hits.length === 0
			? `No verses match “${query}”.`
			: `${hits.length} ${hits.length === 1 ? "verse" : "verses"}${done.allWords ? "" : " with some of these words"}`;

	const textLang = (source: string) =>
		source === "Transliteration"
			? "sa-Latn"
			: source === "Sanskrit"
				? "sa"
				: script === "devanagari"
					? "hi"
					: "en";

	return (
		<div className="min-h-dvh bg-ground">
			<AppHeader backTo="/" current="search" />
			<main className="mx-auto max-w-[760px] px-4 pt-2 pb-16 lg:max-w-[1208px] lg:px-6 lg:pt-4">
				<h1 className="text-[24px] font-bold lg:text-[28px]">Search</h1>
				<search>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							if (reference?.verse) {
								navigate({
									to: "/chapter/$chapterId/verse/$verseNumber",
									params: {
										chapterId: String(reference.chapter),
										verseNumber: String(reference.verse),
									},
								});
							} else if (reference) {
								navigate({
									to: "/chapter/$chapterId",
									params: { chapterId: String(reference.chapter) },
								});
							}
						}}
						className="relative mt-3 lg:mt-4"
					>
						<Search
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
						/>
						<input
							ref={inputRef}
							id={SEARCH_INPUT_ID}
							type="search"
							aria-label="Search the Gita"
							placeholder="A verse like 2.47, or words like steady mind"
							autoComplete="off"
							spellCheck={false}
							enterKeyHint="search"
							value={text}
							onChange={(event) => {
								setText(event.target.value);
								setShown(PAGE_SIZE);
							}}
							className="min-h-13 w-full rounded-[8px] border-[1.5px] border-ink bg-leaf pr-14 pl-12 text-[18px] text-ink placeholder:text-muted lg:min-h-14 lg:text-[19px] [&::-webkit-search-cancel-button]:appearance-none"
						/>
						{text && (
							<button
								type="button"
								aria-label="Clear search"
								onClick={() => {
									setText("");
									inputRef.current?.focus();
								}}
								className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-[6px] text-muted hover:bg-surface hover:text-ink"
							>
								<X aria-hidden="true" className="size-5" />
							</button>
						)}
					</form>
				</search>

				<div className="mt-6 grid items-start gap-10 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_21.25rem] lg:gap-14">
					<div>
						{(reference || chapterMatches.length > 0) && (
							<div className="mb-6 space-y-2.5">
								{reference && (
									<ReferenceCard reference={reference} chapters={chapters} />
								)}
								{chapterMatches.map((chapter) => (
									<ChapterLink key={chapter.number} chapter={chapter} />
								))}
							</div>
						)}

						{!query && (
							<>
								<div className="mb-10 space-y-4 lg:hidden">
									<Tips />
								</div>
								<BrowseChapters chapters={chapters} />
							</>
						)}

						{query && !reference && state.status === "preparing" && (
							<p className="text-[15px] text-muted">Preparing search…</p>
						)}

						{query && !reference && state.status === "failed" && (
							<div className="rounded-[8px] border p-4">
								<p className="text-[15px]">
									Search downloads its list of verses the first time you use it.
									Connect to the internet and try again; after that it works
									offline.
								</p>
								<Button
									className="mt-3"
									onClick={() => setAttempt((value) => value + 1)}
								>
									Try again
								</Button>
							</div>
						)}

						{done && !reference && (
							<section aria-labelledby="results-title">
								<h2
									id="results-title"
									className="text-[15px] font-semibold text-muted"
								>
									{summary}
									{hits.length === 0 && " Try fewer words or another spelling."}
								</h2>
								{results.length > 0 && (
									<ol className="mt-3 border-t">
										{results.map((result) => (
											<li
												key={`${result.chapter}.${result.verse}`}
												className="border-b"
											>
												<Link
													to="/chapter/$chapterId/verse/$verseNumber"
													params={{
														chapterId: String(result.chapter),
														verseNumber: String(result.verse),
													}}
													className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 py-4 hover:bg-surface/60 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-5"
												>
													<span className="text-[18px] font-bold tabular-nums sm:text-[20px]">
														{result.chapter}.{result.verse}
													</span>
													<span className="min-w-0">
														<span
															lang="sa"
															className="block font-sanskrit text-[17px] leading-snug text-muted sm:text-[18px]"
														>
															{result.firstLine}
														</span>
														<span
															lang={textLang(result.source)}
															className="reading-text study-text mt-1.5 block"
														>
															<Marked segments={result.segments} />
														</span>
														<span className="mt-1.5 block text-[14px] text-muted">
															{SPEAKER_NAMES[result.speaker]} · {result.source}
														</span>
													</span>
												</Link>
											</li>
										))}
									</ol>
								)}
								{hits.length > shown && (
									<Button
										className="mt-5"
										onClick={() => setShown((value) => value + PAGE_SIZE)}
									>
										Show {Math.min(PAGE_SIZE, hits.length - shown)} more
									</Button>
								)}
							</section>
						)}
					</div>

					<aside
						aria-label="Search help"
						className="hidden space-y-4 lg:sticky lg:top-4 lg:block"
					>
						<Tips />
					</aside>
				</div>
				<p aria-live="polite" className="sr-only">
					{summary}
				</p>
			</main>
		</div>
	);
}

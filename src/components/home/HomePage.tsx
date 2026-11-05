import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonClass } from "@/components/ui/button";
import { CHAPTER_GROUPS, groupRange } from "@/lib/chapterGroups";
import {
	CONTACT_URL,
	PICTURES,
	REPOSITORY_URL,
	pictureSources,
} from "@/lib/credits";
import type { ChapterInfo, Credits } from "@/lib/gitaData";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Await, Link, getRouteApi } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { Crossfade } from "./Crossfade";
import { RevealArea, revealDelay } from "./Reveal";
import { TodaysVerse, TodaysVersePlaceholder } from "./TodaysVerse";

const route = getRouteApi("/");

const STRIPES = Array.from({ length: 48 }, (_, id) => ({
	id,
	red: id % 2 === 0,
}));

const footerLinkClass =
	"underline decoration-control underline-offset-4 hover:decoration-ink";

function Hero() {
	const lastPosition = useReadingHistory((state) => state.lastPosition);
	const start = lastPosition
		? { chapter: lastPosition.chapterId, verse: lastPosition.verseNumber }
		: { chapter: 1, verse: 1 };

	return (
		<section className="grid gap-3 lg:h-[calc(100svh-1.5rem)] lg:min-h-[40rem] lg:grid-cols-2">
			<Crossfade
				pictures={[PICTURES.devanagari, PICTURES.gurmukhi, PICTURES.bengali]}
				className="relative m-0 h-[48svh] min-h-64 overflow-hidden rounded-[8px] lg:order-last lg:h-auto"
			/>
			<div className="relative z-10 mx-3 -mt-9 flex flex-col overflow-hidden rounded-[8px] bg-leaf text-center lg:m-0">
				<div aria-hidden="true" className="flex h-10 shrink-0 lg:h-14">
					{STRIPES.map((stripe) => (
						<span
							key={stripe.id}
							className={`h-full w-7 shrink-0 ${stripe.red ? "bg-rubric dark:bg-[#a8322a]" : "bg-leaf"}`}
						/>
					))}
				</div>
				<div className="absolute top-12 right-1 lg:top-16 lg:right-2">
					<ThemeToggle />
				</div>
				<div className="flex flex-1 flex-col items-center justify-center px-5 pt-6 pb-5 lg:px-14 lg:py-10">
					<p
						lang="sa"
						data-reveal
						className="font-sanskrit text-[28px] leading-[1.3] lg:text-[44px]"
					>
						श्रीमद्भगवद्गीता
					</p>
					<h1
						data-reveal
						style={revealDelay(1)}
						className="mt-3.5 text-[min(8vw,3.5rem)] leading-none font-bold tracking-[-0.035em] lg:mt-7 lg:text-[clamp(2.5rem,3.6vw,3.5rem)]"
					>
						The Bhagavad Gita,
						<br />
						verse by verse
					</h1>
					<p
						data-reveal
						style={revealDelay(2)}
						className="mt-3.5 max-w-[36ch] font-serif text-[16px] leading-[1.55] lg:mt-6 lg:text-[19px]"
					>
						All 18 chapters and 701 verses in Sanskrit, with transliteration,
						word meanings, seven translations and sixteen commentaries.
					</p>
					<Link
						data-reveal
						style={revealDelay(3)}
						to="/chapter/$chapterId/verse/$verseNumber"
						params={{
							chapterId: String(start.chapter),
							verseNumber: String(start.verse),
						}}
						className={buttonClass(
							"primary",
							"mt-5 min-h-12 w-full px-7 text-[16px] sm:w-auto lg:mt-8 lg:min-h-13",
						)}
					>
						{lastPosition
							? `Continue at ${start.chapter}.${start.verse}`
							: "Start reading"}
					</Link>
				</div>
				<nav
					aria-label="On this site"
					className="flex flex-wrap justify-center gap-x-6 gap-y-0 px-5 pb-5 text-[16px] font-semibold lg:gap-x-7 lg:pb-7"
				>
					<Link to="/chapters" className="flex min-h-11 items-center">
						Chapters
					</Link>
					<Link to="/search" className="flex min-h-11 items-center">
						Search
					</Link>
					<Link to="/saved" className="flex min-h-11 items-center">
						Saved
					</Link>
					<a href="#today" className="flex min-h-11 items-center">
						Today's verse
					</a>
					<Link to="/about" className="flex min-h-11 items-center">
						About
					</Link>
				</nav>
			</div>
		</section>
	);
}

function Intro({ credits }: { credits: Credits }) {
	const english = credits.translators.filter(
		(author) => author.language === "english",
	).length;
	const hindi = credits.translators.length - english;
	const facts = [
		{
			value: credits.counts.chapters,
			note: "chapters, from Arjuna’s despair to his resolve",
		},
		{
			value: credits.counts.verses,
			note: `verses: ${credits.speakers.krishna} spoken by Krishna, ${credits.speakers.arjuna} by Arjuna`,
		},
		{
			value: credits.counts.translators,
			note: `translations: ${english} in English and ${hindi} in Hindi`,
		},
		{
			value: credits.counts.commentators,
			note: "commentaries in English, Hindi and Sanskrit",
		},
	];
	const leaf = PICTURES.malayalam;

	return (
		<section
			aria-labelledby="intro-title"
			className="px-5 pt-16 pb-12 lg:px-16 lg:pt-36 lg:pb-24"
		>
			<div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-6">
				<h2
					id="intro-title"
					data-reveal
					className="text-[min(8vw,3.5rem)] leading-none font-bold tracking-[-0.035em] lg:col-span-7 lg:text-[clamp(2.5rem,3.6vw,3.5rem)]"
				>
					One conversation,
					<br />
					eighteen chapters
				</h2>
				<p
					data-reveal
					style={revealDelay(1)}
					className="font-serif text-[17px] leading-[1.55] lg:col-span-3 lg:col-start-10"
				>
					Arjuna puts down his bow before the battle. Krishna answers him. This
					reader sets out their conversation one verse at a time.
				</p>
			</div>
			<ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 lg:mt-28 lg:flex lg:justify-between lg:gap-8">
				{facts.map((fact, index) => (
					<li key={fact.note} data-reveal style={revealDelay(index)}>
						<p className="text-[28px] font-bold tracking-[-0.02em] tabular-nums lg:text-[44px]">
							{fact.value}
						</p>
						<p className="mt-1.5 max-w-[24ch] text-[14px] text-muted">
							{fact.note}
						</p>
					</li>
				))}
			</ul>
			<figure data-reveal className="mt-14 lg:mt-24">
				<div className="overflow-hidden rounded-[8px]">
					<img
						{...pictureSources(leaf)}
						sizes="(min-width: 1024px) 90vw, 100vw"
						width={leaf.width}
						height={leaf.height}
						alt={leaf.alt}
						loading="lazy"
						className="h-auto w-full scale-[1.06]"
					/>
				</div>
				<figcaption className="mt-2.5 text-[14px] text-muted">
					{leaf.caption}
				</figcaption>
			</figure>
		</section>
	);
}

function Contents({ chapters }: { chapters: ChapterInfo[] }) {
	const total = chapters.reduce((sum, chapter) => sum + chapter.versesCount, 0);

	return (
		<section
			aria-labelledby="contents-title"
			className="rounded-[8px] bg-field px-2.5 py-14 lg:py-24"
			style={{ "--scallop-color": "var(--field)" } as CSSProperties}
		>
			<div className="scalloped mx-auto max-w-[40rem] bg-leaf px-6 py-14 lg:px-16 lg:py-18">
				<h2
					id="contents-title"
					data-reveal
					className="text-center text-[28px] font-bold tracking-[-0.02em] lg:text-[44px]"
				>
					Contents
				</h2>
				<p className="mt-2 text-center text-[14px] text-muted">
					Eighteen chapters in three groups of six
				</p>
				{CHAPTER_GROUPS.map((group) => (
					<div key={group.name} data-reveal className="mt-12 lg:mt-14">
						<h3 className="text-center text-[19px] font-bold lg:text-[22px]">
							{group.name} · {groupRange(group)}
						</h3>
						<ol className="mt-4 space-y-1">
							{chapters
								.filter(
									(chapter) =>
										chapter.number >= group.first &&
										chapter.number <= group.last,
								)
								.map((chapter) => (
									<li key={chapter.number}>
										<Link
											to="/chapter/$chapterId"
											params={{ chapterId: String(chapter.number) }}
											className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-x-3 rounded-[6px] py-2 hover:bg-surface/60"
										>
											<span className="text-[17px] font-bold tabular-nums">
												{chapter.number}
											</span>
											<span className="min-w-0 font-serif text-[16px] lg:text-[17px]">
												{chapter.nameTranslation}
												<span className="mt-0.5 block font-sans text-[14px] text-muted">
													{chapter.nameMeaning}
												</span>
											</span>
											<span className="text-[14px] text-muted tabular-nums">
												{chapter.versesCount} verses
											</span>
										</Link>
									</li>
								))}
						</ol>
					</div>
				))}
				<p className="mt-12 text-center text-[16px] leading-relaxed lg:mt-14">
					{total} verses in all
					<br />
					Read in order, or open any chapter
				</p>
			</div>
		</section>
	);
}

function MaintainerNote() {
	return (
		<section
			aria-labelledby="note-title"
			className="py-20 lg:py-40"
			style={{ "--scallop-color": "var(--ground)" } as CSSProperties}
		>
			<h2 id="note-title" className="sr-only">
				A note from the maintainer
			</h2>
			<div className="mx-auto max-w-[40rem]">
				<div
					data-reveal
					className="scalloped-bottom bg-leaf px-6 pt-10 pb-14 lg:px-15 lg:pt-15"
				>
					<div className="space-y-4 font-serif text-[16px] leading-[1.6] lg:text-[17px]">
						<p>
							This is a free reader for the Bhagavad Gita. It shows one verse at
							a time, the Sanskrit first, with the translations and commentaries
							of the open gita/gita dataset beside it.
						</p>
						<p>
							There are no ads and no accounts. The translations are shared for
							non-commercial reading, and that is how they stay here.
						</p>
						<p>
							Your place, your settings and the verses you have read stay in
							this browser. Nothing is sent anywhere.
						</p>
						<p>
							If a verse looks wrong, or something is hard to read, tell me.
						</p>
					</div>
					<p className="mt-7 font-serif text-[22px] italic">Ankit</p>
					<p className="text-[14px] text-muted">Maintainer</p>
				</div>
				<div
					aria-hidden="true"
					className="mx-2 my-3.5 border-t-[5px] border-dotted border-control"
				/>
				<div
					data-reveal
					style={revealDelay(1)}
					className="flex flex-col gap-3 bg-leaf p-5 sm:flex-row sm:items-center sm:justify-between lg:min-h-18 lg:px-7"
				>
					<a
						href={CONTACT_URL}
						className="text-[16px] underline-offset-4 hover:underline"
					>
						github.com/ankittchauhann
					</a>
					<a
						href={`${REPOSITORY_URL}/issues`}
						className={buttonClass("primary", "w-full sm:w-auto")}
					>
						Report a mistake
					</a>
				</div>
			</div>
		</section>
	);
}

function HomeFooter() {
	const stamp = PICTURES.grantha;

	return (
		<footer
			className="scalloped-top-large mx-auto w-full max-w-[70rem] bg-leaf px-6 pt-14 pb-7 lg:px-16 lg:pt-20"
			style={{ "--scallop-color": "var(--ground)" } as CSSProperties}
		>
			<div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
				<div>
					<p lang="sa" className="font-sanskrit text-[28px] lg:text-[44px]">
						<span className="text-rubric">॥</span> इति{" "}
						<span className="text-rubric">॥</span>
					</p>
					<p className="mt-3.5 max-w-[40ch] font-serif text-[16px] leading-[1.6]">
						Free to read, with no ads and no accounts. Every translator,
						commentator and picture is credited on the About page.
					</p>
				</div>
				<div className="relative">
					<img
						{...pictureSources(stamp)}
						sizes="88px"
						width={stamp.width}
						height={stamp.height}
						alt=""
						loading="lazy"
						className="absolute -top-2 right-0 h-[5.25rem] w-16 border-[6px] border-leaf object-cover outline outline-rule lg:h-[7.3rem] lg:w-[5.5rem]"
					/>
					<ul className="space-y-3 pr-24 text-[17px]">
						<li>
							<Link to="/chapters" className={footerLinkClass}>
								Chapters
							</Link>
						</li>
						<li>
							<Link to="/about" className={footerLinkClass}>
								About and sources
							</Link>
						</li>
						<li>
							<a href={REPOSITORY_URL} className={footerLinkClass}>
								Source code on GitHub
							</a>
						</li>
						<li>
							<a
								href="https://github.com/gita/gita"
								className={footerLinkClass}
							>
								The gita/gita dataset
							</a>
						</li>
					</ul>
				</div>
			</div>
			<p className="mt-14 text-center text-[14px] text-muted">
				Sanskrit text in the public domain · translations and commentaries ©
				their authors, shown for non-commercial reading · pictures CC BY-SA 4.0
				· code MIT
			</p>
		</footer>
	);
}

export function HomePage() {
	const { chapters, credits, todaysVerse } = route.useLoaderData();

	return (
		<RevealArea className="flex min-h-dvh flex-col gap-3 bg-ground p-3">
			<main className="flex flex-col gap-3">
				<Hero />
				<Intro credits={credits} />
				<Contents chapters={chapters} />
				<Await promise={todaysVerse} fallback={<TodaysVersePlaceholder />}>
					{(today) =>
						today ? <TodaysVerse today={today} /> : <TodaysVersePlaceholder />
					}
				</Await>
				<MaintainerNote />
			</main>
			<HomeFooter />
		</RevealArea>
	);
}

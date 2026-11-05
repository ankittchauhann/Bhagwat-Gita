import {
	devanagariNumber,
	halfVerses,
} from "@/components/reader/verseNavigation";
import { buttonClass } from "@/components/ui/button";
import { PICTURES, pictureSources } from "@/lib/credits";
import { WIDE_SCREEN, useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { type KeyboardEvent, useId, useRef, useState } from "react";
import { revealDelay } from "./Reveal";

export interface TodaysVerseData {
	chapter: number;
	verse: number;
	lines: string[];
	transliteration: string[];
	translation: string;
	translatorName: string;
}

const TABS = [
	{ id: "sanskrit", label: "Sanskrit" },
	{ id: "transliteration", label: "Transliteration" },
	{ id: "translation", label: "Translation" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function TodaysVerse({ today }: { today: TodaysVerseData }) {
	const [tab, setTab] = useState<Tab>("sanskrit");
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const baseId = useId();
	const reference = `${today.chapter}.${today.verse}`;
	const picture = PICTURES.angkor;
	const wide = useMediaQuery(WIDE_SCREEN);
	const lines = wide ? halfVerses(today.lines) : today.lines;
	const transliteration = wide
		? halfVerses(today.transliteration)
		: today.transliteration;

	const onKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		const last = TABS.length - 1;
		const target =
			event.key === "ArrowRight"
				? index === last
					? 0
					: index + 1
				: event.key === "ArrowLeft"
					? index === 0
						? last
						: index - 1
					: event.key === "Home"
						? 0
						: event.key === "End"
							? last
							: null;
		if (target === null) {
			return;
		}
		event.preventDefault();
		setTab(TABS[target].id);
		tabRefs.current[target]?.focus();
	};

	return (
		<section
			id="today"
			aria-labelledby="today-title"
			className="grid scroll-mt-3 rounded-[8px] bg-surface lg:min-h-[88svh] lg:grid-cols-2"
		>
			<figure data-reveal className="m-4 flex flex-col justify-center lg:m-10">
				<img
					{...pictureSources(picture)}
					sizes="(min-width: 1024px) 45vw, 100vw"
					width={picture.width}
					height={picture.height}
					alt={picture.alt}
					loading="lazy"
					className="aspect-[4/3] w-full rounded-[8px] object-cover lg:aspect-square"
				/>
				<figcaption className="mt-2.5 text-[14px] text-muted">
					{picture.caption}
				</figcaption>
			</figure>

			<div className="flex flex-col justify-between gap-10 px-5 pb-6 lg:py-14 lg:pr-14 lg:pl-4">
				<div
					role="tablist"
					aria-label="Show today's verse as"
					data-reveal
					style={revealDelay(1)}
					className="flex flex-wrap gap-x-7 gap-y-1"
				>
					{TABS.map((item, index) => {
						const selected = item.id === tab;
						return (
							<button
								key={item.id}
								ref={(element) => {
									tabRefs.current[index] = element;
								}}
								type="button"
								role="tab"
								id={`${baseId}-${item.id}`}
								aria-selected={selected}
								aria-controls={`${baseId}-panel`}
								tabIndex={selected ? 0 : -1}
								onClick={() => setTab(item.id)}
								onKeyDown={(event) => onKeyDown(event, index)}
								className={cn(
									"min-h-11 border-b-2 text-[17px]",
									selected
										? "border-ink font-bold text-ink"
										: "border-transparent font-medium text-muted hover:text-ink",
								)}
							>
								{item.label}
							</button>
						);
					})}
				</div>

				<div data-reveal style={revealDelay(2)}>
					<h2
						id="today-title"
						className="text-[28px] font-bold tracking-[-0.02em] lg:text-[44px]"
					>
						Today's verse, {reference}
					</h2>
					<div
						role="tabpanel"
						id={`${baseId}-panel`}
						aria-labelledby={`${baseId}-${tab}`}
						className="mt-6 min-h-[9rem] lg:mt-10"
					>
						{tab === "sanskrit" && (
							<p
								lang="sa"
								className="verse-lines font-sanskrit text-[22px] leading-[1.65] lg:text-[28px]"
							>
								{lines.map((line, index) => (
									<span key={line}>
										{line}
										{index === lines.length - 1 && (
											<span
												aria-hidden="true"
												className="whitespace-nowrap text-rubric"
											>
												{" ॥ "}
												{devanagariNumber(reference)}
												{" ॥"}
											</span>
										)}
									</span>
								))}
							</p>
						)}
						{tab === "transliteration" && (
							<p
								lang="sa-Latn"
								className="verse-lines font-serif text-[19px] leading-[1.55] italic"
							>
								{transliteration.map((line) => (
									<span key={line}>{line}</span>
								))}
							</p>
						)}
						{tab === "translation" && (
							<div>
								<p className="font-serif text-[19px] leading-[1.55]">
									{today.translation}
								</p>
								<p className="mt-2 text-[14px] text-muted">
									{today.translatorName}
								</p>
							</div>
						)}
					</div>
					<p className="mt-5 text-[14px] text-muted">
						A new verse each day, the same for everyone, in order through the
						Gita
					</p>
				</div>

				<div
					data-reveal
					style={revealDelay(3)}
					className="grid gap-3 sm:grid-cols-2"
				>
					<Link
						to="/chapter/$chapterId/verse/$verseNumber"
						params={{
							chapterId: String(today.chapter),
							verseNumber: String(today.verse),
						}}
						className={buttonClass(
							"primary",
							"min-h-15 text-[16px] lg:min-h-18",
						)}
					>
						Open {reference} in the reader
					</Link>
					<Link
						to="/chapter/$chapterId"
						params={{ chapterId: String(today.chapter) }}
						className={cn(
							buttonClass("secondary", "min-h-15 text-[16px] lg:min-h-18"),
							"bg-field hover:bg-rule",
						)}
					>
						About chapter {today.chapter}
					</Link>
				</div>
			</div>
		</section>
	);
}

export function TodaysVersePlaceholder() {
	return (
		<section
			id="today"
			aria-busy="true"
			aria-label="Today's verse"
			className="grid min-h-[36rem] scroll-mt-3 rounded-[8px] bg-surface lg:min-h-[88svh] lg:grid-cols-2"
		>
			<div className="m-4 aspect-[4/3] rounded-[8px] bg-rule lg:m-10 lg:aspect-square lg:self-center" />
			<div className="space-y-4 px-5 pb-6 lg:py-14 lg:pr-14 lg:pl-4">
				<div className="h-10 w-2/3 rounded-[4px] bg-rule" />
				<div className="h-8 w-full rounded-[4px] bg-rule" />
				<div className="h-8 w-5/6 rounded-[4px] bg-rule" />
			</div>
		</section>
	);
}

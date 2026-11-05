import type { Author, Verse } from "@/lib/gitaData";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/store/preferencesStore";
import type { ReactNode } from "react";
import { devanagariNumber, halfVerses } from "./verseNavigation";

const DEVANAGARI = /[ऀ-ॿ]/;

export function ChangeButton({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className="-mr-3 min-h-11 shrink-0 rounded-[6px] px-3 text-[14px] font-semibold text-ink underline decoration-control underline-offset-4 hover:bg-surface"
		>
			Change
		</button>
	);
}

export function VerseLeaf({
	chapterNumber,
	verse,
	wide,
	translator,
	onChangeTranslator,
	actions,
}: {
	chapterNumber: number;
	verse: Verse;
	wide: boolean;
	translator: Author | undefined;
	onChangeTranslator: () => void;
	actions?: ReactNode;
}) {
	const showTransliteration = usePreferences(
		(state) => state.showTransliteration,
	);
	const translation = translator ? verse.translations[translator.id] : "";
	const lines = wide ? halfVerses(verse.lines) : verse.lines;
	const transliteration = wide
		? halfVerses(verse.transliteration)
		: verse.transliteration;
	const lastLine = lines.length - 1;

	return (
		<article
			className={cn(
				"ruled-leaf mt-4 rounded-[8px] bg-leaf",
				wide ? "px-30 pt-9 pb-10 text-center" : "px-7 py-6 md:px-12 md:py-9",
			)}
		>
			{verse.speakerLine && (
				<p lang="sa" className="mb-1 font-sanskrit text-[17px] text-muted">
					{verse.speakerLine.sanskrit}
				</p>
			)}
			<p
				lang="sa"
				className={cn(
					"verse-sanskrit verse-lines",
					wide && "text-center",
					wide && verse.lines.length === 4 && "long-metre",
				)}
			>
				{lines.map((line, index) => (
					<span key={line}>
						{line}
						{index === lastLine && (
							<span
								aria-hidden="true"
								className="whitespace-nowrap text-rubric"
							>
								{" ॥ "}
								{devanagariNumber(`${chapterNumber}.${verse.number}`)}
								{" ॥"}
							</span>
						)}
					</span>
				))}
			</p>

			{showTransliteration && (
				<p
					className={cn(
						"transliteration-text verse-lines text-muted",
						wide ? "mt-5 text-center" : "mt-4",
					)}
				>
					{verse.speakerLine && (
						<span lang="sa-Latn">{verse.speakerLine.transliteration}</span>
					)}
					{transliteration.map((line) => (
						<span key={line} lang={DEVANAGARI.test(line) ? "sa" : "sa-Latn"}>
							{line}
						</span>
					))}
				</p>
			)}

			{!wide && translator && translation && (
				<div className="mt-6 border-t pt-5">
					<p lang="en" className="reading-text">
						{translation}
					</p>
					<p className="mt-3 flex min-h-11 items-center justify-between gap-4 text-[14px] text-muted">
						<span>{translator.name}</span>
						<ChangeButton
							label="Change English translation"
							onClick={onChangeTranslator}
						/>
					</p>
				</div>
			)}
			{actions && (
				<div className="-mx-4 mt-2 border-t pt-1 md:-mx-8">{actions}</div>
			)}
		</article>
	);
}

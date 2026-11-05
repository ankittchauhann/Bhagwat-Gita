import { Disclosure } from "@/components/ui/disclosure";
import type { Author, Verse } from "@/lib/gitaData";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/store/preferencesStore";
import { useId } from "react";
import { useShallow } from "zustand/react/shallow";
import { CommentarySection } from "./CommentarySection";

interface WordMeaning {
	position: number;
	term: string;
	meaning: string;
}

export function parseWordMeanings(text: string): WordMeaning[] | null {
	const entries = text
		.split(/;\s*/)
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry, position) => {
			const dash = entry.indexOf("—");
			return dash > 0
				? {
						position,
						term: entry.slice(0, dash).trim(),
						meaning: entry.slice(dash + 1).trim(),
					}
				: null;
		});
	return entries.every((entry) => entry !== null) ? entries : null;
}

function WordMeanings({ text }: { text: string }) {
	const entries = parseWordMeanings(text);
	if (!entries) {
		return <p className="reading-text">{text}</p>;
	}
	return (
		<dl className="reading-text space-y-1">
			{entries.map((entry) => (
				<div key={entry.position}>
					<dt lang="sa-Latn" className="inline italic">
						{entry.term}
					</dt>{" "}
					<dd className="inline">— {entry.meaning}</dd>
				</div>
			))}
		</dl>
	);
}

function WordMeaningsTable({ text }: { text: string }) {
	const entries = parseWordMeanings(text);
	if (!entries) {
		return <p className="reading-text study-text mt-3">{text}</p>;
	}
	return (
		<dl className="reading-text study-text mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5">
			{entries.map((entry) => (
				<div key={entry.position} className="contents">
					<dt lang="sa-Latn" className="italic">
						{entry.term}
					</dt>
					<dd>{entry.meaning}</dd>
				</div>
			))}
		</dl>
	);
}

// On a laptop the Hindi translation sits beside the English one, so only the commentary and word meanings remain here.
export function WideStudy({
	chapterNumber,
	verse,
	commentators,
}: {
	chapterNumber: number;
	verse: Verse;
	commentators: Author[];
}) {
	const showWordMeanings = usePreferences((state) => state.showWordMeanings);
	const titleId = useId();
	const words = showWordMeanings && verse.wordMeanings;

	return (
		<div
			className={cn(
				"mt-14 grid items-start gap-x-20",
				words ? "grid-cols-2" : "max-w-[46rem] grid-cols-1",
			)}
		>
			{commentators.length > 0 && (
				<div className="border-b">
					<CommentarySection
						chapterNumber={chapterNumber}
						verseNumber={verse.number}
						commentators={commentators}
						wide
					/>
				</div>
			)}
			{words && (
				<section aria-labelledby={titleId} className="border-t pt-3">
					<h2
						id={titleId}
						className="flex min-h-9 items-center text-[16px] font-semibold"
					>
						Word meanings
					</h2>
					<WordMeaningsTable text={verse.wordMeanings} />
				</section>
			)}
		</div>
	);
}

export function VerseStudy({
	chapterNumber,
	verse,
	hindiTranslator,
	commentators,
}: {
	chapterNumber: number;
	verse: Verse;
	hindiTranslator: Author | undefined;
	commentators: Author[];
}) {
	const preferences = usePreferences(
		useShallow((state) => ({
			showWordMeanings: state.showWordMeanings,
			showHindi: state.showHindi,
			wordMeaningsOpen: state.wordMeaningsOpen,
			hindiOpen: state.hindiOpen,
			setPreferences: state.setPreferences,
		})),
	);
	const hindiTranslation = hindiTranslator
		? verse.translations[hindiTranslator.id]
		: "";

	return (
		<div className="mt-6 border-b">
			{preferences.showWordMeanings && verse.wordMeanings && (
				<Disclosure
					title="Word meanings"
					open={preferences.wordMeaningsOpen}
					onOpenChange={(wordMeaningsOpen) =>
						preferences.setPreferences({ wordMeaningsOpen })
					}
				>
					<WordMeanings text={verse.wordMeanings} />
				</Disclosure>
			)}
			{preferences.showHindi && hindiTranslator && hindiTranslation && (
				<Disclosure
					title="Hindi translation"
					detail={hindiTranslator.name}
					open={preferences.hindiOpen}
					onOpenChange={(hindiOpen) =>
						preferences.setPreferences({ hindiOpen })
					}
				>
					<p lang="hi" className="reading-text">
						{hindiTranslation}
					</p>
				</Disclosure>
			)}
			{commentators.length > 0 && (
				<CommentarySection
					chapterNumber={chapterNumber}
					verseNumber={verse.number}
					commentators={commentators}
				/>
			)}
		</div>
	);
}

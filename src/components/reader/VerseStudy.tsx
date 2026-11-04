import { Disclosure } from "@/components/ui/disclosure";
import type { Author, Verse } from "@/lib/gitaData";
import { usePreferences } from "@/store/preferencesStore";
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
		return <p className="text-reading">{text}</p>;
	}
	return (
		<dl className="text-reading space-y-1">
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
					<p lang="hi" className="text-reading">
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

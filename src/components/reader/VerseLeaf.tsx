import type { Author, Verse } from "@/lib/gitaData";
import { usePreferences } from "@/store/preferencesStore";
import { devanagariNumber } from "./verseNavigation";

const DEVANAGARI = /[ऀ-ॿ]/;

export function VerseLeaf({
	chapterNumber,
	verse,
	translator,
	onChangeTranslator,
}: {
	chapterNumber: number;
	verse: Verse;
	translator: Author | undefined;
	onChangeTranslator: () => void;
}) {
	const showTransliteration = usePreferences(
		(state) => state.showTransliteration,
	);
	const translation = translator ? verse.translations[translator.id] : "";
	const lastLine = verse.lines.length - 1;

	return (
		<article className="mt-4 rounded-[8px] bg-leaf px-5 py-6 md:px-10 md:py-9">
			{verse.speakerLine && (
				<p lang="sa" className="mb-1 font-sanskrit text-[17px] text-muted">
					{verse.speakerLine.sanskrit}
				</p>
			)}
			<p lang="sa" className="text-sanskrit verse-lines">
				{verse.lines.map((line, index) => (
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
				<p className="text-transliteration verse-lines mt-4 text-muted">
					{verse.speakerLine && (
						<span lang="sa-Latn">{verse.speakerLine.transliteration}</span>
					)}
					{verse.transliteration.map((line) => (
						<span key={line} lang={DEVANAGARI.test(line) ? "sa" : "sa-Latn"}>
							{line}
						</span>
					))}
				</p>
			)}

			{translator && translation && (
				<div className="mt-6 border-t pt-5">
					<p
						lang={translator.language === "hindi" ? "hi" : "en"}
						className="text-reading"
					>
						{translation}
					</p>
					<p className="mt-3 flex min-h-11 items-center justify-between gap-4 text-[14px] text-muted">
						<span>{translator.name}</span>
						<button
							type="button"
							onClick={onChangeTranslator}
							aria-label="Change translation"
							className="-mr-3 min-h-11 rounded-[6px] px-3 font-semibold text-ink underline decoration-control underline-offset-4 hover:bg-surface"
						>
							Change
						</button>
					</p>
				</div>
			)}
		</article>
	);
}

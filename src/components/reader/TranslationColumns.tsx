import type { Author, Verse } from "@/lib/gitaData";
import { cn } from "@/lib/utils";
import { ChangeButton } from "./VerseLeaf";

function Translation({
	language,
	translator,
	text,
	onChange,
	className,
}: {
	language: "English" | "Hindi";
	translator: Author;
	text: string;
	onChange: () => void;
	className?: string;
}) {
	return (
		<section className={className}>
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-[14px] font-semibold text-muted">
					{language} · <span>{translator.name}</span>
				</h2>
				<ChangeButton
					label={`Change ${language} translation`}
					onClick={onChange}
				/>
			</div>
			<p
				lang={language === "Hindi" ? "hi" : "en"}
				className="reading-text mt-2"
			>
				{text}
			</p>
		</section>
	);
}

export function TranslationColumns({
	verse,
	englishTranslator,
	hindiTranslator,
	showHindi,
	onChange,
}: {
	verse: Verse;
	englishTranslator: Author | undefined;
	hindiTranslator: Author | undefined;
	showHindi: boolean;
	onChange: (language: "English" | "Hindi") => void;
}) {
	const english = englishTranslator && verse.translations[englishTranslator.id];
	const hindi =
		showHindi && hindiTranslator && verse.translations[hindiTranslator.id];

	return (
		<div
			className={cn(
				"mt-7 grid",
				hindi ? "grid-cols-2" : "max-w-[46rem] grid-cols-1",
			)}
		>
			{englishTranslator && english && (
				<Translation
					language="English"
					translator={englishTranslator}
					text={english}
					onChange={() => onChange("English")}
					className={hindi ? "border-r pr-10" : undefined}
				/>
			)}
			{hindiTranslator && hindi && (
				<Translation
					language="Hindi"
					translator={hindiTranslator}
					text={hindi}
					onChange={() => onChange("Hindi")}
					className="pl-10"
				/>
			)}
		</div>
	);
}

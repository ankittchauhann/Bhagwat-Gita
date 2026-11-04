import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { speechLanguages, useTextToSpeech } from "@/hooks/useTextToSpeech";
import type { Author, Verse } from "@/lib/gitaData";
import { usePreferences } from "@/store/preferencesStore";
import { Pause, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { VerseCommentarySection } from "./VerseCommentarySection";
import { VerseNavigationControls } from "./VerseNavigationControls";

export function VerseDisplay({
	chapterNumber,
	verse,
	translators,
	commentators,
	versesCount,
	onPreviousVerse,
	onNextVerse,
}: {
	chapterNumber: number;
	verse: Verse;
	translators: Author[];
	commentators: Author[];
	versesCount: number;
	onPreviousVerse: () => void;
	onNextVerse: () => void;
}) {
	const { isPlaying, isReady, speak, stop } = useTextToSpeech();
	const [speechLanguage, setSpeechLanguage] = useState<string>("hi-IN");
	const englishTranslatorId = usePreferences(
		(state) => state.englishTranslatorId,
	);
	const setEnglishTranslatorId = usePreferences(
		(state) => state.setEnglishTranslatorId,
	);

	const englishTranslators = useMemo(
		() =>
			translators.filter(
				(author) =>
					author.language === "english" && verse.translations[author.id],
			),
		[translators, verse.translations],
	);

	const hindiTranslators = useMemo(
		() =>
			translators.filter(
				(author) =>
					author.language === "hindi" && verse.translations[author.id],
			),
		[translators, verse.translations],
	);

	const currentTranslator =
		englishTranslators.find((author) => author.id === englishTranslatorId) ??
		englishTranslators[0];
	const currentTranslation = currentTranslator
		? verse.translations[currentTranslator.id]
		: undefined;

	const sanskritText = verse.speaker
		? `${verse.speaker}\n${verse.text}`
		: verse.text;

	const handlePlayPause = useCallback(() => {
		if (isPlaying) {
			stop();
			return;
		}

		let textToSpeak = "";
		let voiceLang = speechLanguage;

		switch (speechLanguage) {
			case "hi-IN":
				textToSpeak =
					(hindiTranslators[0] && verse.translations[hindiTranslators[0].id]) ||
					verse.transliteration ||
					verse.text;
				break;
			case "en-US":
				textToSpeak = currentTranslation || verse.text;
				break;
			default:
				textToSpeak = verse.transliteration || verse.text;
				voiceLang = "hi-IN";
				break;
		}

		if (textToSpeak) {
			speak(textToSpeak, voiceLang);
		}
	}, [
		verse,
		isPlaying,
		speechLanguage,
		hindiTranslators,
		currentTranslation,
		speak,
		stop,
	]);

	return (
		<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
			<CardHeader>
				<div className="flex flex-col space-y-4 ">
					<CardTitle className="text-xl justify-center">
						Verse {verse.number}
					</CardTitle>

					<div className="flex flex-col md:flex-row md:items-end md:justify-end space-y-3 md:space-y-0 md:space-x-3">
						<div className="flex flex-col">
							<span className="text-xs text-slate-600 dark:text-slate-300 mb-1">
								Voice Language
							</span>
							<Select value={speechLanguage} onValueChange={setSpeechLanguage}>
								<SelectTrigger
									className="w-full md:w-32 h-8 text-xs cursor-pointer"
									aria-label="Voice language"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{speechLanguages.map((lang) => (
										<SelectItem
											key={lang.value}
											value={lang.value}
											className="cursor-pointer"
										>
											<span className="flex items-center space-x-1">
												<span>{lang.flag}</span>
												<span>{lang.label}</span>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handlePlayPause}
							disabled={!isReady}
							className="flex items-center justify-center space-x-2 cursor-pointer w-full md:w-auto"
						>
							{isPlaying ? (
								<Pause className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4" />
							)}
							<span>{isPlaying ? "Pause" : "Play"}</span>
						</Button>
					</div>
				</div>

				<div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 rounded-lg border border-blue-200 dark:border-slate-700">
					<div className="flex flex-wrap gap-2 text-xs">
						<span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
							🕉️ Sanskrit
						</span>
						{verse.transliteration && (
							<span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
								🔤 Transliteration
							</span>
						)}
						{verse.wordMeanings && (
							<span className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-full">
								📖 Word Meanings
							</span>
						)}
						{englishTranslators.length > 0 && (
							<span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
								🇬🇧 English ({englishTranslators.length})
							</span>
						)}
						{hindiTranslators.length > 0 && (
							<span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
								🇮🇳 Hindi ({hindiTranslators.length})
							</span>
						)}
						{verse.commentators.length > 0 && (
							<span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
								📚 Commentaries ({verse.commentators.length})
							</span>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-lg">
					<h3 className="text-lg font-semibold mb-3 text-orange-800 dark:text-orange-200">
						Sanskrit (संस्कृत)
					</h3>
					<p
						lang="sa"
						className="text-xl leading-relaxed font-sanskrit text-slate-800 dark:text-slate-200 whitespace-pre-line"
					>
						{sanskritText}
					</p>
				</div>
				{verse.transliteration && (
					<div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 rounded-lg">
						<h3 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">
							Transliteration (IAST)
						</h3>
						<p
							lang="sa-Latn"
							className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line italic"
						>
							{verse.transliteration}
						</p>
						<p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
							Roman script pronunciation guide
						</p>
					</div>
				)}
				{verse.wordMeanings && (
					<div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900 dark:to-cyan-900 rounded-lg border border-teal-200 dark:border-teal-800">
						<h3 className="text-lg font-semibold mb-3 text-teal-800 dark:text-teal-200 flex items-center gap-2">
							<span>📖</span> Word Meanings (पदार्थ)
						</h3>
						<div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-white/50 dark:bg-slate-800/50 p-3 rounded border dark:border-slate-700">
							{verse.wordMeanings}
						</div>
						<p className="text-xs text-teal-700 dark:text-teal-300 mt-2 italic">
							Word-by-word meanings and explanations
						</p>
					</div>
				)}
				{currentTranslator && currentTranslation && (
					<div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
						<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-3">
							<h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
								English Translation
							</h3>
							{englishTranslators.length > 1 && (
								<Select
									value={String(currentTranslator.id)}
									onValueChange={(value) =>
										setEnglishTranslatorId(Number(value))
									}
								>
									<SelectTrigger
										className="w-full sm:w-48 text-sm cursor-pointer"
										aria-label="English translator"
									>
										<SelectValue placeholder="Select translator" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-950 text-black dark:text-white">
										{englishTranslators.map((author) => (
											<SelectItem
												key={author.id}
												value={String(author.id)}
												className="cursor-pointer "
											>
												{author.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
							{currentTranslation}
						</p>
						<p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
							— {currentTranslator.name}
						</p>
					</div>
				)}
				{hindiTranslators.length > 0 && (
					<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
						<h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
							Hindi Translation (हिंदी अनुवाद)
						</h3>
						{hindiTranslators.map((author) => (
							<div key={author.id} className="mb-4 last:mb-0">
								<p
									lang="hi"
									className="text-lg leading-relaxed text-slate-700 dark:text-slate-300"
								>
									{verse.translations[author.id]}
								</p>
								<p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
									— {author.name}
								</p>
							</div>
						))}
					</div>
				)}
				{verse.commentators.length > 0 && (
					<VerseCommentarySection
						chapterNumber={chapterNumber}
						verseNumber={verse.number}
						commentators={commentators.filter((author) =>
							verse.commentators.includes(author.id),
						)}
					/>
				)}
				<VerseNavigationControls
					selectedVerse={verse.number}
					versesCount={versesCount}
					onPrevious={onPreviousVerse}
					onNext={onNextVerse}
				/>
			</CardContent>
		</Card>
	);
}

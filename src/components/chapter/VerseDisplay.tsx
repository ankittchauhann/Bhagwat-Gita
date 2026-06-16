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
import type { Verse } from "@/store/gitaStore";
import { Pause, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { VerseNavigationControls } from "./VerseNavigationControls";

export function VerseDisplay({
	verse,
	versesCount,
	selectedVerse,
	onPreviousVerse,
	onNextVerse,
}: {
	verse: Verse;
	versesCount: number;
	selectedVerse: number;
	onPreviousVerse: () => void;
	onNextVerse: () => void;
}) {
	const { isPlaying, speak, stop } = useTextToSpeech();
	const [selectedTranslationIndex, setSelectedTranslationIndex] = useState(0);
	const [speechLanguage, setSpeechLanguage] = useState<string>("hi-IN"); // Default to Hindi

	const englishTranslations = useMemo(
		() => verse.translations.filter((t) => t.language === "english"),
		[verse.translations],
	);

	const hindiTranslations = useMemo(
		() => verse.translations.filter((t) => t.language === "hindi"),
		[verse.translations],
	);

	const currentTranslation = useMemo(
		() =>
			englishTranslations[selectedTranslationIndex] || englishTranslations[0],
		[englishTranslations, selectedTranslationIndex],
	);

	const handlePlayPause = useCallback(() => {
		if (isPlaying) {
			stop();
			return;
		}

		// Determine which text to speak based on language
		let textToSpeak = "";
		let voiceLang = speechLanguage;

		switch (speechLanguage) {
			case "hi-IN":
				// Try Hindi translation first, fallback to transliteration
				textToSpeak =
					verse.translations?.find((t) => t.language === "hindi")
						?.description ||
					verse.transliteration ||
					verse.text;
				break;
			case "en-US":
				// English translation
				textToSpeak =
					englishTranslations[selectedTranslationIndex]?.description ||
					verse.text;
				break;
			case "hi-IN-sanskrit":
				// For Sanskrit, use transliteration with Hindi voice for better pronunciation
				textToSpeak = verse.transliteration || verse.text;
				voiceLang = "hi-IN"; // Use Hindi voice for Sanskrit transliteration
				break;
			default:
				// Fallback - use transliteration with Hindi voice
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
		selectedTranslationIndex,
		englishTranslations,
		speak,
		stop,
	]);

	return (
		<Card
			className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
			style={{ contain: "layout style paint" }}
		>
			<CardHeader>
				<div className="flex flex-col space-y-4 ">
					{/* Verse Title */}
					<CardTitle className="text-xl justify-center">
						Verse {verse.verse_number}
					</CardTitle>

					{/* Controls Section - Desktop: inline, Mobile: justified */}
					<div className="flex flex-col md:flex-row md:items-end md:justify-end space-y-3 md:space-y-0 md:space-x-3">
						{/* Language Selector for TTS */}
						<div className="flex flex-col">
							<span className="text-xs text-slate-600 mb-1">
								Voice Language
							</span>
							<Select value={speechLanguage} onValueChange={setSpeechLanguage}>
								<SelectTrigger className="w-full md:w-32 h-8 text-xs cursor-pointer">
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
						{/* Play/Pause Button */}
						<Button
							variant="outline"
							size="sm"
							onClick={handlePlayPause}
							className="flex items-center justify-center space-x-2 cursor-pointer w-full md:w-auto"
							style={{ contain: "layout style" }}
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

				{/* Content Features Notice */}
				<div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
					<div className="flex flex-wrap gap-2 text-xs">
						<span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
							🕉️ Sanskrit
						</span>
						{verse.transliteration && (
							<span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
								🔤 Transliteration
							</span>
						)}
						{verse.word_meanings && (
							<span className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-full">
								📖 Word Meanings
							</span>
						)}
						{englishTranslations.length > 0 && (
							<span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
								🇬🇧 English ({englishTranslations.length})
							</span>
						)}
						{hindiTranslations.length > 0 && (
							<span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
								🇮🇳 Hindi ({hindiTranslations.length})
							</span>
						)}
						{verse.commentaries && verse.commentaries.length > 0 && (
							<span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
								📚 Commentaries ({verse.commentaries.length})
							</span>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Sanskrit Text - No lazy loading for critical content */}
				<div className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-lg">
					<h3 className="text-lg font-semibold mb-3 text-orange-800 dark:text-orange-200">
						Sanskrit (संस्कृत)
					</h3>
					<p className="text-xl leading-relaxed font-sanskrit text-slate-800 dark:text-slate-200 whitespace-pre-line">
						{verse.text}
					</p>
				</div>
				{/* Transliteration - No lazy loading for critical content */}
				{verse.transliteration && (
					<div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 rounded-lg">
						<h3 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">
							Transliteration (IAST)
						</h3>
						<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line italic">
							{verse.transliteration}
						</p>
						<p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
							Roman script pronunciation guide
						</p>
					</div>
				)}
				{/* Word Meanings - No lazy loading for critical content */}
				<div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900 dark:to-cyan-900 rounded-lg border border-teal-200">
					<h3 className="text-lg font-semibold mb-3 text-teal-800 dark:text-teal-200 flex items-center gap-2">
						<span>📖</span> Word Meanings (पदार्थ)
					</h3>
					{verse.word_meanings ? (
						<>
							<div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-white/50 dark:bg-slate-800/50 p-3 rounded border">
								{verse.word_meanings}
							</div>
							<p className="text-xs text-teal-600 dark:text-teal-400 mt-2 italic">
								Word-by-word meanings and explanations
							</p>
						</>
					) : (
						<div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-800 p-3 rounded">
							Word meanings not available for this verse. Please check other
							translations and commentaries for detailed explanations.
						</div>
					)}
				</div>
				{/* English Translations */}
				{englishTranslations.length > 0 && (
					<div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
						<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-3">
							<h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
								English Translation
							</h3>
							{englishTranslations.length > 1 && (
								<Select
									value={selectedTranslationIndex.toString()}
									onValueChange={(value) =>
										setSelectedTranslationIndex(Number(value))
									}
								>
									<SelectTrigger className="w-full sm:w-48 text-sm cursor-pointer">
										<SelectValue placeholder="Select translator" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-950 text-black dark:text-white">
										{englishTranslations.map((translation, index) => (
											<SelectItem
												key={translation.id}
												value={index.toString()}
												className="cursor-pointer "
											>
												{translation.author_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
							{currentTranslation?.description}
						</p>
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
							— {currentTranslation?.author_name}
						</p>
					</div>
				)}
				{/* Hindi Translations */}
				{hindiTranslations.length > 0 && (
					<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
						<h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
							Hindi Translation (हिंदी अनुवाद)
						</h3>
						{hindiTranslations.map((translation) => (
							<div key={translation.id} className="mb-4 last:mb-0">
								<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
									{translation.description}
								</p>
								<p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
									— {translation.author_name}
								</p>
							</div>
						))}
					</div>
				)}
				{/* Commentaries - Keep lazy loading only for this heavy section */}
				{verse.commentaries && verse.commentaries.length > 0 && (
					<div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg">
						<h3 className="text-lg font-semibold mb-3 text-purple-800 dark:text-purple-200">
							Commentaries (टिप्पणियां)
						</h3>
						<div className="space-y-4 max-h-96 overflow-y-auto">
							{verse.commentaries.slice(0, 3).map((commentary) => (
								<div
									key={commentary.id}
									className="border-l-4 border-purple-300 pl-4"
								>
									<p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
										{commentary.description}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
										— {commentary.author_name}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
				<VerseNavigationControls
					selectedVerse={selectedVerse}
					versesCount={versesCount}
					onPrevious={onPreviousVerse}
					onNext={onNextVerse}
				/>
			</CardContent>
		</Card>
	);
}

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useGitaStore } from "@/store/gitaStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
export function ChapterPage() {
	const navigate = useNavigate();
	const params = useParams({ from: "/chapter/$chapterId" });
	const chapterId = Number.parseInt(params.chapterId);
	const {
		currentChapter,
		currentVerse,
		loading,
		error,
		fetchChapter,
		fetchVerse,
	} = useGitaStore();
	const [selectedVerse, setSelectedVerse] = useState<number>(1);
	const [isPlaying, setIsPlaying] = useState(false);
	const [selectedTranslationIndex, setSelectedTranslationIndex] = useState(0);
	useEffect(() => {
		fetchChapter(chapterId);
		fetchVerse(chapterId, selectedVerse);
	}, [chapterId, fetchChapter, fetchVerse, selectedVerse]);
	const handleBackToChapters = () => {
		navigate({ to: "/chapters" });
	};
	const handleVerseSelect = (verseNumber: number) => {
		setSelectedVerse(verseNumber);
		fetchVerse(chapterId, verseNumber);
	};
	const handlePreviousVerse = () => {
		if (selectedVerse > 1) {
			handleVerseSelect(selectedVerse - 1);
		}
	};
	const handleNextVerse = () => {
		if (currentChapter && selectedVerse < currentChapter.verses_count) {
			handleVerseSelect(selectedVerse + 1);
		}
	};
	// Debug: Log the current verse data to see what we have
	useEffect(() => {
		if (currentVerse) {
			console.log("Current verse data:", {
				id: currentVerse.id,
				text: `${currentVerse.text?.substring(0, 50)}...`,
				transliteration: `${currentVerse.transliteration?.substring(0, 50)}...`,
				word_meanings: `${currentVerse.word_meanings?.substring(0, 100)}...`,
				translations_count: currentVerse.translations?.length,
				commentaries_count: currentVerse.commentaries?.length,
			});
		}
	}, [currentVerse]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
					<p className="mt-4 text-slate-600">Loading chapter...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="text-red-500 text-6xl mb-4">🚫</div>
					<h2 className="text-xl font-semibold text-slate-800 mb-2">
						Connection Issue
					</h2>
					<p className="text-red-600 mb-6 text-sm">{error}</p>
					<div className="space-y-3">
						<Button
							onClick={() => {
								fetchChapter(chapterId);
								fetchVerse(chapterId, selectedVerse);
							}}
							className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
						>
							🔄 Try Again
						</Button>
						<Button
							variant="outline"
							onClick={handleBackToChapters}
							className="ml-3"
						>
							← Back to Chapters
						</Button>
					</div>
					<div className="mt-4 text-xs text-slate-500">
						<p>• Check your internet connection</p>
						<p>• The API server might be temporarily unavailable</p>
					</div>
				</div>
			</div>
		);
	}
	if (!currentChapter) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
				{" "}
				<div className="text-center">
					{" "}
					<p className="text-slate-600">Chapter not found</p>{" "}
					<Button onClick={handleBackToChapters} className="mt-4">
						{" "}
						Back to Chapters{" "}
					</Button>{" "}
				</div>{" "}
			</div>
		);
	}
	const englishTranslations =
		currentVerse?.translations.filter((t) => t.language === "english") || [];
	const hindiTranslations =
		currentVerse?.translations.filter((t) => t.language === "hindi") || [];
	const currentTranslation =
		englishTranslations[selectedTranslationIndex] || englishTranslations[0];
	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950">
			{" "}
			{/* Header */}{" "}
			<div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-orange-200 z-10">
				{" "}
				<div className="container mx-auto px-4 py-4">
					{" "}
					<div className="flex items-center justify-between">
						{" "}
						<div className="flex items-center space-x-4">
							{" "}
							<Button
								variant="ghost"
								onClick={handleBackToChapters}
								className="hover:bg-orange-100"
							>
								{" "}
								<ArrowLeft className="h-4 w-4 mr-2" /> Back{" "}
							</Button>{" "}
							<div>
								{" "}
								<h1 className="text-2xl font-bold text-slate-800">
									{" "}
									Chapter {currentChapter.chapter_number}:{" "}
									{currentChapter.name_meaning}{" "}
								</h1>{" "}
								<p className="text-sm text-slate-600">
									{currentChapter.name_transliterated}
								</p>{" "}
							</div>{" "}
						</div>{" "}
						<div className="flex items-center space-x-2 text-sm text-slate-500">
							{" "}
							<BookOpen className="h-4 w-4" />{" "}
							<span>{currentChapter.verses_count} verses</span>{" "}
						</div>{" "}
					</div>{" "}
				</div>{" "}
			</div>{" "}
			<div className="container mx-auto px-4 py-6">
				{" "}
				<div className="grid lg:grid-cols-4 gap-6">
					{" "}
					{/* Sidebar - Verses List */}{" "}
					<div className="lg:col-span-1">
						{" "}
						<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto">
							{" "}
							<CardHeader>
								{" "}
								<CardTitle className="text-lg">All Verses</CardTitle>{" "}
								<CardDescription>
									{" "}
									श्लोक सूची - {currentChapter.verses_count} total{" "}
								</CardDescription>{" "}
							</CardHeader>{" "}
							<CardContent>
								{" "}
								<div className="space-y-2">
									{" "}
									{Array.from(
										{ length: currentChapter.verses_count },
										(_, i) => i + 1,
									).map((verseNumber) => (
										<Button
											key={verseNumber}
											variant={
												selectedVerse === verseNumber ? "default" : "ghost"
											}
											size="sm"
											className={`w-full justify-start text-left ${selectedVerse === verseNumber ? "bg-gradient-to-r from-orange-500 to-red-500" : "hover:bg-orange-100"}`}
											onClick={() => handleVerseSelect(verseNumber)}
										>
											{" "}
											<span className="mr-2">श्लोक</span> {verseNumber}{" "}
										</Button>
									))}{" "}
								</div>{" "}
							</CardContent>{" "}
						</Card>{" "}
					</div>{" "}
					{/* Main Content - Verse Display */}{" "}
					<div className="lg:col-span-3">
						{" "}
						<div className="space-y-6">
							{" "}
							{/* Chapter Summary */}{" "}
							<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
								{" "}
								<CardHeader>
									{" "}
									<CardTitle className="text-xl text-orange-700">
										{" "}
										{currentChapter.name}{" "}
									</CardTitle>{" "}
									<CardDescription className="text-base">
										{" "}
										{currentChapter.name_meaning} -{" "}
										{currentChapter.name_transliterated}{" "}
									</CardDescription>{" "}
								</CardHeader>{" "}
								<CardContent>
									{" "}
									<p className="text-slate-700 leading-relaxed">
										{" "}
										{currentChapter.chapter_summary}{" "}
									</p>{" "}
								</CardContent>{" "}
							</Card>{" "}
							{/* Current Verse Display */}{" "}
							{currentVerse && (
								<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
									{" "}
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle className="text-xl">
												Verse {currentVerse.verse_number}
											</CardTitle>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setIsPlaying(!isPlaying)}
												className="flex items-center space-x-2"
											>
												{isPlaying ? (
													<Pause className="h-4 w-4" />
												) : (
													<Play className="h-4 w-4" />
												)}
												<span>{isPlaying ? "Pause" : "Play"}</span>
											</Button>
										</div>

										{/* Content Features Notice */}
										<div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
											<div className="flex flex-wrap gap-2 text-xs">
												<span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
													🕉️ Sanskrit
												</span>
												{currentVerse.transliteration && (
													<span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
														🔤 Transliteration
													</span>
												)}
												{currentVerse.word_meanings && (
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
												{currentVerse.commentaries &&
													currentVerse.commentaries.length > 0 && (
														<span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
															📚 Commentaries (
															{currentVerse.commentaries.length})
														</span>
													)}
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-6">
										{/* Sanskrit Text */}
										<div className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-lg">
											<h3 className="text-lg font-semibold mb-3 text-orange-800 dark:text-orange-200">
												Sanskrit (संस्कृत)
											</h3>
											<p className="text-xl leading-relaxed font-sanskrit text-slate-800 dark:text-slate-200 whitespace-pre-line">
												{currentVerse.text}
											</p>
										</div>
										{/* Transliteration */}
										{currentVerse.transliteration && (
											<div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 rounded-lg">
												<h3 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">
													Transliteration (IAST)
												</h3>
												<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line italic">
													{currentVerse.transliteration}
												</p>
												<p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
													Roman script pronunciation guide
												</p>
											</div>
										)}
										{/* Word Meanings */}
										<div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900 dark:to-cyan-900 rounded-lg border border-teal-200">
											<h3 className="text-lg font-semibold mb-3 text-teal-800 dark:text-teal-200 flex items-center gap-2">
												<span>📖</span> Word Meanings (पदार्थ)
											</h3>
											{currentVerse.word_meanings ? (
												<>
													<div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-white/50 dark:bg-slate-800/50 p-3 rounded border">
														{currentVerse.word_meanings}
													</div>
													<p className="text-xs text-teal-600 dark:text-teal-400 mt-2 italic">
														Word-by-word meanings and explanations
													</p>
												</>
											) : (
												<div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-800 p-3 rounded">
													Word meanings not available for this verse. Please
													check other translations and commentaries for detailed
													explanations.
												</div>
											)}
										</div>
										{/* English Translations */}
										{englishTranslations.length > 0 && (
											<div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
												{" "}
												<div className="flex items-center justify-between mb-3">
													{" "}
													<h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
														{" "}
														English Translation{" "}
													</h3>{" "}
													{englishTranslations.length > 1 && (
														<select
															className="text-sm bg-white border rounded px-2 py-1"
															value={selectedTranslationIndex}
															onChange={(e) =>
																setSelectedTranslationIndex(
																	Number(e.target.value),
																)
															}
														>
															{" "}
															{englishTranslations.map((translation, index) => (
																<option key={translation.id} value={index}>
																	{" "}
																	{translation.author_name}{" "}
																</option>
															))}{" "}
														</select>
													)}{" "}
												</div>{" "}
												<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
													{" "}
													{currentTranslation?.description}{" "}
												</p>{" "}
												<p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
													{" "}
													— {currentTranslation?.author_name}{" "}
												</p>{" "}
											</div>
										)}{" "}
										{/* Hindi Translations */}{" "}
										{hindiTranslations.length > 0 && (
											<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
												{" "}
												<h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
													{" "}
													Hindi Translation (हिंदी अनुवाद){" "}
												</h3>{" "}
												{hindiTranslations.map((translation) => (
													<div key={translation.id} className="mb-4 last:mb-0">
														{" "}
														<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
															{" "}
															{translation.description}{" "}
														</p>{" "}
														<p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
															{" "}
															— {translation.author_name}{" "}
														</p>{" "}
													</div>
												))}{" "}
											</div>
										)}{" "}
										{/* Commentaries */}{" "}
										{currentVerse.commentaries &&
											currentVerse.commentaries.length > 0 && (
												<div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg">
													{" "}
													<h3 className="text-lg font-semibold mb-3 text-purple-800 dark:text-purple-200">
														{" "}
														Commentaries (टिप्पणियां){" "}
													</h3>{" "}
													<div className="space-y-4 max-h-96 overflow-y-auto">
														{" "}
														{currentVerse.commentaries
															.slice(0, 3)
															.map((commentary) => (
																<div
																	key={commentary.id}
																	className="border-l-4 border-purple-300 pl-4"
																>
																	{" "}
																	<p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
																		{" "}
																		{commentary.description}{" "}
																	</p>{" "}
																	<p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
																		{" "}
																		— {commentary.author_name}{" "}
																	</p>{" "}
																</div>
															))}{" "}
													</div>{" "}
												</div>
											)}{" "}
										{/* Navigation */}{" "}
										<div className="flex justify-between items-center pt-4">
											{" "}
											<Button
												variant="outline"
												onClick={handlePreviousVerse}
												disabled={selectedVerse === 1}
											>
												{" "}
												← Previous Verse{" "}
											</Button>{" "}
											<span className="text-sm text-slate-500">
												{" "}
												{selectedVerse} of {currentChapter.verses_count}{" "}
											</span>{" "}
											<Button
												variant="outline"
												onClick={handleNextVerse}
												disabled={selectedVerse === currentChapter.verses_count}
											>
												Next Verse →
											</Button>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

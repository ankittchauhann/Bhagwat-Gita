import { ChapterHeader } from "@/components/chapter/ChapterHeader";
import { ChapterSummaryCard } from "@/components/chapter/ChapterSummaryCard";
import { VerseDisplay } from "@/components/chapter/VerseDisplay";
import { VerseSelector } from "@/components/chapter/VerseSelector";
import { Button } from "@/components/ui/button";
import { useGitaStore } from "@/store/gitaStore";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { startTransition, useCallback, useEffect, useState } from "react";

export function ChapterPage() {
	const navigate = useNavigate();
	const params = useParams({ from: "/chapter/$chapterId" });
	const search = useSearch({ from: "/chapter/$chapterId" });
	const chapterId = Number.parseInt(params.chapterId);
	const {
		currentChapter,
		currentVerse,
		loading,
		error,
		fetchChapter,
		fetchVerse,
	} = useGitaStore();
	const { setLastPosition, addToHistory, markVerseAsRead, lastPosition } =
		useReadingHistory();
	const [selectedVerse, setSelectedVerse] = useState<number>(search.verse || 1);

	// Memoized event handlers to prevent unnecessary re-renders
	const handleBackToChapters = useCallback(() => {
		navigate({ to: "/chapters" });
	}, [navigate]);

	const handleVerseSelect = useCallback(
		(verseNumber: number) => {
			startTransition(() => {
				setSelectedVerse(verseNumber);
				// Update URL with verse parameter
				navigate({
					to: "/chapter/$chapterId",
					params: { chapterId: chapterId.toString() },
					search: { verse: verseNumber },
					replace: true, // Don't add to history stack
				});
			});
			fetchVerse(chapterId, verseNumber);
		},
		[chapterId, fetchVerse, navigate],
	);

	const handlePreviousVerse = useCallback(() => {
		if (selectedVerse > 1) {
			startTransition(() => {
				handleVerseSelect(selectedVerse - 1);
			});
		}
	}, [selectedVerse, handleVerseSelect]);

	const handleNextVerse = useCallback(() => {
		if (currentChapter && selectedVerse < currentChapter.verses_count) {
			startTransition(() => {
				handleVerseSelect(selectedVerse + 1);
			});
		}
	}, [currentChapter, selectedVerse, handleVerseSelect]);

	// Sync selectedVerse when URL changes
	useEffect(() => {
		if (search.verse && search.verse !== selectedVerse) {
			setSelectedVerse(search.verse);
		}
	}, [search.verse, selectedVerse]);

	// Initialize from lastPosition if verse not in URL
	useEffect(() => {
		if (
			!search.verse &&
			lastPosition &&
			lastPosition.chapterId === chapterId &&
			lastPosition.verseNumber !== selectedVerse
		) {
			setSelectedVerse(lastPosition.verseNumber);
			navigate({
				to: "/chapter/$chapterId",
				params: { chapterId: chapterId.toString() },
				search: { verse: lastPosition.verseNumber },
				replace: true,
			});
		}
	}, [chapterId, lastPosition, search.verse, selectedVerse, navigate]);

	useEffect(() => {
		fetchChapter(chapterId);
		fetchVerse(chapterId, selectedVerse);
	}, [chapterId, fetchChapter, fetchVerse, selectedVerse]);

	// Auto-save reading progress whenever verse or chapter changes
	useEffect(() => {
		if (currentChapter && currentVerse) {
			// Save last position
			setLastPosition({
				chapterId: currentChapter.chapter_number,
				verseNumber: currentVerse.verse_number,
				chapterName: currentChapter.name,
				chapterNameTranslated: currentChapter.name_translated,
				timestamp: Date.now(),
			});

			// Add to history with verse preview
			addToHistory({
				chapterId: currentChapter.chapter_number,
				verseNumber: currentVerse.verse_number,
				chapterName: currentChapter.name,
				chapterNameTranslated: currentChapter.name_translated,
				versePreview: currentVerse.text?.substring(0, 100) || "",
				timestamp: Date.now(),
			});

			// Mark verse as read
			markVerseAsRead(currentChapter.chapter_number, currentVerse.verse_number);
		}
	}, [
		currentChapter,
		currentVerse,
		setLastPosition,
		addToHistory,
		markVerseAsRead,
	]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 w-full overflow-x-hidden">
				{/* Fixed Background Layer */}
				<div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 -z-10" />
				<div className="w-full max-w-7xl mx-auto px-4 py-8">
					<div className="flex items-center justify-center min-h-[50vh]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
							<p className="mt-4 text-slate-600">Loading chapter...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 flex items-center justify-center">
				{/* Fixed Background Layer */}
				<div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 -z-10" />
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
				{/* Fixed Background Layer */}
				<div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 -z-10" />
				<div className="text-center">
					<p className="text-slate-600">Chapter not found</p>
					<Button onClick={handleBackToChapters} className="mt-4">
						Back to Chapters
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 w-full overflow-scroll">
			{/* Fixed Background Layer */}
			<div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 -z-10" />
			<ChapterHeader chapter={currentChapter} onBack={handleBackToChapters} />
			<div className="w-full max-w-7xl mx-auto px-4 py-6 pt-24">
				<div className="grid lg:grid-cols-4 gap-6">
					<VerseSelector
						versesCount={currentChapter.verses_count}
						selectedVerse={selectedVerse}
						onSelect={handleVerseSelect}
					/>

					{/* Main Content - Verse Display */}
					<div className="lg:col-span-3 w-full min-w-0">
						<div
							className="space-y-6 transform-gpu will-change-scroll"
							style={{ contain: "layout style" }}
						>
							<ChapterSummaryCard chapter={currentChapter} />
							{currentVerse && (
								<VerseDisplay
									verse={currentVerse}
									versesCount={currentChapter.verses_count}
									selectedVerse={selectedVerse}
									onPreviousVerse={handlePreviousVerse}
									onNextVerse={handleNextVerse}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

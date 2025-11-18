import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, History } from "lucide-react";
import { useEffect } from "react";

export function ContinueReading() {
	const navigate = useNavigate();
	const { lastPosition, history, loadFromStorage } = useReadingHistory();

	// Load reading history from localStorage on mount
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	// Format timestamp to relative time
	const getRelativeTime = (timestamp: number) => {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);

		if (seconds < 60) return "just now";
		if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
		if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
		return new Date(timestamp).toLocaleDateString();
	};

	const handleContinueReading = () => {
		if (lastPosition) {
			navigate({
				to: "/chapter/$chapterId",
				params: { chapterId: lastPosition.chapterId.toString() },
				search: { verse: lastPosition.verseNumber },
			});
		}
	};

	const handleHistoryClick = (chapterId: number, verseNumber: number) => {
		navigate({
			to: "/chapter/$chapterId",
			params: { chapterId: chapterId.toString() },
			search: { verse: verseNumber },
		});
	};

	// If no reading history, don't show the component
	if (!lastPosition) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Continue Reading Card */}
			<Card className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
				<CardHeader>
					<div className="flex items-center space-x-2">
						<BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
						<CardTitle className="text-xl">Continue Reading</CardTitle>
					</div>
					<CardDescription className="text-slate-600 dark:text-slate-400">
						Pick up where you left off
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Last Position Info */}
						<div className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg">
							<div className="flex items-start justify-between">
								<div className="space-y-2 flex-1">
									<h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
										Chapter {lastPosition.chapterId}: Verse{" "}
										{lastPosition.verseNumber}
									</h3>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										{lastPosition.chapterNameTranslated}
									</p>
									<p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
										{lastPosition.chapterName}
									</p>
									<div className="flex items-center space-x-1 text-xs text-slate-500">
										<Clock className="h-3 w-3" />
										<span>{getRelativeTime(lastPosition.timestamp)}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Continue Button */}
						<Button
							onClick={handleContinueReading}
							className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 cursor-pointer"
							size="lg"
						>
							<span>Continue Reading</span>
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Reading History */}
			{history.length > 1 && (
				<Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
					<CardHeader>
						<div className="flex items-center space-x-2">
							<History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<CardTitle className="text-lg">Recent Reading History</CardTitle>
						</div>
						<CardDescription>Your recently viewed verses</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{history.slice(0, 5).map((entry, index) => (
								<button
									key={`${entry.chapterId}-${entry.verseNumber}-${index}`}
									onClick={() =>
										handleHistoryClick(entry.chapterId, entry.verseNumber)
									}
									type="button"
									className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-orange-700"
								>
									<div className="flex items-start justify-between">
										<div className="space-y-1 flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
													Chapter {entry.chapterId} · Verse {entry.verseNumber}
												</span>
											</div>
											<p className="text-xs text-slate-600 dark:text-slate-400 truncate">
												{entry.chapterNameTranslated}
											</p>
											{entry.versePreview && (
												<p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1 font-sanskrit">
													{entry.versePreview}...
												</p>
											)}
											<span className="text-xs text-slate-400 dark:text-slate-500">
												{getRelativeTime(entry.timestamp)}
											</span>
										</div>
										<ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
									</div>
								</button>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGitaStore } from "@/store/gitaStore";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { useEffect, useState } from "react";

export function ChaptersPage() {
	const navigate = useNavigate();
	const { chapters, loading, error, fetchChapters } = useGitaStore();
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchChapters();
	}, [fetchChapters]);

	const filteredChapters = chapters.filter(
		(chapter) =>
			chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chapter.name_transliterated
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			chapter.name_translated
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			chapter.name_meaning.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleChapterClick = (chapterId: number) => {
		navigate({
			to: "/chapter/$chapterId",
			params: { chapterId: chapterId.toString() },
			search: { verse: 1 }, // Always start at verse 1 when selecting from chapters list
		});
	};

	const handleBackToDashboard = () => {
		navigate({ to: "/" });
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 w-full overflow-x-hidden">
				<div className="w-full max-w-7xl mx-auto px-4 py-8">
					<div className="flex items-center justify-center min-h-[50vh]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
							<p className="mt-4 text-slate-600">Loading chapters...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 overflow-x-hidden">
				<div className="container mx-auto px-4 py-8 max-w-full">
					<div className="flex items-center justify-center min-h-[50vh]">
						<div className="text-center max-w-md mx-auto p-6">
							<div className="text-red-500 text-6xl mb-4">🚫</div>
							<h2 className="text-xl font-semibold text-slate-800 mb-2">
								Connection Issue
							</h2>
							<p className="text-red-600 mb-6 text-sm">{error}</p>
							<div className="space-y-3">
								<Button
									onClick={fetchChapters}
									className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
								>
									🔄 Try Again
								</Button>
								<Button
									variant="outline"
									onClick={handleBackToDashboard}
									className="ml-3"
								>
									← Back to Dashboard
								</Button>
							</div>
							<div className="mt-4 text-xs text-slate-500">
								<p>• Check your internet connection</p>
								<p>• The API server might be temporarily unavailable</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 w-full overflow-x-hidden">
			{/* Header */}
			<div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-orange-200 z-50 w-full">
				<div className="w-full max-w-7xl mx-auto px-4 py-3 md:py-4">
					{/* Desktop Layout */}
					<div className="hidden md:flex items-center justify-between">
						<div className="flex items-center space-x-4 min-w-0">
							<Button
								variant="ghost"
								onClick={handleBackToDashboard}
								className="hover:bg-orange-100 cursor-pointer flex-shrink-0"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<div className="min-w-0">
								<h1 className="text-2xl font-bold text-slate-800">
									All Chapters
								</h1>
								<p className="text-sm text-slate-600">
									श्रीमद्भगवद्गीता के सभी अध्याय
								</p>
							</div>
						</div>
						<div className="relative w-64 flex-shrink-0">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								placeholder="Search chapters..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Mobile Layout */}
					<div className="md:hidden space-y-3">
						{/* Top Row: Back Button + Title */}
						<div className="flex items-center space-x-3 min-w-0">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleBackToDashboard}
								className="hover:bg-orange-100 cursor-pointer flex-shrink-0"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								<span className="text-sm">Back</span>
							</Button>
							<div className="min-w-0 flex-1">
								<h1 className="text-lg font-bold text-slate-800 truncate">
									All Chapters
								</h1>
								<p className="text-xs text-slate-600 truncate">
									श्रीमद्भगवद्गीता के सभी अध्याय
								</p>
							</div>
						</div>

						{/* Search Bar */}
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								placeholder="Search chapters..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 text-sm w-full"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Chapters Grid */}
			<div className="w-full max-w-7xl mx-auto px-4 py-8 pt-32 md:pt-24">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{filteredChapters.map((chapter) => (
						<div key={chapter.id} className="w-full">
							<Card
								className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 h-full"
								onClick={() => handleChapterClick(chapter.id)}
							>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between mb-2">
										<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
											<span className="text-white font-bold text-sm">
												{chapter.chapter_number}
											</span>
										</div>
										<div className="flex items-center text-sm text-slate-500 flex-shrink-0">
											<BookOpen className="h-4 w-4 mr-1" />
											{chapter.verses_count} verses
										</div>
									</div>
									<CardTitle className="text-lg leading-tight">
										<div className="text-orange-700 font-sanskrit text-lg md:text-xl mb-1 break-words">
											{chapter.name}
										</div>
										<div className="text-slate-700 text-sm font-medium break-words">
											{chapter.name_transliterated}
										</div>
									</CardTitle>
									<CardDescription className="font-medium text-slate-600 break-words">
										{chapter.name_meaning}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="text-sm text-slate-600 line-clamp-4 leading-relaxed break-words">
										{chapter.chapter_summary}
									</p>
									<div className="mt-4 pt-4 border-t border-slate-200">
										<Button
											variant="ghost"
											size="sm"
											className="w-full justify-center hover:bg-orange-100 text-orange-700 cursor-pointer"
										>
											Read Chapter →
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

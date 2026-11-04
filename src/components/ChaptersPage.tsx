import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { useState } from "react";

const route = getRouteApi("/chapters");

export function ChaptersPage() {
	const navigate = useNavigate();
	const { chapters } = route.useLoaderData();
	const [searchTerm, setSearchTerm] = useState("");

	const query = searchTerm.trim().toLowerCase();
	const filteredChapters = chapters.filter((chapter) =>
		[
			chapter.name,
			chapter.nameTransliterated,
			chapter.nameTranslation,
			chapter.nameMeaning,
		].some((field) => field.toLowerCase().includes(query)),
	);

	const handleBackToDashboard = () => {
		navigate({ to: "/" });
	};

	const searchInput = (className: string) => (
		<>
			<Search
				className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400"
				aria-hidden="true"
			/>
			<Input
				type="search"
				aria-label="Search chapters"
				placeholder="Search chapters…"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className={className}
			/>
		</>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 w-full overflow-x-hidden">
			<div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-b border-orange-200 dark:border-slate-800 z-50 w-full">
				<div className="w-full max-w-7xl mx-auto px-4 py-3 md:py-4">
					<div className="hidden md:flex items-center justify-between">
						<div className="flex items-center space-x-4 min-w-0">
							<Button
								variant="ghost"
								onClick={handleBackToDashboard}
								className="hover:bg-orange-100 dark:hover:bg-slate-800 cursor-pointer flex-shrink-0"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<div className="min-w-0">
								<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
									All Chapters
								</h1>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									श्रीमद्भगवद्गीता के सभी अध्याय
								</p>
							</div>
						</div>
						<div className="relative w-64 flex-shrink-0">
							{searchInput("pl-10")}
						</div>
					</div>

					<div className="md:hidden space-y-3">
						<div className="flex items-center space-x-3 min-w-0">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleBackToDashboard}
								className="hover:bg-orange-100 dark:hover:bg-slate-800 cursor-pointer flex-shrink-0"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								<span className="text-sm">Back</span>
							</Button>
							<div className="min-w-0 flex-1">
								<h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
									All Chapters
								</h1>
								<p className="text-xs text-slate-600 dark:text-slate-300 truncate">
									श्रीमद्भगवद्गीता के सभी अध्याय
								</p>
							</div>
						</div>

						<div className="relative w-full">
							{searchInput("pl-10 text-sm w-full")}
						</div>
					</div>
				</div>
			</div>

			<div className="w-full max-w-7xl mx-auto px-4 py-8 pt-32 md:pt-24">
				{filteredChapters.length === 0 && (
					<p className="text-center text-slate-700 dark:text-slate-300 py-12">
						No chapters match “{searchTerm.trim()}”.
					</p>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{filteredChapters.map((chapter) => (
						<Link
							key={chapter.number}
							to="/chapter/$chapterId/verse/$verseNumber"
							params={{
								chapterId: String(chapter.number),
								verseNumber: "1",
							}}
							className="block w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
						>
							<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 h-full">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between mb-2">
										<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
											<span className="text-white font-bold text-sm">
												{chapter.number}
											</span>
										</div>
										<div className="flex items-center text-sm text-slate-600 dark:text-slate-300 flex-shrink-0">
											<BookOpen className="h-4 w-4 mr-1" aria-hidden="true" />
											{chapter.versesCount} verses
										</div>
									</div>
									<CardTitle className="text-lg leading-tight">
										<div
											lang="sa"
											className="text-orange-700 dark:text-orange-300 font-sanskrit text-lg md:text-xl mb-1 break-words"
										>
											{chapter.name}
										</div>
										<div className="text-slate-700 dark:text-slate-200 text-sm font-medium break-words">
											{chapter.nameTransliterated}
										</div>
									</CardTitle>
									<CardDescription className="font-medium text-slate-600 dark:text-slate-300 break-words">
										{chapter.nameMeaning}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed break-words">
										{chapter.summary}
									</p>
									<div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
										<span className="flex h-9 w-full items-center justify-center rounded-md text-sm font-medium text-orange-700 dark:text-orange-300">
											Read Chapter →
										</span>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

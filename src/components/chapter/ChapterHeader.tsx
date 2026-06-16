import { Button } from "@/components/ui/button";
import type { Chapter } from "@/store/gitaStore";
import { ArrowLeft, BookOpen } from "lucide-react";

export function ChapterHeader({
	chapter,
	onBack,
}: {
	chapter: Chapter;
	onBack: () => void;
}) {
	return (
		<div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-orange-200 z-50 w-full">
			<div className="w-full max-w-7xl mx-auto px-4 py-3 md:py-4">
				{/* Desktop Layout */}
				<div className="hidden md:flex items-center justify-between">
					<div className="flex items-center space-x-4 min-w-0">
						<Button
							variant="ghost"
							onClick={onBack}
							className="hover:bg-orange-100 cursor-pointer flex-shrink-0"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold text-slate-800">
								Chapter {chapter.chapter_number}: {chapter.name_meaning}
							</h1>
							<p className="text-sm text-slate-600">
								{chapter.name_transliterated}
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-2 text-sm text-slate-500 flex-shrink-0">
						<BookOpen className="h-4 w-4" />
						<span>{chapter.verses_count} verses</span>
					</div>
				</div>

				{/* Mobile Layout */}
				<div className="md:hidden space-y-3">
					{/* Top Row: Back Button + Chapter Number */}
					<div className="flex items-center justify-between min-w-0">
						<div className="flex items-center space-x-3 min-w-0 flex-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={onBack}
								className="hover:bg-orange-100 cursor-pointer flex-shrink-0"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								<span className="text-sm">Back</span>
							</Button>
							<div className="text-lg font-bold text-slate-800 truncate">
								Chapter {chapter.chapter_number}
							</div>
						</div>
						<div className="flex items-center space-x-1 text-xs text-slate-500 flex-shrink-0">
							<BookOpen className="h-3 w-3" />
							<span>{chapter.verses_count}</span>
						</div>
					</div>

					{/* Title Section */}
					<div className="space-y-1 min-w-0">
						<h1 className="text-base font-bold text-slate-800 leading-tight break-words">
							{chapter.name_meaning}
						</h1>
						<p className="text-xs text-slate-600 truncate">
							{chapter.name_transliterated}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

import { Button } from "@/components/ui/button";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookmarkCheck } from "lucide-react";
import { useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
	const navigate = useNavigate();
	const { lastPosition, loadFromStorage } = useReadingHistory();

	// Load reading history on mount
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	const handleResumeReading = () => {
		if (lastPosition) {
			navigate({
				to: "/chapter/$chapterId",
				params: { chapterId: lastPosition.chapterId.toString() },
				search: { verse: lastPosition.verseNumber },
			});
		}
	};

	return (
		<header className="p-2 flex gap-2 bg-white dark:bg-gray-900 text-black dark:text-white justify-between transition-colors">
			<nav className="flex flex-row items-center">
				<div className="px-2 font-bold">
					<Link
						to="/"
						className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Home
					</Link>
				</div>
			</nav>
			<div className="flex items-center gap-2">
				{lastPosition && (
					<Button
						onClick={handleResumeReading}
						variant="outline"
						size="sm"
						className="hidden sm:flex items-center gap-1 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
						title={`Resume: Chapter ${lastPosition.chapterId}, Verse ${lastPosition.verseNumber}`}
					>
						<BookmarkCheck className="h-4 w-4" />
						<span className="text-xs">Resume</span>
					</Button>
				)}
				<ThemeToggle />
			</div>
		</header>
	);
}

import { Button } from "@/components/ui/button";

export function VerseNavigationControls({
	selectedVerse,
	versesCount,
	onPrevious,
	onNext,
}: {
	selectedVerse: number;
	versesCount: number;
	onPrevious: () => void;
	onNext: () => void;
}) {
	return (
		<div className="pt-4">
			{/* Mobile Layout - Stacked */}
			<div className="flex flex-col space-y-3 sm:hidden">
				<span className="text-sm text-slate-500 text-center">
					{selectedVerse} of {versesCount}
				</span>
				<div className="flex space-x-3">
					<Button
						variant="outline"
						onClick={onPrevious}
						disabled={selectedVerse === 1}
						className="cursor-pointer flex-1"
						size="sm"
					>
						← Prev
					</Button>
					<Button
						variant="outline"
						onClick={onNext}
						disabled={selectedVerse === versesCount}
						className="cursor-pointer flex-1"
						size="sm"
					>
						Next →
					</Button>
				</div>
			</div>

			{/* Desktop Layout - Horizontal */}
			<div className="hidden sm:flex justify-between items-center">
				<Button
					variant="outline"
					onClick={onPrevious}
					disabled={selectedVerse === 1}
					className="cursor-pointer"
				>
					← Previous Verse
				</Button>
				<span className="text-sm text-slate-500">
					{selectedVerse} of {versesCount}
				</span>
				<Button
					variant="outline"
					onClick={onNext}
					disabled={selectedVerse === versesCount}
					className="cursor-pointer"
				>
					Next Verse →
				</Button>
			</div>
		</div>
	);
}

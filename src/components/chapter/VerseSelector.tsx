import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { memo, useMemo } from "react";

// Memoized Verse Button Component for better performance
const VerseButton = memo(
	({
		verseNumber,
		isSelected,
		onSelect,
	}: {
		verseNumber: number;
		isSelected: boolean;
		onSelect: (verse: number) => void;
	}) => (
		<Button
			variant={isSelected ? "default" : "ghost"}
			size="sm"
			aria-current={isSelected ? "true" : undefined}
			className={`w-full justify-start text-left cursor-pointer ${
				isSelected
					? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm"
					: "hover:bg-orange-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
			}`}
			onClick={() => onSelect(verseNumber)}
		>
			<span className="mr-2">श्लोक</span> {verseNumber}
		</Button>
	),
);

export function VerseSelector({
	versesCount,
	selectedVerse,
	onSelect,
}: {
	versesCount: number;
	selectedVerse: number;
	onSelect: (verse: number) => void;
}) {
	const verseNumbers = useMemo(
		() => Array.from({ length: versesCount }, (_, i) => i + 1),
		[versesCount],
	);

	const verseButtons = useMemo(
		() =>
			verseNumbers.map((verseNumber) => (
				<VerseButton
					key={verseNumber}
					verseNumber={verseNumber}
					isSelected={selectedVerse === verseNumber}
					onSelect={onSelect}
				/>
			)),
		[verseNumbers, selectedVerse, onSelect],
	);

	return (
		<>
			{/* Sidebar - Verses List (Desktop) */}
			<div className="hidden lg:block lg:col-span-1">
				<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto">
					<CardHeader>
						<CardTitle className="text-lg">All Verses</CardTitle>
						<CardDescription>श्लोक सूची - {versesCount} total</CardDescription>
					</CardHeader>
					<CardContent>
						<nav aria-label="Verses" className="space-y-2">
							{verseButtons}
						</nav>
					</CardContent>
				</Card>
			</div>
			{/* Verse Dropdown (Mobile) */}
			<div className="lg:hidden w-full max-w-7xl mx-auto px-4  pt-12">
				<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="pt-6">
						<div className="space-y-2">
							<div
								id="verse-select-label"
								className="text-sm font-medium text-slate-700 dark:text-slate-200"
							>
								Select Verse (श्लोक चुनें)
							</div>
							<Select
								value={selectedVerse.toString()}
								onValueChange={(value) => onSelect(Number.parseInt(value))}
							>
								<SelectTrigger
									className="w-full"
									aria-labelledby="verse-select-label"
								>
									<SelectValue placeholder="Choose a verse..." />
								</SelectTrigger>
								<SelectContent className="max-h-60 w-full">
									{verseNumbers.map((verseNumber) => (
										<SelectItem
											key={verseNumber}
											value={verseNumber.toString()}
										>
											श्लोक {verseNumber}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

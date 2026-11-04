import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ChapterInfo } from "@/lib/gitaData";

export function ChapterSummaryCard({ chapter }: { chapter: ChapterInfo }) {
	return (
		<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
			<CardHeader>
				<CardTitle
					lang="sa"
					className="text-xl text-orange-700 dark:text-orange-300 font-sanskrit"
				>
					{chapter.name}
				</CardTitle>
				<CardDescription className="text-base">
					{chapter.nameMeaning} - {chapter.nameTransliterated}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-slate-700 dark:text-slate-300 leading-relaxed">
					{chapter.summary}
				</p>
			</CardContent>
		</Card>
	);
}

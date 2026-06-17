import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Chapter } from "@/store/gitaStore";

export function ChapterSummaryCard({ chapter }: { chapter: Chapter }) {
	return (
		<Card
			className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
			style={{ contain: "layout style paint" }}
		>
			<CardHeader>
				<CardTitle className="text-xl text-orange-700 font-sanskrit">
					{chapter.name}
				</CardTitle>
				<CardDescription className="text-base">
					{chapter.name_meaning} - {chapter.name_transliterated}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-slate-700 leading-relaxed">
					{chapter.chapter_summary}
				</p>
			</CardContent>
		</Card>
	);
}

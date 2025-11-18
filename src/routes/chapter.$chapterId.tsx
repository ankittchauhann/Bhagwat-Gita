import { createFileRoute } from "@tanstack/react-router";
import { ChapterPage } from "../components/ChapterPage";

interface ChapterSearch {
	verse?: number;
}

export const Route = createFileRoute("/chapter/$chapterId")({
	component: ChapterPage,
	validateSearch: (search: Record<string, unknown>): ChapterSearch => {
		return {
			verse: Number(search.verse) || undefined,
		};
	},
});

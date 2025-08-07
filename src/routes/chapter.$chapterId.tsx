import { createFileRoute } from "@tanstack/react-router";
import { ChapterPage } from "../components/ChapterPage";

export const Route = createFileRoute("/chapter/$chapterId")({
	component: ChapterPage,
});

import { loadChapters } from "@/lib/gitaData";
import { SITE_TITLE } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { ChaptersPage } from "../components/ChaptersPage";
import { PageLoading, RouteError } from "../components/RouteStatus";

export const Route = createFileRoute("/chapters")({
	loader: () => loadChapters(),
	head: () => ({
		meta: [
			{ title: `All 18 Chapters · ${SITE_TITLE}` },
			{
				name: "description",
				content:
					"All 18 chapters of the Bhagavad Gita with their Sanskrit names, meanings, verse counts and summaries.",
			},
		],
	}),
	pendingComponent: () => <PageLoading label="Loading chapters…" />,
	errorComponent: RouteError,
	component: ChaptersPage,
});

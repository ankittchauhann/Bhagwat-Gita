import { loadChapters } from "@/lib/gitaData";
import { SITE_TITLE } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { PageLoading, RouteError } from "../components/RouteStatus";
import { SearchPage } from "../components/search/SearchPage";

interface SearchParams {
	q?: string;
}

export const Route = createFileRoute("/search")({
	validateSearch: (search: Record<string, unknown>): SearchParams => ({
		q: typeof search.q === "string" && search.q ? search.q : undefined,
	}),
	loader: async () => {
		const { chapters } = await loadChapters();
		return { chapters };
	},
	head: () => ({
		meta: [
			{ title: `Search · ${SITE_TITLE}` },
			{
				name: "description",
				content:
					"Search the Bhagavad Gita by verse number or by words in its translations, transliteration and Sanskrit.",
			},
		],
	}),
	pendingComponent: () => <PageLoading label="Loading search…" />,
	errorComponent: RouteError,
	component: SearchPage,
});

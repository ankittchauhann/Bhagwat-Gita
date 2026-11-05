import { loadCredits } from "@/lib/gitaData";
import { SITE_TITLE } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "../components/AboutPage";
import { PageLoading, RouteError } from "../components/RouteStatus";

export const Route = createFileRoute("/about")({
	loader: () => loadCredits(),
	head: () => ({
		meta: [
			{ title: `About and sources · ${SITE_TITLE}` },
			{
				name: "description",
				content:
					"Where the Sanskrit text, the seven translations, the sixteen commentaries and the pictures in this Bhagavad Gita reader come from, and their terms.",
			},
		],
	}),
	pendingComponent: () => <PageLoading label="Loading…" />,
	errorComponent: RouteError,
	component: AboutPage,
});

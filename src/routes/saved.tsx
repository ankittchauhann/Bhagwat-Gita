import { SITE_TITLE } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { SavedPage } from "../components/saved/SavedPage";

export const Route = createFileRoute("/saved")({
	head: () => ({
		meta: [
			{ title: `Saved verses · ${SITE_TITLE}` },
			{
				name: "description",
				content: "The verses you saved, with your notes, kept in this browser.",
			},
		],
	}),
	component: SavedPage,
});

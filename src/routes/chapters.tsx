import { createFileRoute } from "@tanstack/react-router";
import { ChaptersPage } from "../components/ChaptersPage";

export const Route = createFileRoute("/chapters")({
	component: ChaptersPage,
});

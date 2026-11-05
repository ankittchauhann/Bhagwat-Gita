import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { NotFoundPage } from "../components/RouteStatus";
import { AppNotices } from "../components/offline/AppNotices";
import { RetryWhenOnline } from "../components/offline/RetryWhenOnline";
import { SearchShortcut } from "../components/search/SearchShortcut";

export const Route = createRootRoute({
	component: () => (
		<>
			<Outlet />
			<AppNotices />
			<RetryWhenOnline />
			<SearchShortcut />
			<TanStackRouterDevtools />
		</>
	),
	notFoundComponent: NotFoundPage,
});

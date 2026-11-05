import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { NotFoundPage } from "../components/RouteStatus";
import { AppNotices } from "../components/offline/AppNotices";
import { RetryWhenOnline } from "../components/offline/RetryWhenOnline";

export const Route = createRootRoute({
	component: () => (
		<>
			<Outlet />
			<AppNotices />
			<RetryWhenOnline />
			<TanStackRouterDevtools />
		</>
	),
	notFoundComponent: NotFoundPage,
});

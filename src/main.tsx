import sanskritFontUrl from "@fontsource/tiro-devanagari-sanskrit/files/tiro-devanagari-sanskrit-devanagari-400-normal.woff2?url";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { RouteHead } from "./components/RouteHead";
import { NotFoundPage } from "./components/RouteStatus";
import { captureInstallPrompt } from "./lib/install";
import { followSystemTheme } from "./lib/theme";
import { startOfflineLibrary } from "./store/offlineStore";
import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

// Preload the Sanskrit font so the verse doesn't wait for the stylesheet's @font-face to be discovered.
const fontPreloadLink = document.createElement("link");
fontPreloadLink.rel = "preload";
fontPreloadLink.as = "font";
fontPreloadLink.type = "font/woff2";
fontPreloadLink.href = sanskritFontUrl;
fontPreloadLink.crossOrigin = "anonymous";
document.head.appendChild(fontPreloadLink);

followSystemTheme();
captureInstallPrompt();
startOfflineLibrary();

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	defaultNotFoundComponent: NotFoundPage,
	// Rendered outside the route tree so page metadata updates even when a not-found replaces the root layout.
	InnerWrap: ({ children }) => (
		<>
			<RouteHead />
			{children}
		</>
	),
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

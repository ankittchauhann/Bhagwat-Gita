import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const NOT_FOUND_TITLE = `Page not found · ${SITE_TITLE}`;

function upsertHeadElement(selector: string, create: () => HTMLElement) {
	return (
		document.head.querySelector(selector) ?? document.head.appendChild(create())
	);
}

// Applies route `head()` values to the tags already in index.html, so the static defaults stay for crawlers without JavaScript.
export function RouteHead() {
	const head = useRouterState({
		select: (state) => {
			const notFound = state.matches.some(
				(match) => match.status === "notFound" || match.globalNotFound,
			);
			let title = SITE_TITLE;
			let description = SITE_DESCRIPTION;
			for (const match of state.matches) {
				for (const meta of match.meta ?? []) {
					if (meta?.title) {
						title = meta.title;
					} else if (meta?.name === "description" && meta.content) {
						description = String(meta.content);
					}
				}
			}
			return {
				title: notFound ? NOT_FOUND_TITLE : title,
				description,
				notFound,
				pathname: state.location.pathname,
			};
		},
		structuralSharing: true,
	});

	useEffect(() => {
		document.title = head.title;

		upsertHeadElement('meta[name="description"]', () => {
			const meta = document.createElement("meta");
			meta.setAttribute("name", "description");
			return meta;
		}).setAttribute("content", head.description);

		const canonical = upsertHeadElement('link[rel="canonical"]', () => {
			const link = document.createElement("link");
			link.setAttribute("rel", "canonical");
			return link;
		});
		const robots = document.head.querySelector('meta[name="robots"]');

		if (head.notFound) {
			canonical.remove();
			upsertHeadElement('meta[name="robots"]', () => {
				const meta = document.createElement("meta");
				meta.setAttribute("name", "robots");
				return meta;
			}).setAttribute("content", "noindex");
		} else {
			canonical.setAttribute("href", `${SITE_URL}${head.pathname}`);
			robots?.remove();
		}
	}, [head]);

	return null;
}

// Mirror the upstream paths built in api/_handlers. The upstream API answers
// unslashed URLs with a 307 to its own origin, which the browser blocks (CORS).
export const toUpstreamPath = (path: string) => {
	const [pathname, query] = path.replace(/^\/api/, "").split("?");
	const needsSlash = !pathname.endsWith("/") && !pathname.endsWith("/verses");
	const upstream = needsSlash ? `${pathname}/` : pathname;
	return query ? `${upstream}?${query}` : upstream;
};

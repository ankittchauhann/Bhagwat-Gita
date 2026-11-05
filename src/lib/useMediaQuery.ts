import { useCallback, useSyncExternalStore } from "react";

// Keep in sync with the 1024px breakpoint in src/styles.css.
export const WIDE_SCREEN = "(min-width: 1024px)";

export function useMediaQuery(query: string) {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () => list.removeEventListener("change", onChange);
		},
		[query],
	);
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);
}

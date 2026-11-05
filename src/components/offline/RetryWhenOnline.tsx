import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

const RETRY_DELAYS = [0, 1000, 3000, 8000];

// Lives in the root: "online" can fire before requests get through, and a failed retry remounts the error page.
export function RetryWhenOnline() {
	const router = useRouter();

	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];
		const retry = () => {
			for (const delay of RETRY_DELAYS) {
				timers.push(
					setTimeout(() => {
						if (
							router.state.matches.some((match) => match.status === "error")
						) {
							router.invalidate();
						}
					}, delay),
				);
			}
		};
		window.addEventListener("online", retry);
		return () => {
			window.removeEventListener("online", retry);
			for (const timer of timers) {
				clearTimeout(timer);
			}
		};
	}, [router]);

	return null;
}

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

// Marks its subtree as ready, then reveals each [data-reveal] child once it scrolls into view.
export function RevealArea({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = ref.current;
		if (
			!root ||
			!("IntersectionObserver" in window) ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-revealed");
						observer.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: "0px 0px -8% 0px" },
		);
		const observeNew = () => {
			for (const element of root.querySelectorAll(
				"[data-reveal]:not(.is-revealed)",
			)) {
				observer.observe(element);
			}
		};
		observeNew();
		// Sections that arrive after the first render (today's verse) are observed too.
		const additions = new MutationObserver(observeNew);
		additions.observe(root, { childList: true, subtree: true });
		root.classList.add("reveal-ready");
		return () => {
			additions.disconnect();
			observer.disconnect();
		};
	}, []);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

export function revealDelay(step: number) {
	return { "--reveal-delay": `${step * 80}ms` } as CSSProperties;
}

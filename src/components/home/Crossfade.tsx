import { type Picture, pictureSources } from "@/lib/credits";
import { useEffect, useState } from "react";

const HOLD = 6000;
const LOAD_OTHERS_AFTER = 2500;

// The same text in three scripts, changing slowly like light in a room; still under reduced motion and while the tab is hidden.
export function Crossfade({
	pictures,
	className,
}: {
	pictures: Picture[];
	className?: string;
}) {
	const [active, setActive] = useState(0);
	const [rendered, setRendered] = useState(1);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		// The other pictures wait until the first screen has loaded, so they never compete with it.
		const load = window.setTimeout(
			() => setRendered(pictures.length),
			LOAD_OTHERS_AFTER,
		);
		const timer = window.setInterval(() => {
			if (!document.hidden) {
				setActive((index) => (index + 1) % pictures.length);
			}
		}, HOLD);
		return () => {
			window.clearTimeout(load);
			window.clearInterval(timer);
		};
	}, [pictures.length]);

	return (
		<figure className={className}>
			<div className="crossfade absolute inset-0">
				{pictures.slice(0, rendered).map((picture, index) => (
					<img
						key={picture.id}
						{...pictureSources(picture)}
						sizes="(min-width: 1024px) 50vw, 100vw"
						width={picture.width}
						height={picture.height}
						alt={picture.alt}
						data-active={index === active}
						fetchPriority={index === 0 ? "high" : "low"}
					/>
				))}
			</div>
			<figcaption className="absolute top-3 left-3 rounded-[6px] bg-leaf px-3 py-2 text-[14px] lg:top-auto lg:bottom-3">
				{pictures[active].caption}
			</figcaption>
		</figure>
	);
}

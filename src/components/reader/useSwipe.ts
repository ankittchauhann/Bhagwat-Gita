import { type RefObject, useEffect, useRef } from "react";

const MIN_DISTANCE = 60;
const MAX_DURATION = 700;

export function useSwipe(
	ref: RefObject<HTMLElement | null>,
	{
		onSwipeLeft,
		onSwipeRight,
	}: { onSwipeLeft: () => void; onSwipeRight: () => void },
) {
	const handlers = useRef({ onSwipeLeft, onSwipeRight });
	handlers.current = { onSwipeLeft, onSwipeRight };

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		let start: { x: number; y: number; time: number } | null = null;

		const onStart = (event: TouchEvent) => {
			const touch = event.touches[0];
			start =
				event.touches.length === 1
					? { x: touch.clientX, y: touch.clientY, time: event.timeStamp }
					: null;
		};
		const onEnd = (event: TouchEvent) => {
			const touch = event.changedTouches[0];
			if (!start || !touch) {
				return;
			}
			const dx = touch.clientX - start.x;
			const dy = touch.clientY - start.y;
			const isSwipe =
				Math.abs(dx) >= MIN_DISTANCE &&
				Math.abs(dx) > Math.abs(dy) * 2 &&
				event.timeStamp - start.time <= MAX_DURATION &&
				!window.getSelection()?.toString();
			start = null;
			if (isSwipe) {
				if (dx < 0) {
					handlers.current.onSwipeLeft();
				} else {
					handlers.current.onSwipeRight();
				}
			}
		};

		element.addEventListener("touchstart", onStart, { passive: true });
		element.addEventListener("touchend", onEnd, { passive: true });
		return () => {
			element.removeEventListener("touchstart", onStart);
			element.removeEventListener("touchend", onEnd);
		};
	}, [ref]);
}

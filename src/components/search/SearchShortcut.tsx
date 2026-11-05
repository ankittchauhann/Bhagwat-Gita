import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function isTyping(target: EventTarget | null) {
	return (
		target instanceof HTMLElement &&
		(target.isContentEditable ||
			["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
	);
}

// "/" opens search from anywhere, as on many reading sites, unless the reader is typing or a sheet is open.
export function SearchShortcut() {
	const navigate = useNavigate();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				event.key !== "/" ||
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				isTyping(event.target) ||
				document.querySelector("dialog[open]")
			) {
				return;
			}
			event.preventDefault();
			const input = document.getElementById("search-input");
			if (input) {
				input.focus();
			} else {
				navigate({ to: "/search" });
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [navigate]);

	return null;
}

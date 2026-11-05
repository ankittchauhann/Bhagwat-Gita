import { useSyncExternalStore } from "react";

interface InstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let installPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function setInstallPrompt(event: InstallPromptEvent | null) {
	installPrompt = event;
	for (const listener of listeners) {
		listener();
	}
}

// Chrome fires this once, early; keep it so About can offer an Install button later.
export function captureInstallPrompt() {
	window.addEventListener("beforeinstallprompt", (event) =>
		setInstallPrompt(event as InstallPromptEvent),
	);
	window.addEventListener("appinstalled", () => setInstallPrompt(null));
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function useInstallPrompt() {
	return useSyncExternalStore(
		subscribe,
		() => installPrompt,
		() => null,
	);
}

export async function install() {
	const event = installPrompt;
	if (!event) {
		return;
	}
	await event.prompt();
	const { outcome } = await event.userChoice;
	if (outcome === "accepted") {
		setInstallPrompt(null);
	}
}

export function isInstalled() {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		("standalone" in navigator && navigator.standalone === true)
	);
}

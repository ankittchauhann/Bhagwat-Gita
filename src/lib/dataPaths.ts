// Shared by the app and vite.config.ts (the service worker), so it must not touch the DOM.
export const DATA_VERSION = "v2";

export const DATA_BASE_URL = `/data/${DATA_VERSION}`;

export const TEXT_CACHE = `gita-text-${DATA_VERSION}`;
export const COMMENTARY_CACHE = `gita-commentary-${DATA_VERSION}`;
export const IMAGE_CACHE = "gita-images";

export const KEPT_EVENT = "gita:kept";

export function chapterPath(chapterNumber: number) {
	return `/chapter/${chapterNumber}.json`;
}

export function commentaryPath(chapterNumber: number, verseNumber: number) {
	return `/commentary/${chapterNumber}/${verseNumber}.json`;
}

export function searchPath(script: "latin" | "devanagari") {
	return `/search/${script}.json`;
}

export function dataUrl(path: string) {
	return `${DATA_BASE_URL}${path}`;
}

const SAVED_PATH = /^\/(chapter|commentary)\/(\d+)(?:\/(\d+))?\.json$/;

export type SavedFile =
	| { kind: "chapter"; chapter: number }
	| { kind: "commentary"; chapter: number; verse: number };

export function savedFileOf(url: string): SavedFile | null {
	const { pathname } = new URL(url, "http://localhost");
	if (!pathname.startsWith(`${DATA_BASE_URL}/`)) {
		return null;
	}
	const match = SAVED_PATH.exec(pathname.slice(DATA_BASE_URL.length));
	if (!match) {
		return null;
	}
	const [, kind, chapter, verse] = match;
	if (kind === "chapter" && verse === undefined) {
		return { kind, chapter: Number(chapter) };
	}
	if (kind === "commentary" && verse !== undefined) {
		return { kind, chapter: Number(chapter), verse: Number(verse) };
	}
	return null;
}

export function cacheNameFor(path: string) {
	if (path.startsWith("/chapter/") || path.startsWith("/search/")) {
		return TEXT_CACHE;
	}
	if (path.startsWith("/commentary/")) {
		return COMMENTARY_CACHE;
	}
	return null;
}

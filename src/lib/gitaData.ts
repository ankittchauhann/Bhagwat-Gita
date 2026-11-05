import {
	KEPT_EVENT,
	cacheNameFor,
	chapterPath,
	commentaryPath,
	dataUrl,
} from "./dataPaths";

export { DATA_VERSION } from "./dataPaths";

export type Language = "english" | "hindi" | "sanskrit";

export const SPEAKERS = [
	"krishna",
	"arjuna",
	"sanjaya",
	"dhritarashtra",
] as const;
export type Speaker = (typeof SPEAKERS)[number];

export interface Author {
	id: number;
	name: string;
	language: Language;
}

export interface ChapterInfo {
	number: number;
	name: string;
	nameTransliterated: string;
	nameTranslation: string;
	nameMeaning: string;
	summary: string;
	summaryHindi: string;
	versesCount: number;
}

export interface ChaptersIndex {
	source: { repository: string; commit: string };
	chapters: ChapterInfo[];
}

export interface Credits {
	source: { repository: string; commit: string };
	counts: {
		chapters: number;
		verses: number;
		translators: number;
		commentators: number;
		commentaries: number;
	};
	speakers: Record<Speaker, number>;
	translators: Author[];
	commentators: Author[];
}

export interface Verse {
	number: number;
	speaker: Speaker;
	// The "… uvāca" line that opens a speech, present only on its first verse.
	speakerLine: { sanskrit: string; transliteration: string } | null;
	lines: string[];
	transliteration: string[];
	wordMeanings: string;
	translations: Record<string, string>;
	commentators: number[];
}

export interface ChapterFile {
	chapter: ChapterInfo;
	translators: Author[];
	commentators: Author[];
	verses: Verse[];
}

export type VerseCommentary = Record<string, string>;

// Bytes each part takes once saved on the device.
export interface DownloadSizes {
	chapters: { number: number; text: number; commentary: number }[];
}

export class DataLoadError extends Error {
	readonly status: number | null;

	constructor(path: string, status: number | null) {
		super(
			status === null
				? `Couldn't load ${path}. Check your connection and try again.`
				: `Couldn't load ${path} (HTTP ${status}).`,
		);
		this.name = "DataLoadError";
		this.status = status;
	}
}

const cache = new Map<string, Promise<unknown>>();

// Every chapter and commentary that loads is kept for offline reading, even before the service worker takes over.
async function keep(path: string, response: Response) {
	const cacheName = cacheNameFor(path);
	if (!cacheName || typeof caches === "undefined") {
		return;
	}
	try {
		const store = await caches.open(cacheName);
		if (!(await store.match(dataUrl(path)))) {
			await store.put(dataUrl(path), response);
			window.dispatchEvent(new CustomEvent(KEPT_EVENT, { detail: path }));
		}
	} catch {
		// Storage can be full or blocked; reading still works online.
	}
}

function loadJson<T>(path: string): Promise<T> {
	const cached = cache.get(path);
	if (cached) {
		return cached as Promise<T>;
	}

	const request = fetch(dataUrl(path))
		.catch(() => {
			throw new DataLoadError(path, null);
		})
		.then(async (response) => {
			if (!response.ok) {
				throw new DataLoadError(path, response.status);
			}
			const [data] = await Promise.all([
				response.clone().json() as Promise<T>,
				keep(path, response),
			]);
			return data;
		})
		.catch((error: unknown) => {
			cache.delete(path);
			throw error;
		});

	cache.set(path, request);
	return request;
}

export function loadChapters() {
	return loadJson<ChaptersIndex>("/chapters.json");
}

export function loadCredits() {
	return loadJson<Credits>("/credits.json");
}

export function loadDownloadSizes() {
	return loadJson<DownloadSizes>("/sizes.json");
}

export function loadChapter(chapterNumber: number) {
	return loadJson<ChapterFile>(chapterPath(chapterNumber));
}

export function loadCommentary(chapterNumber: number, verseNumber: number) {
	return loadJson<VerseCommentary>(commentaryPath(chapterNumber, verseNumber));
}

export function clearDataCache() {
	cache.clear();
}

export const CHAPTER_COUNT = 18;

const POSITIVE_INTEGER = /^[1-9]\d*$/;

export function parseChapterNumber(value: string): number | null {
	if (!POSITIVE_INTEGER.test(value)) {
		return null;
	}
	const chapterNumber = Number(value);
	return chapterNumber >= 1 && chapterNumber <= CHAPTER_COUNT
		? chapterNumber
		: null;
}

export function parseVerseNumber(
	value: string,
	versesCount: number,
): number | null {
	if (!POSITIVE_INTEGER.test(value)) {
		return null;
	}
	const verseNumber = Number(value);
	return verseNumber >= 1 && verseNumber <= versesCount ? verseNumber : null;
}

import {
	COMMENTARY_CACHE,
	IMAGE_CACHE,
	TEXT_CACHE,
	chapterPath,
	commentaryPath,
	dataUrl,
	savedFileOf,
} from "./dataPaths";
import type { ChapterInfo, DownloadSizes } from "./gitaData";

export interface SavedState {
	text: ReadonlySet<number>;
	commentary: ReadonlyMap<number, number>;
}

export interface DownloadItem {
	cacheName: string;
	path: string;
}

export function offlineSupported() {
	return typeof caches !== "undefined";
}

export function savedStateOf(urls: string[]): SavedState {
	const text = new Set<number>();
	const commentary = new Map<number, number>();
	for (const url of urls) {
		const file = savedFileOf(url);
		if (file?.kind === "chapter") {
			text.add(file.chapter);
		} else if (file?.kind === "commentary") {
			commentary.set(file.chapter, (commentary.get(file.chapter) ?? 0) + 1);
		}
	}
	return { text, commentary };
}

export async function readSavedState(): Promise<SavedState> {
	const urls: string[] = [];
	for (const name of [TEXT_CACHE, COMMENTARY_CACHE]) {
		const cache = await caches.open(name);
		for (const request of await cache.keys()) {
			urls.push(request.url);
		}
	}
	return savedStateOf(urls);
}

export function textItems(chapterNumbers: number[]): DownloadItem[] {
	return chapterNumbers.map((chapterNumber) => ({
		cacheName: TEXT_CACHE,
		path: chapterPath(chapterNumber),
	}));
}

export function commentaryItems(chapter: ChapterInfo): DownloadItem[] {
	return Array.from({ length: chapter.versesCount }, (_, index) => ({
		cacheName: COMMENTARY_CACHE,
		path: commentaryPath(chapter.number, index + 1),
	}));
}

export class DownloadError extends Error {
	constructor(readonly path: string) {
		super(`Couldn't download ${path}.`);
		this.name = "DownloadError";
	}
}

export async function saveFiles(
	items: DownloadItem[],
	{
		signal,
		onProgress,
		fetcher = fetch,
		concurrency = 6,
	}: {
		signal?: AbortSignal;
		onProgress?: (done: number, total: number) => void;
		fetcher?: typeof fetch;
		concurrency?: number;
	} = {},
) {
	const stores = new Map<string, Cache>();
	const pending: DownloadItem[] = [];
	for (const item of items) {
		let store = stores.get(item.cacheName);
		if (!store) {
			store = await caches.open(item.cacheName);
			stores.set(item.cacheName, store);
		}
		if (!(await store.match(dataUrl(item.path)))) {
			pending.push(item);
		}
	}

	let done = items.length - pending.length;
	onProgress?.(done, items.length);

	const stopped = new AbortController();
	const stop = () => stopped.abort(signal?.reason);
	signal?.addEventListener("abort", stop, { once: true });
	let next = 0;

	const work = async () => {
		while (next < pending.length) {
			stopped.signal.throwIfAborted();
			const item = pending[next++];
			const url = dataUrl(item.path);
			const response = await fetcher(url, { signal: stopped.signal });
			if (!response.ok) {
				throw new DownloadError(item.path);
			}
			await stores.get(item.cacheName)?.put(url, response);
			done += 1;
			onProgress?.(done, items.length);
		}
	};

	try {
		await Promise.all(
			Array.from({ length: Math.min(concurrency, pending.length) }, () =>
				work().catch((error: unknown) => {
					stopped.abort(error);
					throw error;
				}),
			),
		);
	} finally {
		signal?.removeEventListener("abort", stop);
	}
}

export function textBytesLeft(sizes: DownloadSizes, saved: SavedState) {
	return sizes.chapters
		.filter((entry) => !saved.text.has(entry.number))
		.reduce((sum, entry) => sum + entry.text, 0);
}

export function commentaryBytesLeft(
	sizes: DownloadSizes,
	chapters: ChapterInfo[],
	saved: SavedState,
) {
	return chapters.reduce((sum, chapter) => {
		const size = sizes.chapters.find(
			(entry) => entry.number === chapter.number,
		);
		const left =
			chapter.versesCount - (saved.commentary.get(chapter.number) ?? 0);
		return sum + ((size?.commentary ?? 0) * left) / chapter.versesCount;
	}, 0);
}

export function formatBytes(bytes: number) {
	if (bytes < 1_000_000) {
		return `${Math.max(1, Math.round(bytes / 1000))} KB`;
	}
	const megabytes = bytes / 1_000_000;
	return `${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} MB`;
}

export async function removeDownloads() {
	await Promise.all([
		caches.delete(TEXT_CACHE),
		caches.delete(COMMENTARY_CACHE),
	]);
}

const CURRENT_CACHES = new Set([TEXT_CACHE, COMMENTARY_CACHE, IMAGE_CACHE]);

export async function pruneOldCaches() {
	for (const name of await caches.keys()) {
		if (name.startsWith("gita-") && !CURRENT_CACHES.has(name)) {
			await caches.delete(name);
		}
	}
}

export async function storageStatus() {
	const storage =
		typeof navigator === "undefined" ? undefined : navigator.storage;
	const [estimate, persisted] = await Promise.all([
		storage?.estimate?.().catch(() => null) ?? null,
		storage?.persisted?.().catch(() => false) ?? false,
	]);
	return { usage: estimate?.usage ?? null, persisted };
}

export async function askToKeepStorage() {
	try {
		return (await navigator.storage?.persist?.()) ?? false;
	} catch {
		return false;
	}
}

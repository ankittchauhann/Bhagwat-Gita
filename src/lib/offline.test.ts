import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	COMMENTARY_CACHE,
	DATA_VERSION,
	TEXT_CACHE,
	cacheNameFor,
	savedFileOf,
} from "./dataPaths";
import type { ChapterInfo, DownloadSizes } from "./gitaData";
import {
	DownloadError,
	commentaryBytesLeft,
	commentaryItems,
	formatBytes,
	pruneOldCaches,
	saveFiles,
	savedStateOf,
	textBytesLeft,
	textItems,
} from "./offline";

class MemoryCache {
	entries = new Map<string, Response>();

	async match(url: string) {
		return this.entries.get(url);
	}

	async put(url: string, response: Response) {
		this.entries.set(url, response);
	}

	async keys() {
		return [...this.entries.keys()].map(
			(url) => new Request(new URL(url, "http://localhost")),
		);
	}
}

class MemoryCacheStorage {
	stores = new Map<string, MemoryCache>();

	async open(name: string) {
		let store = this.stores.get(name);
		if (!store) {
			store = new MemoryCache();
			this.stores.set(name, store);
		}
		return store;
	}

	async keys() {
		return [...this.stores.keys()];
	}

	async delete(name: string) {
		return this.stores.delete(name);
	}
}

const base = `/data/${DATA_VERSION}`;

function chapter(number: number, versesCount: number) {
	return { number, versesCount } as ChapterInfo;
}

let storage: MemoryCacheStorage;

beforeEach(() => {
	storage = new MemoryCacheStorage();
	vi.stubGlobal("caches", storage);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("savedFileOf", () => {
	it("reads chapter and commentary files of the current data version", () => {
		expect(savedFileOf(`http://localhost${base}/chapter/2.json`)).toEqual({
			kind: "chapter",
			chapter: 2,
		});
		expect(
			savedFileOf(`https://example.org${base}/commentary/18/78.json`),
		).toEqual({ kind: "commentary", chapter: 18, verse: 78 });
	});

	it("ignores other files and older data versions", () => {
		expect(savedFileOf(`${base}/chapters.json`)).toBeNull();
		expect(savedFileOf(`${base}/chapter/2/1.json`)).toBeNull();
		expect(savedFileOf(`${base}/commentary/2.json`)).toBeNull();
		expect(savedFileOf("/data/v1/chapter/2.json")).toBeNull();
	});

	it("picks the cache each kind of file is kept in", () => {
		expect(cacheNameFor("/chapter/2.json")).toBe(TEXT_CACHE);
		expect(cacheNameFor("/commentary/2/47.json")).toBe(COMMENTARY_CACHE);
		expect(cacheNameFor("/chapters.json")).toBeNull();
	});
});

describe("savedStateOf", () => {
	it("lists saved chapters and counts saved commentaries per chapter", () => {
		const state = savedStateOf([
			`${base}/chapter/2.json`,
			`${base}/chapter/18.json`,
			`${base}/commentary/2/1.json`,
			`${base}/commentary/2/2.json`,
			`${base}/commentary/3/1.json`,
			`${base}/sizes.json`,
		]);
		expect([...state.text]).toEqual([2, 18]);
		expect([...state.commentary]).toEqual([
			[2, 2],
			[3, 1],
		]);
	});
});

describe("download sizes", () => {
	const sizes: DownloadSizes = {
		chapters: [
			{ number: 1, text: 100_000, commentary: 1_000_000 },
			{ number: 2, text: 200_000, commentary: 4_000_000 },
		],
	};
	const chapters = [chapter(1, 10), chapter(2, 40)];

	it("counts only the chapters that are not saved yet", () => {
		const saved = savedStateOf([`${base}/chapter/1.json`]);
		expect(textBytesLeft(sizes, saved)).toBe(200_000);
	});

	it("counts the share of each chapter's commentaries still to download", () => {
		const saved = savedStateOf([
			...Array.from(
				{ length: 10 },
				(_, index) => `${base}/commentary/1/${index + 1}.json`,
			),
			...Array.from(
				{ length: 10 },
				(_, index) => `${base}/commentary/2/${index + 1}.json`,
			),
		]);
		expect(commentaryBytesLeft(sizes, chapters, saved)).toBe(3_000_000);
	});

	it("formats bytes the way phones report storage", () => {
		expect(formatBytes(873)).toBe("1 KB");
		expect(formatBytes(187_696)).toBe("188 KB");
		expect(formatBytes(3_027_908)).toBe("3.0 MB");
		expect(formatBytes(25_718_381)).toBe("26 MB");
	});
});

describe("saveFiles", () => {
	const items = [...textItems([2]), ...commentaryItems(chapter(2, 4))];

	function okFetch() {
		return vi.fn(async (url: string) => new Response(JSON.stringify({ url })));
	}

	it("lists the chapter file and one commentary file per verse", () => {
		expect(items.map((item) => item.path)).toEqual([
			"/chapter/2.json",
			"/commentary/2/1.json",
			"/commentary/2/2.json",
			"/commentary/2/3.json",
			"/commentary/2/4.json",
		]);
	});

	it("saves every missing file and skips the ones already saved", async () => {
		const text = await storage.open(TEXT_CACHE);
		await text.put(`${base}/chapter/2.json`, new Response("{}"));
		const fetcher = okFetch();
		const progress: number[] = [];

		await saveFiles(items, {
			fetcher: fetcher as unknown as typeof fetch,
			onProgress: (done) => progress.push(done),
		});

		expect(fetcher).toHaveBeenCalledTimes(4);
		expect(progress[0]).toBe(1);
		expect(progress.at(-1)).toBe(5);
		const commentary = await storage.open(COMMENTARY_CACHE);
		expect(commentary.entries.size).toBe(4);
	});

	it("never runs more requests at once than allowed", async () => {
		let running = 0;
		let most = 0;
		const fetcher = vi.fn(async () => {
			running += 1;
			most = Math.max(most, running);
			await new Promise((resolve) => setTimeout(resolve, 5));
			running -= 1;
			return new Response("{}");
		});

		await saveFiles(items, {
			fetcher: fetcher as unknown as typeof fetch,
			concurrency: 2,
		});

		expect(most).toBe(2);
		expect(fetcher).toHaveBeenCalledTimes(5);
	});

	it("stops at the first failed file and keeps what was saved", async () => {
		const fetcher = vi.fn(async (url: string) =>
			url.endsWith("/3.json")
				? new Response("", { status: 404 })
				: new Response("{}"),
		);

		await expect(
			saveFiles(items, {
				fetcher: fetcher as unknown as typeof fetch,
				concurrency: 1,
			}),
		).rejects.toBeInstanceOf(DownloadError);

		const commentary = await storage.open(COMMENTARY_CACHE);
		expect([...commentary.entries.keys()]).toEqual([
			`${base}/commentary/2/1.json`,
			`${base}/commentary/2/2.json`,
		]);
	});

	it("stops when the reader cancels", async () => {
		const controller = new AbortController();
		const fetcher = vi.fn(async () => {
			controller.abort();
			return new Response("{}");
		});

		await expect(
			saveFiles(items, {
				fetcher: fetcher as unknown as typeof fetch,
				signal: controller.signal,
				concurrency: 1,
			}),
		).rejects.toThrow();
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});

describe("pruneOldCaches", () => {
	it("deletes this app's caches from older data versions only", async () => {
		await storage.open("gita-text-v1");
		await storage.open(TEXT_CACHE);
		await storage.open("workbox-precache-v2");

		await pruneOldCaches();

		expect(await storage.keys()).toEqual([TEXT_CACHE, "workbox-precache-v2"]);
	});
});

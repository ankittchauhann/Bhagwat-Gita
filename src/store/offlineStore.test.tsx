import type { ChapterInfo } from "@/lib/gitaData";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const stores = new Map<string, MemoryCache>();
const memoryCaches = {
	async open(name: string) {
		let store = stores.get(name);
		if (!store) {
			store = new MemoryCache();
			stores.set(name, store);
		}
		return store;
	},
	async keys() {
		return [...stores.keys()];
	},
	async delete(name: string) {
		return stores.delete(name);
	},
};

const chapters = [
	{ number: 1, versesCount: 2, name: "", nameTranslation: "One" },
	{ number: 2, versesCount: 3, name: "", nameTranslation: "Two" },
] as ChapterInfo[];

async function loadStore() {
	vi.resetModules();
	return import("./offlineStore");
}

beforeEach(() => {
	stores.clear();
	vi.stubGlobal("caches", memoryCaches);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("offline store", () => {
	it("keeps a failed download as failed, and another download still starts", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: string) =>
				url.includes("/commentary/")
					? new Response("", { status: 500 })
					: new Response("{}"),
			),
		);
		const { useOfflineStore } = await loadStore();

		await useOfflineStore.getState().downloadChapter(chapters[1]);
		expect(useOfflineStore.getState().job).toMatchObject({
			target: { kind: "chapter", chapter: 2 },
			status: "failed",
		});

		await useOfflineStore.getState().downloadAllText(chapters);
		expect(useOfflineStore.getState().job).toBeNull();
		expect([...useOfflineStore.getState().text].sort()).toEqual([1, 2]);
	});

	it("starts a new download straight after Stop, and the stopped one leaves it alone", async () => {
		let releaseFirst: () => void = () => {};
		vi.stubGlobal(
			"fetch",
			vi.fn(
				(url: string, init?: RequestInit) =>
					new Promise<Response>((resolve, reject) => {
						if (url.includes("/commentary/")) {
							releaseFirst = () => resolve(new Response("{}"));
							init?.signal?.addEventListener("abort", () =>
								reject(new DOMException("Stopped", "AbortError")),
							);
						} else {
							resolve(new Response("{}"));
						}
					}),
			),
		);
		const { useOfflineStore } = await loadStore();

		const first = useOfflineStore.getState().downloadChapter(chapters[1]);
		await vi.waitFor(() =>
			expect(useOfflineStore.getState().job?.done).toBeGreaterThan(0),
		);
		useOfflineStore.getState().stop();
		const second = useOfflineStore.getState().downloadAllText(chapters);
		expect(useOfflineStore.getState().job?.target).toEqual({ kind: "text" });

		releaseFirst();
		await Promise.all([first, second]);
		expect(useOfflineStore.getState().job).toBeNull();
		expect([...useOfflineStore.getState().text].sort()).toEqual([1, 2]);
	});

	it("does not block a chapter's download because another chapter's failed", async () => {
		const { useOfflineStore } = await loadStore();
		const { ChapterDownload } = await import(
			"@/components/offline/ChapterDownload"
		);
		useOfflineStore.setState({
			loaded: true,
			job: {
				target: { kind: "chapter", chapter: 1 },
				done: 1,
				total: 3,
				status: "failed",
			},
		});

		render(<ChapterDownload chapter={chapters[1]} />);

		const button = screen.getByRole("button", { name: /^Download chapter 2/ });
		expect(button.hasAttribute("disabled")).toBe(false);
		expect(screen.queryByText("Another download is running.")).toBeNull();
	});
});

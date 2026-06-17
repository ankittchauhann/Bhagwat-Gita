import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGitaStore } from "./gitaStore";

function mockFetchOnce(response: Partial<Response> & { ok: boolean }) {
	const fetchMock = vi.fn().mockResolvedValue(response as Response);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("useGitaStore", () => {
	beforeEach(() => {
		useGitaStore.setState({
			chapters: [],
			currentChapter: null,
			verses: [],
			currentVerse: null,
			loading: false,
			error: null,
		});
		vi.unstubAllGlobals();
	});

	it("fetchChapters calls the same-origin /api proxy and stores the result", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: async () => [{ id: 1, chapter_number: 1 }],
		});

		await useGitaStore.getState().fetchChapters();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url] = fetchMock.mock.calls[0];
		expect(url).toBe("/api/chapters?skip=0&limit=18");
		expect(useGitaStore.getState().chapters).toEqual([
			{ id: 1, chapter_number: 1 },
		]);
		expect(useGitaStore.getState().loading).toBe(false);
		expect(useGitaStore.getState().error).toBeNull();
	});

	it("fetchChapters never falls back to a direct RapidAPI call on failure", async () => {
		const fetchMock = mockFetchOnce({ ok: false, status: 500 } as Response);

		await useGitaStore.getState().fetchChapters();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(useGitaStore.getState().error).toBe(
			"API request failed with status: 500",
		);
		expect(useGitaStore.getState().loading).toBe(false);
	});

	it("fetchChapter requests /api/chapters/:id", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: async () => ({ id: 2, chapter_number: 2 }),
		});

		await useGitaStore.getState().fetchChapter(2);

		expect(fetchMock.mock.calls[0][0]).toBe("/api/chapters/2");
		expect(useGitaStore.getState().currentChapter).toEqual({
			id: 2,
			chapter_number: 2,
		});
	});

	it("fetchVerses requests /api/chapters/:id/verses", async () => {
		const fetchMock = mockFetchOnce({ ok: true, json: async () => [] });

		await useGitaStore.getState().fetchVerses(3);

		expect(fetchMock.mock.calls[0][0]).toBe("/api/chapters/3/verses");
	});

	it("fetchVerse requests /api/chapters/:id/verses/:verseNumber", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: async () => ({ id: 9, verse_number: 5 }),
		});

		await useGitaStore.getState().fetchVerse(4, 5);

		expect(fetchMock.mock.calls[0][0]).toBe("/api/chapters/4/verses/5");
		expect(useGitaStore.getState().currentVerse).toEqual({
			id: 9,
			verse_number: 5,
		});
	});
});

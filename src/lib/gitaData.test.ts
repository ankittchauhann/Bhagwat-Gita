import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	DATA_VERSION,
	DataLoadError,
	clearDataCache,
	loadChapter,
	parseChapterNumber,
	parseVerseNumber,
} from "./gitaData";

describe("parseChapterNumber", () => {
	it("accepts chapters 1 to 18 only", () => {
		expect(parseChapterNumber("1")).toBe(1);
		expect(parseChapterNumber("18")).toBe(18);
		expect(parseChapterNumber("0")).toBeNull();
		expect(parseChapterNumber("19")).toBeNull();
		expect(parseChapterNumber("02")).toBeNull();
		expect(parseChapterNumber("2a")).toBeNull();
		expect(parseChapterNumber("")).toBeNull();
	});
});

describe("parseVerseNumber", () => {
	it("accepts verses within the chapter's count", () => {
		expect(parseVerseNumber("47", 72)).toBe(47);
		expect(parseVerseNumber("72", 72)).toBe(72);
		expect(parseVerseNumber("73", 72)).toBeNull();
		expect(parseVerseNumber("0", 72)).toBeNull();
		expect(parseVerseNumber("1.5", 72)).toBeNull();
	});
});

describe("loadChapter", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		clearDataCache();
		fetchMock.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("requests each chapter file once and reuses it", async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ chapter: { number: 2 } }), { status: 200 }),
		);

		const first = await loadChapter(2);
		const second = await loadChapter(2);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(
			`/data/${DATA_VERSION}/chapter/2.json`,
		);
		expect(second).toBe(first);
	});

	it("reports the HTTP status and tries again on the next call", async () => {
		fetchMock
			.mockResolvedValueOnce(new Response("missing", { status: 404 }))
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ chapter: { number: 3 } }), {
					status: 200,
				}),
			);

		await expect(loadChapter(3)).rejects.toMatchObject({
			name: "DataLoadError",
			status: 404,
		});
		await expect(loadChapter(3)).resolves.toEqual({ chapter: { number: 3 } });
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("reports a network failure without a status", async () => {
		fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

		const error = await loadChapter(4).catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(DataLoadError);
		expect((error as DataLoadError).status).toBeNull();
	});
});

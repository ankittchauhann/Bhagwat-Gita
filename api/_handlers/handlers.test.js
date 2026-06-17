import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import chapterHandler from "./chapter.js";
import chaptersHandler from "./chapters.js";
import verseHandler from "./verse.js";
import versesHandler from "./verses.js";

function createRes() {
	return {
		statusCode: undefined,
		body: undefined,
		headers: {},
		setHeader(key, value) {
			this.headers[key] = value;
		},
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.body = payload;
			return this;
		},
		end() {
			return this;
		},
	};
}

const ENV = {
	RAPIDAPI_HOST: "bhagavad-gita3.p.rapidapi.com",
	RAPIDAPI_KEY: "test-key-not-the-real-one",
	RAPIDAPI_BASE_URL: "https://bhagavad-gita3.p.rapidapi.com/v2",
};

beforeEach(() => {
	Object.assign(process.env, ENV);
});

afterEach(() => {
	for (const key of Object.keys(ENV)) {
		delete process.env[key];
	}
	vi.unstubAllGlobals();
});

describe.each([
	["chaptersHandler", chaptersHandler, { query: { skip: "0", limit: "18" } }],
	["chapterHandler", chapterHandler, { query: { chapterId: "1" } }],
	["versesHandler", versesHandler, { query: { chapterId: "1" } }],
	[
		"verseHandler",
		verseHandler,
		{ query: { chapterId: "1", verseNumber: "5" } },
	],
])("%s", (_name, handler, baseReq) => {
	it("handles an OPTIONS preflight without calling RapidAPI", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const res = createRes();

		await handler({ ...baseReq, method: "OPTIONS" }, res);

		expect(res.statusCode).toBe(200);
		expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("forwards the RapidAPI key only server-side and returns upstream data", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true }),
		});
		vi.stubGlobal("fetch", fetchMock);
		const res = createRes();

		await handler({ ...baseReq, method: "GET" }, res);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ ok: true });

		const [url, options] = fetchMock.mock.calls[0];
		expect(url).toContain(ENV.RAPIDAPI_BASE_URL);
		expect(options.headers["x-rapidapi-key"]).toBe(ENV.RAPIDAPI_KEY);
		expect(options.headers["x-rapidapi-host"]).toBe(ENV.RAPIDAPI_HOST);
	});

	it("returns 500 without leaking the API key when env vars are missing", async () => {
		// biome-ignore lint/performance/noDelete: assigning undefined would coerce to the string "undefined" in process.env
		delete process.env.RAPIDAPI_KEY;
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const res = createRes();

		await handler({ ...baseReq, method: "GET" }, res);

		expect(res.statusCode).toBe(500);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(JSON.stringify(res.body)).not.toContain(ENV.RAPIDAPI_KEY);
	});

	it("returns 500 when the upstream RapidAPI request fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 503 }),
		);
		const res = createRes();

		await handler({ ...baseReq, method: "GET" }, res);

		expect(res.statusCode).toBe(500);
		expect(res.body.message).toContain("503");
	});
});

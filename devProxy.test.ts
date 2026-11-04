import { describe, expect, it } from "vitest";
import { toUpstreamPath } from "./devProxy";

describe("toUpstreamPath", () => {
	it("matches the upstream paths used by the serverless handlers", () => {
		expect(toUpstreamPath("/api/chapters?skip=0&limit=18")).toBe(
			"/chapters/?skip=0&limit=18",
		);
		expect(toUpstreamPath("/api/chapters/2")).toBe("/chapters/2/");
		expect(toUpstreamPath("/api/chapters/2/verses")).toBe(
			"/chapters/2/verses",
		);
		expect(toUpstreamPath("/api/chapters/2/verses/1")).toBe(
			"/chapters/2/verses/1/",
		);
	});

	it("does not double an existing trailing slash", () => {
		expect(toUpstreamPath("/api/chapters/2/")).toBe("/chapters/2/");
	});
});

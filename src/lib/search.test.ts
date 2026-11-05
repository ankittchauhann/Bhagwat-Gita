import { readFileSync } from "node:fs";
import MiniSearch from "minisearch";
import { describe, expect, it } from "vitest";
import type { ChaptersIndex, SearchFile } from "./gitaData";
import {
	INDEX_OPTIONS,
	type SearchDocument,
	highlight,
	normalizeTerm,
	parseReference,
	queryOptions,
	scriptOf,
	searchDocuments,
	verseResult,
} from "./search";

const { chapters } = JSON.parse(
	readFileSync("public/data/v2/chapters.json", "utf8"),
) as ChaptersIndex;

function file(script: "latin" | "devanagari") {
	return JSON.parse(
		readFileSync(`public/data/v2/search/${script}.json`, "utf8"),
	) as SearchFile;
}

function index(searchFile: SearchFile) {
	const miniSearch = new MiniSearch<SearchDocument>(INDEX_OPTIONS);
	miniSearch.addAll(searchDocuments(searchFile));
	return miniSearch;
}

describe("parseReference", () => {
	it.each([
		["2.47", { chapter: 2, verse: 47 }],
		["2:47", { chapter: 2, verse: 47 }],
		["2 47", { chapter: 2, verse: 47 }],
		["2,47", { chapter: 2, verse: 47 }],
		["ch 2 v 47", { chapter: 2, verse: 47 }],
		["Chapter 2 verse 47", { chapter: 2, verse: 47 }],
		["ch2v47", { chapter: 2, verse: 47 }],
		["BG 2.47", { chapter: 2, verse: 47 }],
		["Bhagavad Gita 18.66.", { chapter: 18, verse: 66 }],
		["२.४७", { chapter: 2, verse: 47 }],
		["chapter 13", { chapter: 13, verse: null }],
		["7", { chapter: 7, verse: null }],
	])("reads %s", (input, expected) => {
		expect(parseReference(input, chapters)).toEqual(expected);
	});

	it.each(["2.73", "19.1", "0", "2.0", "duty", "2.47 duty", "47"])(
		"rejects %s",
		(input) => {
			expect(parseReference(input, chapters)).toBeNull();
		},
	);
});

describe("text search", () => {
	const latin = file("latin");
	const english = index(latin);

	it("drops Latin diacritics but keeps Devanagari marks", () => {
		expect(normalizeTerm("Karmaṇy")).toBe("karmany");
		expect(normalizeTerm("कर्मण्येवाधिकारस्ते")).toBe("कर्मण्येवाधिकारस्ते");
		expect(scriptOf("duty")).toBe("latin");
		expect(scriptOf("कर्म")).toBe("devanagari");
	});

	it("puts verses with every word first", () => {
		const hits = english.search(
			"action without attachment",
			queryOptions("AND"),
		);
		expect(hits.length).toBeGreaterThan(5);
		expect(hits.slice(0, 5).map((hit) => hit.id)).toContain("3.19");
	});

	it("finds the transliteration without diacritics", () => {
		const hits = english.search("karmany evadhikaras", queryOptions("AND"));
		expect(hits[0]?.id).toBe("2.47");
	});

	it("matches the word still being typed as a prefix", () => {
		const hits = english.search("steady mi", queryOptions("AND"));
		expect(hits.length).toBeGreaterThan(0);
	});

	it("searches the Sanskrit and Hindi in Devanagari", () => {
		const devanagari = index(file("devanagari"));
		const hits = devanagari.search("कर्मण्येवाधिकारस्ते", queryOptions("AND"));
		expect(hits[0]?.id).toBe("2.47");
	});

	it("shows the translation that matches most, highlighting the matched words", () => {
		const [hit] = english.search("fruits inaction", queryOptions("AND"));
		const result = verseResult(
			latin,
			{ id: hit.id, terms: hit.terms },
			null,
			"Transliteration",
		);
		expect(result).toMatchObject({ chapter: 2, verse: 47, speaker: "krishna" });
		expect(
			result?.segments.filter((segment) => segment.match).map((s) => s.text),
		).toEqual(expect.arrayContaining(["fruits", "inaction"]));
	});

	it("prefers the reader's own translator when matches tie", () => {
		const author = latin.authors[2];
		const result = verseResult(
			latin,
			{ id: "2.47", terms: [] },
			author.id,
			"Transliteration",
		);
		expect(result?.source).toBe(author.name);
	});
});

describe("highlight", () => {
	it("marks whole words and keeps the rest of the text in runs", () => {
		expect(highlight("Act, without attachment.", new Set(["without"]))).toEqual(
			[
				{ text: "Act, ", match: false },
				{ text: "without", match: true },
				{ text: " attachment.", match: false },
			],
		);
		expect(
			highlight("saṅgo ’stvakarmaṇi", new Set(["sango"])).map((s) => s.match),
		).toEqual([true, false]);
	});
});

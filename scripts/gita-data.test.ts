import { describe, expect, it } from "vitest";
import {
	type SourceAuthoredText,
	type SourceData,
	buildData,
	sitemapXml,
	splitSpeaker,
	verseReference,
} from "./gita-data";

describe("splitSpeaker", () => {
	it("separates a speaker line written on its own line and drops blank lines", () => {
		expect(
			splitSpeaker(
				"धृतराष्ट्र उवाच\n\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\n\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय।।1.1।।\n ",
			),
		).toEqual({
			speaker: "धृतराष्ट्र उवाच",
			text: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय।।1.1।।",
		});
	});

	it("separates a speaker line that runs into the verse", () => {
		expect(
			splitSpeaker("अर्जुन उवाचएवं सततयुक्ता ये भक्तास्त्वां पर्युपासते।।12.1।।"),
		).toEqual({
			speaker: "अर्जुन उवाच",
			text: "एवं सततयुक्ता ये भक्तास्त्वां पर्युपासते।।12.1।।",
		});
	});

	it("does not treat उवाच inside a verse as a speaker line", () => {
		const text =
			"भीष्मद्रोणप्रमुखतः सर्वेषां च महीक्षिताम्।\nउवाच पार्थ पश्यैतान्समवेतान्कुरूनिति।।1.25।।";
		expect(splitSpeaker(text)).toEqual({ speaker: null, text });
	});
});

describe("verseReference", () => {
	it("reads the chapter and verse at the end of the Sanskrit text", () => {
		expect(verseReference("मा कर्मफलहेतुर्भूर्मा ते।।2.47।।\n ")).toEqual({
			chapter: 2,
			verse: 47,
		});
		expect(verseReference("no reference here")).toBeNull();
	});
});

function authored(
	author_id: number,
	authorName: string,
	lang: string,
	description: string,
): SourceAuthoredText {
	return { verse_id: 1, author_id, authorName, lang, description };
}

function fixture(): SourceData {
	return {
		chapters: [
			{
				chapter_number: 1,
				chapter_summary: " Summary ",
				chapter_summary_hindi: "सारांश",
				name: "अर्जुनविषादयोग",
				name_meaning: "Arjuna's Dilemma",
				name_translation: "Arjuna Visada Yoga",
				name_transliterated: "Arjun Viṣhād Yog",
				verses_count: 1,
			},
		],
		verses: [
			{
				id: 1,
				chapter_number: 1,
				verse_number: 1,
				text: "अर्जुन उवाच\n\nपहली पंक्ति।\n\nदूसरी पंक्ति।।1.1।।\n ",
				transliteration: " arjuna uvācha\nline\n",
				word_meanings: " words ",
			},
		],
		translations: [
			authored(16, "Swami Sivananda", "english", "English 16"),
			authored(18, "Swami Adidevananda", "english", "English 18"),
			authored(19, "Swami Gambirananda", "english", "English 19"),
			authored(20, "Dr. S. Sankaranarayan", "english", "English 20"),
			authored(21, "Shri Purohit Swami", "english", "English 21"),
			authored(1, "Swami Ramsukhdas", "hindi", "हिंदी 1"),
			authored(17, "Swami Tejomayananda", "hindi", "हिंदी 17"),
		],
		commentaries: [
			authored(10, "Sri Abhinavgupta", "sanskrit", ""),
			authored(2, "Swami Chinmayananda", "hindi", "टीका"),
			authored(16, "Swami Sivananda", "english", "Commentary"),
		],
	};
}

describe("buildData", () => {
	it("keys translations by author, orders authors by language and skips empty commentary", () => {
		const { data } = buildData(fixture());
		const [file] = data.chapterFiles;
		const [verse] = file.verses;

		expect(file.translators.map((author) => author.name)).toEqual([
			"Dr. S. Sankaranarayan",
			"Shri Purohit Swami",
			"Swami Adidevananda",
			"Swami Gambirananda",
			"Swami Sivananda",
			"Swami Ramsukhdas",
			"Swami Tejomayananda",
		]);
		expect(verse.translations["16"]).toBe("English 16");
		expect(verse.translations["1"]).toBe("हिंदी 1");
		expect(verse).toMatchObject({
			number: 1,
			speaker: "अर्जुन उवाच",
			text: "पहली पंक्ति।\nदूसरी पंक्ति।।1.1।।",
			transliteration: "arjuna uvācha\nline",
			wordMeanings: "words",
			commentators: [16, 2],
		});
		expect(data.commentary.get("1/1")).toEqual({
			"16": "Commentary",
			"2": "टीका",
		});
		expect(file.chapter.summary).toBe("Summary");
	});

	it("reports counts that differ from the full Gita", () => {
		const { errors } = buildData(fixture());
		expect(errors).toContain("expected 18 chapters, found 1");
		expect(errors).toContain("expected 701 verses, chapters list 1");
	});

	it("reports a verse with a missing translation", () => {
		const source = fixture();
		source.translations.pop();
		const { errors } = buildData(source);
		expect(errors).toContain("1.1: expected 7 translations, found 6");
	});

	it("reports Sanskrit text that does not end with its own reference", () => {
		const source = fixture();
		source.verses[0].text = "पहली पंक्ति।।1.2।।";
		const { errors } = buildData(source);
		expect(errors).toContain(
			"1.1: Sanskrit text does not end with its reference",
		);
	});
});

describe("sitemapXml", () => {
	it("lists home, the chapter list and every verse", () => {
		const { data } = buildData(fixture());
		const xml = sitemapXml("https://example.com", data.chapterFiles);
		expect(xml).toContain("<loc>https://example.com/</loc>");
		expect(xml).toContain("<loc>https://example.com/chapters</loc>");
		expect(xml).toContain("<loc>https://example.com/chapter/1/verse/1</loc>");
		expect(xml.match(/<url>/g)).toHaveLength(3);
	});
});

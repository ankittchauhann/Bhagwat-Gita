import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { type ChapterFile, DATA_VERSION } from "../src/lib/gitaData";
import {
	type SourceAuthoredText,
	type SourceData,
	buildData,
	sitemapXml,
	speakerOf,
	splitSpeaker,
	splitTransliteration,
	verseLines,
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

	it("separates Krishna's speaker line, written on its own line or run in", () => {
		expect(splitSpeaker("श्री भगवानुवाच\nकुतस्त्वा कश्मलमिदं।।2.2।।")).toEqual({
			speaker: "श्री भगवानुवाच",
			text: "कुतस्त्वा कश्मलमिदं।।2.2।।",
		});
		expect(splitSpeaker("श्री भगवानुवाचइदं शरीरं कौन्तेय।।13.2।।").speaker).toBe(
			"श्री भगवानुवाच",
		);
	});

	it("spells Sanjaya the same way everywhere", () => {
		expect(splitSpeaker("संजय उवाच\nएवमुक्तो।।1.24।।").speaker).toBe("सञ्जय उवाच");
	});

	it("does not treat उवाच inside a verse as a speaker line", () => {
		const text =
			"भीष्मद्रोणप्रमुखतः सर्वेषां च महीक्षिताम्।\nउवाच पार्थ पश्यैतान्समवेतान्कुरूनिति।।1.25।।";
		expect(splitSpeaker(text)).toEqual({ speaker: null, text });
	});
});

describe("speakerOf", () => {
	it("names the speaker of each speaker line", () => {
		expect(speakerOf("श्री भगवानुवाच")).toBe("krishna");
		expect(speakerOf("अर्जुन उवाच")).toBe("arjuna");
		expect(speakerOf("सञ्जय उवाच")).toBe("sanjaya");
		expect(speakerOf("धृतराष्ट्र उवाच")).toBe("dhritarashtra");
		expect(speakerOf("भीष्म उवाच")).toBeNull();
	});
});

describe("verseLines", () => {
	it("keeps half-verse line breaks and drops the closing reference", () => {
		expect(
			verseLines(
				"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि।।2.47।।",
			),
		).toEqual([
			"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
			"मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि",
		]);
	});

	it("breaks a verse written on one line at its single danda", () => {
		expect(
			verseLines(
				"नष्टो मोहः स्मृतिर्लब्धा त्वत्प्रसादान्मयाच्युत।स्थितोऽस्मि गतसन्देहः करिष्ये वचनं तव।।18.73।।",
			),
		).toEqual([
			"नष्टो मोहः स्मृतिर्लब्धा त्वत्प्रसादान्मयाच्युत।",
			"स्थितोऽस्मि गतसन्देहः करिष्ये वचनं तव",
		]);
	});

	it("keeps the four quarter-lines of a long-metre verse", () => {
		expect(
			verseLines(
				"गुरूनहत्वा हि महानुभावान्\nश्रेयो भोक्तुं भैक्ष्यमपीह लोके।\nहत्वार्थकामांस्तु गुरूनिहैव\nभुञ्जीय भोगान् रुधिरप्रदिग्धान्।।2.5।।",
			),
		).toHaveLength(4);
	});
});

describe("splitTransliteration", () => {
	it("separates the speaker line and collapses repeated spaces", () => {
		expect(
			splitTransliteration("śhrī bhagavān uvācha\nline  one\nline two\n"),
		).toEqual({
			speaker: "śhrī bhagavān uvācha",
			lines: ["line one", "line two"],
		});
	});

	it("leaves a verse that only contains uvācha alone", () => {
		expect(
			splitTransliteration("tam-uvācha hṛiṣhīkeśhaḥ prahasanniva bhārata")
				.speaker,
		).toBeNull();
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
	verse_id = 1,
): SourceAuthoredText {
	return { verse_id, author_id, authorName, lang, description };
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
			authored(1, "Swami Ramsukhdas", "hindi", "।।1.1।। हिंदी 1"),
			authored(17, "Swami Tejomayananda", "hindi", "।।1.1।।हिंदी 17।।"),
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
		expect(verse).toEqual({
			number: 1,
			speaker: "arjuna",
			speakerLine: { sanskrit: "अर्जुन उवाच", transliteration: "arjuna uvācha" },
			lines: ["पहली पंक्ति।", "दूसरी पंक्ति"],
			transliteration: ["line"],
			wordMeanings: "words",
			translations: expect.any(Object),
			commentators: [16, 2],
		});
		expect(data.commentary.get("1/1")).toEqual({
			"16": "Commentary",
			"2": "टीका",
		});
		expect(file.chapter.summary).toBe("Summary");
	});

	it("drops the verse reference that opens the Hindi translations", () => {
		const [verse] = buildData(fixture()).data.chapterFiles[0].verses;
		expect(verse.translations["1"]).toBe("हिंदी 1");
		expect(verse.translations["17"]).toBe("हिंदी 17।।");
	});

	it("carries the speaker forward to verses without a speaker line", () => {
		const source = fixture();
		source.chapters[0].verses_count = 2;
		source.verses.push({
			id: 2,
			chapter_number: 1,
			verse_number: 2,
			text: "तीसरी पंक्ति।\nचौथी पंक्ति।।1.2।।",
			transliteration: "line",
			word_meanings: "words",
		});
		const verses = buildData(source).data.chapterFiles[0].verses;
		expect(verses[1]).toMatchObject({ speaker: "arjuna", speakerLine: null });
	});

	it("reports a chapter that does not open with a speaker line", () => {
		const source = fixture();
		source.verses[0].text = "पहली पंक्ति।\nदूसरी पंक्ति।।1.1।।";
		source.verses[0].transliteration = "line";
		const { errors } = buildData(source);
		expect(errors).toContain("1.1: a chapter must open with a speaker line");
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
		source.verses[0].text = "अर्जुन उवाच\nपहली पंक्ति।।1.2।।";
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

describe("committed data", () => {
	const chapterFiles = Array.from(
		{ length: 18 },
		(_, index) =>
			JSON.parse(
				readFileSync(
					`public/data/${DATA_VERSION}/chapter/${index + 1}.json`,
					"utf8",
				),
			) as ChapterFile,
	);
	const verses = chapterFiles.flatMap((file) =>
		file.verses.map((verse) => ({ chapter: file.chapter.number, ...verse })),
	);

	// Checked by hand against the printed text: 1.21 and 1.28 open with Sanjaya's narration, but the source puts Arjuna's speaker line first.
	it("opens a speech at the 60 places the text names a speaker", () => {
		expect(
			verses
				.filter((verse) => verse.speakerLine)
				.map((verse) => `${verse.chapter}.${verse.number} ${verse.speaker}`),
		).toEqual([
			"1.1 dhritarashtra",
			"1.2 sanjaya",
			"1.21 arjuna",
			"1.24 sanjaya",
			"1.28 arjuna",
			"1.47 sanjaya",
			"2.1 sanjaya",
			"2.2 krishna",
			"2.4 arjuna",
			"2.9 sanjaya",
			"2.11 krishna",
			"2.54 arjuna",
			"2.55 krishna",
			"3.1 arjuna",
			"3.3 krishna",
			"3.36 arjuna",
			"3.37 krishna",
			"4.1 krishna",
			"4.4 arjuna",
			"4.5 krishna",
			"5.1 arjuna",
			"5.2 krishna",
			"6.1 krishna",
			"6.33 arjuna",
			"6.35 krishna",
			"6.37 arjuna",
			"6.40 krishna",
			"7.1 krishna",
			"8.1 arjuna",
			"8.3 krishna",
			"9.1 krishna",
			"10.1 krishna",
			"10.12 arjuna",
			"10.19 krishna",
			"11.1 arjuna",
			"11.5 krishna",
			"11.9 sanjaya",
			"11.15 arjuna",
			"11.32 krishna",
			"11.35 sanjaya",
			"11.36 arjuna",
			"11.47 krishna",
			"11.50 sanjaya",
			"11.51 arjuna",
			"11.52 krishna",
			"12.1 arjuna",
			"12.2 krishna",
			"13.1 arjuna",
			"13.2 krishna",
			"14.1 krishna",
			"14.21 arjuna",
			"14.22 krishna",
			"15.1 krishna",
			"16.1 krishna",
			"17.1 arjuna",
			"17.2 krishna",
			"18.1 arjuna",
			"18.2 krishna",
			"18.73 arjuna",
			"18.74 sanjaya",
		]);
	});

	it("gives Krishna 574 verses, Arjuna 86, Sanjaya 40 and Dhritarashtra 1", () => {
		const counts: Record<string, number> = {};
		for (const verse of verses) {
			counts[verse.speaker] = (counts[verse.speaker] ?? 0) + 1;
		}
		expect(counts).toEqual({
			krishna: 574,
			arjuna: 86,
			sanjaya: 40,
			dhritarashtra: 1,
		});
	});

	it("sets every verse as two half-verses or four quarter-lines", () => {
		expect(
			verses.filter(
				(verse) => verse.lines.length !== 2 && verse.lines.length !== 4,
			),
		).toEqual([]);
	});
});

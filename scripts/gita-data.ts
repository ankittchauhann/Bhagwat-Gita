import {
	type Author,
	type ChapterFile,
	type ChapterInfo,
	type ChaptersIndex,
	type Credits,
	type Language,
	SPEAKERS,
	type Speaker,
	type Verse,
	type VerseCommentary,
} from "../src/lib/gitaData";

export const SOURCE_REPOSITORY = "https://github.com/gita/gita";
export const SOURCE_COMMIT = "c6fce39595445768876ddbb8d1268a9c935e1d2b";

export const EXPECTED_CHAPTERS = 18;
export const EXPECTED_VERSES = 701;
export const EXPECTED_TRANSLATIONS_PER_VERSE = 7;

const LANGUAGE_ORDER: Language[] = ["english", "hindi", "sanskrit"];
const SPEAKER_LINE = /^(?:(?:अर्जुन|सञ्जय|संजय|धृतराष्ट्र)\s*उवाच|श्री\s*भगवानुवाच)/;
const TRANSLITERATED_SPEAKER_LINE =
	/^(?:śhrī[-\s]bhagavān|arjuna|sañjaya|dhṛitarāśhtra)\s+uvācha$/;
const VERSE_REFERENCE = /[।॥]{1,2}\s*(\d+)\.(\d+)\s*[।॥]{1,2}$/;
const LEADING_REFERENCE = /^[।॥]{1,2}\s*\d+\.\d+\s*[।॥]{1,2}\s*/;
const SINGLE_DANDA = /(?<!।)।(?!।)\s*/g;

const SPEAKER_PREFIXES: [string, Speaker][] = [
	["श्री", "krishna"],
	["अर्जुन", "arjuna"],
	["सञ्जय", "sanjaya"],
	["संजय", "sanjaya"],
	["धृतराष्ट्र", "dhritarashtra"],
];

export interface SourceChapter {
	chapter_number: number;
	chapter_summary: string;
	chapter_summary_hindi: string;
	name: string;
	name_meaning: string;
	name_translation: string;
	name_transliterated: string;
	verses_count: number;
}

export interface SourceVerse {
	id: number;
	chapter_number: number;
	verse_number: number;
	text: string;
	transliteration: string;
	word_meanings: string;
}

export interface SourceAuthoredText {
	verse_id: number;
	author_id: number;
	authorName: string;
	lang: string;
	description: string | null;
}

export interface SourceData {
	chapters: SourceChapter[];
	verses: SourceVerse[];
	translations: SourceAuthoredText[];
	commentaries: SourceAuthoredText[];
}

export interface BuiltData {
	index: ChaptersIndex;
	chapterFiles: ChapterFile[];
	commentary: Map<string, VerseCommentary>;
}

export function commentaryKey(chapterNumber: number, verseNumber: number) {
	return `${chapterNumber}/${verseNumber}`;
}

export function splitSpeaker(text: string): {
	speaker: string | null;
	text: string;
} {
	const lines = text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const match = lines[0]?.match(SPEAKER_LINE);
	if (!match) {
		return { speaker: null, text: lines.join("\n") };
	}

	const rest = lines[0].slice(match[0].length).trim();
	const body = rest ? [rest, ...lines.slice(1)] : lines.slice(1);
	return { speaker: match[0].replace("संजय", "सञ्जय"), text: body.join("\n") };
}

export function speakerOf(speakerLine: string): Speaker | null {
	return (
		SPEAKER_PREFIXES.find(([prefix]) => speakerLine.startsWith(prefix))?.[1] ??
		null
	);
}

// Half-verses are separated by a line break in most of the source and only by a single danda from chapter 12 on.
export function verseLines(text: string): string[] {
	return text
		.replace(VERSE_REFERENCE, "")
		.replace(SINGLE_DANDA, "।\n")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export function splitTransliteration(text: string): {
	speaker: string | null;
	lines: string[];
} {
	const lines = text
		.split("\n")
		.map((line) => line.replace(/\s+/g, " ").trim())
		.filter(Boolean);
	return TRANSLITERATED_SPEAKER_LINE.test(lines[0] ?? "")
		? { speaker: lines[0], lines: lines.slice(1) }
		: { speaker: null, lines };
}

export function verseReference(
	text: string,
): { chapter: number; verse: number } | null {
	const match = text.trim().match(VERSE_REFERENCE);
	return match ? { chapter: Number(match[1]), verse: Number(match[2]) } : null;
}

function isLanguage(value: string): value is Language {
	return (LANGUAGE_ORDER as string[]).includes(value);
}

function collectAuthors(
	records: SourceAuthoredText[],
	role: string,
	errors: string[],
): Author[] {
	const authors = new Map<number, Author>();
	for (const record of records) {
		if (!isLanguage(record.lang)) {
			errors.push(
				`${role} ${record.author_id}: unknown language "${record.lang}"`,
			);
			continue;
		}
		const existing = authors.get(record.author_id);
		if (!existing) {
			authors.set(record.author_id, {
				id: record.author_id,
				name: record.authorName.trim(),
				language: record.lang,
			});
		} else if (existing.language !== record.lang) {
			errors.push(`${role} ${record.author_id}: mixed languages`);
		}
	}
	return [...authors.values()].sort(
		(a, b) =>
			LANGUAGE_ORDER.indexOf(a.language) - LANGUAGE_ORDER.indexOf(b.language) ||
			a.name.localeCompare(b.name),
	);
}

function groupByVerse(records: SourceAuthoredText[]) {
	const byVerse = new Map<number, SourceAuthoredText[]>();
	for (const record of records) {
		const list = byVerse.get(record.verse_id) ?? [];
		list.push(record);
		byVerse.set(record.verse_id, list);
	}
	return byVerse;
}

export function buildData(source: SourceData): {
	data: BuiltData;
	errors: string[];
} {
	const errors: string[] = [];

	const chapters: ChapterInfo[] = [...source.chapters]
		.sort((a, b) => a.chapter_number - b.chapter_number)
		.map((chapter) => ({
			number: chapter.chapter_number,
			name: chapter.name.trim(),
			nameTransliterated: chapter.name_transliterated.trim(),
			nameTranslation: chapter.name_translation.trim(),
			nameMeaning: chapter.name_meaning.trim(),
			summary: chapter.chapter_summary.trim(),
			summaryHindi: chapter.chapter_summary_hindi.trim(),
			versesCount: chapter.verses_count,
		}));

	const translators = collectAuthors(source.translations, "translator", errors);
	const commentators = collectAuthors(
		source.commentaries,
		"commentator",
		errors,
	);
	const translatorIds = new Set(translators.map((author) => author.id));
	const translationsByVerse = groupByVerse(source.translations);
	const commentariesByVerse = groupByVerse(source.commentaries);

	const chapterFiles: ChapterFile[] = [];
	const commentary = new Map<string, VerseCommentary>();
	let currentSpeaker: Speaker | null = null;

	for (const chapter of chapters) {
		const sourceVerses = source.verses
			.filter((verse) => verse.chapter_number === chapter.number)
			.sort((a, b) => a.verse_number - b.verse_number);

		const verses: Verse[] = sourceVerses.map((sourceVerse) => {
			const label = `${chapter.number}.${sourceVerse.verse_number}`;
			const reference = verseReference(sourceVerse.text);
			if (
				!reference ||
				reference.chapter !== chapter.number ||
				reference.verse !== sourceVerse.verse_number
			) {
				errors.push(`${label}: Sanskrit text does not end with its reference`);
			}

			const translations: Record<string, string> = {};
			for (const record of translationsByVerse.get(sourceVerse.id) ?? []) {
				const text =
					record.description?.trim().replace(LEADING_REFERENCE, "") ?? "";
				if (!text) {
					errors.push(`${label}: empty translation by ${record.authorName}`);
				} else if (translations[record.author_id]) {
					errors.push(
						`${label}: duplicate translation by ${record.authorName}`,
					);
				} else {
					translations[record.author_id] = text;
				}
			}
			const translationIds = Object.keys(translations).map(Number);
			if (
				translationIds.length !== EXPECTED_TRANSLATIONS_PER_VERSE ||
				translationIds.some((id) => !translatorIds.has(id))
			) {
				errors.push(
					`${label}: expected ${EXPECTED_TRANSLATIONS_PER_VERSE} translations, found ${translationIds.length}`,
				);
			}

			const verseCommentary: VerseCommentary = {};
			for (const record of commentariesByVerse.get(sourceVerse.id) ?? []) {
				const text = record.description?.trim() ?? "";
				if (!text) {
					continue;
				}
				if (verseCommentary[record.author_id]) {
					errors.push(`${label}: duplicate commentary by ${record.authorName}`);
				}
				verseCommentary[record.author_id] = text;
			}
			const commentatorIds = commentators
				.map((author) => author.id)
				.filter((id) => verseCommentary[id]);
			if (commentatorIds.length === 0) {
				errors.push(`${label}: no commentary`);
			}
			commentary.set(
				commentaryKey(chapter.number, sourceVerse.verse_number),
				Object.fromEntries(
					commentatorIds.map((id) => [String(id), verseCommentary[id]]),
				),
			);

			const { speaker: speakerLine, text } = splitSpeaker(sourceVerse.text);
			const transliteration = splitTransliteration(
				sourceVerse.transliteration ?? "",
			);
			const wordMeanings = sourceVerse.word_meanings?.trim() ?? "";
			const lines = verseLines(text);
			if (lines.length === 0) errors.push(`${label}: empty Sanskrit text`);
			if (transliteration.lines.length === 0) {
				errors.push(`${label}: empty transliteration`);
			}
			if (!wordMeanings) errors.push(`${label}: empty word meanings`);
			if (Boolean(speakerLine) !== Boolean(transliteration.speaker)) {
				errors.push(
					`${label}: speaker line in only one of Sanskrit and transliteration`,
				);
			}

			if (speakerLine) {
				currentSpeaker = speakerOf(speakerLine);
				if (!currentSpeaker) {
					errors.push(`${label}: unknown speaker "${speakerLine}"`);
				}
			} else if (sourceVerse.verse_number === 1) {
				errors.push(`${label}: a chapter must open with a speaker line`);
			}

			return {
				number: sourceVerse.verse_number,
				speaker: currentSpeaker ?? "sanjaya",
				speakerLine:
					speakerLine && transliteration.speaker
						? {
								sanskrit: speakerLine,
								transliteration: transliteration.speaker,
							}
						: null,
				lines,
				transliteration: transliteration.lines,
				wordMeanings,
				translations: Object.fromEntries(
					translators
						.filter((author) => translations[author.id])
						.map((author) => [String(author.id), translations[author.id]]),
				),
				commentators: commentatorIds,
			};
		});

		chapterFiles.push({ chapter, translators, commentators, verses });
	}

	const data: BuiltData = {
		index: indexFor(chapters),
		chapterFiles,
		commentary,
	};
	errors.push(...validateBuiltData(data));
	return { data, errors };
}

function indexFor(chapters: ChapterInfo[]): ChaptersIndex {
	return {
		source: { repository: SOURCE_REPOSITORY, commit: SOURCE_COMMIT },
		chapters,
	};
}

export function validateBuiltData(data: BuiltData): string[] {
	const errors: string[] = [];
	const { chapters } = data.index;

	if (chapters.length !== EXPECTED_CHAPTERS) {
		errors.push(
			`expected ${EXPECTED_CHAPTERS} chapters, found ${chapters.length}`,
		);
	}
	chapters.forEach((chapter, index) => {
		if (chapter.number !== index + 1) {
			errors.push(
				`chapter at position ${index + 1} is numbered ${chapter.number}`,
			);
		}
	});

	const totalVerses = chapters.reduce(
		(sum, chapter) => sum + chapter.versesCount,
		0,
	);
	if (totalVerses !== EXPECTED_VERSES) {
		errors.push(
			`expected ${EXPECTED_VERSES} verses, chapters list ${totalVerses}`,
		);
	}

	if (data.chapterFiles.length !== chapters.length) {
		errors.push(
			`expected ${chapters.length} chapter files, found ${data.chapterFiles.length}`,
		);
	}

	let builtVerses = 0;
	for (const file of data.chapterFiles) {
		const listed = chapters.find(
			(chapter) => chapter.number === file.chapter.number,
		);
		if (!listed || JSON.stringify(listed) !== JSON.stringify(file.chapter)) {
			errors.push(`chapter ${file.chapter.number}: differs from chapters.json`);
		}
		if (file.verses.length !== file.chapter.versesCount) {
			errors.push(
				`chapter ${file.chapter.number}: ${file.verses.length} verses, expected ${file.chapter.versesCount}`,
			);
		}

		const translatorIds = file.translators.map((author) => String(author.id));
		const commentatorIds = new Set(
			file.commentators.map((author) => author.id),
		);

		file.verses.forEach((verse, index) => {
			builtVerses += 1;
			const label = `${file.chapter.number}.${verse.number}`;
			if (verse.number !== index + 1) {
				errors.push(`${label}: expected verse number ${index + 1}`);
			}
			if (
				verse.lines.length === 0 ||
				verse.transliteration.length === 0 ||
				!verse.wordMeanings
			) {
				errors.push(`${label}: missing text`);
			}
			if (verse.lines.some((line) => SPEAKER_LINE.test(line))) {
				errors.push(`${label}: speaker line left in the Sanskrit text`);
			}
			if (verse.lines.some((line) => /[।॥]\s*\d+\.\d+/.test(line))) {
				errors.push(`${label}: verse reference left in the Sanskrit text`);
			}
			if (!SPEAKERS.includes(verse.speaker)) {
				errors.push(`${label}: unknown speaker "${verse.speaker}"`);
			}
			if (verse.number === 1 && !verse.speakerLine) {
				errors.push(`${label}: a chapter must open with a speaker line`);
			}
			const keys = Object.keys(verse.translations);
			if (
				keys.length !== translatorIds.length ||
				translatorIds.some((id) => !verse.translations[id])
			) {
				errors.push(`${label}: translations do not cover every translator`);
			}
			if (
				Object.values(verse.translations).some((text) =>
					LEADING_REFERENCE.test(text),
				)
			) {
				errors.push(`${label}: translation starts with a verse reference`);
			}
			if (verse.commentators.some((id) => !commentatorIds.has(id))) {
				errors.push(`${label}: unknown commentator`);
			}

			const commentary = data.commentary.get(
				commentaryKey(file.chapter.number, verse.number),
			);
			if (!commentary) {
				errors.push(`${label}: commentary file missing`);
				return;
			}
			const commentaryIds = Object.keys(commentary).map(Number);
			if (
				commentaryIds.length !== verse.commentators.length ||
				commentaryIds.some((id) => !verse.commentators.includes(id)) ||
				Object.values(commentary).some((text) => !text.trim())
			) {
				errors.push(`${label}: commentary file does not match the verse`);
			}
		});
	}

	if (builtVerses !== EXPECTED_VERSES) {
		errors.push(`expected ${EXPECTED_VERSES} verses, built ${builtVerses}`);
	}
	if (data.commentary.size !== builtVerses) {
		errors.push(
			`expected ${builtVerses} commentary files, found ${data.commentary.size}`,
		);
	}

	return errors;
}

export function creditsFor(data: BuiltData): Credits {
	const speakers = Object.fromEntries(
		SPEAKERS.map((speaker) => [speaker, 0]),
	) as Record<Speaker, number>;
	let verses = 0;
	let commentaries = 0;
	for (const file of data.chapterFiles) {
		for (const verse of file.verses) {
			verses += 1;
			speakers[verse.speaker] += 1;
			commentaries += verse.commentators.length;
		}
	}
	const [first] = data.chapterFiles;
	const translators = first?.translators ?? [];
	const commentators = first?.commentators ?? [];
	return {
		source: data.index.source,
		counts: {
			chapters: data.index.chapters.length,
			verses,
			translators: translators.length,
			commentators: commentators.length,
			commentaries,
		},
		speakers,
		translators,
		commentators,
	};
}

export function sitemapXml(siteUrl: string, chapterFiles: ChapterFile[]) {
	const paths = [
		"/",
		"/chapters",
		"/about",
		...chapterFiles.map((file) => `/chapter/${file.chapter.number}`),
		...chapterFiles.flatMap((file) =>
			file.verses.map(
				(verse) => `/chapter/${file.chapter.number}/verse/${verse.number}`,
			),
		),
	];
	const urls = paths
		.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

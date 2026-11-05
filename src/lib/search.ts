import type { Options, SearchOptions } from "minisearch";
import type { ChapterInfo, SearchFile, SearchScript } from "./gitaData";

const DEVANAGARI_DIGITS = "०१२३४५६७८९";
const DEVANAGARI = /[ऀ-ॿ]/;

export function scriptOf(query: string): SearchScript {
	return DEVANAGARI.test(query) ? "devanagari" : "latin";
}

export interface Reference {
	chapter: number;
	verse: number | null;
}

const REFERENCE =
	/^(?:(?:shrimad\s*)?(?:bhagavad|bhagwat)?\s*g[ie]ta\s*|bg\s*)?(?:ch(?:apter)?\.?\s*)?(\d{1,2})(?:\s*(?:[.:,]\s*|\s+|v(?:erse)?\.?\s*|[.,]?\s*v(?:erse)?\.?\s*)(\d{1,3}))?$/;

// "2.47", "2 47", "ch 2 v 47", "chapter 2 verse 47", "bg 2.47" and "२.४७"; null when it isn't a real verse.
export function parseReference(
	input: string,
	chapters: Pick<ChapterInfo, "number" | "versesCount">[],
): Reference | null {
	const text = input
		.trim()
		.toLowerCase()
		.replace(/[०-९]/g, (digit) => String(DEVANAGARI_DIGITS.indexOf(digit)))
		.replace(/[.\s]+$/, "");
	const match = REFERENCE.exec(text);
	if (!match) {
		return null;
	}
	const chapter = chapters.find((entry) => entry.number === Number(match[1]));
	if (!chapter) {
		return null;
	}
	if (match[2] === undefined) {
		return { chapter: chapter.number, verse: null };
	}
	const verse = Number(match[2]);
	return verse >= 1 && verse <= chapter.versesCount
		? { chapter: chapter.number, verse }
		: null;
}

const PLAIN_ASCII = /^\p{ASCII}*$/u;

// Latin diacritics are dropped so "karmanye" finds "karmaṇye"; Devanagari marks are kept.
export function normalizeTerm(term: string) {
	const lower = term.toLowerCase();
	return PLAIN_ASCII.test(lower)
		? lower
		: lower
				.normalize("NFD")
				.replace(/\p{Script=Inherited}/gu, "")
				.normalize("NFC");
}

export interface SearchDocument {
	id: string;
	verse: string;
	translations: string;
}

export function searchDocuments(file: SearchFile): SearchDocument[] {
	return file.verses.map((entry) => ({
		id: `${entry.c}.${entry.v}`,
		verse: entry.t,
		translations: entry.x.join("\n"),
	}));
}

export const INDEX_OPTIONS: Options<SearchDocument> = {
	fields: ["verse", "translations"],
	processTerm: (term) => normalizeTerm(term) || null,
};

export function queryOptions(combineWith: "AND" | "OR"): SearchOptions {
	return {
		combineWith,
		// The last word is still being typed, so it matches as a prefix.
		prefix: (_term, index, terms) => index === terms.length - 1,
		fuzzy: (term) => (term.length > 4 ? 0.2 : false),
	};
}

export interface Segment {
	text: string;
	match: boolean;
}

const WORD = /([\p{L}\p{M}\p{N}]+)/u;

// Unmarked text is kept in runs, so a result renders as a few nodes, not one per word.
export function highlight(text: string, terms: ReadonlySet<string>): Segment[] {
	const segments: Segment[] = [];
	for (const part of text.split(WORD)) {
		if (!part) {
			continue;
		}
		const match = WORD.test(part) && terms.has(normalizeTerm(part));
		const last = segments.at(-1);
		if (last && !last.match && !match) {
			last.text += part;
		} else {
			segments.push({ text: part, match });
		}
	}
	return segments;
}

export interface SearchHit {
	id: string;
	terms: string[];
}

export interface VerseResult {
	chapter: number;
	verse: number;
	speaker: SearchFile["verses"][number]["s"];
	firstLine: string;
	source: string;
	segments: Segment[];
}

const byId = new WeakMap<
	SearchFile,
	Map<string, SearchFile["verses"][number]>
>();

function versesById(file: SearchFile) {
	let map = byId.get(file);
	if (!map) {
		map = new Map(file.verses.map((entry) => [`${entry.c}.${entry.v}`, entry]));
		byId.set(file, map);
	}
	return map;
}

// Shows the text that matches the most words, preferring the reader's own translator on a tie.
export function verseResult(
	file: SearchFile,
	hit: SearchHit,
	preferredAuthorId: number | null,
	verseLabel: string,
): VerseResult | null {
	const [chapter, verse] = hit.id.split(".").map(Number);
	const entry = versesById(file).get(hit.id);
	if (!entry) {
		return null;
	}
	const terms = new Set(hit.terms);
	const count = (segments: Segment[]) =>
		segments.filter((segment) => segment.match).length;
	const candidates = [
		...file.authors.map((author, index) => ({
			source: author.name,
			preferred: author.id === preferredAuthorId,
			segments: highlight(entry.x[index], terms),
		})),
		{
			source: verseLabel,
			preferred: false,
			segments: highlight(entry.t, terms),
		},
	];
	const best = candidates.reduce((winner, candidate) => {
		const difference = count(candidate.segments) - count(winner.segments);
		return difference > 0 ||
			(difference === 0 && candidate.preferred && !winner.preferred)
			? candidate
			: winner;
	});
	return {
		chapter,
		verse,
		speaker: entry.s,
		firstLine: entry.l,
		source: best.source,
		segments: best.segments,
	};
}

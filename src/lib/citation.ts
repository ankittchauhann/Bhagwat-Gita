import { devanagariNumber } from "@/components/reader/verseNavigation";
import { SITE_URL } from "./site";

export interface CitedVerse {
	chapter: number;
	verse: number;
	lines: string[];
	translation?: string;
	translatorName?: string;
}

// What Share and Copy hand over: the verse as printed, the translation with its translator, and the link.
export function verseCitation({
	chapter,
	verse,
	lines,
	translation,
	translatorName,
}: CitedVerse) {
	const reference = `${chapter}.${verse}`;
	const title = `Bhagavad Gita ${reference}`;
	const url = `${SITE_URL}/chapter/${chapter}/verse/${verse}`;
	const sanskrit = [
		...lines.slice(0, -1),
		`${lines.at(-1) ?? ""} ॥ ${devanagariNumber(reference)} ॥`,
	].join("\n");
	const credit = translatorName
		? `— ${title}, translated by ${translatorName}`
		: `— ${title}`;
	const text = [sanskrit, translation, credit].filter(Boolean).join("\n\n");
	return { title, text, url, clipboard: `${text}\n${url}` };
}

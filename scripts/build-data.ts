// Usage: `bun run data` rebuilds public/data from the pinned source; `bun run data:check` validates the committed files offline.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	type ChapterFile,
	type ChaptersIndex,
	DATA_VERSION,
	type VerseCommentary,
} from "../src/lib/gitaData";
import { SITE_URL } from "../src/lib/site";
import {
	type BuiltData,
	SOURCE_COMMIT,
	type SourceAuthoredText,
	type SourceChapter,
	type SourceVerse,
	buildData,
	commentaryKey,
	sitemapXml,
	validateBuiltData,
} from "./gita-data";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(PUBLIC_DIR, "data", DATA_VERSION);
const SITEMAP_FILE = path.join(PUBLIC_DIR, "sitemap.xml");

async function download<T>(file: string): Promise<T> {
	const url = `https://raw.githubusercontent.com/gita/gita/${SOURCE_COMMIT}/data/${file}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`${url}: HTTP ${response.status}`);
	}
	return (await response.json()) as T;
}

function json(value: unknown) {
	return `${JSON.stringify(value)}\n`;
}

async function readJson<T>(file: string): Promise<T> {
	return JSON.parse(await readFile(file, "utf8")) as T;
}

async function build() {
	console.log(`Downloading gita/gita@${SOURCE_COMMIT.slice(0, 7)}…`);
	const [chapters, verses, translations, commentaries] = await Promise.all([
		download<SourceChapter[]>("chapters.json"),
		download<SourceVerse[]>("verse.json"),
		download<SourceAuthoredText[]>("translation.json"),
		download<SourceAuthoredText[]>("commentary.json"),
	]);

	const { data, errors } = buildData({
		chapters,
		verses,
		translations,
		commentaries,
	});
	if (errors.length > 0) {
		fail(errors);
		return;
	}

	await rm(DATA_DIR, { recursive: true, force: true });
	await mkdir(path.join(DATA_DIR, "chapter"), { recursive: true });
	await writeFile(path.join(DATA_DIR, "chapters.json"), json(data.index));
	for (const file of data.chapterFiles) {
		await writeFile(
			path.join(DATA_DIR, "chapter", `${file.chapter.number}.json`),
			json(file),
		);
		const commentaryDir = path.join(
			DATA_DIR,
			"commentary",
			String(file.chapter.number),
		);
		await mkdir(commentaryDir, { recursive: true });
		for (const verse of file.verses) {
			await writeFile(
				path.join(commentaryDir, `${verse.number}.json`),
				json(
					data.commentary.get(commentaryKey(file.chapter.number, verse.number)),
				),
			);
		}
	}
	await writeFile(SITEMAP_FILE, sitemapXml(SITE_URL, data.chapterFiles));

	report(data);
}

async function check() {
	const index = await readJson<ChaptersIndex>(
		path.join(DATA_DIR, "chapters.json"),
	);
	const chapterFiles: ChapterFile[] = [];
	const commentary = new Map<string, VerseCommentary>();
	const errors: string[] = [];

	const chapterNames = await readdir(path.join(DATA_DIR, "chapter"));
	if (chapterNames.length !== index.chapters.length) {
		errors.push(
			`expected ${index.chapters.length} files in chapter/, found ${chapterNames.length}`,
		);
	}

	for (const chapter of index.chapters) {
		const file = await readJson<ChapterFile>(
			path.join(DATA_DIR, "chapter", `${chapter.number}.json`),
		);
		chapterFiles.push(file);

		const commentaryDir = path.join(
			DATA_DIR,
			"commentary",
			String(chapter.number),
		);
		const verseFiles = await readdir(commentaryDir);
		if (verseFiles.length !== file.verses.length) {
			errors.push(
				`commentary/${chapter.number}: ${verseFiles.length} files for ${file.verses.length} verses`,
			);
		}
		for (const verse of file.verses) {
			commentary.set(
				commentaryKey(chapter.number, verse.number),
				await readJson<VerseCommentary>(
					path.join(commentaryDir, `${verse.number}.json`),
				),
			);
		}
	}

	const data: BuiltData = { index, chapterFiles, commentary };
	errors.push(...validateBuiltData(data));

	const sitemap = await readFile(SITEMAP_FILE, "utf8");
	if (sitemap !== sitemapXml(SITE_URL, chapterFiles)) {
		errors.push("public/sitemap.xml is out of date; run `bun run data`");
	}

	if (errors.length > 0) {
		fail(errors);
		return;
	}
	report(data);
}

function report(data: BuiltData) {
	const verses = data.chapterFiles.reduce(
		(sum, file) => sum + file.verses.length,
		0,
	);
	const commentaries = [...data.commentary.values()].reduce(
		(sum, entry) => sum + Object.keys(entry).length,
		0,
	);
	console.log(
		`OK: ${data.index.chapters.length} chapters, ${verses} verses, ${data.chapterFiles[0].translators.length} translators, ${data.chapterFiles[0].commentators.length} commentators, ${commentaries} commentaries.`,
	);
}

function fail(errors: string[]) {
	console.error(`Data validation failed (${errors.length}):`);
	for (const error of errors.slice(0, 50)) {
		console.error(`  - ${error}`);
	}
	process.exitCode = 1;
}

await (process.argv.includes("--check") ? check() : build());

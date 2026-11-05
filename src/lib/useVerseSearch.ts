import {
	type SearchFile,
	type SearchScript,
	loadSearchFile,
} from "@/lib/gitaData";
import { type SearchHit, scriptOf, searchDocuments } from "@/lib/search";
import type { SearchRequest, SearchResponse } from "@/lib/search.worker";
import { useEffect, useRef, useState } from "react";

export type SearchState =
	| { status: "idle" }
	| { status: "preparing" }
	| { status: "failed" }
	| {
			status: "done";
			query: string;
			file: SearchFile;
			hits: SearchHit[];
			allWords: boolean;
	  };

let worker: Worker | null = null;
const files = new Map<SearchScript, Promise<SearchFile>>();
const ready = new Map<SearchScript, Promise<void>>();
const pending = new Map<number, (response: SearchResponse) => void>();
let nextId = 0;

function searchWorker() {
	if (!worker) {
		worker = new Worker(new URL("./search.worker.ts", import.meta.url), {
			type: "module",
		});
		worker.onmessage = ({ data }: MessageEvent<SearchResponse>) => {
			if (data.type === "results") {
				pending.get(data.id)?.(data);
				pending.delete(data.id);
			}
		};
	}
	return worker;
}

function send(message: SearchRequest) {
	searchWorker().postMessage(message);
}

// Downloads the script's file once and indexes it off the main thread.
export function prepareSearch(script: SearchScript) {
	let promise = ready.get(script);
	if (!promise) {
		const file = loadSearchFile(script);
		files.set(script, file);
		promise = file.then(
			(loaded) =>
				new Promise<void>((resolve) => {
					const target = searchWorker();
					const onReady = ({ data }: MessageEvent<SearchResponse>) => {
						if (data.type === "ready" && data.script === script) {
							target.removeEventListener("message", onReady);
							resolve();
						}
					};
					target.addEventListener("message", onReady);
					send({ type: "index", script, documents: searchDocuments(loaded) });
				}),
		);
		promise.catch(() => {
			ready.delete(script);
			files.delete(script);
		});
		ready.set(script, promise);
	}
	return promise;
}

async function runQuery(query: string) {
	const script = scriptOf(query);
	await prepareSearch(script);
	const file = await files.get(script);
	const id = nextId++;
	const response = await new Promise<SearchResponse>((resolve) => {
		pending.set(id, resolve);
		send({ type: "query", id, script, query });
	});
	if (!file || response.type !== "results") {
		throw new Error("Search failed");
	}
	return { file, hits: response.hits, allWords: response.allWords };
}

export function useVerseSearch(query: string, attempt: number) {
	const [state, setState] = useState<SearchState>({ status: "idle" });
	const latest = useRef(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: a new attempt re-runs a failed search.
	useEffect(() => {
		const text = query.trim();
		const request = ++latest.current;
		if (!text) {
			setState({ status: "idle" });
			prepareSearch("latin").catch(() => {});
			return;
		}
		const timer = setTimeout(() => {
			setState((current) =>
				current.status === "done" ? current : { status: "preparing" },
			);
			runQuery(text).then(
				(result) => {
					if (latest.current === request) {
						setState({ status: "done", query: text, ...result });
					}
				},
				() => {
					if (latest.current === request) {
						setState({ status: "failed" });
					}
				},
			);
		}, 120);
		return () => clearTimeout(timer);
	}, [query, attempt]);

	return state;
}

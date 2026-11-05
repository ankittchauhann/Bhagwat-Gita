import MiniSearch from "minisearch";
import type { SearchScript } from "./gitaData";
import {
	INDEX_OPTIONS,
	type SearchDocument,
	type SearchHit,
	queryOptions,
} from "./search";

export type SearchRequest =
	| { type: "index"; script: SearchScript; documents: SearchDocument[] }
	| { type: "query"; id: number; script: SearchScript; query: string };

export type SearchResponse =
	| { type: "ready"; script: SearchScript }
	| {
			type: "results";
			id: number;
			hits: SearchHit[];
			allWords: boolean;
	  };

const indexes = new Map<SearchScript, MiniSearch<SearchDocument>>();
const scope = self as unknown as {
	postMessage: (message: SearchResponse) => void;
	onmessage: ((event: MessageEvent<SearchRequest>) => void) | null;
};

function reply(message: SearchResponse) {
	scope.postMessage(message);
}

scope.onmessage = ({ data }) => {
	if (data.type === "index") {
		const index = new MiniSearch<SearchDocument>(INDEX_OPTIONS);
		index.addAll(data.documents);
		indexes.set(data.script, index);
		reply({ type: "ready", script: data.script });
		return;
	}
	const index = indexes.get(data.script);
	if (!index) {
		return;
	}
	let allWords = true;
	let hits = index.search(data.query, queryOptions("AND"));
	if (hits.length === 0) {
		allWords = false;
		hits = index.search(data.query, queryOptions("OR"));
	}
	reply({
		type: "results",
		id: data.id,
		hits: hits.map((hit) => ({ id: String(hit.id), terms: hit.terms })),
		allWords,
	});
};

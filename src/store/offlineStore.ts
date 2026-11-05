import { KEPT_EVENT, dataUrl, savedFileOf } from "@/lib/dataPaths";
import {
	type ChapterInfo,
	type DownloadSizes,
	loadDownloadSizes,
} from "@/lib/gitaData";
import {
	type DownloadItem,
	type SavedState,
	askToKeepStorage,
	commentaryItems,
	offlineSupported,
	pruneOldCaches,
	readSavedState,
	removeDownloads,
	saveFiles,
	storageStatus,
	textItems,
} from "@/lib/offline";
import { create } from "zustand";

export type DownloadTarget =
	| { kind: "chapter"; chapter: number }
	| { kind: "text" }
	| { kind: "commentary" };

export interface DownloadJob {
	target: DownloadTarget;
	done: number;
	total: number;
	status: "running" | "failed";
}

interface OfflineState extends SavedState {
	supported: boolean;
	loaded: boolean;
	sizes: DownloadSizes | null;
	usage: number | null;
	persisted: boolean;
	job: DownloadJob | null;
	refresh: () => Promise<void>;
	downloadChapter: (chapter: ChapterInfo) => Promise<void>;
	downloadAllText: (chapters: ChapterInfo[]) => Promise<void>;
	downloadAllCommentary: (chapters: ChapterInfo[]) => Promise<void>;
	stop: () => void;
	removeAll: () => Promise<void>;
}

let running: AbortController | null = null;

export const useOfflineStore = create<OfflineState>()((set, get) => {
	const run = async (target: DownloadTarget, items: DownloadItem[]) => {
		if (running) {
			return;
		}
		const controller = new AbortController();
		running = controller;
		// After Stop, a new download may already be running; this one must not touch its state.
		const current = () => running === controller;
		set({ job: { target, done: 0, total: items.length, status: "running" } });
		askToKeepStorage();
		try {
			await saveFiles(items, {
				signal: controller.signal,
				onProgress: (done, total) => {
					if (current()) {
						set({ job: { target, done, total, status: "running" } });
					}
				},
			});
			if (current()) {
				set({ job: null });
			}
		} catch {
			if (current()) {
				set(({ job }) => ({ job: job && { ...job, status: "failed" } }));
			}
		} finally {
			if (current()) {
				running = null;
			}
			await get().refresh();
		}
	};

	return {
		supported: offlineSupported(),
		loaded: false,
		text: new Set(),
		commentary: new Map(),
		sizes: null,
		usage: null,
		persisted: false,
		job: null,
		refresh: async () => {
			if (!get().supported) {
				return;
			}
			try {
				const [saved, storage, sizes] = await Promise.all([
					readSavedState(),
					storageStatus(),
					get().sizes ?? loadDownloadSizes().catch(() => null),
				]);
				set({ ...saved, ...storage, sizes, loaded: true });
			} catch {
				set({ loaded: true });
			}
		},
		downloadChapter: (chapter) =>
			run({ kind: "chapter", chapter: chapter.number }, [
				...textItems([chapter.number]),
				...commentaryItems(chapter),
			]),
		downloadAllText: (chapters) =>
			run(
				{ kind: "text" },
				textItems(chapters.map((chapter) => chapter.number)),
			),
		downloadAllCommentary: (chapters) =>
			run(
				{ kind: "commentary" },
				chapters.flatMap((chapter) => [
					...textItems([chapter.number]),
					...commentaryItems(chapter),
				]),
			),
		stop: () => {
			running?.abort();
			running = null;
			set({ job: null });
		},
		removeAll: async () => {
			get().stop();
			await removeDownloads();
			await get().refresh();
		},
	};
});

let started: Promise<void> | null = null;

function noteKept(path: string) {
	const file = savedFileOf(dataUrl(path));
	if (!file) {
		return;
	}
	const { text, commentary } = useOfflineStore.getState();
	if (file.kind === "chapter") {
		useOfflineStore.setState({ text: new Set(text).add(file.chapter) });
	} else {
		useOfflineStore.setState({
			commentary: new Map(commentary).set(
				file.chapter,
				(commentary.get(file.chapter) ?? 0) + 1,
			),
		});
	}
}

// Started once from main.tsx so the saved state is known before the first page that shows it.
export function startOfflineLibrary() {
	if (!started) {
		if (!offlineSupported()) {
			started = Promise.resolve();
			return started;
		}
		pruneOldCaches().catch(() => {});
		let timer: ReturnType<typeof setTimeout> | undefined;
		window.addEventListener(KEPT_EVENT, (event) => {
			noteKept((event as CustomEvent<string>).detail);
			clearTimeout(timer);
			timer = setTimeout(() => useOfflineStore.getState().refresh(), 1000);
		});
		navigator.serviceWorker?.ready
			.then(() => useOfflineStore.getState().refresh())
			.catch(() => {});
		started = useOfflineStore.getState().refresh();
	}
	return started;
}

export function useOfflineLibrary() {
	return useOfflineStore();
}

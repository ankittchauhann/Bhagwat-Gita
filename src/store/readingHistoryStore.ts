import { addDays, localDay, verseKey } from "@/lib/progress";
import { create } from "zustand";

export interface ReadingPosition {
	chapterId: number;
	verseNumber: number;
	chapterName: string;
	chapterNameTranslated: string;
	timestamp: number;
}

export interface HistoryEntry extends ReadingPosition {
	versePreview?: string;
}

// Carries what the Saved page shows, so it works without loading the chapter.
export interface Bookmark {
	id: string;
	chapterId: number;
	verseNumber: number;
	chapterName: string;
	sanskrit: string;
	translation?: string;
	translatorName?: string;
	timestamp: number;
	note?: string;
}

export interface ReadingStats {
	versesRead: Set<string>; // Format: "chapterId-verseNumber"
	// Local calendar day → different verses opened that day.
	readDays: Record<string, number>;
	today: { day: string; verses: string[] };
}

interface ReadingHistoryState {
	lastPosition: ReadingPosition | null;
	history: HistoryEntry[];
	bookmarks: Bookmark[];
	stats: ReadingStats;

	// Actions
	setLastPosition: (position: ReadingPosition) => void;
	addToHistory: (entry: HistoryEntry) => void;
	addBookmark: (bookmark: Bookmark) => void;
	removeBookmark: (bookmarkId: string) => void;
	setBookmarkNote: (bookmarkId: string, note: string) => void;
	markVerseAsRead: (chapterId: number, verseNumber: number) => void;
	isVerseRead: (chapterId: number, verseNumber: number) => boolean;
	clearHistory: () => void;
	loadFromStorage: () => void;
}

// LocalStorage keys
const STORAGE_KEYS = {
	LAST_POSITION: "gita_last_position",
	HISTORY: "gita_reading_history",
	BOOKMARKS: "gita_bookmarks",
	STATS: "gita_reading_stats",
};

// Helper functions for localStorage
const saveToStorage = (key: string, data: unknown) => {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error(`Failed to save ${key} to localStorage:`, error);
	}
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
	try {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : defaultValue;
	} catch (error) {
		console.error(`Failed to load ${key} from localStorage:`, error);
		return defaultValue;
	}
};

// Convert Set to Array for storage
const serializeStats = (stats: ReadingStats) => ({
	...stats,
	versesRead: Array.from(stats.versesRead),
});

interface SerializedStats {
	versesRead?: string[];
	readDays?: Record<string, number>;
	today?: { day: string; verses: string[] };
	// Before November 2026 only a streak counter was kept.
	lastReadDate?: string;
	readingStreak?: number;
}

const KEPT_DAYS = 400;

function migratedDays({ lastReadDate, readingStreak }: SerializedStats) {
	const days: Record<string, number> = {};
	if (lastReadDate && readingStreak) {
		for (let index = 0; index < Math.min(readingStreak, KEPT_DAYS); index++) {
			days[addDays(lastReadDate, -index)] = 0;
		}
	}
	return days;
}

const deserializeStats = (data: SerializedStats): ReadingStats => ({
	versesRead: new Set(data.versesRead ?? []),
	readDays: data.readDays ?? migratedDays(data),
	today: data.today ?? { day: "", verses: [] },
});

// Read synchronously at creation so a direct visit to a verse never overwrites saved history with an empty state.
const readStoredState = () => ({
	lastPosition: loadFromStorage<ReadingPosition | null>(
		STORAGE_KEYS.LAST_POSITION,
		null,
	),
	history: loadFromStorage<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []),
	bookmarks: loadFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []),
	stats: deserializeStats(
		loadFromStorage<SerializedStats>(STORAGE_KEYS.STATS, {}),
	),
});

export const useReadingHistory = create<ReadingHistoryState>((set, get) => ({
	...readStoredState(),

	setLastPosition: (position) => {
		set({ lastPosition: position });
		saveToStorage(STORAGE_KEYS.LAST_POSITION, position);
	},

	addToHistory: (entry) => {
		const { history } = get();

		// Check if this entry already exists (same chapter and verse)
		const existingIndex = history.findIndex(
			(h) =>
				h.chapterId === entry.chapterId && h.verseNumber === entry.verseNumber,
		);

		let newHistory: HistoryEntry[];

		if (existingIndex !== -1) {
			// Update timestamp and move to front
			newHistory = [
				{ ...entry, timestamp: Date.now() },
				...history.filter((_, i) => i !== existingIndex),
			];
		} else {
			// Add new entry at the front
			newHistory = [{ ...entry, timestamp: Date.now() }, ...history];
		}

		// Keep only last 20 entries
		newHistory = newHistory.slice(0, 20);

		set({ history: newHistory });
		saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
	},

	addBookmark: (bookmark) => {
		const { bookmarks } = get();

		// Check if bookmark already exists
		const exists = bookmarks.some((b) => b.id === bookmark.id);
		if (exists) {
			return;
		}

		const newBookmarks = [bookmark, ...bookmarks];
		set({ bookmarks: newBookmarks });
		saveToStorage(STORAGE_KEYS.BOOKMARKS, newBookmarks);
	},

	removeBookmark: (bookmarkId) => {
		const { bookmarks } = get();
		const newBookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
		set({ bookmarks: newBookmarks });
		saveToStorage(STORAGE_KEYS.BOOKMARKS, newBookmarks);
	},

	setBookmarkNote: (bookmarkId, note) => {
		const text = note.trim();
		const newBookmarks = get().bookmarks.map((bookmark) =>
			bookmark.id === bookmarkId
				? { ...bookmark, note: text || undefined }
				: bookmark,
		);
		set({ bookmarks: newBookmarks });
		saveToStorage(STORAGE_KEYS.BOOKMARKS, newBookmarks);
	},

	markVerseAsRead: (chapterId, verseNumber) => {
		const { stats } = get();
		const key = verseKey(chapterId, verseNumber);
		const day = localDay();
		const todayVerses = stats.today.day === day ? stats.today.verses : [];
		const firstToday = !todayVerses.includes(key);
		if (stats.versesRead.has(key) && !firstToday) {
			return;
		}

		const readDays: Record<string, number> = {};
		const oldest = addDays(day, -KEPT_DAYS);
		for (const [entry, count] of Object.entries(stats.readDays)) {
			if (entry > oldest) {
				readDays[entry] = count;
			}
		}
		readDays[day] = (readDays[day] ?? 0) + (firstToday ? 1 : 0);

		const newStats: ReadingStats = {
			versesRead: new Set(stats.versesRead).add(key),
			readDays,
			today: { day, verses: firstToday ? [...todayVerses, key] : todayVerses },
		};

		set({ stats: newStats });
		saveToStorage(STORAGE_KEYS.STATS, serializeStats(newStats));
	},

	isVerseRead: (chapterId, verseNumber) =>
		get().stats.versesRead.has(verseKey(chapterId, verseNumber)),

	clearHistory: () => {
		set({ history: [] });
		saveToStorage(STORAGE_KEYS.HISTORY, []);
	},

	loadFromStorage: () => {
		set(readStoredState());
	},
}));

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

export interface Bookmark {
	id: string;
	chapterId: number;
	verseNumber: number;
	chapterName: string;
	verseText: string;
	timestamp: number;
	note?: string;
}

export interface ReadingStats {
	versesRead: Set<string>; // Format: "chapterId-verseNumber"
	totalTimeSpent: number; // in seconds
	lastReadDate: string; // ISO date string
	readingStreak: number; // consecutive days
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
	versesRead: string[];
	totalTimeSpent: number;
	lastReadDate: string;
	readingStreak: number;
}

const deserializeStats = (data: SerializedStats): ReadingStats => ({
	...data,
	versesRead: new Set(data.versesRead || []),
});

export const useReadingHistory = create<ReadingHistoryState>((set, get) => ({
	lastPosition: null,
	history: [],
	bookmarks: [],
	stats: {
		versesRead: new Set<string>(),
		totalTimeSpent: 0,
		lastReadDate: new Date().toISOString().split("T")[0],
		readingStreak: 0,
	},

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
			console.log("Bookmark already exists");
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

	markVerseAsRead: (chapterId, verseNumber) => {
		const { stats } = get();
		const verseKey = `${chapterId}-${verseNumber}`;

		// Add verse to read set
		const newVersesRead = new Set(stats.versesRead);
		newVersesRead.add(verseKey);

		// Update last read date and streak
		const today = new Date().toISOString().split("T")[0];
		const yesterday = new Date(Date.now() - 86400000)
			.toISOString()
			.split("T")[0];

		let newStreak = stats.readingStreak;
		if (stats.lastReadDate === yesterday) {
			newStreak += 1;
		} else if (stats.lastReadDate !== today) {
			newStreak = 1;
		}

		const newStats: ReadingStats = {
			...stats,
			versesRead: newVersesRead,
			lastReadDate: today,
			readingStreak: newStreak,
		};

		set({ stats: newStats });
		saveToStorage(STORAGE_KEYS.STATS, serializeStats(newStats));
	},

	isVerseRead: (chapterId, verseNumber) => {
		const { stats } = get();
		const verseKey = `${chapterId}-${verseNumber}`;
		return stats.versesRead.has(verseKey);
	},

	clearHistory: () => {
		set({ history: [] });
		saveToStorage(STORAGE_KEYS.HISTORY, []);
	},

	loadFromStorage: () => {
		const lastPosition = loadFromStorage<ReadingPosition | null>(
			STORAGE_KEYS.LAST_POSITION,
			null,
		);
		const history = loadFromStorage<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
		const bookmarks = loadFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
		const statsData = loadFromStorage<SerializedStats>(STORAGE_KEYS.STATS, {
			versesRead: [],
			totalTimeSpent: 0,
			lastReadDate: new Date().toISOString().split("T")[0],
			readingStreak: 0,
		});

		const stats = deserializeStats(statsData);

		set({ lastPosition, history, bookmarks, stats });
	},
}));

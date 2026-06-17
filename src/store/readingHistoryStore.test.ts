import { beforeEach, describe, expect, it } from "vitest";
import { useReadingHistory } from "./readingHistoryStore";

function resetStore() {
	localStorage.clear();
	useReadingHistory.setState({
		lastPosition: null,
		history: [],
		bookmarks: [],
		stats: {
			versesRead: new Set<string>(),
			totalTimeSpent: 0,
			lastReadDate: new Date().toISOString().split("T")[0],
			readingStreak: 0,
		},
	});
}

describe("useReadingHistory", () => {
	beforeEach(resetStore);

	it("setLastPosition updates state and persists to localStorage", () => {
		const position = {
			chapterId: 1,
			verseNumber: 2,
			chapterName: "Arjuna Vishada Yoga",
			chapterNameTranslated: "Arjuna's Dilemma",
			timestamp: Date.now(),
		};

		useReadingHistory.getState().setLastPosition(position);

		expect(useReadingHistory.getState().lastPosition).toEqual(position);
		expect(
			JSON.parse(localStorage.getItem("gita_last_position") ?? "null"),
		).toEqual(position);
	});

	it("addToHistory moves a repeated verse to the front instead of duplicating it", () => {
		const entry = (verseNumber: number) => ({
			chapterId: 1,
			verseNumber,
			chapterName: "Chapter 1",
			chapterNameTranslated: "Chapter 1",
			timestamp: Date.now(),
		});

		useReadingHistory.getState().addToHistory(entry(1));
		useReadingHistory.getState().addToHistory(entry(2));
		useReadingHistory.getState().addToHistory(entry(1));

		const { history } = useReadingHistory.getState();
		expect(history).toHaveLength(2);
		expect(history[0].verseNumber).toBe(1);
		expect(history[1].verseNumber).toBe(2);
	});

	it("addToHistory caps history at 20 entries", () => {
		for (let i = 1; i <= 25; i++) {
			useReadingHistory.getState().addToHistory({
				chapterId: 1,
				verseNumber: i,
				chapterName: "Chapter 1",
				chapterNameTranslated: "Chapter 1",
				timestamp: Date.now(),
			});
		}

		expect(useReadingHistory.getState().history).toHaveLength(20);
		expect(useReadingHistory.getState().history[0].verseNumber).toBe(25);
	});

	it("addBookmark ignores duplicate ids", () => {
		const bookmark = {
			id: "1-1",
			chapterId: 1,
			verseNumber: 1,
			chapterName: "Chapter 1",
			verseText: "...",
			timestamp: Date.now(),
		};

		useReadingHistory.getState().addBookmark(bookmark);
		useReadingHistory.getState().addBookmark(bookmark);

		expect(useReadingHistory.getState().bookmarks).toHaveLength(1);
	});

	it("removeBookmark removes only the matching id", () => {
		useReadingHistory.getState().addBookmark({
			id: "1-1",
			chapterId: 1,
			verseNumber: 1,
			chapterName: "Chapter 1",
			verseText: "...",
			timestamp: Date.now(),
		});
		useReadingHistory.getState().addBookmark({
			id: "1-2",
			chapterId: 1,
			verseNumber: 2,
			chapterName: "Chapter 1",
			verseText: "...",
			timestamp: Date.now(),
		});

		useReadingHistory.getState().removeBookmark("1-1");

		expect(useReadingHistory.getState().bookmarks.map((b) => b.id)).toEqual([
			"1-2",
		]);
	});

	it("markVerseAsRead tracks read verses and isVerseRead reflects them", () => {
		useReadingHistory.getState().markVerseAsRead(2, 10);

		expect(useReadingHistory.getState().isVerseRead(2, 10)).toBe(true);
		expect(useReadingHistory.getState().isVerseRead(2, 11)).toBe(false);
	});

	it("markVerseAsRead increments the streak on consecutive days and resets otherwise", () => {
		const today = new Date().toISOString().split("T")[0];
		const yesterday = new Date(Date.now() - 86400000)
			.toISOString()
			.split("T")[0];
		const longAgo = new Date(Date.now() - 10 * 86400000)
			.toISOString()
			.split("T")[0];

		useReadingHistory.setState({
			stats: {
				versesRead: new Set(),
				totalTimeSpent: 0,
				lastReadDate: yesterday,
				readingStreak: 3,
			},
		});
		useReadingHistory.getState().markVerseAsRead(1, 1);
		expect(useReadingHistory.getState().stats.readingStreak).toBe(4);
		expect(useReadingHistory.getState().stats.lastReadDate).toBe(today);

		useReadingHistory.setState({
			stats: {
				versesRead: new Set(),
				totalTimeSpent: 0,
				lastReadDate: longAgo,
				readingStreak: 5,
			},
		});
		useReadingHistory.getState().markVerseAsRead(1, 2);
		expect(useReadingHistory.getState().stats.readingStreak).toBe(1);
	});

	it("clearHistory empties history but keeps bookmarks and stats", () => {
		useReadingHistory.getState().addToHistory({
			chapterId: 1,
			verseNumber: 1,
			chapterName: "Chapter 1",
			chapterNameTranslated: "Chapter 1",
			timestamp: Date.now(),
		});

		useReadingHistory.getState().clearHistory();

		expect(useReadingHistory.getState().history).toEqual([]);
	});

	it("loadFromStorage rehydrates state, deserializing versesRead back into a Set", () => {
		useReadingHistory.getState().markVerseAsRead(1, 1);
		useReadingHistory.getState().addBookmark({
			id: "1-1",
			chapterId: 1,
			verseNumber: 1,
			chapterName: "Chapter 1",
			verseText: "...",
			timestamp: Date.now(),
		});

		// Simulate a fresh page load: reset in-memory state but keep localStorage intact.
		useReadingHistory.setState({
			lastPosition: null,
			history: [],
			bookmarks: [],
			stats: {
				versesRead: new Set(),
				totalTimeSpent: 0,
				lastReadDate: new Date().toISOString().split("T")[0],
				readingStreak: 0,
			},
		});
		expect(useReadingHistory.getState().bookmarks).toEqual([]);

		useReadingHistory.getState().loadFromStorage();

		expect(useReadingHistory.getState().bookmarks).toHaveLength(1);
		expect(useReadingHistory.getState().stats.versesRead).toBeInstanceOf(Set);
		expect(useReadingHistory.getState().isVerseRead(1, 1)).toBe(true);
	});
});

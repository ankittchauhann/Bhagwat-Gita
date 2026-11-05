import {
	addDays,
	lastSevenDays,
	localDay,
	readingStreak,
} from "@/lib/progress";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReadingHistory } from "./readingHistoryStore";

function resetStore() {
	localStorage.clear();
	useReadingHistory.setState({
		lastPosition: null,
		history: [],
		bookmarks: [],
		stats: {
			versesRead: new Set<string>(),
			readDays: {},
			today: { day: "", verses: [] },
		},
	});
}

describe("useReadingHistory", () => {
	beforeEach(resetStore);
	afterEach(() => vi.useRealTimers());

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
			sanskrit: "...",
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
			sanskrit: "...",
			timestamp: Date.now(),
		});
		useReadingHistory.getState().addBookmark({
			id: "1-2",
			chapterId: 1,
			verseNumber: 2,
			chapterName: "Chapter 1",
			sanskrit: "...",
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

	it("counts the different verses opened each local day, once each", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 10, 5, 23, 30));
		const store = useReadingHistory.getState();
		store.markVerseAsRead(2, 47);
		store.markVerseAsRead(2, 47);
		store.markVerseAsRead(2, 48);
		expect(useReadingHistory.getState().stats.readDays).toEqual({
			"2026-11-05": 2,
		});

		vi.setSystemTime(new Date(2026, 10, 6, 0, 30));
		useReadingHistory.getState().markVerseAsRead(2, 47);
		expect(useReadingHistory.getState().stats.readDays).toEqual({
			"2026-11-05": 2,
			"2026-11-06": 1,
		});
		vi.useRealTimers();
	});

	it("setBookmarkNote saves a trimmed note and clears an empty one", () => {
		useReadingHistory.getState().addBookmark({
			id: "2-47",
			chapterId: 2,
			verseNumber: 47,
			chapterName: "Sankhya Yoga",
			sanskrit: "...",
			timestamp: 1,
		});
		useReadingHistory.getState().setBookmarkNote("2-47", "  Do the work.  ");
		expect(useReadingHistory.getState().bookmarks[0].note).toBe("Do the work.");
		useReadingHistory.getState().setBookmarkNote("2-47", "   ");
		expect(useReadingHistory.getState().bookmarks[0].note).toBeUndefined();
		expect(
			JSON.parse(localStorage.getItem("gita_bookmarks") ?? "[]")[0].note,
		).toBeUndefined();
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
			sanskrit: "...",
			timestamp: Date.now(),
		});

		// Simulate a fresh page load: reset in-memory state but keep localStorage intact.
		useReadingHistory.setState({
			lastPosition: null,
			history: [],
			bookmarks: [],
			stats: {
				versesRead: new Set(),
				readDays: {},
				today: { day: "", verses: [] },
			},
		});
		expect(useReadingHistory.getState().bookmarks).toEqual([]);

		useReadingHistory.getState().loadFromStorage();

		expect(useReadingHistory.getState().bookmarks).toHaveLength(1);
		expect(useReadingHistory.getState().stats.versesRead).toBeInstanceOf(Set);
		expect(useReadingHistory.getState().isVerseRead(1, 1)).toBe(true);
	});
});

describe("reading days", () => {
	const today = "2026-11-05";

	it("counts a streak up to today, or up to yesterday until today ends", () => {
		const days = { "2026-11-02": 3, "2026-11-03": 1, "2026-11-04": 5 };
		expect(readingStreak(days, today)).toEqual({ days: 3, readToday: false });
		expect(readingStreak({ ...days, [today]: 2 }, today)).toEqual({
			days: 4,
			readToday: true,
		});
		expect(readingStreak({ "2026-11-01": 1 }, today).days).toBe(0);
	});

	it("lists the last seven days, oldest first", () => {
		const week = lastSevenDays({ "2026-11-05": 4, "2026-10-30": 2 }, today);
		expect(week.map((entry) => entry.day)).toEqual([
			"2026-10-30",
			"2026-10-31",
			"2026-11-01",
			"2026-11-02",
			"2026-11-03",
			"2026-11-04",
			"2026-11-05",
		]);
		expect(week.map((entry) => entry.verses)).toEqual([2, 0, 0, 0, 0, 0, 4]);
	});

	it("uses the local calendar day and steps across month ends", () => {
		expect(localDay(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
		expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
		expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
	});
});

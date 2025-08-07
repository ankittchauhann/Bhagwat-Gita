import { create } from "zustand";

export interface Chapter {
	id: number;
	name: string;
	name_transliterated: string;
	name_translated: string;
	verses_count: number;
	chapter_number: number;
	name_meaning: string;
	chapter_summary: string;
}

export interface Translation {
	id: number;
	description: string;
	author_name: string;
	language: string;
}

export interface Commentary {
	id: number;
	description: string;
	author_name: string;
	language: string;
}

export interface Verse {
	id: number;
	verse_number: number;
	chapter_number: number;
	text: string;
	translations: Translation[];
	commentaries: Commentary[];
}

interface GitaState {
	chapters: Chapter[];
	currentChapter: Chapter | null;
	verses: Verse[];
	currentVerse: Verse | null;
	loading: boolean;
	error: string | null;

	// Actions
	setChapters: (chapters: Chapter[]) => void;
	setCurrentChapter: (chapter: Chapter | null) => void;
	setVerses: (verses: Verse[]) => void;
	setCurrentVerse: (verse: Verse | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;

	// API calls
	fetchChapters: () => Promise<void>;
	fetchChapter: (chapterId: number) => Promise<void>;
	fetchVerses: (chapterId: number) => Promise<void>;
	fetchVerse: (chapterId: number, verseNumber: number) => Promise<void>;
}

const API_BASE_URL = "/api"; // Use proxy endpoint

// Utility function to create fetch with retry and timeout
const fetchWithRetry = async (
	url: string,
	options: RequestInit,
	retries = 3,
	timeout = 10000,
): Promise<Response> => {
	for (let i = 0; i < retries; i++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				return response;
			}

			// If it's a server error (500+) or rate limit (429), retry
			if (response.status >= 500 || response.status === 429) {
				if (i === retries - 1) {
					throw new Error(`API request failed with status: ${response.status}`);
				}
				// Wait before retrying (exponential backoff)
				await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
				continue;
			}

			// For other errors, don't retry
			throw new Error(`API request failed with status: ${response.status}`);
		} catch (error) {
			if (i === retries - 1) {
				if (error instanceof Error && error.name === "AbortError") {
					throw new Error(
						"Request timeout - please check your internet connection",
					);
				}
				throw error;
			}
			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
		}
	}
	throw new Error("Maximum retries exceeded");
};

export const useGitaStore = create<GitaState>((set) => ({
	chapters: [],
	currentChapter: null,
	verses: [],
	currentVerse: null,
	loading: false,
	error: null,

	setChapters: (chapters) => set({ chapters }),
	setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
	setVerses: (verses) => set({ verses }),
	setCurrentVerse: (verse) => set({ currentVerse: verse }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),

	fetchChapters: async () => {
		set({ loading: true, error: null });
		try {
			const response = await fetchWithRetry(
				`${API_BASE_URL}/chapters/?skip=0&limit=18`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const chapters = await response.json();
			set({ chapters, loading: false });
		} catch (error) {
			console.error("Failed to fetch chapters:", error);
			set({
				error:
					error instanceof Error
						? error.message
						: "Failed to load chapters. Please check your internet connection and try again.",
				loading: false,
			});
		}
	},

	fetchChapter: async (chapterId: number) => {
		set({ loading: true, error: null });
		try {
			const response = await fetchWithRetry(
				`${API_BASE_URL}/chapters/${chapterId}/`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const chapter = await response.json();
			set({ currentChapter: chapter, loading: false });
		} catch (error) {
			console.error(`Failed to fetch chapter ${chapterId}:`, error);
			set({
				error:
					error instanceof Error
						? error.message
						: `Failed to load chapter ${chapterId}. Please try again.`,
				loading: false,
			});
		}
	},

	fetchVerses: async (chapterId: number) => {
		set({ loading: true, error: null });
		try {
			const response = await fetchWithRetry(
				`${API_BASE_URL}/chapters/${chapterId}/verses`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const verses = await response.json();
			set({ verses, loading: false });
		} catch (error) {
			console.error(`Failed to fetch verses for chapter ${chapterId}:`, error);
			set({
				error:
					error instanceof Error
						? error.message
						: `Failed to load verses for chapter ${chapterId}. Please try again.`,
				loading: false,
			});
		}
	},

	fetchVerse: async (chapterId: number, verseNumber: number) => {
		set({ loading: true, error: null });
		try {
			const response = await fetchWithRetry(
				`${API_BASE_URL}/chapters/${chapterId}/verses/${verseNumber}/`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const verse = await response.json();
			set({ currentVerse: verse, loading: false });
		} catch (error) {
			console.error(
				`Failed to fetch verse ${chapterId}.${verseNumber}:`,
				error,
			);
			set({
				error:
					error instanceof Error
						? error.message
						: `Failed to load verse ${verseNumber}. Please try again.`,
				loading: false,
			});
		}
	},
}));

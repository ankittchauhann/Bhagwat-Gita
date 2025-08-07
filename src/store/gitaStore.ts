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
	transliteration: string;
	word_meanings?: string;
	slug?: string;
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

const API_BASE_URL = "/api"; // Use Vercel API endpoint
const FALLBACK_API_BASE_URL = "https://bhagavad-gita3.p.rapidapi.com/v2"; // Fallback direct API
const RAPIDAPI_KEY = "4af41e915emshcd8cf0801c6079dp1b0ba6jsn3535b27141fd";
const RAPIDAPI_HOST = "bhagavad-gita3.p.rapidapi.com";

// Utility function to create fetch with retry and fallback
const fetchWithRetryAndFallback = async (
	endpoint: string,
	options: RequestInit = {},
	retries = 2,
	timeout = 10000,
): Promise<Response> => {
	// First try: Vercel API route
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			signal: controller.signal,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		clearTimeout(timeoutId);

		if (response.ok) {
			return response;
		}

		// If Vercel API fails, throw error to trigger fallback
		throw new Error(`Vercel API failed with status: ${response.status}`);
	} catch (error) {
		console.warn("Vercel API failed, trying direct RapidAPI:", error);

		// Fallback: Direct RapidAPI call
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const directUrl = `${FALLBACK_API_BASE_URL}${endpoint}`;
		const response = await fetch(directUrl, {
			...options,
			signal: controller.signal,
			headers: {
				"x-rapidapi-host": RAPIDAPI_HOST,
				"x-rapidapi-key": RAPIDAPI_KEY,
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(
				`Both APIs failed. Direct API status: ${response.status}`,
			);
		}

		return response;
	}
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
			const response = await fetchWithRetryAndFallback(
				"/chapters/?skip=0&limit=18",
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
			const response = await fetchWithRetryAndFallback(
				`/chapters/${chapterId}/`,
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
			const response = await fetchWithRetryAndFallback(
				`/chapters/${chapterId}/verses`,
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
			const response = await fetchWithRetryAndFallback(
				`/chapters/${chapterId}/verses/${verseNumber}/`,
			);

			const verse = await response.json();
			console.log("Fetched verse data:", verse); // Debug log to see the data structure
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

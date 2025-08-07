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

export interface Verse {
	id: number;
	verse_number: number;
	chapter_number: number;
	text: string;
	transliteration: string;
	meaning: {
		author: string;
		text: string;
	};
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
	fetchVerses: (chapterId: number) => Promise<void>;
}

const API_BASE_URL = "https://bhagavad-gita3.p.rapidapi.com/v2";
const API_KEY = "4af41e915emshcd8cf0801c6079dp1b0ba6jsn3535b27141fd";

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
			const response = await fetch(
				`${API_BASE_URL}/chapters/?skip=0&limit=18`,
				{
					headers: {
						"x-rapidapi-host": "bhagavad-gita3.p.rapidapi.com",
						"x-rapidapi-key": API_KEY,
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch chapters");
			}

			const chapters = await response.json();
			set({ chapters, loading: false });
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "An error occurred",
				loading: false,
			});
		}
	},

	fetchVerses: async (chapterId: number) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(
				`${API_BASE_URL}/chapters/${chapterId}/verses`,
				{
					headers: {
						"x-rapidapi-host": "bhagavad-gita3.p.rapidapi.com",
						"x-rapidapi-key": API_KEY,
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch verses");
			}

			const verses = await response.json();
			set({ verses, loading: false });
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "An error occurred",
				loading: false,
			});
		}
	},
}));

import { create } from "zustand";
import {
	type StateStorage,
	createJSONStorage,
	persist,
} from "zustand/middleware";

export const PREFERENCES_STORAGE_KEY = "gita_prefs_v1";

// Swami Sivananda: an English translation and the only English commentary in the data.
export const DEFAULT_ENGLISH_TRANSLATOR_ID = 16;
export const DEFAULT_COMMENTATOR_ID = 16;

interface PreferencesState {
	englishTranslatorId: number;
	commentatorId: number;
	showCommentary: boolean;
	setEnglishTranslatorId: (id: number) => void;
	setCommentatorId: (id: number) => void;
	setShowCommentary: (show: boolean) => void;
}

const safeLocalStorage: StateStorage = {
	getItem: (name) => {
		try {
			return localStorage.getItem(name);
		} catch {
			return null;
		}
	},
	setItem: (name, value) => {
		try {
			localStorage.setItem(name, value);
		} catch {
			// Storage can be full or blocked; the preference still applies for this visit.
		}
	},
	removeItem: (name) => {
		try {
			localStorage.removeItem(name);
		} catch {
			// Nothing to remove when storage is unavailable.
		}
	},
};

export const usePreferences = create<PreferencesState>()(
	persist(
		(set) => ({
			englishTranslatorId: DEFAULT_ENGLISH_TRANSLATOR_ID,
			commentatorId: DEFAULT_COMMENTATOR_ID,
			showCommentary: false,
			setEnglishTranslatorId: (englishTranslatorId) =>
				set({ englishTranslatorId }),
			setCommentatorId: (commentatorId) => set({ commentatorId }),
			setShowCommentary: (showCommentary) => set({ showCommentary }),
		}),
		{
			name: PREFERENCES_STORAGE_KEY,
			version: 1,
			storage: createJSONStorage(() => safeLocalStorage),
			partialize: ({ englishTranslatorId, commentatorId, showCommentary }) => ({
				englishTranslatorId,
				commentatorId,
				showCommentary,
			}),
		},
	),
);

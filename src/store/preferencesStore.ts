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
// Swami Ramsukhdas: a Hindi translation and a Hindi commentary.
export const DEFAULT_HINDI_TRANSLATOR_ID = 1;

export const TEXT_SIZES = [0, 1, 2, 3] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export interface Preferences {
	englishTranslatorId: number;
	hindiTranslatorId: number;
	commentatorId: number;
	sanskritSize: TextSize;
	translationSize: TextSize;
	showTransliteration: boolean;
	showWordMeanings: boolean;
	showHindi: boolean;
	wordMeaningsOpen: boolean;
	hindiOpen: boolean;
	commentaryOpen: boolean;
}

interface PreferencesState extends Preferences {
	setPreferences: (changes: Partial<Preferences>) => void;
}

export const DEFAULT_PREFERENCES: Preferences = {
	englishTranslatorId: DEFAULT_ENGLISH_TRANSLATOR_ID,
	hindiTranslatorId: DEFAULT_HINDI_TRANSLATOR_ID,
	commentatorId: DEFAULT_COMMENTATOR_ID,
	sanskritSize: 1,
	translationSize: 1,
	showTransliteration: true,
	showWordMeanings: true,
	showHindi: true,
	wordMeaningsOpen: false,
	hindiOpen: false,
	commentaryOpen: false,
};

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
			...DEFAULT_PREFERENCES,
			setPreferences: (changes) => set(changes),
		}),
		{
			name: PREFERENCES_STORAGE_KEY,
			version: 1,
			storage: createJSONStorage(() => safeLocalStorage),
			partialize: ({ setPreferences, ...preferences }) => preferences,
			merge: (persisted, current) => {
				const saved = (persisted ?? {}) as Record<string, unknown>;
				const known = Object.keys(DEFAULT_PREFERENCES).filter(
					(key) =>
						typeof saved[key] ===
						typeof DEFAULT_PREFERENCES[key as keyof Preferences],
				);
				return {
					...current,
					...Object.fromEntries(known.map((key) => [key, saved[key]])),
				};
			},
		},
	),
);

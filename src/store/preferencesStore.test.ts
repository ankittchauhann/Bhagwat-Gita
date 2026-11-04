import { beforeEach, describe, expect, it } from "vitest";
import {
	DEFAULT_PREFERENCES,
	PREFERENCES_STORAGE_KEY,
	usePreferences,
} from "./preferencesStore";

describe("usePreferences", () => {
	beforeEach(() => {
		localStorage.clear();
		usePreferences.setState(DEFAULT_PREFERENCES);
	});

	it("defaults to Swami Sivananda and Swami Ramsukhdas with every section closed", () => {
		expect(usePreferences.getState()).toMatchObject({
			englishTranslatorId: 16,
			hindiTranslatorId: 1,
			commentatorId: 16,
			sanskritSize: 1,
			translationSize: 1,
			showTransliteration: true,
			wordMeaningsOpen: false,
			hindiOpen: false,
			commentaryOpen: false,
		});
	});

	it("saves choices by author id and leaves out the actions", () => {
		usePreferences.getState().setPreferences({
			englishTranslatorId: 19,
			commentatorId: 14,
			commentaryOpen: true,
			sanskritSize: 3,
		});

		const saved = JSON.parse(
			localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "null",
		);
		expect(saved.state).toEqual({
			...DEFAULT_PREFERENCES,
			englishTranslatorId: 19,
			commentatorId: 14,
			commentaryOpen: true,
			sanskritSize: 3,
		});
	});

	it("keeps choices saved before the newer settings existed", async () => {
		localStorage.setItem(
			PREFERENCES_STORAGE_KEY,
			JSON.stringify({
				state: {
					englishTranslatorId: 19,
					commentatorId: 14,
					showCommentary: true,
				},
				version: 1,
			}),
		);
		await usePreferences.persist.rehydrate();

		expect(usePreferences.getState()).toMatchObject({
			englishTranslatorId: 19,
			commentatorId: 14,
			hindiTranslatorId: 1,
			translationSize: 1,
		});
	});
});

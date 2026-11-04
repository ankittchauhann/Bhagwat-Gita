import { beforeEach, describe, expect, it } from "vitest";
import {
	DEFAULT_COMMENTATOR_ID,
	DEFAULT_ENGLISH_TRANSLATOR_ID,
	PREFERENCES_STORAGE_KEY,
	usePreferences,
} from "./preferencesStore";

describe("usePreferences", () => {
	beforeEach(() => {
		localStorage.clear();
		usePreferences.setState({
			englishTranslatorId: DEFAULT_ENGLISH_TRANSLATOR_ID,
			commentatorId: DEFAULT_COMMENTATOR_ID,
			showCommentary: false,
		});
	});

	it("defaults to Swami Sivananda with commentary closed", () => {
		expect(usePreferences.getState()).toMatchObject({
			englishTranslatorId: 16,
			commentatorId: 16,
			showCommentary: false,
		});
	});

	it("saves choices by author id", () => {
		usePreferences.getState().setEnglishTranslatorId(19);
		usePreferences.getState().setCommentatorId(14);
		usePreferences.getState().setShowCommentary(true);

		const saved = JSON.parse(
			localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "null",
		);
		expect(saved.state).toEqual({
			englishTranslatorId: 19,
			commentatorId: 14,
			showCommentary: true,
		});
	});
});

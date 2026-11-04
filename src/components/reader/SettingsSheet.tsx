import { RadioList, SegmentedControl, Switch } from "@/components/ui/choice";
import { Sheet } from "@/components/ui/sheet";
import type { Author } from "@/lib/gitaData";
import {
	type ThemeSetting,
	applyThemeSetting,
	readThemeSetting,
} from "@/lib/theme";
import { type TextSize, usePreferences } from "@/store/preferencesStore";
import { useEffect, useState } from "react";

const THEME_OPTIONS: { value: ThemeSetting; label: string }[] = [
	{ value: "system", label: "System" },
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
];

const SIZE_OPTIONS: { value: TextSize; label: string }[] = [
	{ value: 0, label: "Small" },
	{ value: 1, label: "Default" },
	{ value: 2, label: "Large" },
	{ value: 3, label: "Largest" },
];

export const TRANSLATION_SECTION_ID = "settings-translation";

export function SettingsSheet({
	open,
	onClose,
	translators,
	focusSection,
}: {
	open: boolean;
	onClose: () => void;
	translators: Author[];
	focusSection: string | null;
}) {
	const preferences = usePreferences();
	const [theme, setTheme] = useState<ThemeSetting>(readThemeSetting);

	useEffect(() => {
		if (open && focusSection) {
			document.getElementById(focusSection)?.scrollIntoView({ block: "start" });
		}
	}, [open, focusSection]);

	const authorOptions = (language: Author["language"]) =>
		translators
			.filter((author) => author.language === language)
			.map((author) => ({ value: author.id, label: author.name }));

	return (
		<Sheet open={open} onClose={onClose} title="Reading settings">
			<div className="space-y-7">
				<SegmentedControl
					legend="Theme"
					options={THEME_OPTIONS}
					value={theme}
					onChange={(value) => {
						setTheme(value);
						applyThemeSetting(value);
					}}
				/>
				<SegmentedControl
					legend="Sanskrit text size"
					options={SIZE_OPTIONS}
					value={preferences.sanskritSize}
					onChange={(sanskritSize) =>
						preferences.setPreferences({ sanskritSize })
					}
				/>
				<SegmentedControl
					legend="Translation text size"
					options={SIZE_OPTIONS}
					value={preferences.translationSize}
					onChange={(translationSize) =>
						preferences.setPreferences({ translationSize })
					}
				/>
				<fieldset>
					<legend className="mb-1 text-[14px] font-semibold">Show</legend>
					<div className="divide-y">
						<Switch
							label="Transliteration"
							checked={preferences.showTransliteration}
							onChange={(showTransliteration) =>
								preferences.setPreferences({ showTransliteration })
							}
						/>
						<Switch
							label="Word meanings"
							checked={preferences.showWordMeanings}
							onChange={(showWordMeanings) =>
								preferences.setPreferences({ showWordMeanings })
							}
						/>
						<Switch
							label="Hindi translation"
							checked={preferences.showHindi}
							onChange={(showHindi) =>
								preferences.setPreferences({ showHindi })
							}
						/>
					</div>
				</fieldset>
				<div id={TRANSLATION_SECTION_ID} className="scroll-mt-4">
					<RadioList
						legend="English translation"
						options={authorOptions("english")}
						value={preferences.englishTranslatorId}
						onChange={(englishTranslatorId) =>
							preferences.setPreferences({ englishTranslatorId })
						}
					/>
				</div>
				<RadioList
					legend="Hindi translation"
					options={authorOptions("hindi")}
					value={preferences.hindiTranslatorId}
					onChange={(hindiTranslatorId) =>
						preferences.setPreferences({ hindiTranslatorId })
					}
				/>
			</div>
		</Sheet>
	);
}

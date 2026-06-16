import { useCallback, useEffect, useState } from "react";

export const speechLanguages = [
	{ value: "hi-IN", label: "Hindi", flag: "🇮🇳" },
	{ value: "en-US", label: "English", flag: "🇺🇸" },
	{ value: "hi-IN-sanskrit", label: "Sanskrit (Hindi Voice)", flag: "🕉️" }, // Use Hindi voice for Sanskrit
];

export function useTextToSpeech() {
	const [isPlaying, setIsPlaying] = useState(false);

	const speak = useCallback((text: string, lang: string) => {
		if (!window.speechSynthesis) {
			alert("Text-to-speech is not supported in your browser.");
			return;
		}

		// Stop any ongoing speech
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = lang;
		utterance.rate = 0.8; // Slower for better comprehension
		utterance.pitch = 1;
		utterance.volume = 1;

		utterance.onstart = () => setIsPlaying(true);
		utterance.onend = () => setIsPlaying(false);
		utterance.onerror = () => setIsPlaying(false);

		window.speechSynthesis.speak(utterance);
	}, []);

	const stop = useCallback(() => {
		if (window.speechSynthesis) {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		}
	}, []);

	// Clean up speech when the consuming component unmounts or verse changes
	useEffect(() => {
		return () => {
			if (window.speechSynthesis) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	return { isPlaying, speak, stop };
}

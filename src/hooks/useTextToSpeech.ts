import { useCallback, useEffect, useRef, useState } from "react";
import Speech from "speak-tts";

export const speechLanguages = [
	{ value: "hi-IN", label: "Hindi", flag: "🇮🇳" },
	{ value: "en-US", label: "English", flag: "🇺🇸" },
	{ value: "hi-IN-sanskrit", label: "Sanskrit (Hindi Voice)", flag: "🕉️" }, // Use Hindi voice for Sanskrit
];

// speak-tts wraps the native Web Speech API: it resolves init() only once
// voices have actually loaded (Chrome loads them asynchronously) and gives
// speak()/cancel() a Promise-based API instead of fire-and-forget callbacks.
export function useTextToSpeech() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const speechRef = useRef<Speech | null>(null);

	useEffect(() => {
		const speech = new Speech();
		if (!speech.hasBrowserSupport()) {
			return;
		}

		let isMounted = true;
		speech
			.init({ rate: 0.8, pitch: 1, volume: 1, splitSentences: false })
			.then(() => {
				if (isMounted) {
					speechRef.current = speech;
					setIsReady(true);
				}
			})
			.catch((error) => {
				console.error("Failed to initialize text-to-speech:", error);
			});

		return () => {
			isMounted = false;
			speech.cancel();
			speechRef.current = null;
		};
	}, []);

	const speak = useCallback((text: string, lang: string) => {
		const speech = speechRef.current;
		if (!speech) {
			alert("Text-to-speech is not supported in your browser.");
			return;
		}

		speech.setLanguage(lang);
		setIsPlaying(true);

		speech
			.speak({
				text,
				queue: false,
				listeners: {
					onend: () => setIsPlaying(false),
					onerror: () => setIsPlaying(false),
				},
			})
			.catch(() => setIsPlaying(false));
	}, []);

	const stop = useCallback(() => {
		speechRef.current?.cancel();
		setIsPlaying(false);
	}, []);

	return { isPlaying, isReady, speak, stop };
}

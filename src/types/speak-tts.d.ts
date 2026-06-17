declare module "speak-tts" {
	export interface SpeechInitConfig {
		volume?: number;
		lang?: string;
		voice?: string | SpeechSynthesisVoice;
		rate?: number;
		pitch?: number;
		splitSentences?: boolean;
		listeners?: {
			onvoiceschanged?: (voices: SpeechSynthesisVoice[]) => void;
		};
	}

	export interface SpeechInitResult {
		voices: SpeechSynthesisVoice[];
		lang?: string;
		voice?: SpeechSynthesisVoice;
		volume: number;
		rate: number;
		pitch: number;
		splitSentences: boolean;
		browserSupport: boolean;
	}

	export interface SpeechSpeakConfig {
		text: string;
		queue?: boolean;
		listeners?: {
			onstart?: () => void;
			onend?: () => void;
			onresume?: () => void;
			onboundary?: (event: { name: string; elapsedTime: number }) => void;
			onerror?: (error: unknown) => void;
		};
	}

	export default class Speech {
		hasBrowserSupport(): boolean;
		init(config?: SpeechInitConfig): Promise<SpeechInitResult>;
		speak(config: SpeechSpeakConfig): Promise<void>;
		setLanguage(lang: string): void;
		setVoice(voice: string | SpeechSynthesisVoice): void;
		setVolume(volume: number): void;
		setRate(rate: number): void;
		setPitch(pitch: number): void;
		setSplitSentences(splitSentences: boolean): void;
		pause(): void;
		resume(): void;
		cancel(): void;
		pending(): boolean;
		paused(): boolean;
		speaking(): boolean;
	}
}

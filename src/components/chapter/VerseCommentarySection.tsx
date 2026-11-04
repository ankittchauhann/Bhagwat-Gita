import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type Author,
	type Language,
	type VerseCommentary,
	loadCommentary,
} from "@/lib/gitaData";
import { usePreferences } from "@/store/preferencesStore";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const LANGUAGE_LABELS: Record<Language, string> = {
	english: "English",
	hindi: "Hindi",
	sanskrit: "Sanskrit",
};

const LANGUAGE_TAGS: Record<Language, string> = {
	english: "en",
	hindi: "hi",
	sanskrit: "sa",
};

type CommentaryState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; commentary: VerseCommentary };

export function VerseCommentarySection({
	chapterNumber,
	verseNumber,
	commentators,
}: {
	chapterNumber: number;
	verseNumber: number;
	commentators: Author[];
}) {
	const panelId = useId();
	const showCommentary = usePreferences((state) => state.showCommentary);
	const setShowCommentary = usePreferences((state) => state.setShowCommentary);
	const commentatorId = usePreferences((state) => state.commentatorId);
	const setCommentatorId = usePreferences((state) => state.setCommentatorId);
	const [state, setState] = useState<CommentaryState>({ status: "loading" });
	const latestRequest = useRef(0);

	const selected =
		commentators.find((author) => author.id === commentatorId) ??
		commentators[0];

	const load = useCallback(() => {
		const request = ++latestRequest.current;
		setState({ status: "loading" });
		loadCommentary(chapterNumber, verseNumber).then(
			(commentary) => {
				if (latestRequest.current === request) {
					setState({ status: "ready", commentary });
				}
			},
			(error: unknown) => {
				if (latestRequest.current === request) {
					setState({
						status: "error",
						message:
							error instanceof Error
								? error.message
								: "Couldn't load commentary.",
					});
				}
			},
		);
	}, [chapterNumber, verseNumber]);

	useEffect(() => {
		if (!showCommentary) {
			return;
		}
		load();
		return () => {
			latestRequest.current += 1;
		};
	}, [showCommentary, load]);

	const languages = (["english", "hindi", "sanskrit"] as const).filter(
		(language) => commentators.some((author) => author.language === language),
	);

	return (
		<div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
					Commentaries (टिप्पणियां)
				</h3>
				<Button
					variant="outline"
					size="sm"
					className="cursor-pointer"
					aria-expanded={showCommentary}
					aria-controls={panelId}
					onClick={() => setShowCommentary(!showCommentary)}
				>
					{showCommentary
						? "Hide commentary"
						: `Show commentary (${commentators.length})`}
				</Button>
			</div>

			{showCommentary && selected && (
				<div id={panelId} className="mt-4 space-y-4">
					<Select
						value={String(selected.id)}
						onValueChange={(value) => setCommentatorId(Number(value))}
					>
						<SelectTrigger
							className="w-full sm:w-72 text-sm cursor-pointer"
							aria-label="Commentator"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-white dark:bg-slate-950 text-black dark:text-white">
							{languages.map((language) => (
								<SelectGroup key={language}>
									<SelectLabel>{LANGUAGE_LABELS[language]}</SelectLabel>
									{commentators
										.filter((author) => author.language === language)
										.map((author) => (
											<SelectItem
												key={author.id}
												value={String(author.id)}
												className="cursor-pointer"
											>
												{author.name}
											</SelectItem>
										))}
								</SelectGroup>
							))}
						</SelectContent>
					</Select>

					{state.status === "loading" && (
						<p
							className="text-sm text-slate-700 dark:text-slate-300"
							aria-live="polite"
						>
							Loading commentary…
						</p>
					)}
					{state.status === "error" && (
						<div className="text-sm text-slate-700 dark:text-slate-300">
							<p>{state.message}</p>
							<Button
								variant="outline"
								size="sm"
								className="mt-2 cursor-pointer"
								onClick={load}
							>
								Try again
							</Button>
						</div>
					)}
					{state.status === "ready" && (
						<div className="border-l-4 border-purple-300 dark:border-purple-500 pl-4">
							<p
								lang={LANGUAGE_TAGS[selected.language]}
								className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line"
							>
								{state.commentary[selected.id]}
							</p>
							<p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
								— {selected.name}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

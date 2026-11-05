import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import {
	type Author,
	type Language,
	type VerseCommentary,
	loadCommentary,
} from "@/lib/gitaData";
import { usePreferences } from "@/store/preferencesStore";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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

export function CommentarySection({
	chapterNumber,
	verseNumber,
	commentators,
	wide = false,
}: {
	chapterNumber: number;
	verseNumber: number;
	commentators: Author[];
	wide?: boolean;
}) {
	const selectId = useId();
	const { commentaryOpen, commentatorId, setPreferences } = usePreferences(
		useShallow((state) => ({
			commentaryOpen: state.commentaryOpen,
			commentatorId: state.commentatorId,
			setPreferences: state.setPreferences,
		})),
	);
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
		if (!commentaryOpen) {
			return;
		}
		load();
		return () => {
			latestRequest.current += 1;
		};
	}, [commentaryOpen, load]);

	const languages = (["english", "hindi", "sanskrit"] as const).filter(
		(language) => commentators.some((author) => author.language === language),
	);

	return (
		<Disclosure
			title="Commentary"
			detail={selected?.name}
			open={commentaryOpen}
			onOpenChange={(open) => setPreferences({ commentaryOpen: open })}
		>
			{selected && (
				<>
					<label htmlFor={selectId} className="text-[14px] font-semibold">
						Commentator
					</label>
					<select
						id={selectId}
						value={selected.id}
						onChange={(event) =>
							setPreferences({ commentatorId: Number(event.target.value) })
						}
						className="mt-2 mb-5 block min-h-11 w-full rounded-[6px] border border-control bg-leaf px-3 text-[16px] text-ink sm:w-80"
					>
						{languages.map((language) => (
							<optgroup key={language} label={LANGUAGE_LABELS[language]}>
								{commentators
									.filter((author) => author.language === language)
									.map((author) => (
										<option key={author.id} value={author.id}>
											{author.name}
										</option>
									))}
							</optgroup>
						))}
					</select>

					{state.status === "loading" && (
						<div aria-hidden="true" className="space-y-3">
							<div className="h-4 w-full rounded-[4px] bg-surface" />
							<div className="h-4 w-11/12 rounded-[4px] bg-surface" />
							<div className="h-4 w-2/3 rounded-[4px] bg-surface" />
						</div>
					)}
					{state.status === "error" && (
						<div className="rounded-[8px] border p-4">
							<p className="text-[15px]">{state.message}</p>
							<Button className="mt-3" onClick={load}>
								Try again
							</Button>
						</div>
					)}
					{state.status === "ready" && (
						<p
							lang={LANGUAGE_TAGS[selected.language]}
							className={`reading-text whitespace-pre-line ${wide ? "study-text max-w-[44rem]" : ""}`}
						>
							{state.commentary[selected.id]}
						</p>
					)}
					<p aria-live="polite" className="sr-only">
						{state.status === "loading" ? "Loading commentary…" : ""}
					</p>
				</>
			)}
		</Disclosure>
	);
}

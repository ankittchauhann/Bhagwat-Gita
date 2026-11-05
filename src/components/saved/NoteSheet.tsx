import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { type Bookmark, useReadingHistory } from "@/store/readingHistoryStore";
import { useId, useState } from "react";

export function NoteSheet({
	bookmark,
	open,
	onClose,
}: {
	bookmark: Bookmark | undefined;
	open: boolean;
	onClose: () => void;
}) {
	const reference = bookmark
		? `${bookmark.chapterId}.${bookmark.verseNumber}`
		: "";
	return (
		<Sheet
			open={open && Boolean(bookmark)}
			onClose={onClose}
			title={`Note on ${reference}`}
		>
			{bookmark && <NoteForm bookmark={bookmark} onDone={onClose} />}
		</Sheet>
	);
}

function NoteForm({
	bookmark,
	onDone,
}: {
	bookmark: Bookmark;
	onDone: () => void;
}) {
	const setBookmarkNote = useReadingHistory((state) => state.setBookmarkNote);
	const [text, setText] = useState(bookmark.note ?? "");
	const fieldId = useId();
	const hintId = useId();

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				setBookmarkNote(bookmark.id, text);
				onDone();
			}}
		>
			<p lang="sa" className="font-sanskrit text-[18px] text-muted">
				{bookmark.sanskrit.split("\n")[0]}
			</p>
			<label htmlFor={fieldId} className="mt-4 block text-[14px] font-semibold">
				Your note
			</label>
			<textarea
				id={fieldId}
				aria-describedby={hintId}
				value={text}
				maxLength={2000}
				rows={5}
				onChange={(event) => setText(event.target.value)}
				className="reading-text mt-1.5 block w-full resize-y rounded-[6px] border border-control bg-leaf p-3 text-ink"
			/>
			<p id={hintId} className="mt-1.5 text-[14px] text-muted">
				Kept only in this browser. Leave it empty to remove the note.
			</p>
			<div className="mt-5 flex gap-3">
				<Button type="submit" variant="primary" className="flex-1 sm:flex-none">
					Save note
				</Button>
				<Button onClick={onDone}>Cancel</Button>
			</div>
		</form>
	);
}

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { IconButton } from "./button";

// A native modal <dialog>: it traps focus, makes the page behind inert, closes on Esc and restores focus to the opener.
export function Sheet({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: the click only catches the backdrop; Esc closes the dialog natively.
		<dialog
			ref={dialogRef}
			className="sheet"
			aria-labelledby={titleId}
			onClose={onClose}
			onClick={(event) => {
				if (event.target === dialogRef.current) {
					onClose();
				}
			}}
		>
			<div className="flex max-h-[inherit] flex-col pb-[env(safe-area-inset-bottom)]">
				<div className="flex min-h-14 items-center justify-between gap-4 border-b px-4">
					<h2 id={titleId} className="text-[17px] font-semibold">
						{title}
					</h2>
					<IconButton label="Close" onClick={onClose} className="-mr-2">
						<X aria-hidden="true" />
					</IconButton>
				</div>
				<div className="overflow-y-auto overscroll-contain px-4 pt-4 pb-6">
					{open && children}
				</div>
			</div>
		</dialog>
	);
}

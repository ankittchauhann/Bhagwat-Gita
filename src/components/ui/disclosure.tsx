import { ChevronDown } from "lucide-react";
import { type ReactNode, useId } from "react";

export function Disclosure({
	title,
	detail,
	open,
	onOpenChange,
	children,
}: {
	title: string;
	detail?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}) {
	const panelId = useId();

	return (
		<section className="border-t">
			<h2>
				<button
					type="button"
					aria-expanded={open}
					aria-controls={panelId}
					onClick={() => onOpenChange(!open)}
					className="flex min-h-12 w-full items-center gap-3 py-2 text-left hover:bg-surface/60"
				>
					<span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
						<span className="text-[16px] font-semibold">{title}</span>
						{detail && (
							<span className="truncate text-[14px] text-muted">{detail}</span>
						)}
					</span>
					<ChevronDown
						aria-hidden="true"
						className={`size-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
					/>
				</button>
			</h2>
			<div id={panelId} hidden={!open} className="pb-6">
				{open && children}
			</div>
		</section>
	);
}

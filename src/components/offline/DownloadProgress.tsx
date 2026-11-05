import { Button } from "@/components/ui/button";

export function DownloadProgress({
	label,
	done,
	total,
	onStop,
}: {
	label: string;
	done: number;
	total: number;
	onStop: () => void;
}) {
	const percent = total === 0 ? 0 : Math.floor((done / total) * 100);
	return (
		<div className="mt-3">
			<p className="flex justify-between gap-4 text-[15px] tabular-nums">
				<span>{label}</span>
				<span className="text-muted">{percent}%</span>
			</p>
			<div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-surface">
				<div
					className="h-full rounded-full bg-ink transition-[width] duration-200"
					style={{ width: `${percent}%` }}
				/>
			</div>
			<Button className="mt-3.5" onClick={onStop}>
				Stop
			</Button>
		</div>
	);
}

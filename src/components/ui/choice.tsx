import { cn } from "@/lib/utils";
import { useId } from "react";

interface Option<T extends string | number> {
	value: T;
	label: string;
}

export function SegmentedControl<T extends string | number>({
	legend,
	options,
	value,
	onChange,
}: {
	legend: string;
	options: Option<T>[];
	value: T;
	onChange: (value: T) => void;
}) {
	const name = useId();

	return (
		<fieldset>
			<legend className="mb-2 text-[14px] font-semibold">{legend}</legend>
			<div className="flex rounded-[6px] bg-surface p-1">
				{options.map((option) => (
					<label key={option.value} className="flex-1">
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={option.value === value}
							onChange={() => onChange(option.value)}
							className="peer sr-only"
						/>
						<span className="flex min-h-10 cursor-pointer items-center justify-center rounded-[4px] px-2 text-center text-[14px] text-muted peer-checked:bg-leaf peer-checked:font-semibold peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-ink">
							{option.label}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}

export function RadioList<T extends string | number>({
	legend,
	options,
	value,
	onChange,
}: {
	legend: string;
	options: Option<T>[];
	value: T;
	onChange: (value: T) => void;
}) {
	const name = useId();

	return (
		<fieldset>
			<legend className="mb-1 text-[14px] font-semibold">{legend}</legend>
			<div className="divide-y">
				{options.map((option) => (
					<label
						key={option.value}
						className="flex min-h-12 cursor-pointer items-center gap-3 text-[16px]"
					>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={option.value === value}
							onChange={() => onChange(option.value)}
							className="size-5 shrink-0 accent-ink"
						/>
						{option.label}
					</label>
				))}
			</div>
		</fieldset>
	);
}

export function Switch({
	label,
	checked,
	onChange,
	className,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	className?: string;
}) {
	return (
		<label
			className={cn(
				"flex min-h-12 cursor-pointer items-center justify-between gap-4 text-[16px]",
				className,
			)}
		>
			{label}
			<input
				type="checkbox"
				role="switch"
				aria-checked={checked}
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="relative h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-full border border-control bg-surface transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-4 before:rounded-full before:bg-control before:transition-transform checked:border-ink checked:bg-ink checked:before:translate-x-4 checked:before:bg-ground"
			/>
		</label>
	);
}

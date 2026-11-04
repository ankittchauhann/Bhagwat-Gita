import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";

const VARIANTS: Record<Variant, string> = {
	primary: "bg-ink text-ground hover:opacity-90",
	secondary: "bg-surface text-ink hover:bg-rule",
	quiet: "text-ink hover:bg-surface",
};

export function buttonClass(
	variant: Variant = "secondary",
	className?: string,
) {
	return cn(
		"inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-4 text-[15px] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-5 [&_svg]:shrink-0",
		VARIANTS[variant],
		className,
	);
}

export function Button({
	variant,
	className,
	type = "button",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
	return (
		<button
			type={type}
			className={buttonClass(variant, className)}
			{...props}
		/>
	);
}

export function iconButtonClass(className?: string) {
	return cn(
		"inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] text-ink transition-colors hover:bg-surface [&_svg]:size-5",
		className,
	);
}

export function IconButton({
	label,
	children,
	className,
	...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
	label: string;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			className={iconButtonClass(className)}
			{...props}
		>
			{children}
		</button>
	);
}

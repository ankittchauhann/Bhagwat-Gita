import { iconButtonClass } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const navLinkClass =
	"flex min-h-11 items-center rounded-[6px] px-3 text-[15px] font-semibold hover:bg-surface";

export function AppHeader({
	backTo,
	current,
}: {
	backTo: "/" | "/chapters";
	current?: "chapters" | "about";
}) {
	return (
		<header className="mx-auto flex h-12 max-w-[1208px] items-center gap-1 px-2 md:px-4 lg:h-14">
			<Link
				to={backTo}
				aria-label={backTo === "/" ? "Home" : "All chapters"}
				className={iconButtonClass()}
			>
				<ArrowLeft aria-hidden="true" />
			</Link>
			<Link
				to="/"
				aria-label="Shrimad Bhagavad Gita, home"
				className="flex min-h-11 items-center rounded-[6px] px-1"
			>
				<span
					lang="sa"
					aria-hidden="true"
					className="font-sanskrit text-[18px] lg:text-[19px]"
				>
					श्रीमद्भगवद्गीता
				</span>
			</Link>
			<nav aria-label="Main" className="ml-auto flex items-center">
				{current !== "chapters" && (
					<Link to="/chapters" className={navLinkClass}>
						Chapters
					</Link>
				)}
				{current !== "about" && (
					<Link to="/about" className={navLinkClass}>
						About
					</Link>
				)}
			</nav>
		</header>
	);
}

import { iconButtonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Search } from "lucide-react";

type Page = "chapters" | "about" | "search" | "saved";

const navLinkClass =
	"flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] px-3 text-[15px] font-semibold hover:bg-surface [&_svg]:size-5 sm:[&_svg]:size-[18px]";

function pageProps(page: Page, current: Page | undefined) {
	return page === current
		? {
				"aria-current": "page" as const,
				className: cn(navLinkClass, "bg-surface"),
			}
		: { className: navLinkClass };
}

export function AppHeader({
	backTo,
	current,
}: {
	backTo: "/" | "/chapters";
	current?: Page;
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
				<Link to="/search" {...pageProps("search", current)}>
					<Search aria-hidden="true" />
					<span className="sr-only sm:not-sr-only">Search</span>
				</Link>
				<Link to="/saved" {...pageProps("saved", current)}>
					<Bookmark aria-hidden="true" />
					<span className="sr-only sm:not-sr-only">Saved</span>
				</Link>
				<Link to="/chapters" {...pageProps("chapters", current)}>
					Chapters
				</Link>
				<Link
					to="/about"
					{...pageProps("about", current)}
					className={cn(pageProps("about", current).className, "max-sm:hidden")}
				>
					About
				</Link>
			</nav>
		</header>
	);
}

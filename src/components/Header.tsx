import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
	return (
		<header className="p-2 flex gap-2 bg-white dark:bg-gray-900 text-black dark:text-white justify-between transition-colors">
			<nav className="flex flex-row">
				<div className="px-2 font-bold">
					<Link
						to="/"
						className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Home
					</Link>
				</div>
			</nav>
			<div className="flex items-center">
				<ThemeToggle />
			</div>
		</header>
	);
}

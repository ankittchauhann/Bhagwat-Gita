import { IconButton } from "@/components/ui/button";
import { applyThemeSetting } from "@/lib/theme";
import { Moon } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(() =>
		document.documentElement.classList.contains("dark"),
	);

	return (
		<IconButton
			label="Dark theme"
			aria-pressed={isDark}
			onClick={() => {
				applyThemeSetting(isDark ? "light" : "dark");
				setIsDark(!isDark);
			}}
		>
			<Moon aria-hidden="true" fill={isDark ? "currentColor" : "none"} />
		</IconButton>
	);
}

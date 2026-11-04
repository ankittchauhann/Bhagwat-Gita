export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Keep in sync with the inline script in index.html, which applies the theme before first paint.
export const THEME_COLORS: Record<Theme, string> = {
	light: "#ffffff",
	dark: "#020617",
};

export function currentTheme(): Theme {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", THEME_COLORS[theme]);
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// Storage can be blocked; the theme still applies for this visit.
	}
}

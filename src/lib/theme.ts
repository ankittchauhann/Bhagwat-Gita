export type Theme = "light" | "dark";
export type ThemeSetting = Theme | "system";

export const THEME_STORAGE_KEY = "theme";

// Keep in sync with the inline script in index.html, which applies the theme before first paint.
export const THEME_COLORS: Record<Theme, string> = {
	light: "#eeecea",
	dark: "#121212",
};

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)");

export function readThemeSetting(): ThemeSetting {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored === "light" || stored === "dark" ? stored : "system";
	} catch {
		return "system";
	}
}

function resolve(setting: ThemeSetting): Theme {
	if (setting !== "system") {
		return setting;
	}
	return systemDark().matches ? "dark" : "light";
}

function paint(theme: Theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", THEME_COLORS[theme]);
}

export function applyThemeSetting(setting: ThemeSetting) {
	try {
		if (setting === "system") {
			localStorage.removeItem(THEME_STORAGE_KEY);
		} else {
			localStorage.setItem(THEME_STORAGE_KEY, setting);
		}
	} catch {
		// Storage can be blocked; the theme still applies for this visit.
	}
	paint(resolve(setting));
}

export function followSystemTheme() {
	const query = systemDark();
	const onChange = () => {
		if (readThemeSetting() === "system") {
			paint(resolve("system"));
		}
	};
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
}

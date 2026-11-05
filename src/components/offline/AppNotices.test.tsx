import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppNotices } from "./AppNotices";

const sw = vi.hoisted(() => ({
	needRefresh: false,
	setNeedRefresh: vi.fn(),
	updateServiceWorker: vi.fn(async () => {}),
}));

vi.mock("virtual:pwa-register/react", () => ({
	useRegisterSW: () => ({
		needRefresh: [sw.needRefresh, sw.setNeedRefresh],
		offlineReady: [false, vi.fn()],
		updateServiceWorker: sw.updateServiceWorker,
	}),
}));

function setOnline(online: boolean) {
	vi.spyOn(navigator, "onLine", "get").mockReturnValue(online);
	act(() => {
		window.dispatchEvent(new Event(online ? "online" : "offline"));
	});
}

afterEach(() => {
	sw.needRefresh = false;
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe("AppNotices", () => {
	it("offers to reload when a new version is waiting", () => {
		sw.needRefresh = true;
		render(<AppNotices />);

		expect(
			screen.getByText("A new version of the reader is ready."),
		).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Reload" }));
		expect(sw.updateServiceWorker).toHaveBeenCalledWith(true);
		fireEvent.click(screen.getByRole("button", { name: "Later" }));
		expect(sw.setNeedRefresh).toHaveBeenCalledWith(false);
	});

	it("says when the connection drops and comes back, then clears", () => {
		vi.useFakeTimers();
		render(<AppNotices />);

		setOnline(false);
		expect(
			screen.getByText(
				"You're offline. Chapters saved on this device still open.",
			),
		).toBeTruthy();

		setOnline(true);
		expect(screen.getByText("Back online.")).toBeTruthy();
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(screen.queryByText("Back online.")).toBeNull();
	});
});

import { useRegisterSW } from "virtual:pwa-register/react";
import { cn } from "@/lib/utils";
import { type ReactNode, useEffect, useState } from "react";

const HOUR = 60 * 60 * 1000;

type Connection = "offline" | "online" | null;

function Notice({
	children,
	actions,
}: {
	children: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="pointer-events-auto flex items-center gap-3 rounded-[8px] bg-ink py-2 pr-2 pl-4 text-ground">
			<p className="flex-1 py-1.5 text-[15px] leading-snug">{children}</p>
			{actions}
		</div>
	);
}

const actionClass =
	"inline-flex min-h-11 shrink-0 items-center rounded-[6px] px-4 text-[15px] font-semibold";

export function AppNotices() {
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		offlineReady: [offlineReady, setOfflineReady],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_url, registration) {
			if (registration) {
				setInterval(() => {
					if (navigator.onLine) {
						registration.update().catch(() => {});
					}
				}, HOUR);
			}
		},
	});
	const [connection, setConnection] = useState<Connection>(null);

	useEffect(() => {
		const show = () => setConnection(navigator.onLine ? "online" : "offline");
		window.addEventListener("online", show);
		window.addEventListener("offline", show);
		return () => {
			window.removeEventListener("online", show);
			window.removeEventListener("offline", show);
		};
	}, []);

	useEffect(() => {
		if (!connection) {
			return;
		}
		const timer = setTimeout(
			() => setConnection(null),
			connection === "online" ? 3000 : 6000,
		);
		return () => clearTimeout(timer);
	}, [connection]);

	useEffect(() => {
		if (!offlineReady) {
			return;
		}
		const timer = setTimeout(() => setOfflineReady(false), 8000);
		return () => clearTimeout(timer);
	}, [offlineReady, setOfflineReady]);

	return (
		<div
			aria-live="polite"
			className="app-notices pointer-events-none fixed inset-x-3 z-40 mx-auto flex max-w-[440px] flex-col gap-2"
		>
			{needRefresh && (
				<Notice
					actions={
						<>
							<button
								type="button"
								onClick={() => setNeedRefresh(false)}
								className={cn(actionClass, "hover:bg-ground/15")}
							>
								Later
							</button>
							<button
								type="button"
								onClick={() => updateServiceWorker(true)}
								className={cn(
									actionClass,
									"bg-ground text-ink hover:opacity-90",
								)}
							>
								Reload
							</button>
						</>
					}
				>
					A new version of the reader is ready.
				</Notice>
			)}
			{offlineReady && !needRefresh && (
				<Notice>
					Ready to read offline. Chapters you open stay on this device.
				</Notice>
			)}
			{connection === "offline" && (
				<Notice>
					You're offline. Chapters saved on this device still open.
				</Notice>
			)}
			{connection === "online" && <Notice>Back online.</Notice>}
		</div>
	);
}

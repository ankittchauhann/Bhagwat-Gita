import { useEffect, useState } from "react";

export function useNetworkStatus() {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [connectionType, setConnectionType] = useState<string>("unknown");

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		const updateConnectionType = () => {
			// Check for network information API
			interface NavigatorWithConnection extends Navigator {
				connection?: {
					effectiveType?: string;
				};
				mozConnection?: {
					effectiveType?: string;
				};
				webkitConnection?: {
					effectiveType?: string;
				};
			}

			const nav = navigator as NavigatorWithConnection;
			const connection =
				nav.connection || nav.mozConnection || nav.webkitConnection;

			if (connection?.effectiveType) {
				setConnectionType(connection.effectiveType);
			}
		};

		// Set up event listeners
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Check connection type if available
		updateConnectionType();

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return { isOnline, connectionType };
}

import { WifiOff } from "lucide-react";

export function OfflineNotice({ saved }: { saved: number }) {
	return (
		<output className="mt-5 flex items-start gap-2.5 rounded-[8px] bg-surface px-3.5 py-3 text-[15px] leading-normal">
			<WifiOff aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
			<span>
				You're offline.{" "}
				{saved === 0 ? (
					"No chapters are saved on this device yet; they need a connection."
				) : (
					<>
						<strong className="font-semibold">
							{saved} {saved === 1 ? "chapter is" : "chapters are"}
						</strong>{" "}
						saved on this device; the others need a connection.
					</>
				)}
			</span>
		</output>
	);
}

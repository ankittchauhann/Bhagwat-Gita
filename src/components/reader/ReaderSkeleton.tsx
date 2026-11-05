import { WIDE_SCREEN, useMediaQuery } from "@/lib/useMediaQuery";

function Bar({ className }: { className: string }) {
	return <div className={`rounded-[4px] bg-surface ${className}`} />;
}

// Drawn at the reader's real size so nothing shifts when the chapter arrives.
export function ReaderSkeleton() {
	const wide = useMediaQuery(WIDE_SCREEN);

	return (
		<div className="min-h-dvh bg-ground" aria-busy="true">
			{wide ? (
				<div className="mx-auto max-w-[1208px] px-6">
					<div className="flex h-14 items-center gap-3">
						<Bar className="size-6" />
						<Bar className="h-4 w-72" />
					</div>
					<Bar className="mt-5 h-8 w-full" />
					<Bar className="mt-5 h-7 w-40" />
					<div className="ruled-leaf mt-4 flex flex-col items-center gap-5 rounded-[8px] bg-leaf px-30 pt-9 pb-10">
						<Bar className="h-10 w-3/4" />
						<Bar className="h-10 w-2/3" />
						<Bar className="mt-4 h-5 w-1/2" />
						<Bar className="h-5 w-1/2" />
					</div>
					<div className="mt-7 grid grid-cols-2 gap-20">
						<div className="space-y-3">
							<Bar className="h-4 w-48" />
							<Bar className="h-5 w-full" />
							<Bar className="h-5 w-11/12" />
							<Bar className="h-5 w-2/3" />
						</div>
						<div className="space-y-3">
							<Bar className="h-4 w-48" />
							<Bar className="h-5 w-full" />
							<Bar className="h-5 w-10/12" />
							<Bar className="h-5 w-1/2" />
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="mx-auto flex h-12 max-w-[720px] items-center gap-3 px-4">
						<Bar className="size-6" />
						<Bar className="h-4 w-48" />
					</div>
					<div className="mx-auto max-w-[720px] px-4 pt-3 md:px-6">
						<Bar className="mt-1 h-6 w-14" />
						<Bar className="mt-2 h-4 w-28" />
						<Bar className="mt-3 h-4 w-full" />
						<div className="ruled-leaf mt-4 space-y-5 rounded-[8px] bg-leaf px-7 py-6 md:px-12 md:py-9">
							<Bar className="h-7 w-11/12" />
							<Bar className="h-7 w-10/12" />
							<Bar className="mt-8 h-4 w-9/12" />
							<Bar className="h-4 w-8/12" />
							<Bar className="mt-8 h-4 w-full" />
							<Bar className="h-4 w-11/12" />
							<Bar className="h-4 w-1/2" />
						</div>
					</div>
				</>
			)}
			<p className="sr-only" aria-live="polite">
				Loading chapter…
			</p>
		</div>
	);
}

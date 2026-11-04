function Bar({ className }: { className: string }) {
	return <div className={`rounded-[4px] bg-surface ${className}`} />;
}

// Drawn at the reader's real size so nothing shifts when the chapter arrives.
export function ReaderSkeleton() {
	return (
		<div className="min-h-dvh bg-ground" aria-busy="true">
			<div className="mx-auto flex h-12 max-w-[720px] items-center gap-3 px-4">
				<Bar className="size-6" />
				<Bar className="h-4 w-48" />
			</div>
			<div className="mx-auto max-w-[720px] px-4 pt-3 md:px-6">
				<Bar className="mt-1 h-6 w-14" />
				<Bar className="mt-2 h-4 w-28" />
				<div className="mt-4 space-y-5 rounded-[8px] bg-leaf px-5 py-6 md:px-10 md:py-9">
					<Bar className="h-7 w-11/12" />
					<Bar className="h-7 w-10/12" />
					<Bar className="mt-8 h-4 w-9/12" />
					<Bar className="h-4 w-8/12" />
					<Bar className="mt-8 h-4 w-full" />
					<Bar className="h-4 w-11/12" />
					<Bar className="h-4 w-1/2" />
				</div>
			</div>
			<p className="sr-only" aria-live="polite">
				Loading chapter…
			</p>
		</div>
	);
}

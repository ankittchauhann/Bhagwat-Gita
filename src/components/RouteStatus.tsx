import { Button, buttonClass } from "@/components/ui/button";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

function StatusPage({ children }: { children: ReactNode }) {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-ground px-4 py-12">
			<div className="w-full max-w-md rounded-[8px] bg-leaf p-6 md:p-8">
				{children}
			</div>
		</main>
	);
}

export function PageLoading({ label }: { label: string }) {
	return (
		<main className="min-h-dvh bg-ground" aria-busy="true">
			<div className="mx-auto max-w-[720px] space-y-3 px-4 pt-16">
				<div className="h-6 w-40 rounded-[4px] bg-surface" />
				<div className="h-4 w-64 rounded-[4px] bg-surface" />
				<div className="mt-6 h-20 w-full rounded-[8px] bg-leaf" />
				<div className="h-20 w-full rounded-[8px] bg-leaf" />
				<div className="h-20 w-full rounded-[8px] bg-leaf" />
			</div>
			<p className="sr-only" aria-live="polite">
				{label}
			</p>
		</main>
	);
}

export function RouteError({ error }: ErrorComponentProps) {
	const router = useRouter();

	return (
		<StatusPage>
			<h1 className="flex items-center gap-2 text-[20px] font-bold">
				<CircleAlert aria-hidden="true" className="size-5 text-rubric" />
				Couldn't load this page
			</h1>
			<p className="mt-2 text-[15px] text-muted">{error.message}</p>
			<div className="mt-6 flex flex-wrap gap-3">
				<Button variant="primary" onClick={() => router.invalidate()}>
					Try again
				</Button>
				<Link to="/chapters" className={buttonClass("secondary")}>
					All chapters
				</Link>
			</div>
		</StatusPage>
	);
}

export function NotFoundPage() {
	return (
		<StatusPage>
			<h1 className="text-[20px] font-bold">Page not found</h1>
			<p className="mt-2 text-[15px] text-muted">
				This chapter or verse doesn't exist. The Bhagavad Gita has 18 chapters
				and 701 verses; open the list to choose one.
			</p>
			<div className="mt-6 flex flex-wrap gap-3">
				<Link to="/chapters" className={buttonClass("primary")}>
					All chapters
				</Link>
				<Link to="/" className={buttonClass("secondary")}>
					Home
				</Link>
			</div>
		</StatusPage>
	);
}

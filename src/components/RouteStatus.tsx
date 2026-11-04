import { Button } from "@/components/ui/button";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";

const pageClassName =
	"min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 flex items-center justify-center px-4";

export function PageLoading({ label }: { label: string }) {
	return (
		<div className={pageClassName}>
			<div className="text-center" aria-live="polite">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
				<p className="mt-4 text-slate-600 dark:text-slate-300">{label}</p>
			</div>
		</div>
	);
}

export function RouteError({ error }: ErrorComponentProps) {
	const router = useRouter();

	return (
		<div className={pageClassName}>
			<div className="text-center max-w-md">
				<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
					Couldn't load this page
				</h1>
				<p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
					{error.message}
				</p>
				<div className="flex flex-wrap justify-center gap-3">
					<Button
						onClick={() => router.invalidate()}
						className="cursor-pointer"
					>
						Try again
					</Button>
					<Button asChild variant="outline">
						<Link to="/chapters">All chapters</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

export function NotFoundPage() {
	return (
		<div className={pageClassName}>
			<div className="text-center max-w-md">
				<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
					Page not found
				</h1>
				<p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
					This chapter or verse doesn't exist. The Bhagavad Gita has 18
					chapters; open the list to choose one.
				</p>
				<div className="flex flex-wrap justify-center gap-3">
					<Button asChild>
						<Link to="/chapters">All chapters</Link>
					</Button>
					<Button asChild variant="outline">
						<Link to="/">Home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

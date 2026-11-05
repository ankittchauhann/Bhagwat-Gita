import { AppHeader } from "@/components/AppHeader";
import { devanagariNumber } from "@/components/reader/verseNavigation";
import { Button, buttonClass } from "@/components/ui/button";
import { CHAPTER_COUNT, DataLoadError } from "@/lib/gitaData";
import { useOfflineLibrary } from "@/store/offlineStore";
import {
	type ErrorComponentProps,
	Link,
	useParams,
	useRouter,
} from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

function StatusPage({
	marker,
	children,
	after,
}: {
	marker: string;
	children: ReactNode;
	after?: ReactNode;
}) {
	return (
		<div className="min-h-dvh bg-ground">
			<AppHeader backTo="/" />
			<main className="px-4 pt-8 pb-16 lg:pt-20">
				<div className="ruled-leaf mx-auto max-w-2xl rounded-[8px] bg-leaf px-8 py-10 text-center md:px-16 md:py-14 lg:px-28">
					<p
						lang="sa"
						aria-hidden="true"
						className="font-sanskrit text-[32px] text-rubric"
					>
						॥ {marker} ॥
					</p>
					<div className="mt-4 flex flex-col items-center">{children}</div>
				</div>
				{after}
			</main>
		</div>
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

function ChapterLinks({
	id,
	title,
	chapters,
}: {
	id: string;
	title: string;
	chapters: number[];
}) {
	return (
		<nav aria-labelledby={id} className="mx-auto mt-10 max-w-2xl">
			<h2 id={id} className="text-center text-[16px] font-semibold">
				{title}
			</h2>
			<ol className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-9">
				{chapters.map((chapter) => (
					<li key={chapter}>
						<Link
							to="/chapter/$chapterId"
							params={{ chapterId: String(chapter) }}
							aria-label={`Chapter ${chapter}`}
							className="flex h-11 items-center justify-center rounded-[6px] bg-leaf text-[15px] font-semibold tabular-nums hover:bg-rule"
						>
							{chapter}
						</Link>
					</li>
				))}
			</ol>
		</nav>
	);
}

function OfflinePage() {
	const router = useRouter();
	const library = useOfflineLibrary();
	const { chapterId } = useParams({ strict: false });
	const saved = [...library.text].sort((a, b) => a - b);

	return (
		<StatusPage
			marker={chapterId ? devanagariNumber(chapterId) : "!"}
			after={
				saved.length > 0 && (
					<ChapterLinks
						id="saved-chapters"
						title="Saved on this device"
						chapters={saved}
					/>
				)
			}
		>
			<h1 className="text-[22px] font-bold">You're offline</h1>
			<p className="mt-2 max-w-[34ch] text-[16px] text-muted">
				{chapterId
					? `Chapter ${chapterId} isn't saved on this device yet. Connect to open it, or read a chapter you have saved.`
					: "This page needs a connection. Connect and try again, or read a chapter you have saved."}
			</p>
			<div className="mt-6 flex flex-wrap justify-center gap-3">
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

export function RouteError({ error }: ErrorComponentProps) {
	const router = useRouter();

	if (
		(error instanceof DataLoadError && error.status === null) ||
		!navigator.onLine
	) {
		return <OfflinePage />;
	}

	return (
		<StatusPage marker="!">
			<h1 className="flex items-center gap-2 text-[22px] font-bold">
				<CircleAlert aria-hidden="true" className="size-5 text-rubric" />
				Couldn't load this page
			</h1>
			<p className="mt-2 text-[16px] text-muted">{error.message}</p>
			<div className="mt-6 flex flex-wrap justify-center gap-3">
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
		<StatusPage
			marker="४०४"
			after={
				<ChapterLinks
					id="not-found-chapters"
					title="Or open a chapter"
					chapters={Array.from(
						{ length: CHAPTER_COUNT },
						(_, index) => index + 1,
					)}
				/>
			}
		>
			<h1 className="text-[22px] font-bold">Page not found</h1>
			<p className="mt-2 max-w-[40ch] text-[16px] text-muted">
				This chapter or verse doesn't exist. The Bhagavad Gita has 18 chapters
				and 701 verses; open the list to choose one.
			</p>
			<div className="mt-6 flex flex-wrap justify-center gap-3">
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

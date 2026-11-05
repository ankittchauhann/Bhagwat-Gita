import { AppHeader } from "@/components/AppHeader";
import { OfflineLibrary } from "@/components/offline/OfflineLibrary";
import { OfflineNotice } from "@/components/offline/OfflineNotice";
import { buttonClass } from "@/components/ui/button";
import { CHAPTER_GROUPS, groupRange } from "@/lib/chapterGroups";
import { readCount } from "@/lib/progress";
import { useOnline } from "@/lib/useOnline";
import { cn } from "@/lib/utils";
import { useOfflineLibrary } from "@/store/offlineStore";
import { useReadingHistory } from "@/store/readingHistoryStore";
import { Link, getRouteApi } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

const route = getRouteApi("/chapters");

export function ChaptersPage() {
	const { chapters, credits } = route.useLoaderData();
	const online = useOnline();
	const library = useOfflineLibrary();
	const versesRead = useReadingHistory((state) => state.stats.versesRead);
	const lastPosition = useReadingHistory((state) => state.lastPosition);
	const [searchTerm, setSearchTerm] = useState("");

	const query = searchTerm.trim().toLowerCase();
	const matches = (chapter: (typeof chapters)[number]) =>
		[
			chapter.name,
			chapter.nameTransliterated,
			chapter.nameTranslation,
			chapter.nameMeaning,
		].some((field) => field.toLowerCase().includes(query));
	const totalVerses = chapters.reduce((sum, c) => sum + c.versesCount, 0);
	const totalRead = chapters.reduce(
		(sum, c) => sum + readCount(versesRead, c.number, c.versesCount),
		0,
	);
	const groups = CHAPTER_GROUPS.map((group) => ({
		group,
		chapters: chapters.filter(
			(chapter) =>
				chapter.number >= group.first &&
				chapter.number <= group.last &&
				matches(chapter),
		),
	})).filter(({ chapters: list }) => list.length > 0);
	const unavailable = (chapterNumber: number) =>
		!online && library.loaded && !library.text.has(chapterNumber);
	const lastChapter = lastPosition
		? chapters.find((chapter) => chapter.number === lastPosition.chapterId)
		: undefined;

	return (
		<div className="min-h-dvh bg-ground">
			<AppHeader backTo="/" current="chapters" />

			<main className="mx-auto max-w-[760px] px-4 pt-4 pb-16 lg:max-w-[1208px] lg:px-6">
				<div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
					<div>
						<h1 className="text-[24px] font-bold lg:text-[28px]">Chapters</h1>
						<p className="mt-1 text-[15px] text-muted tabular-nums">
							{chapters.length} chapters, {totalVerses} verses
							{totalRead > 0 && ` · ${totalRead} read`}
						</p>
					</div>

					<div className="relative mt-5 lg:mt-0 lg:w-[26rem]">
						<Search
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
						/>
						<input
							type="search"
							aria-label="Search chapters"
							placeholder="Search by name or meaning…"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="min-h-11 w-full rounded-[6px] border border-control bg-leaf pr-3 pl-9 text-[16px] text-ink placeholder:text-muted"
						/>
					</div>
				</div>

				{!online && library.supported && (
					<OfflineNotice saved={library.text.size} />
				)}

				{lastPosition && lastChapter && !query && (
					<Link
						to="/chapter/$chapterId/verse/$verseNumber"
						params={{
							chapterId: String(lastPosition.chapterId),
							verseNumber: String(lastPosition.verseNumber),
						}}
						className="mt-6 flex items-center justify-between gap-4 rounded-[8px] bg-leaf px-5 py-4 hover:bg-surface"
					>
						<span className="min-w-0">
							<span className="block text-[14px] text-muted">
								Continue where you stopped
							</span>
							<span className="mt-0.5 block truncate text-[18px] font-bold lg:text-[20px]">
								{lastPosition.chapterId}.{lastPosition.verseNumber} ·{" "}
								{lastChapter.nameTranslation}
							</span>
						</span>
						<span
							aria-hidden="true"
							className={buttonClass("primary", "shrink-0")}
						>
							Continue
						</span>
					</Link>
				)}

				{groups.length === 0 ? (
					<p className="mt-6 rounded-[8px] border border-dashed p-4 text-[15px]">
						No chapters match “{searchTerm.trim()}”.
					</p>
				) : (
					<div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-3">
						{groups.map(({ group, chapters: list }) => (
							<section
								key={group.name}
								aria-labelledby={`group-${group.first}`}
							>
								<h2
									id={`group-${group.first}`}
									className="border-b-2 border-ink pb-2.5 text-[18px] font-bold"
								>
									{group.name}{" "}
									<span className="font-medium text-muted">
										· {groupRange(group)}
									</span>
								</h2>
								<ol>
									{list.map((chapter) => {
										const read = readCount(
											versesRead,
											chapter.number,
											chapter.versesCount,
										);
										const notSaved = unavailable(chapter.number);
										return (
											<li key={chapter.number} className="border-b">
												<Link
													to="/chapter/$chapterId"
													params={{ chapterId: String(chapter.number) }}
													className={cn(
														"grid grid-cols-[1.75rem_minmax(0,1fr)_auto] gap-x-3 py-3.5 hover:bg-surface/60",
														notSaved && "text-muted",
													)}
												>
													<span className="text-right text-[18px] font-bold tabular-nums">
														{chapter.number}
													</span>
													<span className="min-w-0">
														<span
															lang="sa"
															className="block font-sanskrit text-[18px] leading-snug"
														>
															{chapter.name}
														</span>
														<span className="block text-[15px] font-semibold">
															{chapter.nameTranslation}
														</span>
														<span className="block text-[14px] text-muted">
															{chapter.nameMeaning}
														</span>
														<span
															aria-hidden="true"
															className="mt-2 block h-1 rounded-full bg-surface"
														>
															<span
																className="block h-full rounded-full bg-ink"
																style={{
																	width: `${(read / chapter.versesCount) * 100}%`,
																}}
															/>
														</span>
													</span>
													<span className="text-[14px] text-muted tabular-nums">
														<span className="sr-only">
															{read} of {chapter.versesCount} verses read
															{notSaved && ", not saved on this device"}
														</span>
														<span aria-hidden="true">
															{notSaved
																? "Not saved"
																: `${read} / ${chapter.versesCount}`}
														</span>
													</span>
												</Link>
											</li>
										);
									})}
								</ol>
							</section>
						))}
					</div>
				)}

				<OfflineLibrary chapters={chapters} credits={credits} />
			</main>
		</div>
	);
}

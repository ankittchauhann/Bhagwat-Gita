import { iconButtonClass } from "@/components/ui/button";
import { Link, getRouteApi } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

const route = getRouteApi("/chapters");

export function ChaptersPage() {
	const { chapters } = route.useLoaderData();
	const [searchTerm, setSearchTerm] = useState("");

	const query = searchTerm.trim().toLowerCase();
	const filteredChapters = chapters.filter((chapter) =>
		[
			chapter.name,
			chapter.nameTransliterated,
			chapter.nameTranslation,
			chapter.nameMeaning,
		].some((field) => field.toLowerCase().includes(query)),
	);

	return (
		<div className="min-h-dvh bg-ground">
			<header className="mx-auto flex h-12 max-w-[760px] items-center gap-1 px-2 md:px-4 lg:h-14 lg:max-w-[1208px]">
				<Link to="/" aria-label="Home" className={iconButtonClass()}>
					<ArrowLeft aria-hidden="true" />
				</Link>
				<span lang="sa" className="font-sanskrit text-[17px]">
					श्रीमद्भगवद्गीता
				</span>
			</header>

			<main className="mx-auto max-w-[760px] px-4 pt-4 pb-16 lg:max-w-[1208px] lg:px-6">
				<div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
					<div>
						<h1 className="text-[24px] font-bold">Chapters</h1>
						<p className="mt-1 text-[15px] text-muted">
							18 chapters, {chapters.reduce((sum, c) => sum + c.versesCount, 0)}{" "}
							verses
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

				{filteredChapters.length === 0 ? (
					<p className="mt-6 rounded-[8px] border border-dashed p-4 text-[15px]">
						No chapters match “{searchTerm.trim()}”.
					</p>
				) : (
					<ol className="mt-5 grid border-t lg:mt-8 lg:grid-flow-col lg:grid-rows-9 lg:gap-x-12">
						{filteredChapters.map((chapter) => (
							<li key={chapter.number} className="border-b">
								<Link
									to="/chapter/$chapterId/verse/$verseNumber"
									params={{
										chapterId: String(chapter.number),
										verseNumber: "1",
									}}
									className="flex min-h-[84px] items-center gap-4 py-3 hover:bg-surface/60"
								>
									<span className="w-7 shrink-0 text-right text-[18px] font-bold tabular-nums">
										{chapter.number}
									</span>
									<span className="min-w-0 flex-1">
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
									</span>
									<span className="shrink-0 text-[14px] text-muted tabular-nums">
										{chapter.versesCount} verses
									</span>
									<ChevronRight
										aria-hidden="true"
										className="size-4 shrink-0 text-muted"
									/>
								</Link>
							</li>
						))}
					</ol>
				)}
			</main>
		</div>
	);
}

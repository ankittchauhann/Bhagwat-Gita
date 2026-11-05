import { lastSevenDays, localDay, readingStreak } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useReadingHistory } from "@/store/readingHistoryStore";

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const fullDay = new Intl.DateTimeFormat("en-GB", {
	weekday: "long",
	day: "numeric",
	month: "long",
});

function dateOf(day: string) {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(year, month - 1, date);
}

export function ReadingProgress({
	totalVerses,
	className,
}: {
	totalVerses: number;
	className?: string;
}) {
	const stats = useReadingHistory((state) => state.stats);
	const today = localDay();
	const streak = readingStreak(stats.readDays, today);
	const week = lastSevenDays(stats.readDays, today);
	const thisWeek = week.reduce((sum, day) => sum + day.verses, 0);
	const read = stats.versesRead.size;
	const percent = Math.round((read / totalVerses) * 100);

	if (read === 0 && streak.days === 0) {
		return null;
	}

	return (
		<section
			aria-labelledby="your-reading"
			className={cn("rounded-[8px] bg-leaf px-5 pt-4 pb-4", className)}
		>
			<h2 id="your-reading" className="text-[16px] font-bold">
				Your reading
			</h2>
			<dl className="mt-3 grid grid-cols-3 gap-3 tabular-nums">
				<div>
					<dt className="text-[13px] text-muted">Streak</dt>
					<dd className="mt-0.5 text-[22px] font-bold">
						{streak.days} {streak.days === 1 ? "day" : "days"}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-muted">Last 7 days</dt>
					<dd className="mt-0.5 text-[22px] font-bold">
						{thisWeek} {thisWeek === 1 ? "verse" : "verses"}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-muted">Read so far</dt>
					<dd className="mt-0.5 text-[22px] font-bold">{read}</dd>
				</div>
			</dl>
			<ol
				aria-label="Verses read on each of the last 7 days"
				className="mt-3.5 grid grid-cols-7 gap-1.5"
			>
				{week.map((day) => (
					<li key={day.day} className="text-center">
						<span
							aria-hidden="true"
							className={cn(
								"flex h-8 items-center justify-center rounded-[6px] text-[13px] font-semibold tabular-nums",
								day.read ? "bg-ink text-ground" : "bg-surface text-muted",
							)}
						>
							{day.read ? day.verses || "✓" : "·"}
						</span>
						<span
							aria-hidden="true"
							className="mt-1 block text-[12px] text-muted"
						>
							{weekday.format(dateOf(day.day))}
						</span>
						<span className="sr-only">
							{fullDay.format(dateOf(day.day))}:{" "}
							{!day.read
								? "no reading"
								: day.verses
									? `${day.verses} ${day.verses === 1 ? "verse" : "verses"}`
									: "read"}
						</span>
					</li>
				))}
			</ol>
			<div aria-hidden="true" className="mt-3.5 h-1.5 rounded-full bg-surface">
				<div
					className="h-full rounded-full bg-ink"
					style={{ width: `${percent}%` }}
				/>
			</div>
			<p className="mt-1.5 text-[14px] text-muted tabular-nums">
				{read} of {totalVerses} verses · {percent}%
				{streak.days > 0 &&
					!streak.readToday &&
					" · read a verse today to keep your streak"}
			</p>
		</section>
	);
}

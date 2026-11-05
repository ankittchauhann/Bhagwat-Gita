import { AppHeader } from "@/components/AppHeader";
import {
	CONTACT_URL,
	CONTENT_TERMS_URL,
	FONTS,
	FONT_LICENCE,
	PICTURES,
	PICTURE_LICENCE,
	REPOSITORY_URL,
	pictureThumbnail,
} from "@/lib/credits";
import type { Author, Language } from "@/lib/gitaData";
import { getRouteApi } from "@tanstack/react-router";
import type { ReactNode } from "react";

const route = getRouteApi("/about");

const LANGUAGE_NAMES: Record<Language, string> = {
	english: "English",
	hindi: "Hindi",
	sanskrit: "Sanskrit",
};

function Section({
	id,
	title,
	note,
	children,
}: {
	id: string;
	title: string;
	note: ReactNode;
	children: ReactNode;
}) {
	return (
		<section
			aria-labelledby={id}
			className="mt-8 grid gap-4 border-t pt-8 lg:grid-cols-[22.5rem_minmax(0,1fr)] lg:gap-12"
		>
			<div>
				<h2 id={id} className="text-[18px] font-bold">
					{title}
				</h2>
				<p className="mt-1.5 text-[15px] leading-normal text-muted">{note}</p>
			</div>
			<div className="rounded-[8px] bg-leaf px-5 py-5 lg:px-6">{children}</div>
		</section>
	);
}

function AuthorList({ authors }: { authors: Author[] }) {
	const languages = (["english", "hindi", "sanskrit"] as const).filter(
		(language) => authors.some((author) => author.language === language),
	);
	return (
		<div className="space-y-5">
			{languages.map((language) => (
				<div key={language}>
					<h3 className="text-[14px] font-semibold text-muted">
						{LANGUAGE_NAMES[language]}
					</h3>
					<ul className="reading-text study-text mt-1.5 grid gap-x-8 gap-y-1 sm:grid-cols-2">
						{authors
							.filter((author) => author.language === language)
							.map((author) => (
								<li key={author.id}>{author.name}</li>
							))}
					</ul>
				</div>
			))}
		</div>
	);
}

const linkClass =
	"font-semibold text-ink underline decoration-control underline-offset-4 hover:decoration-ink";

export function AboutPage() {
	const credits = route.useLoaderData();
	const commit = credits.source.commit.slice(0, 7);

	return (
		<div className="min-h-dvh bg-ground">
			<AppHeader backTo="/" current="about" />
			<main className="mx-auto max-w-[760px] px-4 pt-4 pb-16 lg:max-w-[1208px] lg:px-6">
				<h1 className="text-[24px] font-bold lg:text-[28px]">
					About and sources
				</h1>
				<p className="mt-1.5 max-w-[60ch] text-[16px] text-muted">
					Where every word and picture in this reader comes from, and the terms
					they are shared under.
				</p>

				<Section
					id="about-text"
					title="The text"
					note="Built from a fixed version of an open dataset. Only the layout changes; the wording never does."
				>
					<dl className="grid gap-x-8 gap-y-4 text-[16px] sm:grid-cols-2">
						<div>
							<dt className="text-[14px] text-muted">Source</dt>
							<dd>
								<a href={credits.source.repository} className={linkClass}>
									gita/gita
								</a>{" "}
								by the BhagavadGita.io team, commit {commit}
							</dd>
						</div>
						<div>
							<dt className="text-[14px] text-muted">Sanskrit verses</dt>
							<dd>Public domain</dd>
						</div>
						<div>
							<dt className="text-[14px] text-muted">
								Translations and commentaries
							</dt>
							<dd>
								© their authors, shared for non-commercial reading with credit
								and without changes (
								<a href={CONTENT_TERMS_URL} className={linkClass}>
									terms
								</a>
								)
							</dd>
						</div>
						<div>
							<dt className="text-[14px] text-muted">
								What this reader changes
							</dt>
							<dd>
								Each verse is set line by line, its closing number becomes the
								red ॥ marker, and the “… said” line is shown apart from the
								verse
							</dd>
						</div>
					</dl>
				</Section>

				<Section
					id="about-translators"
					title="Translators"
					note={`${credits.counts.translators} translations. Choose your English and Hindi translator in Reading settings.`}
				>
					<AuthorList authors={credits.translators} />
				</Section>

				<Section
					id="about-commentators"
					title="Commentators"
					note={`${credits.counts.commentators} commentaries, ${credits.counts.commentaries.toLocaleString("en")} passages in all, loaded only when you open one.`}
				>
					<AuthorList authors={credits.commentators} />
				</Section>

				<Section
					id="about-pictures"
					title="Pictures"
					note={
						<>
							From Wikimedia Commons under{" "}
							<a href={PICTURE_LICENCE.url} className={linkClass}>
								{PICTURE_LICENCE.name}
							</a>
							, resized only.
						</>
					}
				>
					<ul className="grid gap-5 sm:grid-cols-2">
						{Object.values(PICTURES).map((picture) => (
							<li key={picture.id} className="flex gap-4">
								<img
									src={pictureThumbnail(picture)}
									width={picture.width}
									height={picture.height}
									alt=""
									loading="lazy"
									className="size-20 shrink-0 rounded-[6px] object-cover"
								/>
								<div className="min-w-0 text-[15px]">
									<a href={picture.page} className={linkClass}>
										{picture.caption}
									</a>
									<p className="mt-0.5 text-muted">{picture.creator}</p>
								</div>
							</li>
						))}
					</ul>
				</Section>

				<Section
					id="about-fonts"
					title="Fonts"
					note={
						<>
							Self-hosted, under the{" "}
							<a href={FONT_LICENCE.url} className={linkClass}>
								{FONT_LICENCE.name}
							</a>
							.
						</>
					}
				>
					<ul className="grid gap-3 text-[16px] sm:grid-cols-3">
						{FONTS.map((font) => (
							<li key={font.name}>
								<span className="block">{font.name}</span>
								<span className="block text-[14px] text-muted">
									{font.foundry}
								</span>
							</li>
						))}
					</ul>
				</Section>

				<Section
					id="about-privacy"
					title="Privacy and code"
					note="No accounts and no tracking. Your place, settings and read verses stay in this browser."
				>
					<dl className="grid gap-x-8 gap-y-4 text-[16px] sm:grid-cols-2">
						<div>
							<dt className="text-[14px] text-muted">Source code</dt>
							<dd>
								<a href={REPOSITORY_URL} className={linkClass}>
									Bhagwat-Gita on GitHub
								</a>
								, MIT licence
							</dd>
						</div>
						<div>
							<dt className="text-[14px] text-muted">Found a mistake?</dt>
							<dd>
								<a href={`${REPOSITORY_URL}/issues`} className={linkClass}>
									Report it on GitHub
								</a>{" "}
								or write to{" "}
								<a href={CONTACT_URL} className={linkClass}>
									ankittchauhann
								</a>
							</dd>
						</div>
					</dl>
				</Section>
			</main>
		</div>
	);
}

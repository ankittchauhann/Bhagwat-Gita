export interface Picture {
	id: string;
	width: number;
	height: number;
	alt: string;
	caption: string;
	title: string;
	creator: string;
	page: string;
}

export const PICTURE_LICENCE = {
	name: "CC BY-SA 4.0",
	url: "https://creativecommons.org/licenses/by-sa/4.0",
};

// Downloaded from Wikimedia Commons and resized only; each is served as `/images/<id>-640.jpg`, `-900.jpg` and `-1200.jpg`.
export const PICTURES = {
	devanagari: {
		id: "gita-4-7-devanagari",
		width: 1200,
		height: 745,
		alt: "A manuscript page of Bhagavad Gita 4.7 to 4.10 in Devanagari: black ink, red verse marks and red-ruled margins",
		caption: "Chapter 4, verses 7–10, in Devanagari",
		title:
			"4th Chapter, verses 7-10, Bhagavad Gita, Sanskrit, Devanagari script",
		creator: "Ms Sarah Welch",
		page: "https://commons.wikimedia.org/wiki/File:4th_Chapter,_verses_7-10,_Bhagavad_Gita,_Sanskrit,_Devanagari_script.jpg",
	},
	gurmukhi: {
		id: "gita-3-1-gurmukhi",
		width: 1200,
		height: 771,
		alt: "A manuscript page of Bhagavad Gita 3.1 and 3.2 in Gurmukhi script, with lines in red and black ink",
		caption: "Chapter 3, verses 1–2, in Gurmukhi",
		title: "3rd Chapter Verses 1-2, Bhagavad Gita, Gurmukhi script, Punjab",
		creator: "Ms Sarah Welch",
		page: "https://commons.wikimedia.org/wiki/File:3rd_Chapter_Verses_1-2,_Bhagavad_Gita,_Gurmukhi_script,_Punjab.jpg",
	},
	bengali: {
		id: "gita-1-1-bengali",
		width: 1200,
		height: 1007,
		alt: "Two printed pages opening chapters 1 and 2 of the Gita in Bengali script, with the speaker named above each speech",
		caption: "Chapters 1 and 2 in Bengali, 19th century",
		title:
			"1st and 2nd chapter face page, Bhagavad Gita, Bengali script, 19th century",
		creator: "Ms Sarah Welch",
		page: "https://commons.wikimedia.org/wiki/File:1st_and_2nd_chapter_face_page,_Bhagavad_Gita,_Bengali_script,_19th_century.jpg",
	},
	malayalam: {
		id: "gita-palm-leaf-malayalam",
		width: 1200,
		height: 224,
		alt: "A long, narrow palm leaf written in Malayalam script, with two holes for the binding cord",
		caption: "A palm-leaf Gita from Kerala, 16th century, in Malayalam script",
		title:
			"16th century Bhagavad Gita palm leaf manuscript, Sanskrit, Malayalam script, Kerala",
		creator: "Ms Sarah Welch",
		page: "https://commons.wikimedia.org/wiki/File:16th_century_Bhagavad_Gita_palm_leaf_manuscript,_Sanskrit,_Malayalam_script,_Kerala.jpg",
	},
	grantha: {
		id: "gita-palm-leaf-grantha",
		width: 1200,
		height: 302,
		alt: "A palm leaf of the Gita in Grantha script, threaded on two cords",
		caption: "A palm-leaf Gita in Grantha script",
		title: "Bhagavad Gita Grantha script Sanskrit",
		creator: "Ms Sarah Welch",
		page: "https://commons.wikimedia.org/wiki/File:Bhagavad_Gita_Grantha_script_Sanskrit.jpg",
	},
	angkor: {
		id: "kurukshetra-angkor-wat",
		width: 1200,
		height: 900,
		alt: "A stone relief at Angkor Wat of an archer in a chariot at the battle of Kurukshetra",
		caption: "Kurukshetra, a relief at Angkor Wat, 12th century",
		title: "Kurukshetra Angkor Wat 0859",
		creator: "Michael Gunther",
		page: "https://commons.wikimedia.org/wiki/File:Kurukshetra_Angkor_Wat_0859.jpg",
	},
} satisfies Record<string, Picture>;

export function pictureSources(picture: Picture) {
	return {
		src: `/images/${picture.id}-640.jpg`,
		srcSet: `/images/${picture.id}-640.jpg 640w, /images/${picture.id}-900.jpg 900w, /images/${picture.id}-1200.jpg 1200w`,
	};
}

export function pictureThumbnail(picture: Picture) {
	return `/images/${picture.id}-thumb.jpg`;
}

export const FONTS = [
	{ name: "Tiro Devanagari Sanskrit", foundry: "Tiro Typeworks" },
	{ name: "Source Serif 4", foundry: "Adobe" },
	{ name: "Libre Franklin", foundry: "Impallari Type" },
];

export const FONT_LICENCE = {
	name: "SIL Open Font License 1.1",
	url: "https://openfontlicense.org",
};

export const CONTENT_TERMS_URL = "https://bhagavadgita.com/copyright";
export const REPOSITORY_URL = "https://github.com/ankittchauhann/Bhagwat-Gita";
export const CONTACT_URL = "https://github.com/ankittchauhann";

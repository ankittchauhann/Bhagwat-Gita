import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useGitaStore } from "@/store/gitaStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

// Mock verses data - you can replace this with actual API call later
const mockVerses = [
	{
		id: 1,
		verse_number: 1,
		chapter_number: 1,
		text: "धृतराष्ट्र उवाच |\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||१||",
		transliteration:
			"dhṛitarāśhtra uvācha\ndharma-kṣhetre kuru-kṣhetre samavetā yuyutsavaḥ\nmāmakāḥ pāṇḍavāśhchaiva kimakurvata sañjaya",
		meaning: {
			author: "Swami Mukundananda",
			text: "Dhritarashtra said: O Sanjaya, after gathering on the holy field of Kurukshetra, and desiring to fight, what did my sons and the sons of Pandu do?",
		},
	},
	{
		id: 2,
		verse_number: 2,
		chapter_number: 1,
		text: "सञ्जय उवाच |\nदृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा |\nआचार्यमुपसंगम्य राजा वचनमब्रवीत् ||२||",
		transliteration:
			"sañjaya uvācha\ndṛiṣhṭvā tu pāṇḍavānīkaṁ vyūḍhaṁ duryodhanastadā\nāchāryam-upasaṅgamya rājā vachanam-abravīt",
		meaning: {
			author: "Swami Mukundananda",
			text: "Sanjaya said: On seeing the Pandava army standing in military formation, king Duryodhana approached his teacher Dronacharya, and spoke the following words.",
		},
	},
];

export function ChapterPage() {
	const navigate = useNavigate();
	const params = useParams({ from: "/chapter/$chapterId" });
	const chapterId = Number.parseInt(params.chapterId);
	const { chapters, currentChapter, setCurrentChapter } = useGitaStore();
	const [selectedVerse, setSelectedVerse] = useState<number>(1);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		const chapter = chapters.find((ch) => ch.id === chapterId);
		if (chapter) {
			setCurrentChapter(chapter);
		}
	}, [chapterId, chapters, setCurrentChapter]);

	const handleBackToChapters = () => {
		navigate({ to: "/chapters" });
	};

	const currentVerse =
		mockVerses.find((v) => v.verse_number === selectedVerse) || mockVerses[0];

	if (!currentChapter) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
					<p className="mt-4 text-slate-600">Loading chapter...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950">
			{/* Header */}
			<div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-orange-200 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button
								variant="ghost"
								onClick={handleBackToChapters}
								className="hover:bg-orange-100"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<div>
								<h1 className="text-2xl font-bold text-slate-800">
									Chapter {currentChapter.chapter_number}:{" "}
									{currentChapter.name_meaning}
								</h1>
								<p className="text-sm text-slate-600">
									{currentChapter.name_transliterated}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-2 text-sm text-slate-500">
							<BookOpen className="h-4 w-4" />
							<span>{currentChapter.verses_count} verses</span>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				<div className="grid lg:grid-cols-4 gap-6">
					{/* Sidebar - Verses List */}
					<div className="lg:col-span-1">
						<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto">
							<CardHeader>
								<CardTitle className="text-lg">All Verses</CardTitle>
								<CardDescription>
									श्लोक सूची - {currentChapter.verses_count} total
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{Array.from(
										{ length: currentChapter.verses_count },
										(_, i) => i + 1,
									).map((verseNumber) => (
										<Button
											key={verseNumber}
											variant={
												selectedVerse === verseNumber ? "default" : "ghost"
											}
											size="sm"
											className={`w-full justify-start text-left ${
												selectedVerse === verseNumber
													? "bg-gradient-to-r from-orange-500 to-red-500"
													: "hover:bg-orange-100"
											}`}
											onClick={() => setSelectedVerse(verseNumber)}
										>
											<span className="mr-2">श्लोक</span>
											{verseNumber}
										</Button>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Content - Verse Display */}
					<div className="lg:col-span-3">
						<div className="space-y-6">
							{/* Chapter Summary */}
							<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
								<CardHeader>
									<CardTitle className="text-xl text-orange-700">
										{currentChapter.name}
									</CardTitle>
									<CardDescription className="text-base">
										{currentChapter.name_meaning} -{" "}
										{currentChapter.name_transliterated}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-slate-700 leading-relaxed">
										{currentChapter.chapter_summary}
									</p>
								</CardContent>
							</Card>

							{/* Current Verse Display */}
							<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="text-xl">
											Verse {currentVerse.verse_number}
										</CardTitle>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setIsPlaying(!isPlaying)}
											className="flex items-center space-x-2"
										>
											{isPlaying ? (
												<Pause className="h-4 w-4" />
											) : (
												<Play className="h-4 w-4" />
											)}
											<span>{isPlaying ? "Pause" : "Play"}</span>
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Sanskrit Text */}
									<div className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-lg">
										<h3 className="text-lg font-semibold mb-3 text-orange-800 dark:text-orange-200">
											Sanskrit (संस्कृत)
										</h3>
										<p className="text-xl leading-relaxed font-sanskrit text-slate-800 dark:text-slate-200">
											{currentVerse.text}
										</p>
									</div>

									{/* Transliteration */}
									<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
										<h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
											Transliteration
										</h3>
										<p className="text-lg leading-relaxed italic text-slate-700 dark:text-slate-300">
											{currentVerse.transliteration}
										</p>
									</div>

									{/* English Translation */}
									<div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
										<h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200">
											English Translation
										</h3>
										<p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
											{currentVerse.meaning.text}
										</p>
										<p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
											— {currentVerse.meaning.author}
										</p>
									</div>

									{/* Navigation */}
									<div className="flex justify-between items-center pt-4">
										<Button
											variant="outline"
											onClick={() =>
												setSelectedVerse(Math.max(1, selectedVerse - 1))
											}
											disabled={selectedVerse === 1}
										>
											← Previous Verse
										</Button>
										<span className="text-sm text-slate-500">
											{selectedVerse} of {currentChapter.verses_count}
										</span>
										<Button
											variant="outline"
											onClick={() =>
												setSelectedVerse(
													Math.min(
														currentChapter.verses_count,
														selectedVerse + 1,
													),
												)
											}
											disabled={selectedVerse === currentChapter.verses_count}
										>
											Next Verse →
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

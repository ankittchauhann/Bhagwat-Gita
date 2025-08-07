import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

// Collection of inspiring verses from Bhagavad Gita
const inspirationalVerses = [
	{
		sanskrit:
			"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
		english:
			"Whenever there is a decline in righteousness and an increase in unrighteousness, at that time I manifest myself on earth.",
		chapter: 4,
		verse: 7,
	},
	{
		sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
		english:
			"You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results, nor be attached to not doing your duty.",
		chapter: 2,
		verse: 47,
	},
	{
		sanskrit:
			"योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
		english:
			"Perform your duty equipoised, abandoning all attachment to success or failure. Such equanimity is called yoga.",
		chapter: 2,
		verse: 48,
	},
	{
		sanskrit:
			"श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥",
		english:
			"It is better to engage in one's own occupation, even though one may perform it imperfectly, than to accept another's occupation and perform it perfectly.",
		chapter: 3,
		verse: 35,
	},
	{
		sanskrit:
			"मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।\nमामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे॥",
		english:
			"Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.",
		chapter: 18,
		verse: 65,
	},
	{
		sanskrit:
			"सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
		english:
			"Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
		chapter: 18,
		verse: 66,
	},
	{
		sanskrit:
			"यत्करोषि यदश्नासि यज्जुहोषि ददासि यत्।\nयत्तपस्यसि कौन्तेय तत्कुरुष्व मदर्पणम्॥",
		english:
			"Whatever you do, whatever you eat, whatever you offer or give away, whatever austerities you practice—do that as an offering to Me.",
		chapter: 9,
		verse: 27,
	},
	{
		sanskrit:
			"अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
		english:
			"To those who are constantly devoted and who always remember Me with love, I give the understanding by which they can come to Me.",
		chapter: 9,
		verse: 22,
	},
];

export function Dashboard() {
	const navigate = useNavigate();
	const [currentVerse, setCurrentVerse] = useState(inspirationalVerses[0]);

	// Randomize verse on component mount
	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * inspirationalVerses.length);
		setCurrentVerse(inspirationalVerses[randomIndex]);
	}, []);

	const handleNamasteClick = () => {
		navigate({ to: "/chapters" });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950">
			{/* Theme Toggle - Top Right */}
			<div className="absolute top-6 right-6 z-10">
				<ThemeToggle />
			</div>

			{/* Hero Section */}
			<div className="container mx-auto px-4 pt-20 pb-16">
				<div className="text-center space-y-8">
					{/* Logo/Symbol */}
					<div className="flex justify-center">
						<div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
							<span className="text-4xl text-white">॥</span>
						</div>
					</div>

					{/* Title */}
					<div className="space-y-4">
						<h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
							श्रीमद्भगवद्गीता
						</h1>
						<h2 className="text-3xl md:text-4xl font-semibold text-slate-700 dark:text-slate-300">
							Bhagavad Gita
						</h2>
						<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
							The timeless wisdom of Lord Krishna - A sacred dialogue on dharma,
							duty, and devotion
						</p>
					</div>

					{/* Main CTA Button */}
					<div className="pt-8">
						<Button
							onClick={handleNamasteClick}
							size="lg"
							className="text-xl px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
						>
							🙏 Namaste
						</Button>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="container mx-auto px-4 pb-20">
				<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
						<CardHeader className="text-center">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<BookOpen className="h-6 w-6 text-white" />
							</div>
							<CardTitle className="text-xl">18 Chapters</CardTitle>
							<CardDescription>
								Explore all 18 sacred chapters of the Gita
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-center text-slate-600">
								From Arjuna's dilemma to the ultimate surrender, discover the
								complete journey of spiritual wisdom.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
						<CardHeader className="text-center">
							<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<Sparkles className="h-6 w-6 text-white" />
							</div>
							<CardTitle className="text-xl">700 Verses</CardTitle>
							<CardDescription>
								Sacred shlokas in Sanskrit and English
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-center text-slate-600">
								Experience the divine teachings in both original Sanskrit and
								clear English translations.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
						<CardHeader className="text-center">
							<div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<Heart className="h-6 w-6 text-white" />
							</div>
							<CardTitle className="text-xl">Timeless Wisdom</CardTitle>
							<CardDescription>
								Spiritual guidance for modern life
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-center text-slate-600">
								Find answers to life's deepest questions through Krishna's
								eternal teachings.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Quote Section */}
			<div className="container mx-auto px-4 pb-20">
				<Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 border-0 shadow-lg">
					<CardContent className="text-center py-12">
						<blockquote className="space-y-4">
							<p className="text-2xl md:text-3xl font-serif text-slate-700 dark:text-slate-300 italic whitespace-pre-line">
								"{currentVerse.sanskrit}"
							</p>
							<p className="text-lg text-slate-600 dark:text-slate-400">
								"{currentVerse.english}"
							</p>
							<footer className="text-sm text-slate-500 dark:text-slate-500">
								— Bhagavad Gita, Chapter {currentVerse.chapter}, Verse{" "}
								{currentVerse.verse}
							</footer>
						</blockquote>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

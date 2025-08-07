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
import { ThemeToggle } from "./ThemeToggle";

export function Dashboard() {
	const navigate = useNavigate();

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
							className="text-xl px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
						>
							<Heart className="mr-3 h-6 w-6" />🙏 Namaste
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
							<p className="text-2xl md:text-3xl font-serif text-slate-700 dark:text-slate-300 italic">
								"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।
								<br />
								अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥"
							</p>
							<p className="text-lg text-slate-600 dark:text-slate-400">
								"Whenever there is a decline in righteousness and an increase in
								unrighteousness, at that time I manifest myself on earth."
							</p>
							<footer className="text-sm text-slate-500 dark:text-slate-500">
								— Bhagavad Gita, Chapter 4, Verse 7
							</footer>
						</blockquote>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

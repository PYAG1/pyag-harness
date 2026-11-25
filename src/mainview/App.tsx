import { useState } from "react";
import { Link, Route, Routes } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";

function Home() {
	const [count, setCount] = useState(0);

	return (
		<div className="min-h-screen bg-linear-to-br from-indigo-500 to-purple-600 text-gray-900">
			<div className="container mx-auto px-4 py-10 max-w-3xl">
				<h1 className="text-5xl font-bold text-center text-white mb-2 drop-shadow-lg">
					React + Tailwind + Vite
				</h1>
				<p className="text-xl text-center text-white/90 mb-10">
					A fast Electrobun app with hot module replacement
				</p>

				<div className="bg-white rounded-xl shadow-xl p-8 mb-8">
					<h2 className="text-2xl font-semibold text-indigo-600 mb-4">
						Interactive Counter
					</h2>
					<p className="mb-4 text-gray-600">
						Click the button below to test React state. With HMR enabled, you
						can edit this component and see changes instantly without losing
						state.
					</p>
					<div className="flex items-center gap-4">
						<Button
							onClick={() => setCount((c) => c + 1)}
							className="bg-indigo-600 px-6 py-3 text-white shadow-md hover:bg-indigo-700 hover:shadow-lg"
						>
							Count: {count}
						</Button>
						<Button
							variant="secondary"
							onClick={() => setCount(0)}
						>
							Reset
						</Button>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-xl p-8 mb-8">
					<h2 className="text-2xl font-semibold text-indigo-600 mb-4">
						Getting Started
					</h2>
					<ul className="space-y-3 text-gray-700">
						<li className="flex items-start gap-2">
							<span className="text-indigo-500 font-bold">1.</span>
							<span>
								Run{" "}
								<code className="bg-gray-100 px-2 py-1 rounded text-sm">
									hutch run dev
								</code>{" "}
								for development without HMR
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-indigo-500 font-bold">2.</span>
							<span>
								Run{" "}
								<code className="bg-gray-100 px-2 py-1 rounded text-sm">
									hutch run dev:hmr
								</code>{" "}
								for development with hot reload
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-indigo-500 font-bold">3.</span>
							<span>
								Run{" "}
								<code className="bg-gray-100 px-2 py-1 rounded text-sm">
									hutch run build:canary
								</code>{" "}
								to build for production
							</span>
						</li>
					</ul>
				</div>

				<div className="bg-white rounded-xl shadow-xl p-8">
					<h2 className="text-2xl font-semibold text-indigo-600 mb-4">Stack</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-3xl mb-2">⚡</div>
							<div className="font-medium">Electrobun</div>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-3xl mb-2">⚛️</div>
							<div className="font-medium">React</div>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-3xl mb-2">🎨</div>
							<div className="font-medium">Tailwind</div>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-3xl mb-2">🔥</div>
							<div className="font-medium">Vite HMR</div>
						</div>
					</div>
				</div>

				<div className="text-center text-white/80 mt-10 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
					<p>
						Edit{" "}
						<code className="bg-white/20 px-2 py-1 rounded text-sm">
							src/mainview/App.tsx
						</code>{" "}
						and save to see HMR in action
					</p>
				</div>
			</div>
		</div>
	);
}

function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-2xl font-semibold">Page not found</h1>
			<p className="text-muted-foreground">That page doesn’t exist in this app.</p>
			<Link to="/" className={buttonVariants()}>
				Back to home
			</Link>
		</main>
	);
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;

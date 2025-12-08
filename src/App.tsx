/** biome-ignore-all lint/a11y/useButtonType: template */
import confetti from "canvas-confetti";
import { useCallback, useEffect, useState } from "react";
import { DrawnNumbers } from "./components/drawn-numbers";
import { LotteryDialog } from "./components/lottery-dialog";
import { LotteryTicket } from "./components/lottery-ticket";
import { Button } from "./components/ui/button";

// Initialize sounds
const drumRoll = new Audio("/sounds/drum-roll.mp3");
drumRoll.loop = true;
const tada = new Audio("/sounds/tada.mp3");
const applause = new Audio("/sounds/applause.mp3");

// Chain sounds
tada.onended = () => {
	applause.currentTime = 0;
	applause.play().catch(() => {});
};

export default function App() {
	const [showDialog, setShowDialog] = useState(() => {
		return !localStorage.getItem("undian-paliat-config");
	});
	const [startNumber, setStartNumber] = useState(() => {
		const saved = localStorage.getItem("undian-paliat-config");
		return saved ? JSON.parse(saved).start : 1;
	});
	const [endNumber, setEndNumber] = useState(() => {
		const saved = localStorage.getItem("undian-paliat-config");
		return saved ? JSON.parse(saved).end : 100;
	});
	const [totalDraws, setTotalDraws] = useState(() => {
		const saved = localStorage.getItem("undian-paliat-config");
		return saved ? JSON.parse(saved).total : 5;
	});
	const [exceptions, setExceptions] = useState<number[]>(() => {
		const saved = localStorage.getItem("undian-paliat-config");
		return saved ? JSON.parse(saved).exceptions || [] : [];
	});
	const [isDrawing, setIsDrawing] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [drawnNumbers, setDrawnNumbers] = useState<number[]>(() => {
		const saved = localStorage.getItem("undian-paliat-winners");
		return saved ? JSON.parse(saved) : [];
	});
	const [currentNumber, setCurrentNumber] = useState(1);

	// Initialize currentNumber from saved state if exists
	useEffect(() => {
		if (drawnNumbers.length > 0) {
			setCurrentNumber(drawnNumbers[drawnNumbers.length - 1]);
		}
	}, [drawnNumbers]);

	const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);

	// Initialize availableNumbers logic on load if config exists
	useEffect(() => {
		const savedConfig = localStorage.getItem("undian-paliat-config");
		if (savedConfig && availableNumbers.length === 0) {
			const {
				start,
				end,
				exceptions: savedExceptions = [],
			} = JSON.parse(savedConfig);
			// Reconstruct available numbers excluding already drawn ones and exceptions
			const allNumbers = Array.from(
				{ length: end - start + 1 },
				(_, i) => start + i,
			);
			const remaining = allNumbers.filter(
				(n) => !drawnNumbers.includes(n) && !savedExceptions.includes(n),
			);
			setAvailableNumbers(remaining);
		}
	}, [availableNumbers.length, drawnNumbers]);

	// Persist drawn numbers
	useEffect(() => {
		localStorage.setItem("undian-paliat-winners", JSON.stringify(drawnNumbers));
	}, [drawnNumbers]);

	const handleStart = (
		start: number,
		end: number,
		total: number,
		exceptionNumbers: number[],
	) => {
		setStartNumber(start);
		setEndNumber(end);
		setTotalDraws(total);
		setExceptions(exceptionNumbers);
		setShowDialog(false);

		// Save config including exceptions
		localStorage.setItem(
			"undian-paliat-config",
			JSON.stringify({ start, end, total, exceptions: exceptionNumbers }),
		);

		// Initialize available numbers excluding exceptions
		const numbers = Array.from(
			{ length: end - start + 1 },
			(_, i) => start + i,
		).filter((n) => !exceptionNumbers.includes(n));
		setAvailableNumbers(numbers);
		setDrawnNumbers([]);
	};

	const handleStartDrawing = useCallback(() => {
		if (isDrawing || drawnNumbers.length >= totalDraws) return;

		setIsDrawing(true);
		drumRoll.currentTime = 0;
		drumRoll.play().catch(() => {}); // catch error if user hasn't interacted yet

		// Reset effects
		tada.pause();
		tada.currentTime = 0;
		applause.pause();
		applause.currentTime = 0;

		// Animate for 3 seconds then draw a number
		setTimeout(() => {
			// LOGIC UNDIAN: MURNI RANDOM
			// Menggunakan Math.random() untuk memilih satu indeks secara acak dari array availableNumbers.
			// Tidak ada manipulasi atau 'settingan', setiap nomor yang tersisa memiliki peluang yang sama untuk terpilih.
			const randomIndex = Math.floor(Math.random() * availableNumbers.length);
			const drawnNumber = availableNumbers[randomIndex];

			setDrawnNumbers((prev) => [...prev, drawnNumber]);
			setCurrentNumber(drawnNumber); // Show the winner!
			setAvailableNumbers((prev) =>
				prev.filter((_, index) => index !== randomIndex),
			);
			setIsDrawing(false);

			// Stop drum roll and play tada
			drumRoll.pause();
			tada.currentTime = 0;
			tada.play().catch(() => {});

			// Fire confetti
			const duration = 3 * 1000;
			const animationEnd = Date.now() + duration;
			const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

			const randomInRange = (min: number, max: number) => {
				return Math.random() * (max - min) + min;
			};

			const interval = window.setInterval(() => {
				const timeLeft = animationEnd - Date.now();

				if (timeLeft <= 0) {
					return clearInterval(interval);
				}

				const particleCount = 50 * (timeLeft / duration);
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				});
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				});
			}, 250);
		}, 3000);
	}, [isDrawing, drawnNumbers, totalDraws, availableNumbers]);

	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}, []);

	// Listen to fullscreen changes
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	// Redraw (Undi Ulang) - removes last winner and draws again immediately
	const handleRedraw = useCallback(() => {
		if (isDrawing || drawnNumbers.length === 0) return;

		// Remove the last drawn number (it's voided/hangus)
		// We do NOT add it back to avaiableNumbers because it's voided
		setDrawnNumbers((prev) => prev.slice(0, -1));

		// Start drawing immediately
		handleStartDrawing();
	}, [isDrawing, drawnNumbers.length, handleStartDrawing]);

	// Keyboard binding
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space" && !showDialog) {
				e.preventDefault();
				handleStartDrawing();
			}
			if (e.code === "KeyF") {
				e.preventDefault();
				toggleFullscreen();
			}
			if ((e.code === "KeyR" || e.key.toLowerCase() === "r") && !showDialog) {
				e.preventDefault();
				handleRedraw();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleStartDrawing, toggleFullscreen, showDialog, handleRedraw]);

	const handleReset = () => {
		if (confirm("Apakah Anda yakin ingin mereset semua data undian?")) {
			setShowDialog(true);
			setDrawnNumbers([]);
			localStorage.removeItem("undian-paliat-winners");
			localStorage.removeItem("undian-paliat-config");
			setIsDrawing(false);
			setCurrentNumber(1);

			// Reset audio
			drumRoll.pause();
			drumRoll.currentTime = 0;
			tada.pause();
			tada.currentTime = 0;
			applause.pause();
			applause.currentTime = 0;
		}
	};

	// Auto-generate random numbers for animation (Attract Mode) - DISABLED
	// Sekarang menampilkan pesan instruksi daripada nomor random berganti-ganti
	// useEffect(() => {
	// 	if (!showDialog && !isDrawing && drawnNumbers.length === 0) {
	// 		const interval = setInterval(() => {
	// 			setCurrentNumber(
	// 				Math.floor(Math.random() * (endNumber - startNumber + 1)) +
	// 					startNumber,
	// 			);
	// 		}, 100);

	// 		return () => clearInterval(interval);
	// 	}
	// }, [showDialog, isDrawing, startNumber, endNumber, drawnNumbers.length]);

	// Generate random numbers during drawing
	useEffect(() => {
		if (isDrawing) {
			const interval = setInterval(() => {
				setCurrentNumber(
					Math.floor(Math.random() * (endNumber - startNumber + 1)) +
						startNumber,
				);
			}, 50);

			return () => clearInterval(interval);
		}
	}, [isDrawing, startNumber, endNumber]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-yellow-950 via-yellow-900 to-amber-800 flex items-center justify-center p-4">
			<div
				style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 100 }}
			>
				{/* GitHub Button */}
				<Button
					asChild
					size="icon"
					className="bg-black/50 text-yellow-300 shadow-lg hover:shadow-xl hover:bg-black/70 transition-all border-2 border-yellow-600 px-4 py-4"
					style={{ width: "3rem", height: "3rem", borderRadius: "9999px" }}
				>
					<a
						href="https://github.com/sizoune/undian-paliat"
						target="_blank"
						rel="noopener noreferrer"
						title="Kode Sumber"
						className="flex items-center justify-center p-0"
						style={{ width: "100%", height: "100%", borderRadius: "9999px" }}
					>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle:valid */}
						<svg
							style={{ width: "1.5rem", height: "1.5rem" }}
							viewBox="0 0 16 16"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
						</svg>
						<span className="sr-only">Kode Sumber</span>
					</a>
				</Button>
			</div>
			{showDialog && <LotteryDialog onStart={handleStart} />}

			{!showDialog && (
				<div className="w-full max-w-4xl">
					<div className="text-center mb-8">
						<div className="flex items-center justify-center gap-4 mb-4">
							<img src="/tabalong.png" alt="Tabalong" className="h-24 mb-4" />
							<img
								src="/tabalongsmart.png"
								alt="Tabalong Smart"
								className="h-24 mb-4"
							/>
						</div>
						<h1 className="text-yellow-300 mb-2">
							Undian Kupon Makan Paliat Besamaan
						</h1>
						<p className="text-yellow-200/90">
							Range: {startNumber} - {endNumber} | Total Undian: {totalDraws}
							{exceptions.length > 0 && (
								<> | Pengecualian: {exceptions.join(", ")}</>
							)}
						</p>
					</div>

					<LotteryTicket
						currentNumber={currentNumber}
						isDrawing={isDrawing}
						maxDigits={String(endNumber).length}
						showInstructions={drawnNumbers.length === 0 && !isDrawing}
					/>

					<div className="text-center mt-8">
						<button
							onClick={handleStartDrawing}
							disabled={isDrawing || drawnNumbers.length >= totalDraws}
							className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-12 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-black"
						>
							{isDrawing ? (
								"Mengundi..."
							) : drawnNumbers.length >= totalDraws ? (
								"Undian Selesai"
							) : (
								<span className="flex items-center gap-2">
									Mulai Undian{" "}
									<kbd className="hidden md:inline-block px-2 py-0.5 bg-black/20 rounded text-xs">
										Spasi
									</kbd>
								</span>
							)}
						</button>

						<button
							onClick={handleReset}
							className="ml-4 bg-black/50 text-yellow-300 px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-black/70 transition-all border-2 border-yellow-600"
						>
							Reset
						</button>
					</div>

					<DrawnNumbers numbers={drawnNumbers} totalDraws={totalDraws} />
				</div>
			)}
		</div>
	);
}

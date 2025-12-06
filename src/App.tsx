/** biome-ignore-all lint/a11y/useButtonType: template */
import { useCallback, useEffect, useState } from "react";
import { DrawnNumbers } from "./components/drawn-numbers";
import { LotteryDialog } from "./components/lottery-dialog";
import { LotteryTicket } from "./components/lottery-ticket";

export default function App() {
	const [showDialog, setShowDialog] = useState(true);
	const [startNumber, setStartNumber] = useState(1);
	const [endNumber, setEndNumber] = useState(100);
	const [totalDraws, setTotalDraws] = useState(5);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentNumber, setCurrentNumber] = useState(1);
	const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
	const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);

	const handleStart = (start: number, end: number, total: number) => {
		setStartNumber(start);
		setEndNumber(end);
		setTotalDraws(total);
		setShowDialog(false);

		// Initialize available numbers
		const numbers = Array.from(
			{ length: end - start + 1 },
			(_, i) => start + i,
		);
		setAvailableNumbers(numbers);
		setDrawnNumbers([]);
	};

	const handleStartDrawing = useCallback(() => {
		if (isDrawing || drawnNumbers.length >= totalDraws) return;

		setIsDrawing(true);

		// Animate for 3 seconds then draw a number
		setTimeout(() => {
			const randomIndex = Math.floor(Math.random() * availableNumbers.length);
			const drawnNumber = availableNumbers[randomIndex];

			setDrawnNumbers((prev) => [...prev, drawnNumber]);
			setAvailableNumbers((prev) =>
				prev.filter((_, index) => index !== randomIndex),
			);
			setIsDrawing(false);
		}, 3000);
	}, [isDrawing, drawnNumbers, totalDraws, availableNumbers]);

	// Keyboard binding
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space" && !showDialog) {
				e.preventDefault();
				handleStartDrawing();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleStartDrawing, showDialog]);

	const handleReset = () => {
		setShowDialog(true);
		setDrawnNumbers([]);
		setIsDrawing(false);
		setCurrentNumber(1);
	};

	// Auto-generate random numbers for animation
	useEffect(() => {
		if (!showDialog && !isDrawing) {
			const interval = setInterval(() => {
				setCurrentNumber(
					Math.floor(Math.random() * (endNumber - startNumber + 1)) +
						startNumber,
				);
			}, 100);

			return () => clearInterval(interval);
		}
	}, [showDialog, isDrawing, startNumber, endNumber]);

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
						</p>
					</div>

					<LotteryTicket currentNumber={currentNumber} isDrawing={isDrawing} />

					<div className="text-center mt-8">
						<button
							onClick={handleStartDrawing}
							disabled={isDrawing || drawnNumbers.length >= totalDraws}
							className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-12 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-black"
						>
							{isDrawing
								? "Mengundi..."
								: drawnNumbers.length >= totalDraws
									? "Undian Selesai"
									: "Mulai Undian"}
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

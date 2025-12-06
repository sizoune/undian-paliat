import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LotteryTicketProps {
	currentNumber: number;
	isDrawing: boolean;
	maxDigits?: number;
}

export function LotteryTicket({
	currentNumber,
	isDrawing,
	maxDigits = 3,
}: LotteryTicketProps) {
	return (
		<div className="relative">
			<motion.div
				animate={{
					scale: isDrawing ? [1, 1.05, 1] : 1,
					rotateY: isDrawing ? [0, 5, -5, 0] : 0,
				}}
				transition={{
					duration: 0.5,
					repeat: isDrawing ? Infinity : 0,
				}}
				className="relative"
			>
				{/* Ticket Background */}
				<div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl shadow-2xl overflow-hidden border-4 border-black">
					{/* Decorative Border */}
					<div className="border-8 border-dashed border-black/30 rounded-3xl m-4 p-8">
						{/* Ticket Header */}
						<div className="text-center mb-6">
							<div className="flex items-center justify-center gap-2 mb-2">
								<Sparkles className="w-6 h-6 text-black" />
								<h2 className="text-black">KUPON UNDIAN</h2>
								<Sparkles className="w-6 h-6 text-black" />
							</div>
							<div className="h-1 w-32 bg-black mx-auto rounded-full"></div>
						</div>

						{/* Number Display */}
						<div className="bg-white rounded-2xl p-12 shadow-inner border-4 border-black">
							<div className="text-center">
								<p className="text-gray-700 mb-4">Nomor Undian</p>
								<motion.div
									key={currentNumber}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.1 }}
									className="text-8xl text-black tabular-nums tracking-wider"
									style={{ fontFamily: "monospace" }}
								>
									{String(currentNumber).padStart(maxDigits, "0")}
								</motion.div>
								{isDrawing && (
									<motion.p
										animate={{ opacity: [0.5, 1, 0.5] }}
										transition={{ duration: 1, repeat: Infinity }}
										className="text-yellow-700 mt-4"
									>
										Sedang mengundi...
									</motion.p>
								)}
							</div>
						</div>

						{/* Decorative Elements */}
						<div className="mt-6 flex justify-between items-center">
							<div className="flex gap-1">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="w-2 h-2 bg-black rounded-full"></div>
								))}
							</div>
							<div className="flex gap-1">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="w-2 h-2 bg-black rounded-full"></div>
								))}
							</div>
						</div>
					</div>

					{/* Perforated Edges */}
					<div className="absolute top-0 left-0 right-0 h-2 flex justify-around">
						{[...Array(20)].map((_, i) => (
							<div
								key={i}
								className="w-2 h-2 bg-yellow-950 rounded-full -mt-1"
							></div>
						))}
					</div>
					<div className="absolute bottom-0 left-0 right-0 h-2 flex justify-around">
						{[...Array(20)].map((_, i) => (
							<div
								key={i}
								className="w-2 h-2 bg-yellow-950 rounded-full -mb-1"
							></div>
						))}
					</div>
				</div>

				{/* Glow Effect when Drawing */}
				{isDrawing && (
					<motion.div
						className="absolute inset-0 rounded-3xl"
						animate={{
							boxShadow: [
								"0 0 0px rgba(234, 179, 8, 0)",
								"0 0 40px rgba(234, 179, 8, 0.8)",
								"0 0 0px rgba(234, 179, 8, 0)",
							],
						}}
						transition={{ duration: 1, repeat: Infinity }}
					/>
				)}
			</motion.div>

			{/* Floating Confetti Effect */}
			{isDrawing && (
				<div className="absolute inset-0 pointer-events-none">
					{[...Array(10)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-3 h-3 bg-yellow-300 rounded-full border border-black"
							initial={{
								x: Math.random() * 100 - 50,
								y: Math.random() * 100 - 50,
								opacity: 0,
							}}
							animate={{
								x: Math.random() * 200 - 100,
								y: Math.random() * 200 - 100,
								opacity: [0, 1, 0],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								delay: i * 0.1,
							}}
							style={{
								left: "50%",
								top: "50%",
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}

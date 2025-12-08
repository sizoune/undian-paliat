import { useState } from "react";

interface LotteryDialogProps {
	onStart: (
		start: number,
		end: number,
		total: number,
		exceptions: number[],
	) => void;
}

export function LotteryDialog({ onStart }: LotteryDialogProps) {
	const [startNumber, setStartNumber] = useState("1");
	const [endNumber, setEndNumber] = useState("100");
	const [totalDraws, setTotalDraws] = useState("5");
	const [exceptions, setExceptions] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const start = parseInt(startNumber, 10);
		const end = parseInt(endNumber, 10);
		const total = parseInt(totalDraws, 10);

		if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(total)) {
			setError("Mohon masukkan angka yang valid");
			return;
		}

		if (start >= end) {
			setError("Nomor akhir harus lebih besar dari nomor awal");
			return;
		}

		if (total <= 0) {
			setError("Total undian harus lebih dari 0");
			return;
		}

		// Parse exceptions
		const exceptionNumbers: number[] = [];
		if (exceptions.trim()) {
			const parts = exceptions.split(",").map((part) => part.trim());
			for (const part of parts) {
				const num = parseInt(part, 10);
				if (Number.isNaN(num)) {
					setError(`Nomor pengecualian tidak valid: "${part}"`);
					return;
				}
				if (num < start || num > end) {
					setError(`Nomor pengecualian ${num} di luar range ${start}-${end}`);
					return;
				}
				exceptionNumbers.push(num);
			}
		}

		// Calculate available numbers after exceptions
		const availableCount = end - start + 1 - exceptionNumbers.length;

		if (total > availableCount) {
			setError(
				`Total undian (${total}) tidak boleh melebihi jumlah nomor yang tersedia (${availableCount})`,
			);
			return;
		}

		onStart(start, end, total, exceptionNumbers);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300 border-4 border-yellow-600">
				<div className="flex items-center justify-center mb-6">
					<img src="/tabalongsmart.png" alt="Tabalong Smart" className="h-20" />
				</div>

				<h2 className="text-center text-black mb-2">Selamat Datang</h2>
				<p className="text-center text-gray-700 mb-6">
					Masukkan pengaturan undian Anda
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-1">
								<label htmlFor="start-number" className="block text-black mb-2">
									Nomor Awal Kupon
								</label>
								<input
									id="start-number"
									type="number"
									value={startNumber}
									onChange={(e) => setStartNumber(e.target.value)}
									className="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:border-yellow-700 focus:outline-none transition-colors bg-white"
									placeholder="1"
								/>
							</div>

							<div className="flex-1">
								<label htmlFor="end-number" className="block text-black mb-2">
									Nomor Akhir Kupon
								</label>
								<input
									id="end-number"
									type="number"
									value={endNumber}
									onChange={(e) => setEndNumber(e.target.value)}
									className="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:border-yellow-700 focus:outline-none transition-colors bg-white"
									placeholder="100"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="total-draws" className="block text-black mb-2">
								Total Undian yang Diambil
							</label>
							<input
								id="total-draws"
								type="number"
								value={totalDraws}
								onChange={(e) => setTotalDraws(e.target.value)}
								className="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:border-yellow-700 focus:outline-none transition-colors bg-white"
								placeholder="5"
							/>
						</div>

						<div>
							<label htmlFor="exceptions" className="block text-black mb-2">
								Nomor Pengecualian (Yang sudah Kena, Agar Tidak Kena Lagi)
								(opsional)
							</label>
							<input
								id="exceptions"
								type="text"
								value={exceptions}
								onChange={(e) => setExceptions(e.target.value)}
								className="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:border-yellow-700 focus:outline-none transition-colors bg-white"
								placeholder="Contoh: 5, 10, 15"
							/>
							<p className="text-xs text-gray-600 mt-1">
								Pisahkan nomor dengan koma (,)
							</p>
						</div>
					</div>

					{error && (
						<div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
							{error}
						</div>
					)}

					<button
						type="submit"
						className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl border-2 border-black"
					>
						Mulai
					</button>
				</form>
			</div>
		</div>
	);
}

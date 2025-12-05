import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

interface DrawnNumbersProps {
  numbers: number[];
  totalDraws: number;
}

export function DrawnNumbers({ numbers, totalDraws }: DrawnNumbersProps) {
  if (numbers.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 shadow-xl border-2 border-yellow-600">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-yellow-300">Nomor Pemenang</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {numbers.map((number, index) => (
            <motion.div
              key={number}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 shadow-lg text-center border-2 border-black"
            >
              <div className="text-black/70 mb-1">#{index + 1}</div>
              <div className="text-3xl text-black tabular-nums" style={{ fontFamily: 'monospace' }}>
                {String(number).padStart(3, '0')}
              </div>
            </motion.div>
          ))}

          {/* Empty slots */}
          {[...Array(totalDraws - numbers.length)].map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-black/20 rounded-xl p-6 border-2 border-dashed border-yellow-600/60 text-center"
            >
              <div className="text-yellow-300/50 mb-1">#{numbers.length + index + 1}</div>
              <div className="text-3xl text-yellow-300/30">???</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-yellow-200">
            {numbers.length} dari {totalDraws} undian telah selesai
          </p>
        </div>
      </div>
    </div>
  );
}
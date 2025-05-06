import { motion } from 'motion/react';
import { useAtomValue } from 'jotai';
import { stateAtom } from '@/lib/atoms';

export function AnimatedBackground() {
  const state = useAtomValue(stateAtom);

  if (!state.running) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-bl from-purple-600/10 to-blue-600/10"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
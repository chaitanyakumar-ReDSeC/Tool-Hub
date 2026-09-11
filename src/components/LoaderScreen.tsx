import type { Key } from 'react';
import { motion } from 'motion/react';

interface LoaderScreenProps {
  key?: Key;
  statusText?: string;
}

export function LoaderScreen({ statusText = 'LOADING' }: LoaderScreenProps) {
  return (
    <motion.div
      id="tool-hub-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070708] select-none"
    >
      <div className="flex flex-col items-center">
        {/* Simple subtle title with red accent dot */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            TOOL<span className="text-red-500">HUB</span>
          </h1>
        </div>

        {/* Minimal thin loading indicator line */}
        <div className="mt-5 h-[2px] w-24 overflow-hidden rounded-full bg-zinc-900">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-2/3 bg-red-500"
          />
        </div>

        {/* Subtle status label */}
        <span className="mt-3 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          {statusText}
        </span>
      </div>
    </motion.div>
  );
}

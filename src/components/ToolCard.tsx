import { useState, type Key } from 'react';
import { ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Tool } from '../types';

interface ToolCardProps {
  key?: Key;
  tool: Tool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // High-res favicon fallback
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(tool.domain)}&sz=128`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.3) }}
      className="group relative flex h-full flex-col"
    >
      <a
        id={`tool-card-${tool.id}`}
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0e0e12] transition-all duration-200 hover:-translate-y-1 hover:border-red-600/70 hover:bg-[#121217] hover:shadow-[0_10px_30px_rgba(220,38,38,0.16)] focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {/* OpenGraph Thumbnail Section */}
        <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#131318] border-b border-zinc-800/70">
          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 animate-pulse">
              <div className="flex items-center gap-2 text-zinc-600 text-xs font-mono">
                <ImageIcon className="h-4 w-4 text-red-500/40" />
                <span className="text-[10px]">PREVIEW</span>
              </div>
            </div>
          )}

          {/* Fallback Banner if OG image cannot be fetched */}
          {imageError ? (
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#121217] via-[#1a0f12] to-[#0d0d10] p-4 text-center">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none" />
              <img
                src={faviconUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="mt-2 font-mono text-[11px] font-medium text-zinc-400">
                {tool.domain}
              </span>
            </div>
          ) : (
            /* OpenGraph image */
            <img
              src={tool.ogImage}
              alt={`${tool.name} preview`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`h-full w-full object-cover object-top transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Bottom gradient fade overlay for smooth transition into card body */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0e0e12] to-transparent" />

          {/* Floating Category Badge */}
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center rounded-md border border-red-500/40 bg-black/75 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-red-400 backdrop-blur-md shadow-sm">
              {tool.category}
            </span>
          </div>

          {/* Floating External Link Icon */}
          <div className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-black/75 text-zinc-400 backdrop-blur-md transition-all duration-200 group-hover:border-red-500/60 group-hover:bg-red-600 group-hover:text-white shadow-sm">
            <ExternalLink className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-5 pt-3">
          <div>
            {/* Tool Name in Space Grotesk */}
            <h3 className="font-heading text-lg font-bold tracking-tight text-white transition-colors duration-150 group-hover:text-red-400">
              {tool.name}
            </h3>

            {/* Tool Description in Montserrat */}
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-3">
              {tool.description || 'No description provided.'}
            </p>
          </div>

          {/* Card Footer: Domain source & Launch indicator */}
          <div className="mt-5 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="h-3 w-3 shrink-0 text-red-500/70" />
              <span className="truncate font-mono text-zinc-400 group-hover:text-zinc-300">
                {tool.domain}
              </span>
            </div>

            <span className="shrink-0 font-medium text-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Launch &rarr;
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

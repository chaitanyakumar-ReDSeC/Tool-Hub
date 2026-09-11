import { Github, Layers, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-[#070708] py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        {/* Brand and system info */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-red-500/30 bg-zinc-950">
            <Layers className="h-3.5 w-3.5 text-red-500" />
          </div>
          <span className="font-heading font-semibold text-zinc-300">
            TOOL<span className="text-red-500">HUB</span>
          </span>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-[11px] text-zinc-500">
            A-Z Alphabetical Index
          </span>
        </div>

        {/* Developer GitHub Link */}
        <div className="flex items-center gap-4">
          <a
            id="developer-github-link"
            href="https://github.com/chaitanyakumar-ReDSeC/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg border border-zinc-800/90 bg-zinc-900/60 px-3 py-1.5 text-zinc-400 transition-all duration-150 hover:border-red-500/60 hover:bg-zinc-900 hover:text-white shadow-sm"
          >
            <Github className="h-3.5 w-3.5 transition-colors group-hover:text-red-400" />
            <span className="font-mono text-[11px]">
              chaitanyakumar-ReDSeC
            </span>
            <ArrowUpRight className="h-3 w-3 text-zinc-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-400" />
          </a>
        </div>
      </div>
    </footer>
  );
}

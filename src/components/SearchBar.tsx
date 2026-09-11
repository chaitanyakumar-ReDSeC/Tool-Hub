import { Search, X } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="h-4 w-4 text-zinc-500 transition-colors group-focus-within:text-red-500" />
      </div>

      <input
        ref={inputRef}
        id="tool-search-input"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search tools by name..."
        className="w-full rounded-xl border border-zinc-800 bg-[#0d0d10] py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition-all focus:border-red-500 focus:bg-black focus:outline-none focus:ring-2 focus:ring-red-500/20"
      />

      {searchQuery && (
        <button
          id="clear-search-button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-white"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 hover:bg-red-600 transition-colors">
            <X className="h-3 w-3" />
          </div>
        </button>
      )}
    </div>
  );
}

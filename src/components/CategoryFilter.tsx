import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 2;
    setCanScrollLeft(el.scrollLeft > threshold);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - threshold);
  }, []);

  // Update scrollability indicators on mount, resize, and category changes
  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => checkScrollability());
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [categories, checkScrollability]);

  // Convert standard vertical mouse wheel scrolls to smooth horizontal scrolling without Shift key
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If there is any vertical scroll intent, divert it to horizontal
      if (e.deltaY !== 0) {
        const canScrollLeftNow = el.scrollLeft > 0;
        const canScrollRightNow = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;

        if ((e.deltaY > 0 && canScrollRightNow) || (e.deltaY < 0 && canScrollLeftNow)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.9;
          checkScrollability();
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [checkScrollability]);

  // Scroll controls
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollability, 300);
  };

  // Mouse Drag-to-scroll Handlers
  const handleMouseDown = (e: MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.2;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    checkScrollability();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative flex w-full items-center">
      {/* Left Chevron Button */}
      {canScrollLeft && (
        <div className="absolute left-0 z-10 flex h-full items-center pr-2">
          <button
            id="category-scroll-left"
            onClick={() => handleScroll('left')}
            aria-label="Scroll categories left"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-[#0d0d10]/95 text-zinc-300 shadow-lg backdrop-blur hover:border-red-500 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="pointer-events-none h-full w-6 bg-gradient-to-r from-[#070708] to-transparent" />
        </div>
      )}

      {/* Categories Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollability}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex w-full items-center gap-2 overflow-x-auto py-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
      >
        {/* "All" button */}
        <button
          id="category-filter-all"
          onClick={() => {
            if (!hasMovedRef.current) onSelectCategory('All');
          }}
          className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            selectedCategory === 'All'
              ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.35)]'
              : 'border border-zinc-800 bg-[#0d0d10] text-zinc-400 hover:border-zinc-700 hover:text-white'
          }`}
        >
          <span>All</span>
          <span
            className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
              selectedCategory === 'All'
                ? 'bg-red-950/80 text-white'
                : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Dynamic categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const categoryId = `category-filter-${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

          return (
            <button
              key={cat.name}
              id={categoryId}
              onClick={() => {
                if (!hasMovedRef.current) onSelectCategory(cat.name);
              }}
              className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.35)]'
                  : 'border border-zinc-800 bg-[#0d0d10] text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                  isSelected
                    ? 'bg-red-950/80 text-white'
                    : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Chevron Button */}
      {canScrollRight && (
        <div className="absolute right-0 z-10 flex h-full items-center pl-2">
          <div className="pointer-events-none h-full w-6 bg-gradient-to-l from-[#070708] to-transparent" />
          <button
            id="category-scroll-right"
            onClick={() => handleScroll('right')}
            aria-label="Scroll categories right"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-[#0d0d10]/95 text-zinc-300 shadow-lg backdrop-blur hover:border-red-500 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

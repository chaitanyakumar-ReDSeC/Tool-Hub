import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Tool, ApplicationTab } from './types';
import { parseToolsCSV } from './utils/csvParser';
import { LoaderScreen } from './components/LoaderScreen';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ToolCard } from './components/ToolCard';
import { Footer } from './components/Footer';

const TAB_CSV_FILES: Record<ApplicationTab, string> = {
  'Web Applications': 'web_applications.csv',
  'Windows Applications': 'windows_applications.csv',
  'Android Applications': 'android_applications.csv',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ApplicationTab>('Web Applications');
  const [toolsCache, setToolsCache] = useState<Record<ApplicationTab, Tool[]>>({
    'Web Applications': [],
    'Windows Applications': [],
    'Android Applications': [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch a single CSV for a specific tab
  const fetchTabCSV = async (tab: ApplicationTab, isManual = false): Promise<Tool[]> => {
    const csvFile = TAB_CSV_FILES[tab];
    const url = isManual ? `${csvFile}?t=${Date.now()}` : csvFile;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${csvFile} (HTTP ${response.status})`);
    }
    const text = await response.text();
    return parseToolsCSV(text);
  };

  // Initial load: fetch all three CSVs in parallel for instantaneous tab switching and live tab counters
  useEffect(() => {
    const loadAllInventories = async () => {
      try {
        const minDisplayTimer = new Promise((resolve) => setTimeout(resolve, 750));

        const [webTools, winTools, droidTools] = await Promise.all([
          fetchTabCSV('Web Applications'),
          fetchTabCSV('Windows Applications'),
          fetchTabCSV('Android Applications'),
          minDisplayTimer,
        ]);

        setToolsCache({
          'Web Applications': webTools,
          'Windows Applications': winTools,
          'Android Applications': droidTools,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading application catalogs';
        setFetchError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllInventories();
  }, []);

  // Manual refresh for the current active tab
  const handleRefreshCurrentTab = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);

    try {
      const refreshedTools = await fetchTabCSV(activeTab, true);
      setToolsCache((prev) => ({
        ...prev,
        [activeTab]: refreshedTools,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to refresh ${activeTab}`;
      setFetchError(msg);
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  }, [activeTab]);

  // Handle switching tabs
  const handleTabChange = (newTab: ApplicationTab) => {
    setActiveTab(newTab);
    setSelectedCategory('All');
    setFetchError(null);
  };

  // Active tools based on selected tab
  const currentTools = useMemo(() => {
    return toolsCache[activeTab] || [];
  }, [toolsCache, activeTab]);

  // Tool counts for all tabs to display on tab buttons
  const tabCounts = useMemo<Record<ApplicationTab, number>>(() => {
    return {
      'Web Applications': toolsCache['Web Applications'].length,
      'Windows Applications': toolsCache['Windows Applications'].length,
      'Android Applications': toolsCache['Android Applications'].length,
    };
  }, [toolsCache]);

  // Extract unique categories and their counts for the active tab
  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of currentTools) {
      counts.set(tool.category, (counts.get(tool.category) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentTools]);

  // Filter tools by search query and category for current tab
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return currentTools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        tool.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        q === '' ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [currentTools, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070708] text-white">
      {/* Simple, subtle Loader Screen */}
      <AnimatePresence>
        {isLoading && <LoaderScreen key="loader-screen" />}
      </AnimatePresence>

      {/* Main App Navigation with Tabs & Mobile Hamburger Menu */}
      <Navbar
        currentTab={activeTab}
        onTabChange={handleTabChange}
        totalTools={currentTools.length}
        filteredCount={filteredTools.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshCurrentTab}
        tabCounts={tabCounts}
      />

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Error notification banner if CSV failed to fetch */}
        {fetchError && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-800/80 bg-red-950/40 p-4 text-sm text-red-200 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={handleRefreshCurrentTab}
              className="flex items-center gap-1.5 rounded-lg border border-red-700 bg-red-900/60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Controls Section: Real-time Search and Category Filter */}
        <div className="mb-6 space-y-3.5">
          <div className="w-full">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          <CategoryFilter
            categories={categoriesWithCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalCount={currentTools.length}
          />
        </div>

        {/* Tools Card Grid */}
        <section aria-label={`${activeTab} Inventory Grid`} className="flex-1">
          {filteredTools.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Empty state when no tools match search or filter */
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-[#0c0c0f] p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500">
                <AlertCircle className="h-6 w-6 text-red-500/80" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-white">
                No matching tools found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-400">
                {searchQuery
                  ? `No tools match "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory} for ${activeTab}.`
                  : `No tools found in category "${selectedCategory}" for ${activeTab}.`}
              </p>
              <button
                id="reset-search-filters-button"
                onClick={handleResetFilters}
                className="mt-5 rounded-lg border border-red-600 bg-red-600/20 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-600 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer with Developer GitHub Link */}
      <Footer />
    </div>
  );
}

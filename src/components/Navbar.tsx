import { useState } from 'react';
import { Layers, RefreshCw, Database, Globe, Monitor, Smartphone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApplicationTab } from '../types';

interface NavbarProps {
  currentTab: ApplicationTab;
  onTabChange: (tab: ApplicationTab) => void;
  totalTools: number;
  filteredCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  tabCounts: Record<ApplicationTab, number>;
}

interface TabOption {
  id: ApplicationTab;
  label: string;
  icon: typeof Globe;
}

const TABS: TabOption[] = [
  { id: 'Web Applications', label: 'Web Applications', icon: Globe },
  { id: 'Windows Applications', label: 'Windows Applications', icon: Monitor },
  { id: 'Android Applications', label: 'Android Applications', icon: Smartphone },
];

export function Navbar({
  currentTab,
  onTabChange,
  totalTools,
  filteredCount,
  isRefreshing,
  onRefresh,
  tabCounts,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: ApplicationTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#070708]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/40 bg-zinc-950 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
            <Layers className="h-5 w-5 text-red-500" strokeWidth={2.2} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              TOOL<span className="text-red-500">HUB</span>
            </span>
          </div>
        </div>

        {/* Desktop Tabs */}
        <nav
          aria-label="Application platforms"
          className="hidden md:flex items-center gap-1 rounded-xl border border-zinc-800/80 bg-[#0c0c10] p-1 shadow-inner"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = currentTab === tab.id;
            const count = tabCounts[tab.id];

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                    : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                      isSelected
                        ? 'bg-red-950/80 text-white'
                        : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls: Count, Refresh, Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Inventory Count Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-3 py-1.5 text-xs font-mono text-zinc-300">
            <Database className="h-3.5 w-3.5 text-red-400" />
            <span>
              <strong className="text-white">{filteredCount}</strong>
              {filteredCount !== totalTools && (
                <span className="text-zinc-500"> / {totalTools}</span>
              )}{' '}
              {filteredCount === 1 ? 'tool' : 'tools'}
            </span>
          </div>

          {/* Refresh CSV button */}
          <button
            id="reload-csv-button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Reload current tab CSV"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all hover:border-red-500/50 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close platform menu' : 'Open platform menu'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-red-500/50 hover:text-white md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4 text-red-400" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-platform-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-zinc-800 bg-[#0b0b0f] px-4 py-3 md:hidden overflow-hidden"
          >
            <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Select Platform
            </div>
            <div className="flex flex-col gap-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = currentTab === tab.id;
                const count = tabCounts[tab.id];

                return (
                  <button
                    key={tab.id}
                    id={`mobile-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white font-semibold shadow-md'
                        : 'border border-zinc-800/80 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {count !== undefined && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                          isSelected ? 'bg-red-950/90 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {count} {count === 1 ? 'tool' : 'tools'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

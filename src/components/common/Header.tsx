import React, { useState, useEffect } from 'react';
import { Sun, Moon, RotateCcw } from 'lucide-react';
import { TurbineLogo } from '../reactbits/TurbineLogo';
import { BlurText } from '../reactbits/BlurText';

interface HeaderProps {
  criticalCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  criticalCount,
  isDark,
  onToggleTheme,
  onResetData,
}) => {
  const [clockString, setClockString] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const day = d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
      const time = d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setClockString(`${day} · ${time}`);
    };

    updateClock();
    // Rule: no heavy animation on data that updates every second; tick every 10 seconds
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResetClick = () => {
    if (
      window.confirm(
        'Regenerate the demo dataset? Any assignments made in this session will be lost.'
      )
    ) {
      onResetData();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e2e8f0] bg-white/95 px-4 md:px-6 backdrop-blur-md transition-colors dark:border-ink-750 dark:bg-ink-900/95">
      {/* Brand & Farm Info */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-wind-600/30 bg-wind-50/50 dark:border-wind-500/20 dark:bg-ink-800">
          <TurbineLogo criticalCount={criticalCount} size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-heading font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center">
              <BlurText text="WINDSAGE" delay={0.06} className="font-extrabold tracking-wider" />
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded border border-wind-600/30 bg-wind-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-wind-700 dark:border-wind-400/30 dark:text-wind-300">
              O&amp;M
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
            North Ridge wind farm &middot; 8 turbines / 33.6 MW
          </p>
        </div>
      </div>

      {/* Topbar Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Environment pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Demo dataset</span>
        </div>

        {/* Live Clock (strictly tabular numbers, no distracting pulse) */}
        <div className="hidden sm:flex items-center rounded-md border border-[#e2e8f0] bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-600 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-300 tabular-nums">
          {clockString}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e8f0] text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-ink-700 dark:text-slate-300 dark:hover:bg-ink-800 dark:hover:text-white transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleResetClick}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-200 dark:hover:bg-ink-750 dark:hover:border-ink-600 transition-colors shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset data</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

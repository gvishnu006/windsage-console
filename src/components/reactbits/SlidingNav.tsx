import React from 'react';
import { motion } from 'framer-motion';

export interface NavItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SlidingNavProps {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const SlidingNav: React.FC<SlidingNavProps> = ({
  items,
  activeId,
  onChange,
  className = '',
  orientation = 'vertical',
}) => {
  return (
    <nav
      className={`relative flex ${
        orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row items-center gap-1.5'
      } ${className}`}
      aria-label="Navigation"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-wind-500 ${
              isActive
                ? 'text-white dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-ink-800/60'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute inset-0 rounded-md bg-wind-700 dark:bg-wind-700/80 shadow-sm border border-wind-600/40"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              {item.icon}
              <span>{item.label}</span>
            </span>
            {item.count !== undefined && item.count > 0 && (
              <span
                className={`relative z-10 ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-mono font-medium ${
                  isActive
                    ? 'bg-wind-900/60 text-wind-100 border border-wind-500/30'
                    : 'bg-slate-200 text-slate-700 dark:bg-ink-750 dark:text-slate-300'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default SlidingNav;

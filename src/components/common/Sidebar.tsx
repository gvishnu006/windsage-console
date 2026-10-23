import React from 'react';
import { LayoutDashboard, AlertOctagon, RefreshCw, Cpu, Activity } from 'lucide-react';
import { SlidingNav, type NavItem } from '../reactbits/SlidingNav';
import { type TabType } from '../../hooks/useWindSage';
import { TURBINES } from '../../data/windsage';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  openCount: number;
  recurrenceCount: number;
  criticalIncidents: { turbine: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  openCount,
  recurrenceCount,
  criticalIncidents,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'incidents',
      label: 'Incidents',
      count: openCount,
      icon: <AlertOctagon className="h-4 w-4" />,
    },
    {
      id: 'recurrence',
      label: 'Recurrence',
      count: recurrenceCount,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      id: 'analysis',
      label: 'Root cause',
      icon: <Cpu className="h-4 w-4" />,
    },
  ];

  // Map turbines with alert status
  const criticalTurbineSet = new Set(criticalIncidents.map((i) => i.turbine));

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[#e2e8f0] bg-white/70 dark:border-ink-750 dark:bg-ink-900/60 p-3 md:p-4 flex flex-col justify-between">
      <div>
        <div className="hidden md:block mb-3 px-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
            Fleet Control
          </span>
        </div>

        {/* Sliding Navigation */}
        <SlidingNav
          items={navItems}
          activeId={currentTab}
          onChange={(id) => onTabChange(id as TabType)}
          orientation="vertical"
        />
      </div>

      {/* Fleet quick matrix at bottom (desktop only) */}
      <div className="hidden md:block mt-6 pt-4 border-t border-[#e2e8f0] dark:border-ink-750">
        <div className="flex items-center justify-between mb-2.5 px-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-wind-500" />
            Turbine Fleet (8)
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">33.6 MW</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 px-1">
          {TURBINES.map((t) => {
            const hasCritical = criticalTurbineSet.has(t.id);
            return (
              <div
                key={t.id}
                className={`flex flex-col items-center justify-center p-1.5 rounded border text-[10px] font-mono transition-colors ${
                  hasCritical
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 dark:border-ink-700/60 bg-slate-50 dark:bg-ink-850 text-slate-600 dark:text-slate-300'
                }`}
                title={`${t.id} - 4.2 MW ${hasCritical ? '(Active critical alarm)' : '(Nominal)'}`}
              >
                <span>{t.id.replace('WTG-', '')}</span>
                <span
                  className={`mt-1 h-1 w-1 rounded-full ${
                    hasCritical ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

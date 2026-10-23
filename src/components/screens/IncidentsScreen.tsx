import React from 'react';
import {
  type EnrichedIncident,
  TURBINES,
  CATEGORIES,
  STATUS
} from '../../data/windsage';
import { type FilterState } from '../../hooks/useWindSage';
import { fmtDate, fmtDurMin } from '../../utils/formatters';
import { RankChip, SevChip, StatusChip, DueBadge } from '../common/StatusBadges';
import { AnimatedContent } from '../reactbits/AnimatedContent';
import { StarBorder } from '../reactbits/StarBorder';
import { Search, X, Filter } from 'lucide-react';

interface IncidentsScreenProps {
  incidents: EnrichedIncident[];
  allCount: number;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onSelectIncident: (id: string) => void;
  now: number;
}

export const IncidentsScreen: React.FC<IncidentsScreenProps> = ({
  incidents,
  allCount,
  filters,
  onFilterChange,
  onClearFilters,
  onSelectIncident,
  now,
}) => {
  const shownRows = incidents.slice(0, 200);

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Incidents
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every alarm is a work item: owner, deadline, verification and time to resolve.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Click any incident to assign, escalate or verify
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-xs dark:border-ink-750 dark:bg-ink-850 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Turbine filter */}
          <div className="relative">
            <select
              aria-label="Filter by turbine"
              value={filters.turbine}
              onChange={(e) => onFilterChange({ turbine: e.target.value })}
              className="rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-mono text-slate-700 shadow-xs focus:border-wind-500 focus:outline-none focus:ring-1 focus:ring-wind-500 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-200"
            >
              <option value="">All turbines</option>
              {TURBINES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              aria-label="Filter by category"
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-700 shadow-xs focus:border-wind-500 focus:outline-none focus:ring-1 focus:ring-wind-500 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-200"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              aria-label="Filter by status"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-700 shadow-xs focus:border-wind-500 focus:outline-none focus:ring-1 focus:ring-wind-500 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-200"
            >
              <option value="">Any status</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="search"
              aria-label="Search incidents"
              value={filters.q}
              onChange={(e) => onFilterChange({ q: e.target.value })}
              placeholder="Search code, turbine or owner..."
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 shadow-xs focus:border-wind-500 focus:outline-none focus:ring-1 focus:ring-wind-500 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>

          {/* Open only checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={filters.openOnly}
              onChange={(e) => onFilterChange({ openOnly: e.target.checked })}
              className="rounded border-slate-300 text-wind-600 focus:ring-wind-500 dark:border-ink-700 dark:bg-ink-900"
            />
            <span>Open only</span>
          </label>

          {/* Clear filters button */}
          {(filters.turbine || filters.category || filters.status || filters.q || filters.openOnly) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ml-auto font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table View (Desktop & Tablet) */}
      <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-xs dark:border-ink-750 dark:bg-ink-850 overflow-hidden">
        {/* Responsive Table for md+ screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-ink-900 border-b border-slate-200 dark:border-ink-750 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold w-12">P</th>
                <th className="px-4 py-3 font-semibold">Alarm</th>
                <th className="px-4 py-3 font-semibold">Turbine</th>
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-4 py-3 font-semibold">Started</th>
                <th className="px-4 py-3 font-semibold text-right">Downtime</th>
                <th className="px-4 py-3 font-semibold text-right">Est. MWh</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
              {shownRows.map((inc) => {
                const isOverdue = inc.overdue;
                const isCritical = inc.codeInfo.severity === 'Critical';
                return (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectIncident(inc.id);
                    }}
                    tabIndex={0}
                    className={`hover:bg-slate-50/80 dark:hover:bg-ink-800/70 cursor-pointer transition-colors focus:outline-none focus:bg-slate-50 dark:focus:bg-ink-800 ${
                      isOverdue ? 'bg-rose-500/5' : isCritical ? 'bg-rose-500/[0.02]' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      {inc.status === 'Closed' ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <RankChip rank={inc.rank} />
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {inc.code}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {inc.codeInfo.name}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {inc.turbine}
                    </td>
                    <td className="px-4 py-2.5">
                      <SevChip severity={inc.codeInfo.severity} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                      {fmtDate(inc.startedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {fmtDurMin(inc.downtimeHours * 60)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {inc.loss.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                      {inc.owner || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusChip status={inc.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <DueBadge
                        status={inc.status}
                        deadline={inc.deadline}
                        overdue={inc.overdue}
                        now={now}
                      />
                    </td>
                  </tr>
                );
              })}

              {shownRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <Filter className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      No incidents match your filter
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Clear one of the filters or broaden your query to view results.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (Screen width < 768px) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-ink-750">
          {shownRows.map((inc, idx) => (
            <AnimatedContent key={inc.id} delay={Math.min(idx * 0.035, 0.4)}>
              <StarBorder
                active={inc.overdue || inc.codeInfo.severity === 'Critical'}
                color={inc.overdue ? '#f43f5e' : '#ef4444'}
                className="w-full"
              >
                <div
                  onClick={() => onSelectIncident(inc.id)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-ink-800 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RankChip rank={inc.rank} />
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {inc.turbine}
                      </span>
                      <SevChip severity={inc.codeInfo.severity} />
                    </div>
                    <StatusChip status={inc.status} />
                  </div>

                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {inc.code}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {inc.codeInfo.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-ink-750">
                    <span>Loss: <b className="text-slate-900 dark:text-slate-100">{inc.loss.toFixed(1)} MWh</b></span>
                    <DueBadge
                      status={inc.status}
                      deadline={inc.deadline}
                      overdue={inc.overdue}
                      now={now}
                    />
                  </div>
                </div>
              </StarBorder>
            </AnimatedContent>
          ))}

          {shownRows.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                No incidents match
              </div>
              <div className="text-xs text-slate-500 mt-1">Clear filters to see results.</div>
            </div>
          )}
        </div>

        {/* Table footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 dark:border-ink-750 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-ink-900/50">
          <span>
            Showing {shownRows.length} of {incidents.length} matching &middot; {allCount} total
          </span>
          <span>Dashboard estimates use 38% capacity factor</span>
        </div>
      </div>
    </div>
  );
};

export default IncidentsScreen;

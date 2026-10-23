import React from 'react';
import { type RecurrenceGroup, type FixEffectiveness } from '../../data/windsage';
import { fmtDate, fmtMWh } from '../../utils/formatters';
import { CheckCircle2, TrendingUp, TrendingDown, Minus, ArrowRight, AlertTriangle } from 'lucide-react';

interface RecurrenceScreenProps {
  groups: RecurrenceGroup[];
  totalIncidents: number;
  fixStats: FixEffectiveness;
  onSelectPattern: (turbine: string, category: string) => void;
}

export const RecurrenceScreen: React.FC<RecurrenceScreenProps> = ({
  groups,
  totalIncidents,
  fixStats,
  onSelectPattern,
}) => {
  const repeatShare = totalIncidents
    ? Math.round((groups.reduce((s, g) => s + g.count, 0) / totalIncidents) * 100)
    : 0;

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Recurrence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A pattern is the same category of alarm returning on the same turbine inside 60 days.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {groups.length} patterns &middot; {repeatShare}% of alarms sit inside one
        </div>
      </div>

      {/* 14-day Fix Check Banner */}
      <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold font-mono uppercase tracking-wider text-[11px] block mb-0.5 text-teal-800 dark:text-teal-300">
            Closed Alarm Verification (14-Day Control Window)
          </span>
          {fixStats.checked > 0 ? (
            <span>
              <b>
                {fixStats.held} of {fixStats.checked}
              </b>{' '}
              verified closures ran 14 days without a repeat alarm in the same pattern (
              {fixStats.rate?.toFixed(0)}%). Closures younger than 14 days are excluded.
            </span>
          ) : (
            <span>No closure is old enough to check a 14-day repeat window yet.</span>
          )}
        </div>
      </div>

      {/* Main Recurrence Patterns Panel */}
      <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-xs dark:border-ink-750 dark:bg-ink-850 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-ink-750 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">
              Patterns over threshold
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Minimum 3 alarms &middot; 60-day window &middot; sorted by estimated loss
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {groups.length} active patterns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-ink-900 border-b border-slate-200 dark:border-ink-750 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Turbine / Category</th>
                <th className="px-4 py-3 font-semibold text-right">Alarms</th>
                <th className="px-4 py-3 font-semibold text-right">Active</th>
                <th className="px-4 py-3 font-semibold">Last Alarm</th>
                <th className="px-4 py-3 font-semibold text-right">Avg Gap</th>
                <th className="px-4 py-3 font-semibold text-right">Est. MWh</th>
                <th className="px-4 py-3 font-semibold">Last 30 vs Prior 30</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
              {groups.map((g) => {
                const trendIcon =
                  g.trend === 'up' ? (
                    <span className="inline-flex items-center gap-1 font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      <TrendingUp className="h-3 w-3" /> ▲ {g.last30} vs {g.prev30}
                    </span>
                  ) : g.trend === 'down' ? (
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      <TrendingDown className="h-3 w-3" /> ▼ {g.last30} vs {g.prev30}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
                      <Minus className="h-3 w-3" /> — {g.last30} vs {g.prev30}
                    </span>
                  );

                return (
                  <tr
                    key={g.key}
                    onClick={() => onSelectPattern(g.turbine, g.category)}
                    className="hover:bg-slate-50/80 dark:hover:bg-ink-800/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {g.turbine} &middot; {g.categoryLabel}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {g.topCode} most frequent
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {g.count}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                      {g.active}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {fmtDate(g.lastAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {g.avgGap ? `${g.avgGap.toFixed(1)} d` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {fmtMWh(g.loss)}
                    </td>
                    <td className="px-4 py-3.5">{trendIcon}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPattern(g.turbine, g.category);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-ink-700 bg-white dark:bg-ink-800 hover:bg-slate-50 dark:hover:bg-ink-750 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {groups.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <AlertTriangle className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      No recurring patterns
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      No turbine/category pair reached three alarms in 60 days.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-ink-750 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-ink-900/50">
          <span>Click a pattern row to filter open incidents for that turbine &amp; category.</span>
          <span>Gap = average interval between consecutive alarms</span>
        </div>
      </div>

      {/* Engineering note */}
      <div className="rounded-lg border border-slate-200 dark:border-ink-750 bg-slate-50 dark:bg-ink-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <b className="text-slate-800 dark:text-slate-200">Engineering Rule:</b> Recurrence is counted on turbine and category, not on the exact alarm code. For example, a gearbox oil-temperature alarm and a gearbox filter pressure-drop alarm on WTG-03 both attach to the same mechanical failure pattern.
      </div>
    </div>
  );
};

export default RecurrenceScreen;

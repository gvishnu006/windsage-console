import React, { useMemo, Suspense, lazy } from 'react';
import {
  type EnrichedIncident,
  type FleetStats,
  CATEGORIES,
  isActive
} from '../../data/windsage';
import { fmtDate, fmtDurMin, fmtMWh } from '../../utils/formatters';
import { RankChip, SevChip } from '../common/StatusBadges';
import { SpotlightCard } from '../reactbits/SpotlightCard';
import { CountUp } from '../reactbits/CountUp';
import { BlurText } from '../reactbits/BlurText';
import { StarBorder } from '../reactbits/StarBorder';
import { AnimatedContent } from '../reactbits/AnimatedContent';
import { ArrowRight, Flame, ShieldCheck, TrendingDown, ArrowUpRight } from 'lucide-react';

const LazyAurora = lazy(() => import('../reactbits/Aurora'));

interface OverviewScreenProps {
  stats: FleetStats;
  allIncidents: EnrichedIncident[];
  now: number;
  totalAlarmsCount: number;
  onSelectIncident: (id: string) => void;
  onSelectPattern: (turbine: string, category: string) => void;
  onNavigateToTab: (tab: 'incidents' | 'recurrence' | 'analysis') => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  stats,
  allIncidents,
  now,
  totalAlarmsCount,
  onSelectIncident,
  onSelectPattern,
  onNavigateToTab,
}) => {
  // Top 3 urgent items for "Needs attention now" strip
  const urgentTop3 = useMemo(() => {
    return allIncidents
      .filter((i) => isActive(i))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [allIncidents]);

  // Needs attention top 6 list
  const attentionList = useMemo(() => {
    return allIncidents
      .filter((i) => isActive(i))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [allIncidents]);

  // 30 days loss by category
  const categoryLosses = useMemo(() => {
    const since30 = now - 30 * 86400000;
    const last30 = allIncidents.filter((i) => i.startedAt >= since30);

    const catMap: Record<string, { count: number; loss: number }> = {};
    for (const inc of last30) {
      const catId = inc.codeInfo.category;
      if (!catMap[catId]) catMap[catId] = { count: 0, loss: 0 };
      catMap[catId].count += 1;
      catMap[catId].loss += inc.loss;
    }

    const list = CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: catMap[c.id]?.count || 0,
      loss: catMap[c.id]?.loss || 0,
    }))
      .filter((c) => c.loss > 0)
      .sort((a, b) => b.loss - a.loss);

    const maxLoss = Math.max(1, ...list.map((c) => c.loss));
    const total = list.reduce((s, c) => s + c.loss, 0);

    return { list, maxLoss, total };
  }, [allIncidents, now]);

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Header with Deep Teal Aurora Canvas Background */}
      <div className="relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-slate-900 p-6 text-white shadow-md dark:border-ink-700/60 dark:bg-ink-950">
        <Suspense fallback={<div className="absolute inset-0 bg-wind-950/20" />}>
          <LazyAurora
            colorStops={['#0e2a38', '#17556f', '#07161f']}
            opacity={0.3}
            speed={0.5}
            className="z-0"
          />
        </Suspense>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-wind-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-wind-300 font-semibold">
                Control Room Telemetry
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white">
              <BlurText text="Fleet overview" delay={0.04} />
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl font-normal">
              Continuous alarm tracking, recurrence analysis, and estimated Lost Production Factor (LPF). Synthetic demo data, 90-day window.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 shrink-0">
            <span>{totalAlarmsCount} alarms recorded</span>
            <span className="text-white/30">&middot;</span>
            <span>Data synced {fmtDate(now)}</span>
          </div>
        </div>

        {/* Story Flow Banner: Alarm -> Recurrence -> Root Cause -> Action -> Verified -> LPF Reduced */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 hidden lg:flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">O&amp;M Strategy Pipeline:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 border border-rose-500/30">1. Alarm</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 border border-amber-500/30">2. Recurrence Group</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="rounded bg-sky-500/20 text-sky-300 px-2 py-0.5 border border-sky-500/30">3. DMAIC Root Cause</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 border border-indigo-500/30">4. Action Order</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="rounded bg-teal-500/20 text-teal-300 px-2 py-0.5 border border-teal-500/30">5. 14d Verification</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 border border-emerald-500/30 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> LPF Reduced
            </span>
          </div>
        </div>
      </div>

      {/* UX REQUIREMENT: "Needs attention now" strip (top 3 critical/recurring incidents with MWh lost each) above the KPIs */}
      {urgentTop3.length > 0 && (
        <section aria-label="Urgent Alerts Strip" className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
              <Flame className="h-4 w-4 text-rose-500" />
              <span>Needs attention now &middot; Top 3 critical incidents</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Ranked by lost production risk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {urgentTop3.map((inc) => {
              const isOverdue = inc.overdue;
              return (
                <StarBorder
                  key={inc.id}
                  active={inc.codeInfo.severity === 'Critical' || isOverdue}
                  color={isOverdue ? '#f43f5e' : '#ef4444'}
                  className="rounded-lg shadow-sm"
                >
                  <div
                    onClick={() => onSelectIncident(inc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectIncident(inc.id);
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex flex-col justify-between h-full p-3.5 bg-white dark:bg-ink-850 hover:bg-slate-50 dark:hover:bg-ink-800 transition-colors cursor-pointer rounded-[inherit] border border-[#e2e8f0] dark:border-ink-750 focus:outline-none focus:ring-2 focus:ring-wind-500"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RankChip rank={inc.rank} />
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {inc.turbine}
                        </span>
                        <SevChip severity={inc.codeInfo.severity} />
                      </div>
                      <span className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {inc.loss.toFixed(1)} MWh
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {inc.codeInfo.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {inc.categoryLabel} &middot; {inc.owner || 'Unassigned'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-ink-750 text-[11px] font-mono">
                      <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        {isOverdue
                          ? `Overdue ${fmtDurMin((now - (inc.deadline || now)) / 60000)}`
                          : inc.deadline
                          ? `Due in ${fmtDurMin(((inc.deadline || now) - now) / 60000)}`
                          : 'No SLA'}
                      </span>
                      <span className="text-wind-600 dark:text-wind-400 flex items-center gap-0.5 font-sans font-medium">
                        Open drawer <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </StarBorder>
              );
            })}
          </div>
        </section>
      )}

      {/* 5 KPI Cards: SpotlightCard with cursor glow & CountUp numbers */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* KPI 1: Open incidents */}
          <SpotlightCard className="flex flex-col justify-between">
            <div className="text-xs font-mono font-medium uppercase text-slate-500 dark:text-slate-400">
              Open incidents
            </div>
            <div className="my-2.5 text-3xl font-heading font-bold text-slate-900 dark:text-white">
              <CountUp to={stats.open} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className={stats.criticalOpen > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}>
                {stats.criticalOpen} critical
              </span>{' '}
              &middot; {stats.awaiting} awaiting verification
            </div>
          </SpotlightCard>

          {/* KPI 2: Recurring patterns */}
          <SpotlightCard className="flex flex-col justify-between">
            <div className="text-xs font-mono font-medium uppercase text-slate-500 dark:text-slate-400">
              Recurring patterns
            </div>
            <div className="my-2.5 text-3xl font-heading font-bold text-slate-900 dark:text-white">
              <CountUp to={stats.recurring} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.recurringOpen}</span> active alarms inside them
            </div>
          </SpotlightCard>

          {/* KPI 3: Est. loss · 30 days */}
          <SpotlightCard className="flex flex-col justify-between">
            <div className="text-xs font-mono font-medium uppercase text-slate-500 dark:text-slate-400">
              Est. loss &middot; 30 days
            </div>
            <div className="my-2.5 text-3xl font-heading font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
              <CountUp to={stats.loss30} decimals={stats.loss30 >= 100 ? 0 : 1} />
              <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">MWh</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              LPF <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.lpf30.toFixed(2)}%</span> of potential
            </div>
          </SpotlightCard>

          {/* KPI 4: Mean time to resolve */}
          <SpotlightCard className="flex flex-col justify-between">
            <div className="text-xs font-mono font-medium uppercase text-slate-500 dark:text-slate-400">
              Mean time to resolve
            </div>
            <div className="my-2.5 text-3xl font-heading font-bold text-slate-900 dark:text-white font-mono">
              {fmtDurMin(stats.mttr * 60)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {stats.mttrCount} incidents completed, 30 days
            </div>
          </SpotlightCard>

          {/* KPI 5: Past deadline */}
          <SpotlightCard className={`flex flex-col justify-between ${stats.overdue > 0 ? 'border-rose-400/40 dark:border-rose-500/40' : ''}`}>
            <div className="text-xs font-mono font-medium uppercase text-slate-500 dark:text-slate-400">
              Past deadline
            </div>
            <div className={`my-2.5 text-3xl font-heading font-bold ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              <CountUp to={stats.overdue} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className={stats.criticalOverdue > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-800 dark:text-slate-200'}>
                {stats.criticalOverdue} critical
              </span>{' '}
              of {stats.active} active
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Bento Grid: Loss by Category + Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Estimated loss by category */}
        <div className="flex flex-col justify-between rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-ink-750">
              <div>
                <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">
                  Estimated loss by category
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last 30 days &middot; nameplate &times; 38% capacity factor &times; derate
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400">MWh</span>
            </div>

            <div className="mt-4 space-y-3.5">
              {categoryLosses.list.map((c, idx) => {
                const pct = Math.max(2, (c.loss / categoryLosses.maxLoss) * 100);
                return (
                  <AnimatedContent key={c.id} delay={idx * 0.03}>
                    <div className="group">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {c.label}
                          <span className="text-[11px] font-mono text-slate-400">
                            ({c.count} alarm{c.count === 1 ? '' : 's'})
                          </span>
                        </span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {fmtMWh(c.loss)}{' '}
                          <span className="font-normal text-slate-400 text-[10px]">MWh</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-750">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-wind-600 to-wind-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </AnimatedContent>
                );
              })}
            </div>
          </div>

          {categoryLosses.list.length > 0 && (
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-ink-750 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total estimated energy loss:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {fmtMWh(categoryLosses.total)} MWh &middot; {stats.lpf30.toFixed(2)}% LPF
              </span>
            </div>
          )}
        </div>

        {/* Panel 2: Needs attention (top active ranked by impact) */}
        <div className="flex flex-col justify-between rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-ink-750">
              <div>
                <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">
                  Needs attention
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Active incidents, ranked by impact score
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('incidents')}
                className="text-xs text-wind-600 dark:text-wind-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {attentionList.map((inc, idx) => (
                <AnimatedContent key={inc.id} delay={idx * 0.035}>
                  <div
                    onClick={() => onSelectIncident(inc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectIncident(inc.id);
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-md border border-slate-100 dark:border-ink-750 hover:bg-slate-50 dark:hover:bg-ink-800 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-wind-500"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RankChip rank={inc.rank} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {inc.codeInfo.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{inc.turbine}</span> &middot; {inc.categoryLabel} &middot; {inc.owner || 'Unassigned'} &middot; score {inc.score}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right font-mono text-[11px]">
                      <div className={inc.overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                        {inc.overdue
                          ? `Overdue ${fmtDurMin((now - (inc.deadline || now)) / 60000)}`
                          : inc.deadline
                          ? `in ${fmtDurMin(((inc.deadline || now) - now) / 60000)}`
                          : 'no SLA'}
                      </div>
                      <div className="text-[10px] text-slate-400">{inc.loss.toFixed(1)} MWh</div>
                    </div>
                  </div>
                </AnimatedContent>
              ))}

              {attentionList.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <ShieldCheck className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nothing waiting</div>
                  <p className="text-xs text-slate-500">Every active alarm has been handled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel 3: Recurring patterns summary table */}
      <section className="rounded-lg border border-[#e2e8f0] bg-white shadow-xs dark:border-ink-750 dark:bg-ink-850 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-ink-750">
          <div>
            <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">
              Recurring patterns
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              3+ alarms on one turbine and category within 60 days
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('recurrence')}
            className="text-xs text-wind-600 dark:text-wind-400 hover:underline flex items-center gap-1 font-medium"
          >
            Open Recurrence tab <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-ink-900 border-b border-slate-200 dark:border-ink-750 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Turbine / Category</th>
                <th className="px-4 py-3 font-semibold text-right">Alarms</th>
                <th className="px-4 py-3 font-semibold text-right">Active</th>
                <th className="px-4 py-3 font-semibold">Last Alarm</th>
                <th className="px-5 py-3 font-semibold text-right">Est. MWh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
              {stats.groups.slice(0, 6).map((g) => (
                <tr
                  key={g.key}
                  onClick={() => onSelectPattern(g.turbine, g.category)}
                  className="hover:bg-slate-50/80 dark:hover:bg-ink-800/60 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {g.turbine} &middot; {g.categoryLabel}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {g.topCode} most frequent
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {g.count}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {g.active}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                    {fmtDate(g.lastAt)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {fmtMWh(g.loss)}
                  </td>
                </tr>
              ))}

              {stats.groups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    <b>No pattern crosses the threshold</b>
                    <div className="text-xs mt-1">Three alarms on one turbine and category in 60 days flags a pattern.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-ink-750 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-ink-900/50">
          <span>Click any pattern to view and filter its incidents.</span>
          <span>Lost production based on 38% capacity factor</span>
        </div>
      </section>
    </div>
  );
};

export default OverviewScreen;

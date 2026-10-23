import React, { useMemo } from 'react';
import {
  type EnrichedIncident,
  type Incident,
  CODE_BY_ID,
  CONFIG,
  SLA_HOURS,
  downtimeHours,
  estMWh,
  isActive
} from '../../data/windsage';
import { fmtDate, fmtDurMin, fmtMWh } from '../../utils/formatters';
import { RankChip, SevChip, StatusChip } from '../common/StatusBadges';
import { CheckSquare, CheckCircle } from 'lucide-react';

interface AnalysisScreenProps {
  allIncidents: EnrichedIncident[];
  rawIncidents: Incident[];
  selectedAnalysisId: string | null;
  onSelectAnalysisId: (id: string) => void;
  now: number;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  allIncidents,
  rawIncidents,
  selectedAnalysisId,
  onSelectAnalysisId,
  now,
}) => {
  // Current analyzed incident
  const incident = useMemo(() => {
    if (selectedAnalysisId) {
      const found = allIncidents.find((i) => i.id === selectedAnalysisId);
      if (found) return found;
    }
    // Default to highest impact active incident
    const activeSorted = allIncidents
      .filter((i) => isActive(i))
      .sort((a, b) => b.score - a.score);
    return activeSorted[0] || allIncidents[0] || null;
  }, [allIncidents, selectedAnalysisId]);

  // Pattern items for this incident
  const { patternItems, patternLoss, catMttr, evidence } = useMemo(() => {
    if (!incident) {
      return {
        patternItems: [],
        patternLoss: 0,
        catMttr: null as number | null,
        evidence: [] as string[],
      };
    }

    const windowStart = now - CONFIG.recurrenceWindowDays * 86400000;
    const items = rawIncidents.filter((i) => {
      const c = CODE_BY_ID[i.code];
      return (
        c &&
        i.turbine === incident.turbine &&
        c.category === incident.codeInfo.category &&
        i.startedAt >= windowStart
      );
    });

    const loss = items.reduce((s, i) => s + estMWh(i), 0);
    const sorted = [...items].sort((a, b) => a.startedAt - b.startedAt);

    let gapSum = 0;
    for (let idx = 1; idx < sorted.length; idx++) {
      gapSum += (sorted[idx].startedAt - sorted[idx - 1].startedAt) / 86400000;
    }
    const gap = sorted.length > 1 ? gapSum / (sorted.length - 1) : 0;

    const counts: Record<string, number> = {};
    for (const it of items) counts[it.code] = (counts[it.code] || 0) + 1;

    const related = Object.entries(counts)
      .filter(([code]) => code !== incident.code)
      .sort((a, b) => b[1] - a[1])
      .map(([code, n]) => `${code} ×${n}`)
      .join(', ');

    const sameCodeCount = items.filter((i) => i.code === incident.code).length;

    const catResolved = rawIncidents.filter((i) => {
      const c = CODE_BY_ID[i.code];
      return (
        c &&
        c.category === incident.codeInfo.category &&
        (i.resolvedAt || i.closedAt)
      );
    });

    const mttr = catResolved.length
      ? catResolved.reduce(
          (s, i) => s + (((i.resolvedAt || i.closedAt)!) - i.startedAt) / 3600000,
          0
        ) / catResolved.length
      : null;

    const ev: string[] = [
      `${items.length} alarms in this turbine/category in the last 60 days.`,
      `${sameCodeCount} of them were ${incident.code}.`,
      gap > 0
        ? `Average interval between alarms is ${gap.toFixed(1)} days.`
        : 'This is the first alarm of its category on this turbine in the window.',
      `Estimated loss on this pattern: ${fmtMWh(loss)} MWh.`,
    ];
    if (related) {
      ev.push(`Other codes in the same category: ${related}.`);
    }

    return {
      patternItems: items,
      patternLoss: loss,
      avgGap: gap,
      relatedCodes: related,
      catMttr: mttr,
      evidence: ev,
    };
  }, [incident, rawIncidents, now]);

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-400">
        <b>No incidents available</b>
        <p className="text-xs mt-1">There is no alarm history to analyse.</p>
      </div>
    );
  }

  const sla = SLA_HOURS[incident.codeInfo.severity];
  const sortedDropdownList = [...allIncidents].sort((a, b) => {
    const ao = a.status === 'Closed' ? 1 : 0;
    const bo = b.status === 'Closed' ? 1 : 0;
    if (ao !== bo) return ao - bo;
    if (!ao) return b.score - a.score;
    return b.startedAt - a.startedAt;
  });

  const occurrences = [...patternItems]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 6);

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Root cause workbench
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            DMAIC view built from SCADA alarm history. Hypotheses are suggested starting points for technicians.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {patternItems.length > 0
            ? `${patternItems.length} alarms in this pattern`
            : 'No established pattern yet'}
        </div>
      </div>

      {/* Incident Switcher Toolbar */}
      <div className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-xs dark:border-ink-750 dark:bg-ink-850">
        <label htmlFor="analysisSelect" className="text-xs font-mono font-semibold uppercase text-slate-500 dark:text-slate-400 shrink-0">
          Target Incident:
        </label>
        <select
          id="analysisSelect"
          value={incident.id}
          onChange={(e) => onSelectAnalysisId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-mono text-slate-800 shadow-xs focus:border-wind-500 focus:outline-none focus:ring-1 focus:ring-wind-500 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-200"
        >
          {sortedDropdownList.map((i) => (
            <option key={i.id} value={i.id}>
              {i.turbine} &middot; {i.code} &middot; {i.status} &middot; {fmtDate(i.startedAt)} (Score {i.score})
            </option>
          ))}
        </select>
      </div>

      {/* Incident Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-3.5 dark:border-ink-750 dark:bg-ink-850">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Priority</div>
          <div className="mt-1 flex items-baseline gap-2">
            <RankChip rank={incident.rank} />
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              score {incident.score}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e8f0] bg-white p-3.5 dark:border-ink-750 dark:bg-ink-850">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Estimated Loss</div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
            {incident.loss.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">MWh</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e8f0] bg-white p-3.5 dark:border-ink-750 dark:bg-ink-850">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Pattern (60 days)</div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
            {patternItems.length}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({patternItems.filter((i) => i.status !== 'Closed').length} open)
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e8f0] bg-white p-3.5 dark:border-ink-750 dark:bg-ink-850">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Owner &amp; Team</div>
          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {incident.owner || <span className="text-slate-400 italic">Unassigned</span>}{' '}
            <span className="text-xs font-normal text-slate-500 block truncate">
              {incident.teamLabel}
            </span>
          </div>
        </div>
      </div>

      {/* DMAIC 5-Phase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phase D: Define */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4.5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-ink-750 pb-2.5 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-wind-600 font-mono text-xs font-bold text-white">
              D
            </span>
            <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
              Define
            </h3>
            <span className="text-xs text-slate-400 ml-auto font-mono">Scope &amp; Metadata</span>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-xs">
            <dt className="text-slate-500 dark:text-slate-400">Incident ID:</dt>
            <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">{incident.id}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Alarm Code:</dt>
            <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">{incident.code}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Alarm Name:</dt>
            <dd className="text-slate-800 dark:text-slate-200">{incident.codeInfo.name}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Turbine:</dt>
            <dd className="font-mono text-slate-800 dark:text-slate-200">{incident.turbine} &middot; {incident.categoryLabel}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Severity:</dt>
            <dd><SevChip severity={incident.codeInfo.severity} /></dd>
            <dt className="text-slate-500 dark:text-slate-400">Detected:</dt>
            <dd className="font-mono text-slate-700 dark:text-slate-300">{fmtDate(incident.startedAt)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Status:</dt>
            <dd><StatusChip status={incident.status} /></dd>
          </dl>
        </div>

        {/* Phase M: Measure */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4.5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-ink-750 pb-2.5 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-wind-600 font-mono text-xs font-bold text-white">
              M
            </span>
            <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
              Measure
            </h3>
            <span className="text-xs text-slate-400 ml-auto font-mono">Quantification</span>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-xs">
            <dt className="text-slate-500 dark:text-slate-400">Alarms in Pattern:</dt>
            <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">{patternItems.length} in 60 days</dd>
            <dt className="text-slate-500 dark:text-slate-400">Pattern Downtime:</dt>
            <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">
              {fmtDurMin(patternItems.reduce((s, i) => s + downtimeHours(i) * 60, 0))}
            </dd>
            <dt className="text-slate-500 dark:text-slate-400">Pattern Est. Loss:</dt>
            <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">{fmtMWh(patternLoss)} MWh</dd>
            <dt className="text-slate-500 dark:text-slate-400">This Incident Downtime:</dt>
            <dd className="font-mono text-slate-800 dark:text-slate-200">
              {fmtDurMin(incident.downtimeHours * 60)} &middot; {incident.loss.toFixed(1)} MWh
            </dd>
            <dt className="text-slate-500 dark:text-slate-400">Category MTTR:</dt>
            <dd className="font-mono text-slate-700 dark:text-slate-300">
              {catMttr != null ? fmtDurMin(catMttr * 60) : 'No completed history'}
            </dd>
            <dt className="text-slate-500 dark:text-slate-400">Service SLA:</dt>
            <dd className="font-mono text-slate-700 dark:text-slate-300">{sla} hours from detection</dd>
          </dl>
        </div>

        {/* Phase A: Analyze */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4.5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-ink-750 pb-2.5 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-wind-600 font-mono text-xs font-bold text-white">
              A
            </span>
            <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
              Analyze
            </h3>
            <span className="text-xs text-slate-400 ml-auto font-mono">Probable Failure Hypothesis</span>
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-950 dark:text-amber-200">
              {incident.codeInfo.rootCause}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-semibold">
                Telemetry Evidence:
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                {evidence.map((evItem, idx) => (
                  <li key={idx}>{evItem}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Phase I: Improve */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4.5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-ink-750 pb-2.5 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-wind-600 font-mono text-xs font-bold text-white">
              I
            </span>
            <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
              Improve
            </h3>
            <span className="text-xs text-slate-400 ml-auto font-mono">Action Checklist</span>
          </div>
          <div className="space-y-3">
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
              {incident.codeInfo.actions.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckSquare className="h-3.5 w-3.5 text-wind-600 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-md bg-slate-50 dark:bg-ink-900 p-2.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-ink-750">
              Dispatch to <b>{incident.codeInfo.team}</b>. Target turnaround: <b>{sla} hours</b> from detection.
            </div>
          </div>
        </div>

        {/* Phase C: Control (Spans full width) */}
        <div className="md:col-span-2 rounded-lg border border-[#e2e8f0] bg-white p-4.5 shadow-xs dark:border-ink-750 dark:bg-ink-850">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-ink-750 pb-2.5 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-wind-600 font-mono text-xs font-bold text-white">
              C
            </span>
            <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
              Control
            </h3>
            <span className="text-xs text-slate-400 ml-auto font-mono">Verification &amp; 14-Day Watch</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">
                Sign-off Verification Criteria:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                {incident.codeInfo.verify.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-ink-750 bg-slate-50 dark:bg-ink-900/40 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                After closure, watch <b>{incident.turbine} &middot; {incident.categoryLabel}</b> for 14 continuous operational days.
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                If the alarm reoccurs inside this window, the repair did not hold. The system will flag the failure and reopen the incident under the existing recurrence pattern.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Occurrences Table and Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest Occurrences */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-xs dark:border-ink-750 dark:bg-ink-850 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-ink-750">
            <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-slate-100">
              Latest occurrences in this pattern
            </h3>
            <p className="text-xs text-slate-400">Up to 6 most recent alarms</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-ink-900 border-b border-slate-200 dark:border-ink-750 font-mono text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Started</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2 text-right">Downtime</th>
                  <th className="px-4 py-2 text-right">Est. MWh</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-ink-750 font-mono">
                {occurrences.map((occ) => (
                  <tr key={occ.id} className="hover:bg-slate-50 dark:hover:bg-ink-800">
                    <td className="px-4 py-2 text-slate-500">{fmtDate(occ.startedAt)}</td>
                    <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">{occ.code}</td>
                    <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">
                      {fmtDurMin(downtimeHours(occ) * 60)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {estMWh(occ).toFixed(1)}
                    </td>
                    <td className="px-4 py-2 font-sans"><StatusChip status={occ.status} /></td>
                  </tr>
                ))}
                {occurrences.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                      No pattern history for this turbine/category in 60 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology and Limits */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4.5 shadow-xs dark:border-ink-750 dark:bg-ink-850 text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
          <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-slate-100">
            Method and engineering assumptions
          </h3>
          <p className="leading-relaxed">
            <b className="text-slate-800 dark:text-slate-200">Lost production calculation:</b> Downtime &times; nameplate rating (4.2 MW) &times; 38% fleet capacity factor &times; severity factor derate (Critical 100%, Major 55%, Minor 15%).
          </p>
          <p className="leading-relaxed">
            <b className="text-slate-800 dark:text-slate-200">Dataset parameters:</b> 90 days of synthetic SCADA-style alarms across 8 turbines (33.6 MW). Seeded deterministic generator.
          </p>
          <p className="leading-relaxed">
            <b className="text-slate-800 dark:text-slate-200">Model behavior:</b> Recurrence clustering on turbine &times; category + domain failure signatures. Real industrial deployments calibrate against power curves and SCADA 10-minute average winds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;

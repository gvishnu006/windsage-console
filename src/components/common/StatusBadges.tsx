import React from 'react';
import { type Severity, type IncidentStatus } from '../../data/windsage';
import { fmtDurMin } from '../../utils/formatters';

export const RankChip: React.FC<{ rank: 'P1' | 'P2' | 'P3'; className?: string }> = ({ rank, className = '' }) => {
  const styles = {
    P1: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    P2: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    P3: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
  };
  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${styles[rank]} ${className}`}
    >
      {rank}
    </span>
  );
};

export const SevChip: React.FC<{ severity: Severity; className?: string }> = ({ severity, className = '' }) => {
  const styles: Record<Severity, string> = {
    Critical: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    Major: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    Minor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[severity]} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          severity === 'Critical' ? 'bg-rose-500' : severity === 'Major' ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />
      {severity}
    </span>
  );
};

export const StatusChip: React.FC<{ status: IncidentStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<IncidentStatus, string> = {
    New: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    Assigned: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    'In progress': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    Resolved: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    Closed: 'bg-slate-400/15 text-slate-600 dark:text-slate-400 border-slate-400/30',
  };
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[status] || 'border-slate-500/30 text-slate-400'} ${className}`}
    >
      {status}
    </span>
  );
};

interface DueCellProps {
  status: IncidentStatus;
  deadline: number | null;
  overdue: boolean;
  now: number;
}

export const DueBadge: React.FC<DueCellProps> = ({ status, deadline, overdue, now }) => {
  if (status === 'Closed') {
    return <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>;
  }
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30">
        Verify
      </span>
    );
  }
  if (!deadline) {
    return <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>;
  }
  if (overdue) {
    const overdueMins = (now - deadline) / 60000;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        Overdue {fmtDurMin(overdueMins)}
      </span>
    );
  }
  const remainingMins = (deadline - now) / 60000;
  return (
    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
      in {fmtDurMin(remainingMins)}
    </span>
  );
};

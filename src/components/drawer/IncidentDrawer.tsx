import React, { useState, useEffect } from 'react';
import {
  type EnrichedIncident,
  type RecurrenceGroup,
  TEAMS,
  OWNERS,
  isActive
} from '../../data/windsage';
import { fmtDate, fmtDurMin, toLocalInput } from '../../utils/formatters';
import { RankChip, SevChip, StatusChip } from '../common/StatusBadges';
import { Drawer } from '../reactbits/Drawer';
import { Play, CheckCircle, ShieldAlert, Bell, CheckSquare, Save } from 'lucide-react';

interface IncidentDrawerProps {
  incident: EnrichedIncident | null;
  pattern: RecurrenceGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (id: string, team: string, owner: string, deadline: number) => void;
  onStart: (id: string) => void;
  onResolve: (id: string) => void;
  onCloseIncident: (id: string) => void;
  onNotify: (id: string) => void;
  onEscalate: (id: string) => void;
  now: number;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  incident,
  pattern,
  isOpen,
  onClose,
  onAssign,
  onStart,
  onResolve,
  onCloseIncident,
  onNotify,
  onEscalate,
  now,
}) => {
  const [team, setTeam] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [deadlineStr, setDeadlineStr] = useState<string>('');

  useEffect(() => {
    if (incident) {
      setTeam(incident.teamLabel || incident.codeInfo.team);
      setOwner(incident.owner || '');
      const dl = incident.deadline || incident.startedAt + 24 * 3600000;
      setDeadlineStr(toLocalInput(dl));
    }
  }, [incident]);

  if (!incident) return null;

  const isClosed = incident.status === 'Closed';
  const canStart = incident.status === 'New' || incident.status === 'Assigned';
  const canResolve = incident.status === 'Assigned' || incident.status === 'In progress';
  const canClose = incident.status === 'Resolved';
  const canEscalate = isActive(incident) && !incident.escalated;
  const deadline = incident.deadline || incident.startedAt + 24 * 3600000;

  const handleSaveAssignment = () => {
    const rawTime = new Date(deadlineStr).getTime();
    if (!rawTime || isNaN(rawTime)) {
      alert('Please select a valid deadline date and time.');
      return;
    }
    onAssign(incident.id, team, owner, rawTime);
  };

  const titleNode = (
    <div className="space-y-1">
      <div className="font-mono text-xs text-wind-600 dark:text-wind-400 font-medium">
        {incident.turbine} &middot; {incident.categoryLabel} &middot; {incident.code}
      </div>
      <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
        {incident.codeInfo.name}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <SevChip severity={incident.codeInfo.severity} />
        <StatusChip status={incident.status} />
        {incident.overdue && (
          <span className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">
            Overdue
          </span>
        )}
        {incident.escalated && (
          <span className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
            Escalated
          </span>
        )}
        <RankChip rank={incident.rank} />
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={titleNode}>
      {/* Stat Strip */}
      <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 dark:border-ink-750 bg-slate-50 dark:bg-ink-850 p-3 text-center">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Est. Loss
          </div>
          <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-slate-100">
            {incident.loss.toFixed(1)} <span className="text-xs font-normal text-slate-500">MWh</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Downtime
          </div>
          <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-slate-100">
            {fmtDurMin(incident.downtimeHours * 60)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pattern (60d)
          </div>
          <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-slate-100">
            {pattern ? pattern.count : 0} <span className="text-xs font-normal text-slate-500">alarms</span>
          </div>
        </div>
      </div>

      {/* Metadata KV */}
      <div className="space-y-2 border-b border-slate-200 dark:border-ink-750 pb-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Incident Metadata
        </h4>
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-slate-500 dark:text-slate-400">Incident ID:</dt>
          <dd className="font-mono font-medium text-slate-800 dark:text-slate-200">{incident.id}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Started At:</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">{fmtDate(incident.startedAt)}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Resolution SLA:</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">
            {fmtDate(deadline)} {incident.overdue && <span className="text-rose-500 font-bold">&middot; Overdue</span>}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Assigned Owner:</dt>
          <dd className="text-slate-800 dark:text-slate-200">
            {incident.owner || <span className="text-slate-400 italic">Unassigned</span>}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">O&amp;M Team:</dt>
          <dd className="text-slate-800 dark:text-slate-200">{incident.teamLabel}</dd>
          <dt className="text-slate-500 dark:text-slate-400">{incident.resolvedAt ? 'Time to Resolve:' : 'Open For:'}</dt>
          <dd className="font-mono font-medium text-slate-800 dark:text-slate-200">
            {fmtDurMin(((incident.resolvedAt || now) - incident.startedAt) / 60000)}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Priority Score:</dt>
          <dd className="font-mono text-slate-800 dark:text-slate-200">
            {incident.score} &middot; {incident.rank} ({incident.freq14} alarms in 14 days)
          </dd>
        </dl>
      </div>

      {/* Operator Note if available */}
      {incident.note && (
        <div className="rounded-md border border-wind-500/20 bg-wind-50/50 dark:border-wind-500/30 dark:bg-wind-950/20 p-3 text-xs text-wind-900 dark:text-wind-200">
          <div className="font-mono text-[10px] font-bold uppercase mb-1 text-wind-700 dark:text-wind-300">
            Site Notes:
          </div>
          {incident.note}
        </div>
      )}

      {/* Probable Cause & Recurrence */}
      <div className="space-y-1.5 border-b border-slate-200 dark:border-ink-750 pb-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Probable Cause
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {incident.codeInfo.rootCause}
        </p>
        {pattern && (
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
            Recurrence: {pattern.count} alarms in 60 days
            {pattern.avgGap ? `, average gap ${pattern.avgGap.toFixed(1)} days.` : '.'}
          </p>
        )}
      </div>

      {/* Assignment Form */}
      <div className="space-y-3 border-b border-slate-200 dark:border-ink-750 pb-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Assignment &amp; Dispatch
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Assigned Team</label>
            <select
              disabled={isClosed}
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-800 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-850 dark:text-slate-200"
            >
              {TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Technician Owner</label>
            <select
              disabled={isClosed}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-800 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-850 dark:text-slate-200"
            >
              <option value="">Unassigned</option>
              {OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono text-slate-500 mb-1">SLA Target Deadline</label>
            <input
              type="datetime-local"
              disabled={isClosed}
              value={deadlineStr}
              onChange={(e) => setDeadlineStr(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-800 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-850 dark:text-slate-200"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={isClosed}
          onClick={handleSaveAssignment}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs"
        >
          <Save className="h-3.5 w-3.5" />
          Save assignment
        </button>
      </div>

      {/* Workflow Actions */}
      <div className="space-y-3 border-b border-slate-200 dark:border-ink-750 pb-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Workflow Transition
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          {canStart && (
            <button
              type="button"
              onClick={() => onStart(incident.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-wind-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-wind-700 transition-colors shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              Start work
            </button>
          )}

          {canResolve && (
            <button
              type="button"
              onClick={() => onResolve(incident.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-wind-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-wind-700 transition-colors shadow-xs"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Mark resolved
            </button>
          )}

          {canClose && (
            <button
              type="button"
              onClick={() => onCloseIncident(incident.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Verify and close
            </button>
          )}

          {incident.owner && !isClosed && (
            <button
              type="button"
              onClick={() => onNotify(incident.id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-ink-700 dark:bg-ink-850 dark:text-slate-200 dark:hover:bg-ink-800 transition-colors shadow-xs"
            >
              <Bell className="h-3.5 w-3.5" />
              Notify owner
            </button>
          )}

          {canEscalate && (
            <button
              type="button"
              onClick={() => onEscalate(incident.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Escalate
            </button>
          )}

          {isClosed && (
            <span className="text-xs text-slate-500 italic">
              Incident closed. 14-day recurrence monitor is active.
            </span>
          )}
        </div>
      </div>

      {/* Activity Timeline Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Activity Log
        </h4>
        <ul className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-ink-750">
          {[...incident.log]
            .sort((a, b) => b.at - a.at)
            .map((entry, idx) => (
              <li key={idx} className="relative pl-6 text-xs">
                <span className="absolute left-[5px] top-1.5 h-2 w-2 rounded-full bg-wind-500 ring-2 ring-white dark:ring-ink-900" />
                <div className="text-slate-800 dark:text-slate-200 font-medium">{entry.text}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{fmtDate(entry.at)}</div>
              </li>
            ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-ink-750 text-[11px] text-slate-400 italic">
        Estimated production loss uses turbine nameplate rating (4.2 MW), 38% capacity factor and severity derate.
      </div>
    </Drawer>
  );
};

export default IncidentDrawer;

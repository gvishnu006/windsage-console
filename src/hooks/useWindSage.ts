import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  type EnrichedIncident,
  type RecurrenceGroup,
  type WindSageStore,
  loadStore,
  saveStore,
  resetStore,
  enrich,
  recurrenceGroups,
  fixEffectiveness,
  computeFleetStats,
  CODE_BY_ID,
  isActive
} from '../data/windsage';
import { fmtDate } from '../utils/formatters';

export type TabType = 'overview' | 'incidents' | 'recurrence' | 'analysis';

export interface FilterState {
  turbine: string;
  category: string;
  status: string;
  q: string;
  openOnly: boolean;
}

export interface ToastItem {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export function useWindSage() {
  const [store, setStore] = useState<WindSageStore>(() => loadStore());
  const [tab, setTab] = useState<TabType>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('windsage-theme');
        if (saved) return saved === 'dark';
        return document.documentElement.classList.contains('dark') || true;
      }
    } catch {
      // fallback
    }
    return true;
  });

  // Dark mode effect
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('windsage-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('windsage-theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  const [filters, setFilters] = useState<FilterState>({
    turbine: '',
    category: '',
    status: '',
    q: '',
    openOnly: false
  });

  // Live timer - updates every 15 seconds for accurate SLA and downtime
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const addToast = useCallback((text: string, type: ToastItem['type'] = 'success') => {
    const id = 'toast-' + Math.random().toString(36).slice(2, 7);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save store updates
  const commitStore = useCallback((updated: WindSageStore, message?: string) => {
    setStore(updated);
    saveStore(updated);
    if (message) addToast(message);
  }, [addToast]);

  // Enrich all incidents
  const enrichedIncidents = useMemo<EnrichedIncident[]>(() => {
    return store.incidents.map((inc) => enrich(inc, store.incidents, now));
  }, [store.incidents, now]);

  // Recurrence groups
  const groups = useMemo<RecurrenceGroup[]>(() => {
    return recurrenceGroups(store.incidents, now);
  }, [store.incidents, now]);

  // Fleet stats
  const stats = useMemo(() => {
    return computeFleetStats(store.incidents, now);
  }, [store.incidents, now]);

  // Fix effectiveness
  const fixStats = useMemo(() => {
    return fixEffectiveness(store.incidents, now);
  }, [store.incidents, now]);

  // Filtered incidents
  const filteredIncidents = useMemo<EnrichedIncident[]>(() => {
    let rows = enrichedIncidents;
    if (filters.turbine) rows = rows.filter((i) => i.turbine === filters.turbine);
    if (filters.category) rows = rows.filter((i) => i.codeInfo.category === filters.category);
    if (filters.status) rows = rows.filter((i) => i.status === filters.status);
    if (filters.openOnly) rows = rows.filter((i) => i.status !== 'Closed');
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter((i) =>
        (i.code + ' ' + i.codeInfo.name + ' ' + i.turbine + ' ' + (i.owner || '') + ' ' + i.categoryLabel)
          .toLowerCase()
          .includes(q)
      );
    }

    return [...rows].sort((a, b) => {
      const ac = a.status === 'Closed' ? 1 : 0;
      const bc = b.status === 'Closed' ? 1 : 0;
      if (ac !== bc) return ac - bc;
      if (!ac && b.score !== a.score) return b.score - a.score;
      return b.startedAt - a.startedAt;
    });
  }, [enrichedIncidents, filters]);

  // Selected incident for drawer
  const selectedIncident = useMemo<EnrichedIncident | null>(() => {
    if (!selectedId) return null;
    return enrichedIncidents.find((i) => i.id === selectedId) || null;
  }, [enrichedIncidents, selectedId]);

  // Pattern for an incident
  const getPatternFor = useCallback(
    (inc: EnrichedIncident): RecurrenceGroup | null => {
      return (
        groups.find((g) => g.turbine === inc.turbine && g.category === inc.codeInfo.category) || null
      );
    },
    [groups]
  );

  // Actions
  const clearFilters = useCallback(() => {
    setFilters({ turbine: '', category: '', status: '', q: '', openOnly: false });
  }, []);

  const selectPattern = useCallback((turbine: string, category: string) => {
    setFilters({ turbine, category, status: '', q: '', openOnly: true });
    setTab('incidents');
    setSelectedId(null);
  }, []);

  const assignIncident = useCallback(
    (id: string, team: string, owner: string, deadline: number) => {
      const incIndex = store.incidents.findIndex((i) => i.id === id);
      if (incIndex === -1) return;

      const inc = { ...store.incidents[incIndex] };
      inc.team = team;
      inc.owner = owner || null;
      inc.deadline = deadline;
      if (inc.status === 'New' && inc.owner) {
        inc.status = 'Assigned';
      }
      inc.log = [
        ...inc.log,
        {
          at: Date.now(),
          text: inc.owner
            ? `Assigned to ${inc.owner} (${team}), due ${fmtDate(deadline)}`
            : `Team set to ${team}, owner still unassigned`
        }
      ];

      const newIncidents = [...store.incidents];
      newIncidents[incIndex] = inc;
      commitStore({ ...store, incidents: newIncidents }, 'Assignment saved');
    },
    [store, commitStore]
  );

  const startWork = useCallback(
    (id: string) => {
      const incIndex = store.incidents.findIndex((i) => i.id === id);
      if (incIndex === -1) return;
      const inc = { ...store.incidents[incIndex] };

      if (inc.status === 'New' && !inc.owner) {
        addToast('Assign an owner before starting work', 'error');
        return;
      }

      inc.status = 'In progress';
      inc.log = [
        ...inc.log,
        { at: Date.now(), text: `Work started by ${inc.owner || 'site team'}` }
      ];

      const newIncidents = [...store.incidents];
      newIncidents[incIndex] = inc;
      commitStore({ ...store, incidents: newIncidents }, 'Incident moved to in progress');
    },
    [store, commitStore, addToast]
  );

  const resolveIncident = useCallback(
    (id: string) => {
      const incIndex = store.incidents.findIndex((i) => i.id === id);
      if (incIndex === -1) return;
      const inc = { ...store.incidents[incIndex] };
      const currentNow = Date.now();

      inc.resolvedAt = currentNow;
      inc.status = 'Resolved';
      inc.log = [
        ...inc.log,
        { at: currentNow, text: 'Corrective action completed, pending verification' }
      ];

      const newIncidents = [...store.incidents];
      newIncidents[incIndex] = inc;
      commitStore({ ...store, incidents: newIncidents }, 'Marked resolved. Verify before closing.');
    },
    [store, commitStore]
  );

  const closeIncident = useCallback(
    (id: string) => {
      const incIndex = store.incidents.findIndex((i) => i.id === id);
      if (incIndex === -1) return;
      const inc = { ...store.incidents[incIndex] };
      const currentNow = Date.now();

      if (inc.status !== 'Resolved') {
        addToast('Resolve the incident before closing it', 'warning');
        return;
      }

      inc.closedAt = currentNow;
      inc.status = 'Closed';
      inc.log = [
        ...inc.log,
        { at: currentNow, text: `Verification passed, incident closed. Watch ${inc.turbine} for 14 days.` }
      ];

      const newIncidents = [...store.incidents];
      newIncidents[incIndex] = inc;
      commitStore({ ...store, incidents: newIncidents }, 'Incident closed. Pattern stays under watch.');
    },
    [store, commitStore, addToast]
  );

  const notifyOwner = useCallback(
    (id: string) => {
      const inc = store.incidents.find((i) => i.id === id);
      if (!inc) return;
      if (!inc.owner) {
        addToast('Assign an owner first', 'warning');
        return;
      }
      const code = CODE_BY_ID[inc.code];
      const teamLabel = inc.team || (code ? code.team : 'O&M Team');
      const currentNow = Date.now();

      const incIndex = store.incidents.findIndex((i) => i.id === id);
      const updatedInc = {
        ...inc,
        log: [
          ...inc.log,
          { at: currentNow, text: `Reminder queued for ${inc.owner} (${teamLabel})` }
        ]
      };
      const newIncidents = [...store.incidents];
      newIncidents[incIndex] = updatedInc;
      commitStore({ ...store, incidents: newIncidents }, `Reminder sent to ${inc.owner}`);
    },
    [store, commitStore, addToast]
  );

  const escalateIncident = useCallback(
    (id: string) => {
      const incIndex = store.incidents.findIndex((i) => i.id === id);
      if (incIndex === -1) return;
      const inc = { ...store.incidents[incIndex] };
      const currentNow = Date.now();

      inc.escalated = true;
      const overdue = isActive(inc) && inc.deadline !== null && currentNow > inc.deadline;
      inc.log = [
        ...inc.log,
        { at: currentNow, text: `Escalated to shift lead: ${overdue ? 'past deadline' : 'manual escalation'}` }
      ];

      const newIncidents = [...store.incidents];
      newIncidents[incIndex] = inc;
      commitStore({ ...store, incidents: newIncidents }, 'Escalated to shift lead');
    },
    [store, commitStore]
  );

  const resetAllData = useCallback(() => {
    const fresh = resetStore();
    setStore(fresh);
    setFilters({ turbine: '', category: '', status: '', q: '', openOnly: false });
    setAnalysisId(null);
    setSelectedId(null);
    addToast('Demo data regenerated');
  }, [addToast]);

  return {
    store,
    tab,
    setTab,
    filters,
    setFilters,
    clearFilters,
    selectedId,
    setSelectedId,
    selectedIncident,
    analysisId,
    setAnalysisId,
    toasts,
    dismissToast,
    now,
    isDark,
    setIsDark,
    stats,
    fixStats,
    groups,
    enrichedIncidents,
    filteredIncidents,
    getPatternFor,
    assignIncident,
    startWork,
    resolveIncident,
    closeIncident,
    notifyOwner,
    escalateIncident,
    resetAllData,
    selectPattern
  };
}

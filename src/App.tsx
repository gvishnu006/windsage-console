import { useWindSage } from './hooks/useWindSage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { IncidentsScreen } from './components/screens/IncidentsScreen';
import { RecurrenceScreen } from './components/screens/RecurrenceScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { IncidentDrawer } from './components/drawer/IncidentDrawer';
import { ToastContainer } from './components/reactbits/Toast';

export function App() {
  const {
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
    selectPattern,
  } = useWindSage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] dark:bg-[#080d14] dark:text-[#f1f5f9] bg-grid-subtle font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        criticalCount={stats.criticalOpen}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onResetData={resetAllData}
      />

      {/* Main Workspace: Left Sidebar + Screen Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1920px] w-full mx-auto">
        <Sidebar
          currentTab={tab}
          onTabChange={(newTab) => {
            setTab(newTab);
            setSelectedId(null);
          }}
          openCount={stats.open}
          recurrenceCount={stats.recurring}
          criticalIncidents={enrichedIncidents.filter((i) => i.codeInfo.severity === 'Critical' && (i.status === 'New' || i.status === 'Assigned' || i.status === 'In progress'))}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {tab === 'overview' && (
            <OverviewScreen
              stats={stats}
              allIncidents={enrichedIncidents}
              now={now}
              totalAlarmsCount={store.incidents.length}
              onSelectIncident={(id) => setSelectedId(id)}
              onSelectPattern={(turbine, category) => selectPattern(turbine, category)}
              onNavigateToTab={(newTab) => setTab(newTab)}
            />
          )}

          {tab === 'incidents' && (
            <IncidentsScreen
              incidents={filteredIncidents}
              allCount={store.incidents.length}
              filters={filters}
              onFilterChange={(patch) => setFilters((prev: typeof filters) => ({ ...prev, ...patch }))}
              onClearFilters={clearFilters}
              onSelectIncident={(id) => setSelectedId(id)}
              now={now}
            />
          )}

          {tab === 'recurrence' && (
            <RecurrenceScreen
              groups={groups}
              totalIncidents={store.incidents.length}
              fixStats={fixStats}
              onSelectPattern={(turbine, category) => selectPattern(turbine, category)}
            />
          )}

          {tab === 'analysis' && (
            <AnalysisScreen
              allIncidents={enrichedIncidents}
              rawIncidents={store.incidents}
              selectedAnalysisId={analysisId}
              onSelectAnalysisId={(id) => setAnalysisId(id)}
              now={now}
            />
          )}
        </main>
      </div>

      {/* Slide-in Detail Drawer */}
      <IncidentDrawer
        incident={selectedIncident}
        pattern={selectedIncident ? getPatternFor(selectedIncident) : null}
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        onAssign={assignIncident}
        onStart={startWork}
        onResolve={resolveIncident}
        onCloseIncident={closeIncident}
        onNotify={notifyOwner}
        onEscalate={escalateIncident}
        now={now}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;

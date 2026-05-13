import { useState, useCallback, useEffect } from 'react';
import type { Scenario, ViewMode, ComparisonResult } from '@/types';
import { scenarios } from '@/data/mockData';
import { api } from '@/data/api';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ScenarioSelector from '@/components/ScenarioSelector';
import ComparisonCards from '@/components/ComparisonCards';
import NetworkTopology from '@/components/NetworkTopology';
import ServerLoadsChart from '@/components/ServerLoadsChart';
import ConvergenceChart from '@/components/ConvergenceChart';
import ParetoChart from '@/components/ParetoChart';
import GainTable from '@/components/GainTable';
import SimulationPlayer from '@/components/SimulationPlayer';
import CustomParamsPanel from '@/components/CustomParamsPanel';

function App() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTasks, setCustomTasks] = useState<number[] | null>(null);
  const [customServers, setCustomServers] = useState<number[] | null>(null);
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [useBackend, setUseBackend] = useState(true);

  const currentTasks = customTasks ?? selectedScenario.tasks;
  const currentServers = customServers ?? selectedScenario.servers;

  // ── Calcul via backend FastAPI ──────────────────────────────────
  const runComputation = useCallback(async () => {
    setIsComputing(true);
    setError(null);

    if (useBackend) {
      try {
        const result = await api.compare({
          tasks: currentTasks,
          servers: currentServers,
          scenario_name: selectedScenario.name,
        });
        setComparison(result);
      } catch (err) {
        // Fallback sur mockData si le backend n'est pas disponible
        console.warn('Backend indisponible, fallback mockData:', err);
        setError('Backend non disponible — affichage des données locales');
        const { computeComparison } = await import('@/data/mockData');
        const scenario: Scenario = { ...selectedScenario, tasks: currentTasks, servers: currentServers };
        setComparison(computeComparison(scenario));
        setUseBackend(false);
      }
    } else {
      const { computeComparison } = await import('@/data/mockData');
      const scenario: Scenario = { ...selectedScenario, tasks: currentTasks, servers: currentServers };
      setComparison(computeComparison(scenario));
    }

    setIsComputing(false);
  }, [selectedScenario, currentTasks, currentServers, useBackend]);

  useEffect(() => {
    runComputation();
  }, [runComputation]);

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCustomTasks(null);
    setCustomServers(null);
    setShowCustomPanel(false);
    setUseBackend(true);
  };

  const handleCustomParams = (tasks: number[], servers: number[]) => {
    setCustomTasks(tasks);
    setCustomServers(servers);
    setShowCustomPanel(false);
    setUseBackend(true);
  };

  const nashResult = comparison?.nash ?? null;
  const lpResult = comparison?.lp ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          priceOfAnarchy={comparison?.priceOfAnarchy}
          improvement={comparison?.improvementPercent}
          nashIterations={nashResult?.iterations}
          nServers={currentServers.length}
          nTasks={currentTasks.length}
        />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Bannière erreur backend */}
          {error && (
            <div className="mb-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => { setUseBackend(true); setError(null); runComputation(); }}
                className="ml-auto text-xs underline hover:no-underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Bannière backend connecté */}
          {!error && useBackend && comparison && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-2 text-xs">
              <span>🟢</span>
              <span>Connecté au backend FastAPI — calculs en temps réel</span>
            </div>
          )}

          {/* Scenario Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Scénario</h2>
              <button
                onClick={() => setShowCustomPanel(!showCustomPanel)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {showCustomPanel ? 'Fermer' : 'Paramètres Personnalisés'}
              </button>
            </div>

            {showCustomPanel && (
              <CustomParamsPanel
                tasks={currentTasks}
                servers={currentServers}
                onApply={handleCustomParams}
              />
            )}

            <ScenarioSelector
              scenarios={scenarios}
              selected={selectedScenario}
              onSelect={handleScenarioChange}
            />
          </div>

          {/* Comparison Cards */}
          {comparison && (
            <ComparisonCards comparison={comparison} isComputing={isComputing} />
          )}

          {/* Main Content Based on View Mode */}
          <div className="space-y-6">
            {(viewMode === 'overview' || viewMode === 'topology') && nashResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Topologie du Réseau — Équilibre de Nash
                </h3>
                <NetworkTopology
                  tasks={currentTasks}
                  servers={currentServers}
                  assignment={nashResult.assignment}
                  title="Nash"
                />
              </div>
            )}

            {(viewMode === 'overview' || viewMode === 'topology') && lpResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Topologie du Réseau — Solution Optimale (LP)
                </h3>
                <NetworkTopology
                  tasks={currentTasks}
                  servers={currentServers}
                  assignment={lpResult.assignment}
                  title="Optimal"
                />
              </div>
            )}

            {(viewMode === 'overview' || viewMode === 'comparison') && comparison && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Répartition des Charges — Nash vs Optimal
                  </h3>
                  <ServerLoadsChart
                    nashDistribution={nashResult?.serverDistribution ?? []}
                    lpDistribution={lpResult?.serverDistribution ?? []}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Comparaison Makespan
                  </h3>
                  <div className="h-64 flex items-end justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-24 bg-nash rounded-t-lg transition-all duration-700 flex items-end justify-center text-white font-bold pb-2"
                        style={{ height: `${(nashResult?.makespan ?? 0) / Math.max(nashResult?.makespan ?? 1, lpResult?.makespan ?? 1) * 200}px` }}
                      >
                        {nashResult?.makespan.toFixed(2)}
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-600">Nash</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-24 bg-optimal rounded-t-lg transition-all duration-700 flex items-end justify-center text-white font-bold pb-2"
                        style={{ height: `${(lpResult?.makespan ?? 0) / Math.max(nashResult?.makespan ?? 1, lpResult?.makespan ?? 1) * 200}px` }}
                      >
                        {lpResult?.makespan.toFixed(2)}
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-600">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(viewMode === 'overview' || viewMode === 'convergence') && nashResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Simulation de Convergence vers l'Équilibre
                </h3>
                <SimulationPlayer
                  tasks={currentTasks}
                  servers={currentServers}
                  convergenceSteps={nashResult.convergenceSteps}
                />
              </div>
            )}

            {(viewMode === 'overview' || viewMode === 'convergence') && nashResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Courbe de Convergence
                </h3>
                <ConvergenceChart steps={nashResult.convergenceSteps} />
              </div>
            )}

            {(viewMode === 'overview' || viewMode === 'pareto') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Front de Pareto — Makespan vs Déséquilibre
                </h3>
                <ParetoChart tasks={currentTasks} servers={currentServers} />
              </div>
            )}

            {(viewMode === 'overview' || viewMode === 'gains') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Table de Gains — Jeu à 2 Joueurs
                </h3>
                <GainTable tasks={currentTasks} servers={currentServers} />
              </div>
            )}
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}

export default App;

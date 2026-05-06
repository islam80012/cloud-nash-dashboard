import { useState, useCallback, useEffect } from 'react';
import type { Scenario, ViewMode, ComparisonResult } from '@/types';
import { scenarios, computeComparison} from '@/data/mockData';
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
  const [customTasks, setCustomTasks] = useState<number[] | null>(null);
  const [customServers, setCustomServers] = useState<number[] | null>(null);
  const [showCustomPanel, setShowCustomPanel] = useState(false);

  const currentTasks = customTasks ?? selectedScenario.tasks;
  const currentServers = customServers ?? selectedScenario.servers;

  const runComputation = useCallback(() => {
    setIsComputing(true);
    // Simulate async computation
    setTimeout(() => {
      const scenario: Scenario = {
        ...selectedScenario,
        tasks: currentTasks,
        servers: currentServers,
      };
      const result = computeComparison(scenario);
      setComparison(result);
      setIsComputing(false);
    }, 300);
  }, [selectedScenario, currentTasks, currentServers]);

  useEffect(() => {
    runComputation();
  }, [runComputation]);

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCustomTasks(null);
    setCustomServers(null);
    setShowCustomPanel(false);
  };

  const handleCustomParams = (tasks: number[], servers: number[]) => {
    setCustomTasks(tasks);
    setCustomServers(servers);
    setShowCustomPanel(false);
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
        />

        <main className="flex-1 overflow-y-auto p-6">
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
                    Makespan Comparison
                  </h3>
                  <div className="h-64 flex items-end justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-24 bg-nash rounded-t-lg transition-all duration-500 flex items-end justify-center text-white font-bold pb-2"
                        style={{ height: `${(nashResult?.makespan ?? 0) / Math.max(nashResult?.makespan ?? 1, lpResult?.makespan ?? 1) * 200}px` }}
                      >
                        {nashResult?.makespan.toFixed(2)}
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-600">Nash</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-24 bg-optimal rounded-t-lg transition-all duration-500 flex items-end justify-center text-white font-bold pb-2"
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

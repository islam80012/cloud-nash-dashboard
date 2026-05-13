import { Gauge, TrendingDown, Clock, Server, Zap, AlertTriangle, Cpu } from 'lucide-react';

interface SidebarProps {
  priceOfAnarchy?: number;
  improvement?: number;
  nashIterations?: number;
  nServers?: number;
  nTasks?: number;
}

export default function Sidebar({ priceOfAnarchy, improvement, nashIterations, nServers, nTasks }: SidebarProps) {
  const getPoAColor = (poa: number) => {
    if (poa <= 1.05) return 'text-green-600';
    if (poa <= 1.2)  return 'text-yellow-600';
    return 'text-red-600';
  };
  const getPoABg = (poa: number) => {
    if (poa <= 1.05) return 'bg-green-50 border-green-200';
    if (poa <= 1.2)  return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };
  const getPoALabel = (poa: number) => {
    if (poa <= 1.05) return '✅ Très proche de l\'optimal';
    if (poa <= 1.2)  return '⚠️ Légèrement sous-optimal';
    return '❌ Éloigné de l\'optimal';
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col overflow-y-auto">
      <div className="p-6 space-y-5">

        {/* Price of Anarchy */}
        {priceOfAnarchy !== undefined && (
          <div className={`rounded-xl border p-4 ${getPoABg(priceOfAnarchy)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-800 text-sm">Price of Anarchy</h3>
            </div>
            <p className={`text-3xl font-bold ${getPoAColor(priceOfAnarchy)}`}>
              {priceOfAnarchy.toFixed(3)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {getPoALabel(priceOfAnarchy)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Nash coûte {((priceOfAnarchy - 1) * 100).toFixed(1)}% de plus que l'optimal
            </p>
          </div>
        )}

        {/* Gain Optimal */}
        {improvement !== undefined && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-optimal" />
              <h3 className="font-semibold text-gray-800 text-sm">Gain possible (LP)</h3>
            </div>
            <p className="text-2xl font-bold text-optimal">
              {improvement.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Amélioration possible avec coordination centralisée
            </p>
          </div>
        )}

        {/* Stats dynamiques — connectées aux vrais résultats */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
            Configuration active
          </h3>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Cpu className="w-4 h-4 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Tâches</p>
              <p className="font-semibold text-gray-800 text-sm">
                {nTasks !== undefined ? nTasks : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Server className="w-4 h-4 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Serveurs actifs</p>
              <p className="font-semibold text-gray-800 text-sm">
                {nServers !== undefined ? nServers : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Clock className="w-4 h-4 text-nash" />
            <div>
              <p className="text-xs text-gray-500">Itérations Nash</p>
              <p className="font-semibold text-gray-800 text-sm">
                {nashIterations !== undefined ? nashIterations : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Zap className="w-4 h-4 text-pareto" />
            <div>
              <p className="text-xs text-gray-500">Algorithme</p>
              <p className="font-semibold text-gray-800 text-sm">Best Response</p>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Légende</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-nash flex-shrink-0" />
              <span className="text-gray-600 text-xs">Équilibre de Nash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-optimal flex-shrink-0" />
              <span className="text-gray-600 text-xs">Solution Optimale (LP)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pareto flex-shrink-0" />
              <span className="text-gray-600 text-xs">Front de Pareto</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
              <span className="text-gray-600 text-xs">Serveur surchargé</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}

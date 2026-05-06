import { Gauge, TrendingDown, Clock, Server, Zap, AlertTriangle } from 'lucide-react';

interface SidebarProps {
  //viewMode: ViewMode;
  //onViewModeChange: (mode: ViewMode) => void;
  priceOfAnarchy?: number;
  improvement?: number;
}

export default function Sidebar({ priceOfAnarchy, improvement }: SidebarProps) {
  const getPoAColor = (poa: number) => {
    if (poa <= 1.1) return 'text-green-600';
    if (poa <= 1.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPoABg = (poa: number) => {
    if (poa <= 1.1) return 'bg-green-50 border-green-200';
    if (poa <= 1.3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Price of Anarchy Card */}
        {priceOfAnarchy !== undefined && (
          <div className={`rounded-xl border p-4 ${getPoABg(priceOfAnarchy)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-800 text-sm">Price of Anarchy</h3>
            </div>
            <p className={`text-3xl font-bold ${getPoAColor(priceOfAnarchy)}`}>
              {priceOfAnarchy.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Le chaos coûte {((priceOfAnarchy - 1) * 100).toFixed(0)}% de temps en plus
            </p>
          </div>
        )}

        {/* Improvement Card */}
        {improvement !== undefined && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-optimal" />
              <h3 className="font-semibold text-gray-800 text-sm">Gain Optimal</h3>
            </div>
            <p className="text-2xl font-bold text-optimal">
              {improvement.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Amélioration possible avec coordination
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
            Statistiques
          </h3>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Server className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Serveurs</p>
              <p className="font-semibold text-gray-800">3-6 actifs</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Zap className="w-5 h-5 text-nash" />
            <div>
              <p className="text-xs text-gray-500">Algorithme</p>
              <p className="font-semibold text-gray-800">Best Response</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Clock className="w-5 h-5 text-pareto" />
            <div>
              <p className="text-xs text-gray-500">Convergence</p>
              <p className="font-semibold text-gray-800">&lt; 50 itérations</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
            Légende
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-nash" />
              <span className="text-gray-600">Équilibre de Nash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-optimal" />
              <span className="text-gray-600">Solution Optimale (LP)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pareto" />
              <span className="text-gray-600">Front de Pareto</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-gray-600">Serveur surchargé</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

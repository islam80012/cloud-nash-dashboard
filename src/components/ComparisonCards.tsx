import { TrendingUp, TrendingDown, Activity, CheckCircle2, Zap } from 'lucide-react';
import type { ComparisonResult } from '@/types';

interface ComparisonCardsProps {
  comparison: ComparisonResult;
  isComputing: boolean;
}

export default function ComparisonCards({ comparison, isComputing }: ComparisonCardsProps) {
  if (isComputing) {
    return (
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const poa = comparison.priceOfAnarchy;
  const nashIsOptimal = poa <= 1.001;
  const nashIsClose   = poa <= 1.05;

  const cards = [
    {
      title: 'Makespan Nash',
      value: comparison.nash.makespan.toFixed(3),
      unit: '',
      icon: Activity,
      color: 'text-nash',
      bgColor: 'bg-nash/10',
      detail: `${comparison.nash.iterations} itération(s)`,
    },
    {
      title: 'Makespan Optimal (LP)',
      value: comparison.lp.makespan.toFixed(3),
      unit: '',
      icon: CheckCircle2,
      color: 'text-optimal',
      bgColor: 'bg-optimal/10',
      detail: `${comparison.lp.solveTime.toFixed(3)}s calcul`,
    },
    {
      title: 'Price of Anarchy',
      value: poa.toFixed(3),
      unit: '',
      icon: TrendingUp,
      color: poa > 1.2 ? 'text-red-600' : poa > 1.05 ? 'text-yellow-600' : 'text-green-600',
      bgColor: poa > 1.2 ? 'bg-red-50' : poa > 1.05 ? 'bg-yellow-50' : 'bg-green-50',
      detail: `+${comparison.improvementPercent.toFixed(2)}% améliorable`,
    },
    {
      title: 'Tâches / Serveurs',
      value: `${comparison.nTasks}`,
      unit: `/ ${comparison.nServers}`,
      icon: TrendingDown,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      detail: 'Configuration actuelle',
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                {card.unit && <span className="text-sm text-gray-500">{card.unit}</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{card.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Badge Nash vs Pareto — visible et pédagogique pour la prof */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
          nashIsOptimal
            ? 'bg-green-50 border-green-200 text-green-800'
            : nashIsClose
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <Zap className="w-4 h-4" />
          {nashIsOptimal
            ? '✅ Nash = Solution Optimale (Pareto-optimal)'
            : nashIsClose
            ? '🔵 Nash très proche de l\'optimal'
            : `⚠️ Nash sous-optimal — Price of Anarchy : ${poa.toFixed(3)}`}
        </div>
        <div className="text-xs text-gray-400">
          Nash converge en {comparison.nash.iterations} itération(s) · LP prend {comparison.lp.solveTime.toFixed(3)}s
        </div>
      </div>
    </div>
  );
}

import {TrendingUp, TrendingDown, Activity, CheckCircle2 } from 'lucide-react';
import type { ComparisonResult } from '@/types';

interface ComparisonCardsProps {
  comparison: ComparisonResult;
  isComputing: boolean;
}

export default function ComparisonCards({ comparison, isComputing }: ComparisonCardsProps) {
  if (isComputing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Makespan Nash',
      value: comparison.nash.makespan.toFixed(2),
      unit: 'min',
      icon: Activity,
      color: 'text-nash',
      bgColor: 'bg-nash/10',
      detail: `${comparison.nash.iterations} itérations`,
    },
    {
      title: 'Makespan Optimal',
      value: comparison.lp.makespan.toFixed(2),
      unit: 'min',
      icon: CheckCircle2,
      color: 'text-optimal',
      bgColor: 'bg-optimal/10',
      detail: `${comparison.lp.solveTime.toFixed(3)}s calcul`,
    },
    {
      title: 'Price of Anarchy',
      value: comparison.priceOfAnarchy.toFixed(2),
      unit: '',
      icon: TrendingUp,
      color: comparison.priceOfAnarchy > 1.2 ? 'text-red-600' : 'text-yellow-600',
      bgColor: comparison.priceOfAnarchy > 1.2 ? 'bg-red-50' : 'bg-yellow-50',
      detail: `+${comparison.improvementPercent.toFixed(1)}% possible`,
    },
    {
      title: 'Tâches / Serveurs',
      value: `${comparison.nTasks}`,
      unit: `/${comparison.nServers}`,
      icon: TrendingDown,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      detail: 'Configuration actuelle',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <span className="text-sm text-gray-500">{card.unit}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{card.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

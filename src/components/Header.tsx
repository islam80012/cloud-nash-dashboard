import { Cloud, Menu, X, BarChart3, Network, TrendingUp, Target, Table2, GitCompare } from 'lucide-react';
import { useState } from 'react';
import type { ViewMode } from '@/types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Vue densemble', icon: BarChart3 },
  { id: 'topology', label: 'Topologie', icon: Network },
  { id: 'convergence', label: 'Convergence', icon: TrendingUp },
  { id: 'pareto', label: 'Pareto', icon: Target },
  { id: 'gains', label: 'Table de Gains', icon: Table2 },
  { id: 'comparison', label: 'Comparaison', icon: GitCompare },
];

export default function Header({ viewMode, onViewModeChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Cloud className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Cloud Load Balancing
              </h1>
              <p className="text-xs text-gray-500">Théorie des Jeux · Équilibre de Nash</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = viewMode === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => onViewModeChange(view.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{view.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = viewMode === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    onViewModeChange(view.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

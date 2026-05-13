import { Cloud, BarChart3, Network, TrendingUp, Target, Table2, GitCompare, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { ViewMode } from '@/types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Vue d\'ensemble', icon: BarChart3   },
  { id: 'topology',   label: 'Topologie',        icon: Network     },
  { id: 'convergence',label: 'Convergence',       icon: TrendingUp  },
  { id: 'pareto',     label: 'Pareto',            icon: Target      },
  { id: 'gains',      label: 'Table de Gains',    icon: Table2      },
  { id: 'comparison', label: 'Comparaison',       icon: GitCompare  },
];

export default function Header({ viewMode, onViewModeChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }} className="sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur p-2 rounded-lg border border-white/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                Cloud Load Balancing
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                Théorie des Jeux · Équilibre de Nash
              </p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = viewMode === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => onViewModeChange(view.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{view.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-blue-900/90 backdrop-blur">
          <div className="px-4 py-2 space-y-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = viewMode === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => { onViewModeChange(view.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
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

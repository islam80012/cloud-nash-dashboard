import type { Scenario } from '@/types';
import { Play, Users, HardDrive } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selected: Scenario;
  onSelect: (scenario: Scenario) => void;
}

export default function ScenarioSelector({ scenarios, selected, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {scenarios.map((scenario) => {
        const isSelected = selected.id === scenario.id;
        return (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              isSelected
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3">
                <div className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  Actif
                </div>
              </div>
            )}

            <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-primary-800' : 'text-gray-800'}`}>
              {scenario.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{scenario.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">{scenario.tasks.length}</span>
                <span className="text-gray-400">tâches</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <HardDrive className="w-4 h-4" />
                <span className="font-medium">{scenario.servers.length}</span>
                <span className="text-gray-400">serveurs</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { Plus, Minus, RotateCcw, Check } from 'lucide-react';

interface CustomParamsPanelProps {
  tasks: number[];
  servers: number[];
  onApply: (tasks: number[], servers: number[]) => void;
}

export default function CustomParamsPanel({ tasks, servers, onApply }: CustomParamsPanelProps) {
  const [localTasks, setLocalTasks] = useState<number[]>([...tasks]);
  const [localServers, setLocalServers] = useState<number[]>([...servers]);

  const updateTask = (index: number, value: number) => {
    const newTasks = [...localTasks];
    newTasks[index] = Math.max(0.1, Math.min(50, value));
    setLocalTasks(newTasks);
  };

  const updateServer = (index: number, value: number) => {
    const newServers = [...localServers];
    newServers[index] = Math.max(0.1, Math.min(20, value));
    setLocalServers(newServers);
  };

  const addTask = () => {
    if (localTasks.length < 100) {
      setLocalTasks([...localTasks, parseFloat((Math.random() * 10 + 1).toFixed(2))]);
    }
  };

  const removeTask = () => {
    if (localTasks.length > 1) {
      setLocalTasks(localTasks.slice(0, -1));
    }
  };

  const addServer = () => {
    if (localServers.length < 20) {
      setLocalServers([...localServers, parseFloat((Math.random() * 5 + 0.5).toFixed(2))]);
    }
  };

  const removeServer = () => {
    if (localServers.length > 1) {
      setLocalServers(localServers.slice(0, -1));
    }
  };

  const reset = () => {
    setLocalTasks([...tasks]);
    setLocalServers([...servers]);
  };

  const randomize = () => {
    const nTasks = Math.floor(Math.random() * 15) + 5;
    const nServers = Math.floor(Math.random() * 4) + 2;
    setLocalTasks(Array.from({ length: nTasks }, () => parseFloat((Math.random() * 10 + 1).toFixed(2))));
    setLocalServers(Array.from({ length: nServers }, () => parseFloat((Math.random() * 5 + 0.5).toFixed(2))));
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Paramètres Personnalisés</h3>
        <div className="flex items-center gap-2">
          <button onClick={randomize} className="btn-secondary text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Aléatoire
          </button>
          <button onClick={reset} className="btn-secondary text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button 
            onClick={() => onApply(localTasks, localServers)}
            className="btn-primary text-xs flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Appliquer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Tâches ({localTasks.length})</h4>
            <div className="flex items-center gap-1">
              <button onClick={removeTask} className="p-1 rounded hover:bg-gray-200" disabled={localTasks.length <= 1}>
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={addTask} className="p-1 rounded hover:bg-gray-200">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
            {localTasks.map((weight, i) => (
              <div key={i} className="flex flex-col items-center">
                <label className="text-xs text-gray-400 mb-1">T{i}</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => updateTask(i, parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0.1"
                  max="50"
                  className="w-full text-center text-sm border border-gray-200 rounded px-1 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Servers Panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Serveurs ({localServers.length})</h4>
            <div className="flex items-center gap-1">
              <button onClick={removeServer} className="p-1 rounded hover:bg-gray-200" disabled={localServers.length <= 1}>
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={addServer} className="p-1 rounded hover:bg-gray-200">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
            {localServers.map((speed, i) => (
              <div key={i} className="flex flex-col items-center">
                <label className="text-xs text-gray-400 mb-1">S{i}</label>
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => updateServer(i, parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0.1"
                  max="20"
                  className="w-full text-center text-sm border border-gray-200 rounded px-1 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

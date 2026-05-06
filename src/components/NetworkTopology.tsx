import { useMemo } from 'react';
import { Server, Cpu, ArrowRight } from 'lucide-react';
import { getColorForIndex, getLoadColor } from '@/utils';

interface NetworkTopologyProps {
  tasks: number[];
  servers: number[];
  assignment: number[];
  title: string;
}

export default function NetworkTopology({ tasks, servers, assignment, title }: NetworkTopologyProps) {
  const serverData = useMemo(() => {
    const loads = new Array(servers.length).fill(0);
    const taskCounts = new Array(servers.length).fill(0);

    for (let i = 0; i < tasks.length; i++) {
      loads[assignment[i]] += tasks[i] / servers[assignment[i]];
      taskCounts[assignment[i]]++;
    }

    const maxLoad = Math.max(...loads, 0.01);

    return servers.map((speed, j) => ({
      id: j,
      speed,
      load: loads[j],
      taskCount: taskCounts[j],
      color: getLoadColor(loads[j], maxLoad),
      tasks: tasks.map((w, i) => assignment[i] === j ? { id: i, weight: w } : null).filter(Boolean) as { id: number; weight: number }[],
    }));
  }, [tasks, servers, assignment]);

  const maxLoad = Math.max(...serverData.map(s => s.load), 0.01);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            title === 'Nash' ? 'bg-nash/10 text-nash' : 'bg-optimal/10 text-optimal'
          }`}>
            {title}
          </span>
          <span className="text-sm text-gray-500">
            {tasks.length} tâches · {servers.length} serveurs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Column */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Tâches ({tasks.length})
          </h4>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {tasks.map((weight, i) => {
              const serverId = assignment[i];
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs shadow-sm"
                  title={`Tâche ${i}: poids ${weight} → Serveur ${serverId}`}
                >
                  <span className="font-mono font-bold text-gray-700">T{i}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getColorForIndex(serverId) }}
                  />
                  <span className="text-gray-500">{weight.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Servers Column */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Serveurs
          </h4>

          {serverData.map((srv) => (
            <div key={srv.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getColorForIndex(srv.id) }}
                  >
                    S{srv.id}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Serveur {srv.id}</p>
                    <p className="text-xs text-gray-500">Vitesse: {srv.speed.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: srv.color }}>
                    {srv.load.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">charge</p>
                </div>
              </div>

              {/* Load Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((srv.load / maxLoad) * 100, 100)}%`,
                    backgroundColor: srv.color,
                  }}
                />
              </div>

              {/* Task Chips */}
              <div className="flex flex-wrap gap-1.5">
                {srv.tasks.map((task) => (
                  <span
                    key={task.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    T{task.id}: {task.weight.toFixed(1)}
                  </span>
                ))}
                {srv.tasks.length === 0 && (
                  <span className="text-xs text-gray-400 italic">Aucune tâche</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

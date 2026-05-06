import { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Cell } from 'recharts';
import { computePareto } from '@/data/mockData';

interface ParetoChartProps {
  tasks: number[];
  servers: number[];
}

export default function ParetoChart({ tasks, servers }: ParetoChartProps) {
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(() => computePareto(tasks, servers), [tasks, servers]);

  const frontData = useMemo(() => 
    result.front.map(p => ({ x: p.makespan, y: p.desequilibre, type: 'pareto' })),
    [result]
  );

  const allData = useMemo(() => 
    result.allPoints.map(p => ({ x: p.makespan, y: p.desequilibre, type: 'dominated' })),
    [result]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showAll} 
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Afficher tous les points
          </label>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-pareto" />
            <span className="text-gray-600">Front Pareto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-nash border-2 border-white shadow" />
            <span className="text-gray-600">Nash</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Makespan" 
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Makespan', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Déséquilibre" 
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Déséquilibre (écart-type)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              formatter={(value: number, name: string) => [value.toFixed(3), name === 'x' ? 'Makespan' : 'Déséquilibre']}
            />

            {showAll && (
              <Scatter data={allData} fill="#e5e7eb" opacity={0.5} />
            )}

            <Scatter data={frontData} fill="#8b5cf6">
              {frontData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#8b5cf6" />
              ))}
            </Scatter>

            <ReferenceDot 
              x={result.nashPoint.makespan} 
              y={result.nashPoint.desequilibre} 
              r={8} 
              fill="#f59e0b" 
              stroke="#fff" 
              strokeWidth={2}
              label={{ value: 'Nash', position: 'top', fill: '#f59e0b', fontSize: 12 }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          result.nashPoint.isPareto ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {result.nashPoint.isPareto ? '✅ Nash est Pareto-optimal' : '⚠️ Nash nest pas sur le front'}
        </div>
      </div>
    </div>
  );
}

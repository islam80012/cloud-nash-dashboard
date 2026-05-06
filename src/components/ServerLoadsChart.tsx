import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ServerDistribution } from '@/types';

interface ServerLoadsChartProps {
  nashDistribution: ServerDistribution[];
  lpDistribution: ServerDistribution[];
}

export default function ServerLoadsChart({ nashDistribution, lpDistribution }: ServerLoadsChartProps) {
  const data = useMemo(() => {
    return nashDistribution.map((nash, i) => ({
      name: `S${nash.serverId}`,
      nash: parseFloat(nash.load.toFixed(2)),
      optimal: lpDistribution[i] ? parseFloat(lpDistribution[i].load.toFixed(2)) : 0,
      nashTasks: nash.nTasks,
      optimalTasks: lpDistribution[i]?.nTasks ?? 0,
    }));
  }, [nashDistribution, lpDistribution]);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
          <YAxis tick={{ fill: '#6b7280' }} label={{ value: 'Charge', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'nash') return [`${value} (${props.payload.nashTasks} tâches)`, 'Nash'];
              if (name === 'optimal') return [`${value} (${props.payload.optimalTasks} tâches)`, 'Optimal'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="nash" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Nash" />
          <Bar dataKey="optimal" fill="#10b981" radius={[4, 4, 0, 0]} name="Optimal" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

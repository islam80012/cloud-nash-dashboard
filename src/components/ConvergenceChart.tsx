import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ConvergenceStep } from '@/types';

interface ConvergenceChartProps {
  steps: ConvergenceStep[];
}

export default function ConvergenceChart({ steps }: ConvergenceChartProps) {
  const data = useMemo(() => {
    return steps.map((step, index) => ({
      iteration: step.iteration || index,
      makespan: step.makespan,
      movedTask: step.movedTask,
      fromServer: step.fromServer,
      toServer: step.toServer,
    }));
  }, [steps]);

  const finalMakespan = data.length > 0 ? data[data.length - 1].makespan : 0;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="iteration" 
            tick={{ fill: '#6b7280' }} 
            label={{ value: 'Itération', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280' }} 
            domain={['auto', 'auto']}
            label={{ value: 'Makespan', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value: number, _name: string, props: any) => {
              const moved = props.payload.movedTask;
              if (moved !== null && moved !== undefined) {
                return [`${value} (Tâche ${moved}: S${props.payload.fromServer} → S${props.payload.toServer})`, 'Makespan'];
              }
              return [value, 'Makespan'];
            }}
          />
          <ReferenceLine y={finalMakespan} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Équilibre', fill: '#10b981', position: 'right' }} />
          <Line 
            type="monotone" 
            dataKey="makespan" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 6, fill: '#f59e0b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

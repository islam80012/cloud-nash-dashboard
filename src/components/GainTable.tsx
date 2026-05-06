import { useMemo } from 'react';
import { computeGainTable } from '@/data/mockData';
import { Trophy, Star } from 'lucide-react';

interface GainTableProps {
  tasks: number[];
  servers: number[];
}

export default function GainTable({ tasks, servers }: GainTableProps) {
  const result = useMemo(() => computeGainTable(tasks, servers), [tasks, servers]);

  const isNash = (i: number, j: number) => result.nashCells.some(([ni, nj]) => ni === i && nj === j);
  const isPareto = (i: number, j: number) => result.paretoCells.some(([pi, pj]) => pi === i && pj === j);

  const getCellStyle = (i: number, j: number) => {
    const nash = isNash(i, j);
    const pareto = isPareto(i, j);

    if (nash && pareto) return 'bg-gradient-to-br from-nash/20 to-pareto/20 border-nash border-2';
    if (nash) return 'bg-nash/10 border-nash border-2';
    if (pareto) return 'bg-pareto/10 border-pareto border-2';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-nash" />
          <span className="text-gray-600">Équilibre de Nash</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-pareto" />
          <span className="text-gray-600">Pareto-optimal</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200">
                Scheduleur ↓ / Gestionnaire →
              </th>
              {result.labelsJ2.map((label) => (
                <th key={label} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 min-w-[140px]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.labelsJ1.map((labelJ1, i) => (
              <tr key={labelJ1}>
                <td className="p-3 text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200">
                  {labelJ1}
                </td>
                {result.labelsJ2.map((_, j) => {
                  const cell = result.table[i][j];
                  const nash = isNash(i, j);
                  const pareto = isPareto(i, j);

                  return (
                    <td 
                      key={j} 
                      className={`p-3 border transition-all hover:shadow-md ${getCellStyle(i, j)}`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-mono">
                          <span className="text-primary-700 font-bold">{cell.gainJ1.toFixed(2)}</span>
                          <span className="text-gray-400 mx-1">,</span>
                          <span className="text-pareto font-bold">{cell.gainJ2.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {nash && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-nash/20 text-nash-dark">
                              <Trophy className="w-3 h-3 mr-0.5" />
                              N
                            </span>
                          )}
                          {pareto && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-pareto/20 text-pareto-dark">
                              <Star className="w-3 h-3 mr-0.5" />
                              P
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-700 mb-1">Équilibres de Nash:</p>
          <p className="text-gray-600">
            {result.nashCells.length > 0 
              ? result.nashCells.map(([i, j]) => `(${result.labelsJ1[i]}, ${result.labelsJ2[j]})`).join(', ')
              : 'Aucun'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-700 mb-1">Cellules Pareto:</p>
          <p className="text-gray-600">
            {result.paretoCells.length > 0 
              ? result.paretoCells.map(([i, j]) => `(${result.labelsJ1[i]}, ${result.labelsJ2[j]})`).join(', ')
              : 'Aucun'}
          </p>
        </div>
      </div>
    </div>
  );
}

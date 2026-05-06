import type { Scenario, NashResult, LPResult, ParetoResult, GainTableResult, ComparisonResult, ConvergenceStep, ServerDistribution,ParetoPoint,GainCell } from '@/types';

// ── Scénarios prédéfinis ─────────────────────────────────────────

export const scenarios: Scenario[] = [
  {
    id: 'petit',
    name: 'Petit',
    description: '5 tâches, 3 serveurs — convergence rapide',
    tasks: [3.52, 7.81, 2.14, 5.67, 4.23],
    servers: [2.89, 3.74, 1.82],
  },
  {
    id: 'moyen',
    name: 'Moyen',
    description: '20 tâches, 4 serveurs — observer les itérations',
    tasks: [5.2, 3.1, 8.7, 2.4, 6.5, 4.3, 7.1, 3.8, 5.9, 2.7, 9.3, 4.6, 6.2, 3.5, 7.8, 5.1, 4.9, 6.7, 3.3, 8.2],
    servers: [2.5, 3.0, 1.8, 4.2],
  },
  {
    id: 'desequilibre',
    name: 'Déséquilibré',
    description: '15 tâches, 3 serveurs de vitesses très différentes',
    tasks: [4.5, 6.2, 3.8, 7.1, 5.3, 4.9, 6.7, 3.2, 5.8, 4.1, 6.5, 3.9, 7.3, 5.6, 4.7],
    servers: [0.5, 2.0, 5.0],
  },
  {
    id: 'grand',
    name: 'Grand',
    description: '50 tâches, 6 serveurs — stress test',
    tasks: Array.from({ length: 50 }, (_) => parseFloat((Math.random() * 14 + 1).toFixed(2))),
    servers: [1.2, 3.5, 0.8, 4.1, 2.3, 5.6],
  },
];

// ── Utilitaires de calcul (portés du Python) ─────────────────────

function getLoads(assignment: number[], tasks: number[], servers: number[]): number[] {
  const loads = new Array(servers.length).fill(0);
  for (let i = 0; i < tasks.length; i++) {
    loads[assignment[i]] += tasks[i] / servers[assignment[i]];
  }
  return loads;
}

function computeCost(taskWeight: number, serverSpeed: number, currentLoad: number): number {
  return taskWeight / serverSpeed + currentLoad;
}

function getMakespan(assignment: number[], tasks: number[], servers: number[]): number {
  return Math.max(...getLoads(assignment, tasks, servers));
}

function getServerDistribution(assignment: number[], tasks: number[], servers: number[]): ServerDistribution[] {
  const loads = getLoads(assignment, tasks, servers);
  return servers.map((speed, j) => {
    const tasksIds = assignment.map((s, i) => s === j ? i : -1).filter(i => i !== -1);
    return {
      serverId: j,
      serverSpeed: speed,
      nTasks: tasksIds.length,
      tasksIds,
      load: parseFloat(loads[j].toFixed(4)),
    };
  });
}

// ── Algorithme de Nash (Best Response) ─────────────────────────

export function computeNash(tasks: number[], servers: number[], maxIter: number = 5000): NashResult {
  const startTime = performance.now();

  // Initialisation aléatoire
  let assignment = tasks.map(() => Math.floor(Math.random() * servers.length));
  const convergenceSteps: ConvergenceStep[] = [];

  let itCount = maxIter;

  for (let iteration = 0; iteration < maxIter; iteration++) {
    let moved = false;

    for (let i = 0; i < tasks.length; i++) {
      const loads = getLoads(assignment, tasks, servers);
      const jCur = assignment[i];
      const loadWithoutI = loads[jCur] - tasks[i] / servers[jCur];
      const costCur = computeCost(tasks[i], servers[jCur], loadWithoutI);

      let bestJ = jCur;
      let bestCost = costCur;

      for (let j = 0; j < servers.length; j++) {
        if (j === jCur) continue;
        const costJ = computeCost(tasks[i], servers[j], loads[j]);
        if (costJ < bestCost - 1e-9) {
          bestCost = costJ;
          bestJ = j;
        }
      }

      if (bestJ !== jCur) {
        assignment = [...assignment];
        assignment[i] = bestJ;
        moved = true;

        convergenceSteps.push({
          iteration: iteration + 1,
          assignment: [...assignment],
          makespan: parseFloat(getMakespan(assignment, tasks, servers).toFixed(4)),
          movedTask: i,
          fromServer: jCur,
          toServer: bestJ,
        });
      }
    }

    if (!moved) {
      itCount = iteration + 1;
      break;
    }
  }

  const executionTime = performance.now() - startTime;

  return {
    assignment,
    makespan: parseFloat(getMakespan(assignment, tasks, servers).toFixed(4)),
    iterations: itCount,
    executionTime: parseFloat(executionTime.toFixed(4)),
    serverDistribution: getServerDistribution(assignment, tasks, servers),
    convergenceSteps: convergenceSteps.length > 0 ? convergenceSteps : [{
      iteration: 0,
      assignment: [...assignment],
      makespan: parseFloat(getMakespan(assignment, tasks, servers).toFixed(4)),
      movedTask: null,
      fromServer: null,
      toServer: null,
    }],
  };
}

// ── Optimisation Linéaire (simulation approximative) ─────────────

export function computeLP(tasks: number[], servers: number[]): LPResult {
  const startTime = performance.now();

  // Greedy LPT (Longest Processing Time) — approximation de l'optimal
  const sortedTasks = tasks.map((w, i) => ({ weight: w, id: i })).sort((a, b) => b.weight - a.weight);
  const assignment = new Array(tasks.length).fill(0);
  const loads = new Array(servers.length).fill(0);

  for (const task of sortedTasks) {
    let bestServer = 0;
    let bestLoad = Infinity;

    for (let j = 0; j < servers.length; j++) {
      const newLoad = loads[j] + task.weight / servers[j];
      if (newLoad < bestLoad) {
        bestLoad = newLoad;
        bestServer = j;
      }
    }

    assignment[task.id] = bestServer;
    loads[bestServer] += task.weight / servers[bestServer];
  }

  const solveTime = performance.now() - startTime;

  return {
    assignment,
    makespan: parseFloat(Math.max(...loads).toFixed(4)),
    solveTime: parseFloat(solveTime.toFixed(4)),
    serverDistribution: getServerDistribution(assignment, tasks, servers),
  };
}

// ── Front de Pareto (simulation) ────────────────────────────────

export function computePareto(tasks: number[], servers: number[]): ParetoResult {
  const nashResult = computeNash(tasks, servers);
  const lpResult = computeLP(tasks, servers);

  // Génération de points Pareto par variation des poids
  const front: ParetoPoint[] = [];
  const allPoints: ParetoPoint[] = [];

  for (let alpha = 0; alpha <= 1; alpha += 0.05) {
    // Stratégie mixte: alpha * Nash + (1-alpha) * LP
    const assignment = tasks.map((_, i) => {
      return Math.random() < alpha 
        ? nashResult.assignment[i] 
        : lpResult.assignment[i];
    });

    const loads = getLoads(assignment, tasks, servers);
    const makespan = Math.max(...loads);
    const mean = loads.reduce((a, b) => a + b, 0) / loads.length;
    const variance = loads.reduce((sum, l) => sum + (l - mean) ** 2, 0) / loads.length;
    const desequilibre = Math.sqrt(variance);

    const point = {
      assignment,
      makespan: parseFloat(makespan.toFixed(4)),
      desequilibre: parseFloat(desequilibre.toFixed(4)),
    };

    allPoints.push(point);
  }

  // Filtrage Pareto
  for (const p of allPoints) {
    let isDominated = false;
    for (const q of allPoints) {
      if (p === q) continue;
      if (q.makespan <= p.makespan + 1e-6 && q.desequilibre <= p.desequilibre + 1e-6 &&
          (q.makespan < p.makespan - 1e-6 || q.desequilibre < p.desequilibre - 1e-6)) {
        isDominated = true;
        break;
      }
    }
    if (!isDominated) {
      front.push(p);
    }
  }

  front.sort((a, b) => a.makespan - b.makespan);

  const nashLoads = getLoads(nashResult.assignment, tasks, servers);
  const nashMean = nashLoads.reduce((a, b) => a + b, 0) / nashLoads.length;
  const nashDes = Math.sqrt(nashLoads.reduce((s, l) => s + (l - nashMean) ** 2, 0) / nashLoads.length);

  return {
    front,
    nashPoint: {
      makespan: nashResult.makespan,
      desequilibre: parseFloat(nashDes.toFixed(4)),
      isPareto: front.some(p => Math.abs(p.makespan - nashResult.makespan) < 0.1 && Math.abs(p.desequilibre - nashDes) < 0.1),
    },
    allPoints,
  };
}

// ── Table de Gains ────────────────────────────────────────────────

export function computeGainTable(tasks: number[], servers: number[]): GainTableResult {
  const strategiesJ1 = [
    { name: 'S1_Nash', fn: () => computeNash(tasks, servers).assignment },
    { name: 'S2_Greedy', fn: () => computeLP(tasks, servers).assignment },
    { name: 'S3_RR', fn: () => tasks.map((_, i) => i % servers.length) },
    { name: 'S4_Random', fn: () => tasks.map(() => Math.floor(Math.random() * servers.length)) },
  ];

  const strategiesJ2 = [
    { name: 'G1_Uniforme', weights: servers.map(() => 1.0) },
    { name: 'G2_Priorite', weights: servers.map(s => s / servers.reduce((a, b) => a + b, 0)) },
    { name: 'G3_Equilibre', weights: servers.map(s => 1.0 / s).map(w => w / servers.map(s => 1.0 / s).reduce((a, b) => a + b, 0)) },
  ];

  const table: GainCell[][] = [];

  for (const s1 of strategiesJ1) {
    const row: GainCell[] = [];
    for (const s2 of strategiesJ2) {
      const assignment = s1.fn();
      const loads = getLoads(assignment, tasks, servers);
      const makespan = Math.max(...loads);
      const mean = loads.reduce((a, b) => a + b, 0) / loads.length;
      const variance = loads.reduce((sum, l) => sum + (l - mean) ** 2, 0) / loads.length;
      const desequilibre = Math.sqrt(variance);

      row.push({
        strategieJ1: s1.name,
        strategieJ2: s2.name,
        gainJ1: parseFloat((-makespan).toFixed(4)),
        gainJ2: parseFloat((-desequilibre).toFixed(4)),
        assignment,
      });
    }
    table.push(row);
  }

  // Détection Nash dans la table
  const nashCells: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const g1 = table[i][j].gainJ1;
      const g2 = table[i][j].gainJ2;
      const bestJ1 = Math.max(...table.map(row => row[j].gainJ1));
      const bestJ2 = Math.max(...table[i].map(cell => cell.gainJ2));

      if (g1 >= bestJ1 - 1e-6 && g2 >= bestJ2 - 1e-6) {
        nashCells.push([i, j]);
      }
    }
  }

  // Détection Pareto
  const paretoCells: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const g1 = table[i][j].gainJ1;
      const g2 = table[i][j].gainJ2;
      let isDominated = false;

      for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 3; l++) {
          if (i === k && j === l) continue;
          const g1kl = table[k][l].gainJ1;
          const g2kl = table[k][l].gainJ2;
          if (g1kl >= g1 - 1e-6 && g2kl >= g2 - 1e-6 && (g1kl > g1 + 1e-6 || g2kl > g2 + 1e-6)) {
            isDominated = true;
            break;
          }
        }
        if (isDominated) break;
      }

      if (!isDominated) {
        paretoCells.push([i, j]);
      }
    }
  }

  return {
    table,
    labelsJ1: strategiesJ1.map(s => s.name),
    labelsJ2: strategiesJ2.map(s => s.name),
    nashCells,
    paretoCells,
  };
}

// ── Comparaison complète ─────────────────────────────────────────

export function computeComparison(scenario: Scenario): ComparisonResult {
  const nash = computeNash(scenario.tasks, scenario.servers);
  const lp = computeLP(scenario.tasks, scenario.servers);

  return {
    scenario: scenario.name,
    nTasks: scenario.tasks.length,
    nServers: scenario.servers.length,
    nash,
    lp,
    priceOfAnarchy: parseFloat((nash.makespan / lp.makespan).toFixed(4)),
    improvementPercent: parseFloat(((nash.makespan - lp.makespan) / nash.makespan * 100).toFixed(2)),
  };
}

import type {
  NashResult, LPResult, ParetoResult,
  GainTableResult, ComparisonResult, Scenario
} from '@/types';

type ScenarioList = Scenario[];

const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ComputeRequest {
  tasks: number[];
  servers: number[];
  max_iter?: number;
}

// Helper — convertit snake_case backend → camelCase frontend
function toNashResult(raw: any): NashResult {
  return {
    assignment: raw.assignment,
    makespan: raw.makespan,
    iterations: raw.iterations,
    executionTime: raw.execution_time,
    serverDistribution: (raw.server_distribution ?? []).map((d: any) => ({
      serverId: d.server_id,
      serverSpeed: d.server_speed,
      nTasks: d.n_tasks,
      tasksIds: d.tasks_ids,
      load: d.load,
    })),
    convergenceSteps: (raw.convergence_steps ?? []).map((s: any) => ({
      iteration: s.iteration,
      assignment: s.assignment,
      makespan: s.makespan,
      movedTask: s.moved_task ?? null,
      fromServer: s.from_server ?? null,
      toServer: s.to_server ?? null,
    })),
  };
}

function toLPResult(raw: any): LPResult {
  return {
    assignment: raw.assignment,
    makespan: raw.makespan,
    solveTime: raw.solve_time,
    serverDistribution: (raw.server_distribution ?? []).map((d: any) => ({
      serverId: d.server_id,
      serverSpeed: d.server_speed,
      nTasks: d.n_tasks,
      tasksIds: d.tasks_ids,
      load: d.load,
    })),
  };
}

function toComparisonResult(raw: any): ComparisonResult {
  return {
    scenario: raw.scenario,
    nTasks: raw.n_tasks,
    nServers: raw.n_servers,
    nash: toNashResult(raw.nash),
    lp: toLPResult(raw.lp),
    priceOfAnarchy: raw.price_of_anarchy,
    improvementPercent: raw.improvement_percent,
  };
}

function toGainTableResult(raw: any): GainTableResult {
  return {
    table: raw.table.map((row: any[]) =>
      row.map((cell: any) => ({
        strategieJ1: cell.strategie_j1,
        strategieJ2: cell.strategie_j2,
        gainJ1: cell.gain_j1,
        gainJ2: cell.gain_j2,
        assignment: cell.assignment,
      }))
    ),
    labelsJ1: raw.labels_j1,
    labelsJ2: raw.labels_j2,
    nashCells: raw.nash_cells,
    paretoCells: raw.pareto_cells,
  };
}

function toParetoResult(raw: any): ParetoResult {
  return {
    front: raw.front,
    nashPoint: raw.nash_point,
    allPoints: raw.all_points,
  };
}

export const api = {
  getScenarios: () => apiGet<ScenarioList>('/api/scenarios'),

  computeNash: (req: ComputeRequest) =>
    apiPost<any>('/api/compute/nash', req).then(toNashResult),

  computeLP: (req: ComputeRequest) =>
    apiPost<any>('/api/compute/lp', req).then(toLPResult),

  computePareto: (req: { tasks: number[]; servers: number[]; max_affectations?: number | null }) =>
    apiPost<any>('/api/compute/pareto', req).then(toParetoResult),

  computeGainTable: (req: { tasks: number[]; servers: number[] }) =>
    apiPost<any>('/api/compute/gain-table', req).then(toGainTableResult),

  compare: (req: { tasks: number[]; servers: number[]; scenario_name?: string }) =>
    apiPost<any>('/api/compare', req).then(toComparisonResult),
};
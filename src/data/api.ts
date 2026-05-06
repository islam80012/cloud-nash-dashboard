import type { 
  NashResult, LPResult, ParetoResult, 
  GainTableResult, ComparisonResult,Scenario
} from '@/types';
type ScenarioList = Scenario[]

// En Docker: nginx proxy redirige /api vers le backend
// En dev local: utiliser localhost:8000
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

export const api = {
  getScenarios: () => apiGet<ScenarioList>('/api/scenarios'),
  computeNash: (req: ComputeRequest) => apiPost<NashResult>('/api/compute/nash', req),
  computeLP: (req: ComputeRequest) => apiPost<LPResult>('/api/compute/lp', req),
  computePareto: (req: { tasks: number[]; servers: number[]; max_affectations?: number | null }) => 
    apiPost<ParetoResult>('/api/compute/pareto', req),
  computeGainTable: (req: { tasks: number[]; servers: number[] }) => 
    apiPost<GainTableResult>('/api/compute/gain-table', req),
  compare: (req: { tasks: number[]; servers: number[]; scenario_name?: string }) => 
    apiPost<ComparisonResult>('/api/compare', req),
};

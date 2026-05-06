export interface Task {
  id: number;
  weight: number;
}

export interface Server {
  id: number;
  speed: number;
  load: number;
  tasks: number[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  tasks: number[];
  servers: number[];
}

export interface NashResult {
  assignment: number[];
  makespan: number;
  iterations: number;
  executionTime: number;
  serverDistribution: ServerDistribution[];
  convergenceSteps: ConvergenceStep[];
}

export interface LPResult {
  assignment: number[];
  makespan: number;
  solveTime: number;
  serverDistribution: ServerDistribution[];
}

export interface ServerDistribution {
  serverId: number;
  serverSpeed: number;
  nTasks: number;
  tasksIds: number[];
  load: number;
}

export interface ConvergenceStep {
  iteration: number;
  assignment: number[];
  makespan: number;
  movedTask: number | null;
  fromServer: number | null;
  toServer: number | null;
}

export interface ParetoPoint {
  assignment: number[];
  makespan: number;
  desequilibre: number;
}

export interface ParetoResult {
  front: ParetoPoint[];
  nashPoint: {
    makespan: number;
    desequilibre: number;
    isPareto: boolean;
  };
  allPoints: ParetoPoint[];
}

export interface GainCell {
  strategieJ1: string;
  strategieJ2: string;
  gainJ1: number;
  gainJ2: number;
  assignment: number[];
}

export interface GainTableResult {
  table: GainCell[][];
  labelsJ1: string[];
  labelsJ2: string[];
  nashCells: [number, number][];
  paretoCells: [number, number][];
}

export interface ComparisonResult {
  scenario: string;
  nTasks: number;
  nServers: number;
  nash: NashResult;
  lp: LPResult;
  priceOfAnarchy: number;
  improvementPercent: number;
}

export type ViewMode = 'overview' | 'topology' | 'convergence' | 'pareto' | 'gains' | 'comparison';

export interface SimulationState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
}

export interface ParetoPoint {
  assignment: number[];
  makespan: number;
  desequilibre: number;
}

export interface ParetoResult {
  front: ParetoPoint[];
  nashPoint: {
    makespan: number;
    desequilibre: number;
    isPareto: boolean;
  };
  allPoints: ParetoPoint[];
}

export interface GainCell {
  strategieJ1: string;
  strategieJ2: string;
  gainJ1: number;
  gainJ2: number;
  assignment: number[];
}
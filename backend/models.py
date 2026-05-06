from pydantic import BaseModel, Field
from typing import List, Optional, Tuple

# ── Requêtes ─────────────────────────────────────────

class ComputeRequest(BaseModel):
    tasks: List[float] = Field(..., description="Liste des poids des tâches", min_length=1)
    servers: List[float] = Field(..., description="Liste des vitesses des serveurs", min_length=1)
    max_iter: int = Field(default=5000, ge=100, le=50000, description="Nombre max d'itérations")

class ParetoRequest(BaseModel):
    tasks: List[float] = Field(..., min_length=1)
    servers: List[float] = Field(..., min_length=1)
    max_affectations: Optional[int] = Field(default=None, description="Limite échantillonnage (None = exact)")

class GainTableRequest(BaseModel):
    tasks: List[float] = Field(..., min_length=1)
    servers: List[float] = Field(..., min_length=1)

class CompareRequest(BaseModel):
    tasks: List[float] = Field(..., min_length=1)
    servers: List[float] = Field(..., min_length=1)
    scenario_name: Optional[str] = Field(default="custom", description="Nom du scénario")

# ── Réponses ─────────────────────────────────────────

class ServerDistribution(BaseModel):
    server_id: int
    server_speed: float
    n_tasks: int
    tasks_ids: List[int]
    load: float

class ConvergenceStep(BaseModel):
    iteration: int
    assignment: List[int]
    makespan: float
    moved_task: Optional[int] = None
    from_server: Optional[int] = None
    to_server: Optional[int] = None

class NashResult(BaseModel):
    assignment: List[int]
    makespan: float
    iterations: int
    execution_time: float
    server_distribution: List[ServerDistribution]
    convergence_steps: List[ConvergenceStep]

class LPResult(BaseModel):
    assignment: List[int]
    makespan: float
    solve_time: float
    server_distribution: List[ServerDistribution]

class ParetoPoint(BaseModel):
    assignment: List[int]
    makespan: float
    desequilibre: float

class ParetoResult(BaseModel):
    front: List[ParetoPoint]
    nash_point: dict
    all_points: List[ParetoPoint]

class GainCell(BaseModel):
    strategie_j1: str
    strategie_j2: str
    gain_j1: float
    gain_j2: float
    assignment: List[int]

class GainTableResult(BaseModel):
    table: List[List[GainCell]]
    labels_j1: List[str]
    labels_j2: List[str]
    nash_cells: List[Tuple[int, int]]
    pareto_cells: List[Tuple[int, int]]

class ComparisonResult(BaseModel):
    scenario: str
    n_tasks: int
    n_servers: int
    nash: NashResult
    lp: LPResult
    price_of_anarchy: float
    improvement_percent: float

class ScenarioInfo(BaseModel):
    id: str
    name: str
    description: str
    tasks: List[float]
    servers: List[float]

class ScenarioList(BaseModel):
    scenarios: List[ScenarioInfo]

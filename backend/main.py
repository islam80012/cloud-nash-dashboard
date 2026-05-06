from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models import (
    ComputeRequest, ParetoRequest, GainTableRequest, CompareRequest,
    NashResult, LPResult, ParetoResult, GainTableResult, ComparisonResult,
    ScenarioList, ScenarioInfo
)
from algorithms.data_gen import SCENARIOS
from algorithms.nash import nash_equilibrium
from algorithms.lp_solver import solve_lp
from algorithms.pareto import compute_pareto
from algorithms.gain_table import construire_table_gains


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Cloud Nash Backend démarré")
    yield
    print("🛑 Arrêt du backend")


app = FastAPI(
    title="Cloud Load Balancing API",
    description="API pour la modélisation par théorie des jeux du load balancing cloud",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — autorise le frontend React (Vite dev server + production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Cloud Load Balancing API",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/scenarios", response_model=ScenarioList, tags=["Scénarios"])
def list_scenarios():
    """Liste les 4 scénarios prédéfinis."""
    scenarios = []
    for key, (name, desc, fn) in SCENARIOS.items():
        tasks, servers = fn()
        scenarios.append(ScenarioInfo(
            id=key,
            name=name,
            description=desc,
            tasks=tasks,
            servers=servers,
        ))
    return ScenarioList(scenarios=scenarios)


@app.post("/api/compute/nash", response_model=NashResult, tags=["Algorithmes"])
def compute_nash(req: ComputeRequest):
    """Calcule l'équilibre de Nash par Best Response."""
    try:
        result = nash_equilibrium(req.tasks, req.servers, req.max_iter)
        return NashResult(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/compute/lp", response_model=LPResult, tags=["Algorithmes"])
def compute_lp(req: ComputeRequest):
    """Calcule la solution optimale par Programmation Linéaire (PuLP)."""
    try:
        result = solve_lp(req.tasks, req.servers)
        return LPResult(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/compute/pareto", response_model=ParetoResult, tags=["Algorithmes"])
def compute_pareto_endpoint(req: ParetoRequest):
    """Calcule le front de Pareto (Makespan vs Déséquilibre)."""
    try:
        result = compute_pareto(req.tasks, req.servers, req.max_affectations)
        return ParetoResult(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/compute/gain-table", response_model=GainTableResult, tags=["Algorithmes"])
def compute_gain_table(req: GainTableRequest):
    """Construit la table de gains du jeu à 2 joueurs."""
    try:
        result = construire_table_gains(req.tasks, req.servers)
        return GainTableResult(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/compare", response_model=ComparisonResult, tags=["Comparaison"])
def compare_solutions(req: CompareRequest):
    """Compare Nash vs Optimal et calcule le Price of Anarchy."""
    try:
        nash_res = nash_equilibrium(req.tasks, req.servers)
        lp_res = solve_lp(req.tasks, req.servers)

        price_of_anarchy = round(nash_res["makespan"] / lp_res["makespan"], 4)
        improvement_percent = round(
            (nash_res["makespan"] - lp_res["makespan"]) / nash_res["makespan"] * 100, 2
        )

        return ComparisonResult(
            scenario=req.scenario_name,
            n_tasks=len(req.tasks),
            n_servers=len(req.servers),
            nash=NashResult(**nash_res),
            lp=LPResult(**lp_res),
            price_of_anarchy=price_of_anarchy,
            improvement_percent=improvement_percent,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ═══════════════════════════════════════════════════════
# Point d'entrée
# ═══════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

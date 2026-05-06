import random
import statistics
from typing import List, Dict, Any, Optional
from .nash import nash_equilibrium, get_loads, get_makespan

def objectif_makespan(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    loads = get_loads(assignment, tasks, servers)
    return max(loads)

def objectif_desequilibre(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    loads = get_loads(assignment, tasks, servers)
    if len(loads) < 2:
        return 0.0
    return statistics.stdev(loads)

def domine(a: tuple, b: tuple) -> bool:
    makespan_a, desequilibre_a = a
    makespan_b, desequilibre_b = b

    meilleur_ou_egal = (
        makespan_a <= makespan_b + 1e-9 and
        desequilibre_a <= desequilibre_b + 1e-9
    )
    strictement_meilleur = (
        makespan_a < makespan_b - 1e-9 or
        desequilibre_a < desequilibre_b - 1e-9
    )
    return meilleur_ou_egal and strictement_meilleur

def calculer_front_pareto(tasks: List[float], servers: List[float], max_affectations: Optional[int] = None) -> tuple:
    n = len(tasks)
    m = len(servers)
    nb_total = m ** n

    if max_affectations is not None and nb_total > max_affectations:
        candidats = [
            [random.randint(0, m - 1) for _ in range(n)]
            for _ in range(max_affectations)
        ]
        assignment_nash = nash_equilibrium(tasks, servers)["assignment"]
        candidats.append(assignment_nash)
    else:
        import itertools
        candidats = [list(c) for c in itertools.product(range(m), repeat=n)]

    tous_les_points = []
    for aff in candidats:
        ms = objectif_makespan(aff, tasks, servers)
        deq = objectif_desequilibre(aff, tasks, servers)
        tous_les_points.append({
            "assignment": aff,
            "makespan": round(ms, 4),
            "desequilibre": round(deq, 4),
        })

    front = []
    for i, p in enumerate(tous_les_points):
        est_domine = False
        for j, q in enumerate(tous_les_points):
            if i == j:
                continue
            if domine((q["makespan"], q["desequilibre"]), (p["makespan"], p["desequilibre"])):
                est_domine = True
                break
        if not est_domine:
            front.append(p)

    front.sort(key=lambda x: x["makespan"])
    return front, tous_les_points

def comparer_nash_pareto(tasks: List[float], servers: List[float], front_pareto: List[Dict]) -> Dict[str, Any]:
    nash_result = nash_equilibrium(tasks, servers)
    assignment_nash = nash_result["assignment"]
    ms_nash = objectif_makespan(assignment_nash, tasks, servers)
    deq_nash = objectif_desequilibre(assignment_nash, tasks, servers)

    ms_nash_r = round(ms_nash, 4)
    deq_nash_r = round(deq_nash, 4)

    def distance(p):
        return ((p["makespan"] - ms_nash_r) ** 2 + (p["desequilibre"] - deq_nash_r) ** 2) ** 0.5

    pareto_plus_proche = min(front_pareto, key=distance)
    dist_min = distance(pareto_plus_proche)
    nash_est_pareto = dist_min <= 1e-6

    return {
        "nash_assignment": assignment_nash,
        "nash_iterations": nash_result["iterations"],
        "nash_makespan": ms_nash_r,
        "nash_desequilibre": deq_nash_r,
        "nash_est_pareto": nash_est_pareto,
        "pareto_plus_proche": pareto_plus_proche,
        "distance_nash_pareto": round(dist_min, 4),
    }

def compute_pareto(tasks: List[float], servers: List[float], max_affectations: Optional[int] = None) -> Dict[str, Any]:
    front, all_points = calculer_front_pareto(tasks, servers, max_affectations)
    comparaison = comparer_nash_pareto(tasks, servers, front)

    return {
        "front": front,
        "nash_point": {
            "makespan": comparaison["nash_makespan"],
            "desequilibre": comparaison["nash_desequilibre"],
            "is_pareto": comparaison["nash_est_pareto"],
        },
        "all_points": all_points,
        "comparaison_nash": comparaison,
    }

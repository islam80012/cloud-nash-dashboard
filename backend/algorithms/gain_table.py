import random
import statistics
from typing import List, Dict, Any, Tuple
from .nash import nash_equilibrium, get_loads, get_makespan
from .lp_solver import solve_lp

STRATEGIES_J1 = [
    ("S1_Nash", lambda tasks, servers, poids: nash_equilibrium(tasks, servers)["assignment"]),
    ("S2_Greedy", lambda tasks, servers, poids: solve_lp(tasks, servers)["assignment"]),
    ("S3_RR", lambda tasks, servers, poids: [i % len(servers) for i in range(len(tasks))]),
    ("S4_Random", lambda tasks, servers, poids: [random.randint(0, len(servers) - 1) for _ in tasks]),
]

def gestionnaire_uniforme(servers: List[float]) -> List[float]:
    return [1.0] * len(servers)

def gestionnaire_priorite(servers: List[float]) -> List[float]:
    total = sum(servers)
    return [round(v / total, 4) for v in servers]

def gestionnaire_equilibre(servers: List[float]) -> List[float]:
    inv = [1.0 / v for v in servers]
    total = sum(inv)
    return [round(x / total, 4) for x in inv]

STRATEGIES_J2 = [
    ("G1_Uniforme", gestionnaire_uniforme),
    ("G2_Priorite", gestionnaire_priorite),
    ("G3_Equilibre", gestionnaire_equilibre),
]

def gain_joueur1(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    return -round(get_makespan(assignment, tasks, servers), 4)

def gain_joueur2(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    loads = get_loads(assignment, tasks, servers)
    if len(loads) < 2:
        return 0.0
    return -round(statistics.stdev(loads), 4)

def construire_table_gains(tasks: List[float], servers: List[float]) -> Dict[str, Any]:
    nb_s1 = len(STRATEGIES_J1)
    nb_s2 = len(STRATEGIES_J2)

    table = []
    for i, (nom_s1, fn_s1) in enumerate(STRATEGIES_J1):
        ligne = []
        for j, (nom_s2, fn_s2) in enumerate(STRATEGIES_J2):
            poids = fn_s2(servers)
            aff = fn_s1(tasks, servers, poids)
            g1 = gain_joueur1(aff, tasks, servers)
            g2 = gain_joueur2(aff, tasks, servers)
            ligne.append({
                "strategie_j1": nom_s1,
                "strategie_j2": nom_s2,
                "gain_j1": g1,
                "gain_j2": g2,
                "assignment": aff,
            })
        table.append(ligne)

    # Détection Nash
    nash_cells = []
    for i in range(nb_s1):
        for j in range(nb_s2):
            g1_ij = table[i][j]["gain_j1"]
            g2_ij = table[i][j]["gain_j2"]
            meilleur_j1 = max(table[k][j]["gain_j1"] for k in range(nb_s1))
            meilleur_j2 = max(table[i][k]["gain_j2"] for k in range(nb_s2))
            if g1_ij >= meilleur_j1 - 1e-6 and g2_ij >= meilleur_j2 - 1e-6:
                nash_cells.append((i, j))

    # Détection Pareto
    pareto_cells = []
    all_cells = [(i, j) for i in range(nb_s1) for j in range(nb_s2)]
    for (i, j) in all_cells:
        g1 = table[i][j]["gain_j1"]
        g2 = table[i][j]["gain_j2"]
        est_dominee = False
        for (k, l) in all_cells:
            if (k, l) == (i, j):
                continue
            g1_kl = table[k][l]["gain_j1"]
            g2_kl = table[k][l]["gain_j2"]
            if (g1_kl >= g1 - 1e-6 and g2_kl >= g2 - 1e-6 and
                    (g1_kl > g1 + 1e-6 or g2_kl > g2 + 1e-6)):
                est_dominee = True
                break
        if not est_dominee:
            pareto_cells.append((i, j))

    return {
        "table": table,
        "labels_j1": [s[0] for s in STRATEGIES_J1],
        "labels_j2": [s[0] for s in STRATEGIES_J2],
        "nash_cells": nash_cells,
        "pareto_cells": pareto_cells,
    }

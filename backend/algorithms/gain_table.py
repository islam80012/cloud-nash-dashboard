import random
import statistics
from typing import List, Dict, Any, Tuple
from .nash import nash_equilibrium, get_loads, get_makespan


# ── Stratégies Joueur 1 (Scheduleur) ─────────────────────────────

def _strategie_nash(tasks, servers, poids):
    return nash_equilibrium(tasks, servers)["assignment"]

def _strategie_greedy(tasks, servers, poids):
    n, m = len(tasks), len(servers)
    charges = [0.0] * m
    result = [0] * n
    ordre = sorted(range(n), key=lambda i: -tasks[i])
    for i in ordre:
        if poids:
            charges_eff = [charges[j] / max(poids[j], 1e-9) for j in range(m)]
        else:
            charges_eff = charges[:]
        j_min = min(range(m), key=lambda j: charges_eff[j])
        result[i] = j_min
        charges[j_min] += tasks[i] / servers[j_min]
    return result

def _strategie_rr(tasks, servers, poids):
    n, m = len(servers), len(servers)
    if poids:
        total = sum(poids)
        slots = []
        for j, p in enumerate(poids):
            count = max(1, round(p / total * m))
            slots.extend([j] * count)
    else:
        slots = list(range(m))
    return [slots[i % len(slots)] for i in range(len(tasks))]

def _strategie_random(tasks, servers, poids):
    return [random.randint(0, len(servers) - 1) for _ in tasks]


STRATEGIES_J1 = [
    ("S1_Nash",   _strategie_nash),
    ("S2_Greedy", _strategie_greedy),
    ("S3_RR",     _strategie_rr),
    ("S4_Random", _strategie_random),
]


# ── Stratégies Joueur 2 (Gestionnaire) ───────────────────────────

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
    ("G1_Uniforme",  gestionnaire_uniforme),
    ("G2_Priorite",  gestionnaire_priorite),
    ("G3_Equilibre", gestionnaire_equilibre),
]


# ── Fonctions de gain ─────────────────────────────────────────────

def gain_joueur1(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    return -round(get_makespan(assignment, tasks, servers), 4)

def gain_joueur2(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    loads = get_loads(assignment, tasks, servers)
    if len(loads) < 2:
        return 0.0
    return -round(statistics.stdev(loads), 4)


# ── Construction de la table ──────────────────────────────────────

def construire_table_gains(tasks: List[float], servers: List[float]) -> Dict[str, Any]:
    nb_s1 = len(STRATEGIES_J1)
    nb_s2 = len(STRATEGIES_J2)

    table = []
    for i, (nom_s1, fn_s1) in enumerate(STRATEGIES_J1):
        ligne = []
        for j, (nom_s2, fn_s2) in enumerate(STRATEGIES_J2):
            poids = fn_s2(servers)
            aff   = fn_s1(tasks, servers, poids)
            g1    = gain_joueur1(aff, tasks, servers)
            g2    = gain_joueur2(aff, tasks, servers)
            ligne.append({
                "strategie_j1": nom_s1,
                "strategie_j2": nom_s2,
                "gain_j1":      g1,
                "gain_j2":      g2,
                "assignment":   aff,
            })
        table.append(ligne)

    # Détection Nash dans la table
    nash_cells = []
    for i in range(nb_s1):
        for j in range(nb_s2):
            g1_ij = table[i][j]["gain_j1"]
            g2_ij = table[i][j]["gain_j2"]
            meilleur_j1 = max(table[k][j]["gain_j1"] for k in range(nb_s1))
            meilleur_j2 = max(table[i][k]["gain_j2"] for k in range(nb_s2))
            if g1_ij >= meilleur_j1 - 1e-6 and g2_ij >= meilleur_j2 - 1e-6:
                nash_cells.append((i, j))

    # Détection Pareto dans la table
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
        "table":       table,
        "labels_j1":   [s[0] for s in STRATEGIES_J1],
        "labels_j2":   [s[0] for s in STRATEGIES_J2],
        "nash_cells":  nash_cells,
        "pareto_cells": pareto_cells,
    }
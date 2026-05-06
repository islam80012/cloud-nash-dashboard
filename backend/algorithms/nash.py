import time
import random
from typing import List, Tuple, Dict, Any

def compute_cost(task_weight: float, server_speed: float, current_load: float) -> float:
    if server_speed <= 0:
        raise ValueError(f"Vitesse serveur invalide : {server_speed}")
    return task_weight / server_speed + current_load

def get_loads(assignment: List[int], tasks: List[float], servers: List[float]) -> List[float]:
    loads = [0.0] * len(servers)
    for i, j in enumerate(assignment):
        if j < 0 or j >= len(servers):
            raise IndexError(f"Tâche {i} affectée au serveur {j} qui n'existe pas.")
        loads[j] += tasks[i] / servers[j]
    return loads

def get_makespan(assignment: List[int], tasks: List[float], servers: List[float]) -> float:
    loads = get_loads(assignment, tasks, servers)
    return max(loads) if loads else 0.0

def get_server_distribution(assignment: List[int], tasks: List[float], servers: List[float]) -> List[Dict[str, Any]]:
    loads = get_loads(assignment, tasks, servers)
    distribution = []
    for j in range(len(servers)):
        tasks_j = [i for i, srv in enumerate(assignment) if srv == j]
        distribution.append({
            "server_id": j,
            "server_speed": servers[j],
            "n_tasks": len(tasks_j),
            "tasks_ids": tasks_j,
            "load": round(loads[j], 4),
        })
    return distribution

def nash_equilibrium(tasks: List[float], servers: List[float], max_iter: int = 5000) -> Dict[str, Any]:
    start_time = time.time()

    if not servers:
        raise ValueError("La liste de serveurs est vide.")

    assignment = [random.randint(0, len(servers) - 1) for _ in tasks]
    convergence_steps = []
    it_count = max_iter

    for iteration in range(max_iter):
        moved = False

        for i in range(len(tasks)):
            loads = get_loads(assignment, tasks, servers)
            j_cur = assignment[i]
            load_without_i = loads[j_cur] - tasks[i] / servers[j_cur]
            cost_cur = compute_cost(tasks[i], servers[j_cur], load_without_i)

            best_j = j_cur
            best_cost = cost_cur

            for j in range(len(servers)):
                if j == j_cur:
                    continue
                cost_j = compute_cost(tasks[i], servers[j], loads[j])
                if cost_j < best_cost - 1e-9:
                    best_cost = cost_j
                    best_j = j

            if best_j != j_cur:
                assignment[i] = best_j
                moved = True

                convergence_steps.append({
                    "iteration": iteration + 1,
                    "assignment": assignment.copy(),
                    "makespan": round(get_makespan(assignment, tasks, servers), 4),
                    "moved_task": i,
                    "from_server": j_cur,
                    "to_server": best_j,
                })

        if not moved:
            it_count = iteration + 1
            break

    execution_time = time.time() - start_time

    # Add initial step if no moves occurred
    if not convergence_steps:
        convergence_steps.append({
            "iteration": 0,
            "assignment": assignment.copy(),
            "makespan": round(get_makespan(assignment, tasks, servers), 4),
            "moved_task": None,
            "from_server": None,
            "to_server": None,
        })

    return {
        "assignment": assignment,
        "makespan": round(get_makespan(assignment, tasks, servers), 4),
        "iterations": it_count,
        "execution_time": round(execution_time, 4),
        "server_distribution": get_server_distribution(assignment, tasks, servers),
        "convergence_steps": convergence_steps,
    }

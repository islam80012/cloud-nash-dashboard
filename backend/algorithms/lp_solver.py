import time
import pulp
from typing import List, Dict, Any
from .nash import get_server_distribution, get_loads

def solve_lp(tasks: List[float], servers: List[float]) -> Dict[str, Any]:
    start_time = time.time()

    prob = pulp.LpProblem("Minimize_Makespan", pulp.LpMinimize)
    num_tasks = len(tasks)
    num_servers = len(servers)

    x = pulp.LpVariable.dicts("x", (range(num_tasks), range(num_servers)), cat='Binary')
    C_max = pulp.LpVariable("C_max", lowBound=0)

    # Contrainte : chaque tâche sur exactement 1 serveur
    for i in range(num_tasks):
        prob += pulp.lpSum([x[i][j] for j in range(num_servers)]) == 1

    # Contrainte : C_max >= charge de chaque serveur j
    for j in range(num_servers):
        load_j = pulp.lpSum([(tasks[i] / servers[j]) * x[i][j] for i in range(num_tasks)])
        prob += C_max >= load_j

    prob += C_max

    # Résolution
    prob.solve(pulp.PULP_CBC_CMD(msg=0))

    # Extraction
    assignment_lp = []
    for i in range(num_tasks):
        for j in range(num_servers):
            if pulp.value(x[i][j]) == 1:
                assignment_lp.append(j)
                break

    solve_time = time.time() - start_time

    return {
        "assignment": assignment_lp,
        "makespan": round(pulp.value(C_max), 4),
        "solve_time": round(solve_time, 4),
        "server_distribution": get_server_distribution(assignment_lp, tasks, servers),
    }

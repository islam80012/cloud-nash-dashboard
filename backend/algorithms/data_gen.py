import random
from typing import List, Tuple

def generate_tasks(n: int = 5, min_w: float = 1.0, max_w: float = 10.0, seed: int = None) -> List[float]:
    if seed is not None:
        random.seed(seed)
    return [round(random.uniform(min_w, max_w), 2) for _ in range(n)]

def generate_servers(m: int = 3, min_v: float = 1.0, max_v: float = 5.0, seed: int = None) -> List[float]:
    if seed is not None:
        random.seed(seed)
    return [round(random.uniform(min_v, max_v), 2) for _ in range(m)]

def scenario_petit() -> Tuple[List[float], List[float]]:
    tasks = generate_tasks(n=5, min_w=1, max_w=8, seed=42)
    servers = generate_servers(m=3, min_v=1.5, max_v=4.0, seed=42)
    return tasks, servers

def scenario_moyen() -> Tuple[List[float], List[float]]:
    tasks = generate_tasks(n=20, min_w=1, max_w=10, seed=7)
    servers = generate_servers(m=4, min_v=1.0, max_v=4.0, seed=7)
    return tasks, servers

def scenario_desequilibre() -> Tuple[List[float], List[float]]:
    tasks = generate_tasks(n=15, min_w=2, max_w=9, seed=99)
    servers = [0.5, 2.0, 5.0]
    return tasks, servers

def scenario_grand() -> Tuple[List[float], List[float]]:
    tasks = generate_tasks(n=50, min_w=1, max_w=15, seed=2024)
    servers = generate_servers(m=6, min_v=0.5, max_v=6.0, seed=2024)
    return tasks, servers

SCENARIOS = {
    "petit": ("Petit (5t/3s)", "5 tâches, 3 serveurs — convergence rapide", scenario_petit),
    "moyen": ("Moyen (20t/4s)", "20 tâches, 4 serveurs — observer les itérations", scenario_moyen),
    "desequilibre": ("Déséquilibré (15t/3s)", "15 tâches, 3 serveurs de vitesses très différentes", scenario_desequilibre),
    "grand": ("Grand (50t/6s)", "50 tâches, 6 serveurs — stress test", scenario_grand),
}

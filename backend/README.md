# 🔧 Backend Cloud Load Balancing

API FastAPI qui expose les algorithmes Python de théorie des jeux.

## 🚀 Démarrage Rapide

```bash
cd backend

# Option 1: Script automatique
./start.sh

# Option 2: Manuel
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```

L'API sera disponible sur `http://localhost:8000`

## 📚 Documentation

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🔌 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/scenarios` | Liste les 4 scénarios prédéfinis |
| POST | `/api/compute/nash` | Calcule l'équilibre de Nash |
| POST | `/api/compute/lp` | Calcule la solution optimale (PuLP) |
| POST | `/api/compute/pareto` | Calcule le front de Pareto |
| POST | `/api/compute/gain-table` | Construit la table de gains |
| POST | `/api/compare` | Compare Nash vs Optimal |

### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/compute/nash \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [3.5, 7.8, 2.1, 5.6, 4.2],
    "servers": [2.9, 3.7, 1.8],
    "max_iter": 5000
  }'
```

## 📁 Structure

```
backend/
├── main.py              # Application FastAPI + routes
├── models.py            # Modèles Pydantic (validation)
├── requirements.txt     # Dépendances Python
├── start.sh             # Script de démarrage
└── algorithms/
    ├── data_gen.py      # Génération des scénarios
    ├── nash.py          # Algorithme Best Response
    ├── lp_solver.py     # Solveur PuLP
    ├── pareto.py        # Front de Pareto
    └── gain_table.py    # Table de gains 2 joueurs
```

## 🔗 Connexion Frontend

Le frontend React doit pointer vers `http://localhost:8000`. 
Le CORS est déjà configuré pour `localhost:5173` (Vite dev).

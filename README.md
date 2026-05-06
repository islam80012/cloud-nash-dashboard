# 🎮 Cloud Load Balancing Dashboard

> Dashboard interactif pour la modélisation par la théorie des jeux du problème de load balancing dans un environnement cloud.

## 📋 Description du Projet

Ce projet compare deux approches pour l'allocation de tâches à des serveurs :

- **Vision 1 (Égoïste)** : Chaque tâche est un joueur autonome qui minimise son propre coût → **Équilibre de Nash**
- **Vision 2 (Centralisée)** : Un coordinateur calcule l'allocation globalement optimale → **Programmation Linéaire (PuLP)**

Le **Price of Anarchy** mesure le coût du manque de coordination.

## 🏗️ Architecture

```
cloud-nash-dashboard/
├── 📁 backend/           # FastAPI + PuLP + Algorithmes Python
│   ├── main.py
│   ├── models.py
│   ├── Dockerfile       ← 🐳
│   ├── requirements.txt
│   └── algorithms/
│       ├── nash.py
│       ├── lp_solver.py
│       ├── pareto.py
│       └── gain_table.py
│
├── 📁 frontend/          # React + TypeScript + Tailwind + Recharts
│   ├── src/
│   │   ├── components/   # 12 composants
│   │   ├── data/         # Mock + API client
│   │   └── ...
│   ├── Dockerfile        ← 🐳
│   └── nginx.conf        ← 🐳
│
├── docker-compose.yml    ← 🐳
├── docker-start.sh       ← 🐳
└── .env
```

## 🐳 Docker — Déploiement Recommandé (Partage avec amis)

### Prérequis
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Lancer en un clic

```bash
cd cloud-nash-dashboard
./docker-start.sh
```

Ou manuellement :
```bash
cd cloud-nash-dashboard
docker-compose up --build -d
```

### 2. Accéder à l'application

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost | Interface React (port 80) |
| **API** | http://localhost:8000 | Backend FastAPI |
| **Docs API** | http://localhost:8000/docs | Swagger UI |

### 3. Partager avec tes amis

Trouve ton IP locale :
```bash
# Linux/Mac
ipconfig getifaddr en0

# Windows
ipconfig
```

Tes amis accèdent via : `http://TON_IP`

### 4. Arrêter
```bash
docker-compose down
```

---

## 🚀 Développement Local (Sans Docker)

### Terminal 1 — Backend
```bash
cd backend
./start.sh
# → http://localhost:8000
```

### Terminal 2 — Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## ✨ Fonctionnalités

### Dashboard
- **4 Scénarios** : Petit, Moyen, Déséquilibré, Grand
- **Paramètres personnalisés** : modifier tâches/serveurs en temps réel
- **Topologie réseau** interactive
- **Graphiques** : charges, convergence, Pareto, table de gains
- **Simulation** play/pause/step de la convergence Nash
- **Price of Anarchy** calculé en temps réel

### API Backend
| Endpoint | Description |
|----------|-------------|
| `GET /api/scenarios` | Liste des scénarios |
| `POST /api/compute/nash` | Équilibre de Nash |
| `POST /api/compute/lp` | Solution optimale PuLP |
| `POST /api/compute/pareto` | Front de Pareto |
| `POST /api/compute/gain-table` | Table de gains 2 joueurs |
| `POST /api/compare` | Comparaison complète |

---

## 📝 Auteurs

Projet de modélisation par la théorie des jeux pour l'optimisation de réseaux.

#!/bin/bash

echo "🚀 Démarrage du backend Cloud Nash..."
echo ""

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    exit 1
fi

# Créer venv si inexistant
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer venv
source venv/bin/activate

# Installer dépendances
echo "📦 Installation des dépendances..."
pip install -q -r requirements.txt

# Démarrer
echo ""
echo "✅ Backend prêt !"
echo "   URL API    : http://localhost:8000"
echo "   Docs       : http://localhost:8000/docs"
echo ""
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

#!/bin/bash

echo "🐳 Cloud Nash — Docker Deployment"
echo "=================================="
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "   → https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Choisir la commande docker compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Construction des images..."
$COMPOSE_CMD build

echo ""
echo "🚀 Démarrage des services..."
$COMPOSE_CMD up -d

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "   🌐 Dashboard (Frontend) : http://localhost"
echo "   🔌 API (Backend)        : http://localhost:8000"
echo "   📚 API Docs (Swagger)   : http://localhost:8000/docs"
echo ""
echo "   Commandes utiles :"
echo "     $COMPOSE_CMD logs -f    # Voir les logs"
echo "     $COMPOSE_CMD down       # Arrêter"
echo "     $COMPOSE_CMD down -v    # Arrêter + supprimer volumes"

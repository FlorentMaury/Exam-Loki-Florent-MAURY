#!/bin/bash

# Script de déploiement pour l'environnement de staging.

echo "🚀 Déploiement en staging..."

# Vérifier que Docker est installé.
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    exit 1
fi

# Charger les variables d'environnement.
if [ -f .env.staging ]; then
    export $(cat .env.staging | xargs)
fi

# Arrêter les anciens conteneurs.
echo "🛑 Arrêt des anciens conteneurs..."
docker-compose -f docker-compose.staging.yml down

# Construire les images.
echo "🔨 Construction des images..."
docker-compose -f docker-compose.staging.yml build

# Démarrer les services.
echo "⚙️ Démarrage des services..."
docker-compose -f docker-compose.staging.yml up -d

# Attendre que les services soient prêts.
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier la santé des services.
echo "✅ Vérification de l'état des services..."
docker-compose -f docker-compose.staging.yml ps

# Afficher les URLs.
echo ""
echo "🌐 URLs d'accès :"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo "   Gateway: http://localhost:8000"
echo ""
echo "✅ Déploiement en staging réussi."

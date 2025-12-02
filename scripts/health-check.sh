#!/bin/bash

# Script de vérification de la santé des services.

echo "Vérification de la santé des services..."
echo ""

# Fonction pour vérifier un service.
check_service() {
  local service=$1
  local url=$2
  local port=$3
  
  if curl -f -s "$url" > /dev/null 2>&1; then
    echo "OK $service: EN LIGNE (port $port)"
  else
    echo "ERREUR $service: HORS LIGNE (port $port)"
  fi
}

# Vérifier les services.
check_service "Frontend" "http://localhost:3000" "3000"
check_service "Backend" "http://localhost:5000/api/products" "5000"
check_service "MongoDB" "mongodb://localhost:27017" "27017"
check_service "Notifications" "http://localhost:4002" "4002"
check_service "Stock Management" "http://localhost:4003" "4003"
check_service "Gateway" "http://localhost:8000" "8000"
check_service "Prometheus" "http://localhost:9090" "9090"
check_service "Grafana" "http://localhost:3001" "3001"

echo ""
echo "Vérification terminée."

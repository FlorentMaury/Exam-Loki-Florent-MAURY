#!/bin/bash

# Script pour afficher les métriques Prometheus en temps réel.

echo "Supervision Prometheus en temps réel..."
echo ""

# Fonction pour afficher les alertes critiques.
show_critical_alerts() {
  echo "Alertes critiques:"
  curl -s http://localhost:9090/api/v1/alerts | \
    jq '.data.alerts[] | select(.labels.severity=="critical")'
  echo ""
}

# Fonction pour afficher l'état des services.
show_service_status() {
  echo "État des services:"
  curl -s http://localhost:9090/api/v1/query?query=up | \
    jq '.data.result[] | {job: .metric.job, status: .value[1]}'
  echo ""
}

# Fonction pour afficher l'utilisation des ressources.
show_resource_usage() {
  echo "Utilisation des ressources:"
  curl -s http://localhost:9090/api/v1/query?query=container_memory_usage_bytes | \
    jq '.data.result[] | {container: .metric.name, memory_mb: (.value[1] / 1024 / 1024 | floor)}'
  echo ""
}

# Boucle infinie pour afficher les mises à jour.
while true; do
  clear
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "SUPERVISION - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  show_critical_alerts
  show_service_status
  show_resource_usage
  
  sleep 10
done

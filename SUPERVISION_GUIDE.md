# Guide de Supervision et Alertes

## Outils de supervision utilisés

- **Prometheus** : Collecte des métriques (port 9090).
- **AlertManager** : Gestion des alertes (port 9093).
- **Grafana** : Visualisation des métriques (port 3001).

## Accès aux interfaces

### Staging

- Prometheus : http://localhost:9090
- AlertManager : http://localhost:9093
- Grafana : http://localhost:3001 (admin/admin)

### Production

- Prometheus : https://prometheus.example.com
- AlertManager : https://alertmanager.example.com
- Grafana : https://grafana.example.com

## Métriques collectées

- Taux de requêtes HTTP par seconde.
- Latence des requêtes (95e centile).
- Taux d'erreurs HTTP 5xx.
- Utilisation CPU et mémoire.
- Espace disque disponible.
- Statut de MongoDB.
- Connexions actives à MongoDB.

## Alertes configurées

| Alerte | Seuil | Sévérité | Action |
|--------|-------|----------|--------|
| Container Down | Service arrêté plus de 2 minutes | Critique | Slack et PagerDuty |
| High Error Rate | Erreurs 5xx supérieures à 5 pourcent | Avertissement | Slack |
| High Latency | Latence 95e centile supérieure à 2 secondes | Avertissement | Slack |
| High CPU Usage | CPU supérieur à 80 pourcent | Avertissement | Slack |
| Low Disk Space | Disque inférieur à 10 pourcent | Critique | Slack et PagerDuty |
| MongoDB Down | Base de données indisponible plus de 2 minutes | Critique | Slack et PagerDuty |
| High MongoDB Connections | Plus de 80 connexions actives | Avertissement | Slack |

## Configuration des notifications

### Slack

1. Créer un webhook Slack sur https://api.slack.com/messaging/webhooks
2. Ajouter SLACK_WEBHOOK_URL à .env
3. Redémarrer AlertManager : docker-compose restart alertmanager

### PagerDuty

1. Créer une intégration PagerDuty
2. Ajouter PAGERDUTY_SERVICE_KEY à .env.production
3. Redémarrer AlertManager : docker-compose restart alertmanager

## Commandes utiles

```bash
# Lancer la supervision.
npm run monitor:prometheus

# Vérifier la santé des services.
npm run health:check

# Voir les logs Prometheus.
docker-compose logs -f prometheus

# Voir les logs AlertManager.
docker-compose logs -f alertmanager

# Voir les logs Grafana.
docker-compose logs -f grafana

# Redémarrer la supervision complète.
docker-compose restart prometheus alertmanager grafana
```

## Tableau de bord Grafana

### Créer un dashboard personnalisé

1. Accéder à http://localhost:3001
2. Se connecter (admin/admin)
3. Créer un nouveau dashboard
4. Ajouter des panneaux avec les requêtes Prometheus

### Exemples de requêtes Prometheus

```promql
# Taux de requêtes HTTP par seconde.
rate(http_requests_total[5m])

# Latence 95e centile.
histogram_quantile(0.95, http_request_duration_seconds)

# Taux d'erreurs HTTP 5xx.
rate(http_requests_total{status=~"5.."}[5m])

# Utilisation mémoire moyenne.
avg(container_memory_usage_bytes) / 1024 / 1024
```

## Dépannage

### Prometheus ne démarre pas

Vérifier la syntaxe YAML des fichiers de configuration :

```bash
# Pour prometheus.yml
docker run --rm -v $(pwd):/etc/prometheus prom/prometheus:latest promtool check config /etc/prometheus/prometheus.yml

# Pour alert-rules.yml
docker run --rm -v $(pwd):/etc/prometheus prom/prometheus:latest promtool check rules /etc/prometheus/alert-rules.yml
```

### Pas d'alertes reçues

1. Vérifier le webhook Slack est accessible
2. Vérifier la connexion réseau
3. Vérifier les logs AlertManager : docker-compose logs alertmanager
4. Tester AlertManager : curl -X POST http://localhost:9093/api/v1/alerts

### Métriques manquantes

Vérifier que le backend expose l'endpoint /metrics :

```bash
curl http://localhost:5000/metrics
```

## Maintenance

### Nettoyer les anciennes données Prometheus

Par défaut, les données sont conservées 30 jours en production. Pour les nettoyer manuellement :

```bash
docker-compose stop prometheus
docker volume rm exam_prometheus_data_prod
docker-compose start prometheus
```

### Sauvegarder les tableaux de bord Grafana

1. Accéder à http://localhost:3001
2. Menu principal > Dashboards > Gérer les dashboards
3. Exporter chaque dashboard en JSON
4. Stocker dans un dépôt Git

## Variables d'environnement requises

```env
# Staging
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Production
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_SERVICE_KEY=your_pagerduty_key_here
GRAFANA_ADMIN_PASSWORD=secure_password_here
GRAFANA_ROOT_URL=https://grafana.example.com
```

## Intégration avec CI/CD

Les alertes de Prometheus peuvent être intégrées dans les pipelines CI/CD :

1. Vérifier que Prometheus est opérationnel
2. Exécuter les requêtes Prometheus pour valider les métriques
3. Générer des rapports d'alerte avant le déploiement

Exemple de script :

```bash
#!/bin/bash

# Vérifier que Prometheus est accessible.
curl -f http://localhost:9090/api/v1/query?query=up || exit 1

# Vérifier qu'il n'y a pas d'alertes critiques.
CRITICAL_ALERTS=$(curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.severity=="critical")')

if [ ! -z "$CRITICAL_ALERTS" ]; then
  echo "Alertes critiques détectées. Déploiement annulé."
  exit 1
fi

echo "Toutes les vérifications passées. Déploiement autorisé."
```

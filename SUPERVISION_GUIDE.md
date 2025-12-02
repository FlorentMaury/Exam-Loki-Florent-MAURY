# Guide d'implémentation de la supervision et des alertes.

## 1. Introduction à la supervision.

La supervision des services est un processus essentiel pour maintenir la qualité et la disponibilité d'une application en production. Elle permet de collecter des métriques, de détecter les anomalies et de générer des alertes en cas de problème.

### 1.1 Objectifs de la supervision.

- Collecter les métriques de performance des services.
- Détecter les défaillances des services de manière automatique.
- Générer des alertes en temps réel aux équipes responsables.
- Fournir des données historiques pour l'analyse des tendances.
- Faciliter le débogage et l'identification des goulots d'étranglement.

### 1.2 Outils utilisés.

Trois outils principaux sont utilisés pour la supervision de cette application.

1. Prometheus: Collecte les métriques de tous les services.
2. AlertManager: Gère les règles d'alerte et les notifications.
3. Grafana: Visualise les métriques collectées par Prometheus.

## 2. Architecture de la supervision.

### 2.1 Architecture générale.

La supervision fonctionne selon un modèle pull-based où Prometheus interroge les endpoints de métriques des services à intervalles réguliers.

### 2.2 Composants principaux.

Prometheus collecte les données toutes les 15 secondes en se connectant aux endpoints /metrics des services. AlertManager évalue les règles d'alerte toutes les 30 secondes et envoie les notifications via Slack ou PagerDuty. Grafana se connecte à Prometheus pour afficher les tableaux de bord.

### 2.3 Flux de données.

```
Services -> /metrics -> Prometheus -> AlertManager -> Notifications
                            |
                            v
                        Grafana (visualisation)
```

## 3. Configuration de Prometheus.

### 3.1 Rôle de Prometheus.

Prometheus est un système de surveillance qui collecte les métriques en temps réel. Il stocke les données de manière persistante et permet de les interroger via une API.

### 3.2 Configuration des scrape configs.

Le fichier prometheus.yml doit contenir les configurations pour chaque service à monitorer.

Chaque service expose ses métriques sur un endpoint /metrics ou sur un port spécifique. Prometheus se connecte à ces endpoints à des intervalles réguliers pour récupérer les données.

### 3.3 Services monitorés.

Les services suivants sont monitorés dans cette application.

- Backend Express sur le port 5000 avec l'endpoint /metrics.
- Frontend React sur le port 3000.
- MongoDB sur le port 27017.
- Microservice notifications sur le port 4002.
- Microservice stock-management sur le port 4003.
- Gateway sur le port 8000.

Les intervalles de scrape sont définis à 15 secondes avec une évaluation des alertes toutes les 30 secondes.

### 3.4 Stockage des données.

Prometheus stocke les données au format TSDB (Time Series Database) dans le répertoire /prometheus. En production, les données sont conservées pendant 30 jours. En préproduction, aucune limite de rétention n'est définie.

## 4. Métriques collectées.

### 4.1 Métriques par défaut.

Prometheus collecte automatiquement les métriques Go telles que la mémoire utilisée, le nombre de goroutines et les stats du garbage collector.

### 4.2 Métriques personnalisées du backend.

Le backend Express expose des métriques personnalisées via la bibliothèque prom-client.

```
http_request_duration_seconds: Mesure le temps de réponse des requêtes HTTP en secondes.
http_requests_total: Compteur du nombre total de requêtes HTTP par méthode, route et code de statut.
```

### 4.3 Labels des métriques.

Chaque métrique est associée à des labels pour faciliter le regroupement et le filtrage.

```
method: Méthode HTTP (GET, POST, PUT, DELETE, etc).
route: Route de l'API (/api/products, /api/orders, etc).
status_code: Code HTTP de réponse (200, 404, 500, etc).
```

### 4.4 Histogrammes de latence.

Les latences sont regroupées dans des buckets pour calculer les centiles.

```
Buckets: 0.1s, 0.5s, 1s, 2s, 5s
```

## 5. Règles d'alerte.

### 5.1 Objectif des règles d'alerte.

Les règles d'alerte évaluent les métriques Prometheus et génèrent des alertes lorsque les conditions sont remplies.

### 5.2 Anatomie d'une règle d'alerte.

Une règle d'alerte contient les éléments suivants.

1. alert: Nom unique de l'alerte.
2. expr: Expression Prometheus pour évaluer la condition.
3. for: Durée minimale avant de déclencher l'alerte.
4. labels: Étiquettes pour catégoriser l'alerte (severity).
5. annotations: Messages descriptifs pour les administrateurs.

### 5.3 Alerte ContainerDown.

L'alerte ContainerDown se déclenche lorsqu'un service n'est pas accessible pendant 2 minutes.

```
Condition: up == 0
Durée: 2 minutes
Sévérité: critique
Message: Le conteneur X est arrêté depuis 2 minutes.
```

### 5.4 Alerte HighErrorRate.

L'alerte HighErrorRate se déclenche lorsque le taux d'erreur HTTP dépasse 5 pourcent.

```
Condition: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
Durée: 5 minutes
Sévérité: avertissement
Message: Le taux d'erreur HTTP 5xx dépasse 5 pourcent.
```

### 5.5 Alerte HighLatency.

L'alerte HighLatency se déclenche lorsque la latence du 95e centile dépasse 2 secondes.

```
Condition: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
Durée: 5 minutes
Sévérité: avertissement
Message: La latence API dépasse 2 secondes.
```

### 5.6 Alerte HighCPUUsage.

L'alerte HighCPUUsage se déclenche lorsque l'utilisation CPU dépasse 80 pourcent.

```
Condition: (100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
Durée: 10 minutes
Sévérité: avertissement
Message: L'utilisation CPU dépasse 80 pourcent.
```

### 5.7 Alerte LowDiskSpace.

L'alerte LowDiskSpace se déclenche lorsque l'espace disque disponible est inférieur à 10 pourcent.

```
Condition: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) < 0.1
Durée: 5 minutes
Sévérité: critique
Message: L'espace disque disponible est inférieur à 10 pourcent.
```

### 5.8 Alerte MongoDBDown.

L'alerte MongoDBDown se déclenche lorsque MongoDB n'est pas accessible pendant 2 minutes.

```
Condition: up{job="mongodb"} == 0
Durée: 2 minutes
Sévérité: critique
Message: La base de données MongoDB est indisponible.
```

## 6. Configuration d'AlertManager.

### 6.1 Rôle d'AlertManager.

AlertManager reçoit les alertes de Prometheus et les route vers les destinataires appropriés en fonction des règles de routage.

### 6.2 Configuration du routage.

Le routage d'AlertManager est hiérarchique et basé sur les labels des alertes.

```
Route par défaut: #monitoring Slack
Route critique: #critical-alerts Slack et PagerDuty
Route avertissement: #warning-alerts Slack
```

### 6.3 Récepteurs Slack.

Slack est utilisé pour recevoir les notifications d'alerte. Un webhook Slack doit être configuré pour chaque canal.

Pour les alertes critiques, le canal est #critical-alerts. Pour les avertissements, c'est #warning-alerts.

### 6.4 Récepteurs PagerDuty.

PagerDuty est utilisé en production pour les alertes critiques. Elle permet de créer des incidents et de les assigner aux équipes sur appel.

### 6.5 Configuration des templates.

Les templates permettent de personnaliser les messages d'alerte. Ils peuvent inclure des variables Prometheus comme le nom du service ou la valeur de la métrique.

## 7. Supervision en environnement staging.

### 7.1 Configuration spécifique au staging.

En staging, tous les services s'exécutent localement dans Docker. Prometheus scrape sur localhost ou sur les noms d'hôtes des conteneurs.

### 7.2 Docker Compose pour staging.

Le fichier docker-compose.staging.yml inclut Prometheus, AlertManager et Grafana comme services supplémentaires.

- Prometheus sur le port 9090.
- AlertManager sur le port 9093.
- Grafana sur le port 3001.

### 7.3 Volumes de données en staging.

Les données Prometheus et AlertManager sont stockées dans des volumes Docker nommés.

```
prometheus_data_preprod
alertmanager_data_preprod
grafana_data_preprod
```

### 7.4 Accès aux interfaces en staging.

Les interfaces web sont accessibles sur localhost.

```
Prometheus: http://localhost:9090
AlertManager: http://localhost:9093
Grafana: http://localhost:3001
```

### 7.5 Webhook Slack en staging.

Le webhook Slack est défini via la variable d'environnement SLACK_WEBHOOK_URL dans .env.staging.

## 8. Supervision en environnement production.

### 8.1 Configuration spécifique à la production.

En production, les services s'exécutent sur des serveurs distants. Prometheus scrape sur les adresses IP ou noms de domaine des services.

### 8.2 Docker Compose pour production.

Le fichier docker-compose.prod.yml inclut la même configuration que staging avec des paramètres optimisés pour la production.

- Restart policy: always pour redémarrage automatique.
- Logging: json-file avec rotation des logs.
- Rétention des données: 30 jours pour Prometheus.

### 8.3 Volumes de données en production.

Les données Prometheus incluent des sauvegardes et une rétention longue durée.

```
prometheus_data_prod: Stockage principal des métriques.
alertmanager_data_prod: Stockage des alertes silencieuses et des groupes.
grafana_data_prod: Tableaux de bord et sources de données.
mongo_backup_prod: Sauvegardes MongoDB.
```

### 8.4 Accès aux interfaces en production.

Les interfaces web sont accessibles via des URLs sécurisées en HTTPS.

```
Prometheus: https://prometheus.example.com
AlertManager: https://alertmanager.example.com
Grafana: https://grafana.example.com
```

### 8.5 Authentification en production.

Grafana est protégée par une authentification administrateur. Les identifiants par défaut doivent être changés.

```
Utilisateur: admin
Mot de passe: Variable d'environnement GRAFANA_ADMIN_PASSWORD
```

### 8.6 Notifications PagerDuty en production.

En production, les alertes critiques sont envoyées à PagerDuty pour créer des incidents.

La clé de service PagerDuty est définie via la variable d'environnement PAGERDUTY_SERVICE_KEY.

## 9. Configuration du backend pour l'exposition de métriques.

### 9.1 Installation de prom-client.

La bibliothèque prom-client permet au backend d'exposer des métriques Prometheus.

```bash
npm install prom-client
```

### 9.2 Initialisation des collecteurs par défaut.

Prom-client fournit des collecteurs par défaut pour les métriques Go.

```
Mémoire utilisée
Nombre de goroutines
Statistiques du garbage collector
```

### 9.3 Définition des métriques personnalisées.

Les métriques personnalisées sont définies comme des histogrammes ou des compteurs.

Un histogramme mesure la distribution des valeurs. Un compteur incrémente un entier.

### 9.4 Middleware Prometheus dans Express.

Un middleware Express enregistre les métriques de chaque requête HTTP.

```
Durée de la requête
Code de statut HTTP
Méthode HTTP
Route demandée
```

### 9.5 Endpoint /metrics.

Le backend expose les métriques sur le chemin /metrics. Prometheus scrape cet endpoint régulièrement.

```
GET /metrics: Retourne toutes les métriques au format Prometheus.
```

### 9.6 Format des métriques.

Les métriques sont exposées au format texte Prometheus. Chaque ligne représente une observation ou un échantillon.

```
# HELP http_request_duration_seconds Durée des requêtes HTTP en secondes.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/products",status_code="200",le="0.1"} 5
```

## 10. Procédures de supervision en staging.

### 10.1 Lancement de la supervision.

La supervision peut être lancée via un script npm ou directement via docker-compose.

```bash
npm run start:all
```

### 10.2 Vérification du statut des services.

Après le lancement, vérifier que tous les services Prometheus scrape correctement.

```bash
curl http://localhost:9090/api/v1/targets
```

### 10.3 Test des alertes.

Pour tester les alertes, des métriques fictives peuvent être créées manuellement via curl.

```bash
curl -X POST http://localhost:9090/api/v1/write -d 'test_metric 42'
```

### 10.4 Monitoring des logs en temps réel.

Un script bash permet de surveiller les logs en temps réel.

```bash
npm run monitor:logs
```

### 10.5 Vérification de la santé des services.

Un script bash vérifie que tous les services répondent correctement.

```bash
npm run health:check
```

## 11. Procédures de supervision en production.

### 11.1 Déploiement de la supervision.

La supervision est déployée automatiquement via les pipelines CI/CD.

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 11.2 Vérification de la configuration.

Avant le déploiement, les fichiers de configuration YAML doivent être validés.

```bash
promtool check config prometheus.yml
promtool check rules alert-rules.yml
```

### 11.3 Accès à distance aux interfaces.

Les interfaces Prometheus, AlertManager et Grafana sont accessibles via des URLs externes sécurisées en HTTPS.

### 11.4 Surveillance du stockage des données.

En production, l'espace disque utilisé par Prometheus doit être surveillé. La rétention des données est limitée à 30 jours.

### 11.5 Maintenance des alertes.

Les alertes doivent être régulièrement examinées pour éviter les faux positifs. Les seuils peuvent être ajustés selon l'expérience.

## 12. Utilisateurs et droits d'accès.

### 12.1 Rôles de supervision.

Plusieurs rôles peuvent accéder à la supervision en fonction de leurs responsabilités.

- Administrateur: Accès complet à Prometheus, AlertManager et Grafana.
- Opérateur: Accès en lecture à Prometheus et Grafana. Modification des silences d'alerte.
- Développeur: Accès en lecture uniquement à Prometheus et Grafana.

### 12.2 Authentification Grafana.

Grafana utilise une base de données interne pour gérer les utilisateurs. Un administrateur par défaut est créé lors du déploiement.

### 12.3 Authentification AlertManager.

AlertManager n'a pas d'authentification native. L'accès doit être restreint au niveau du pare-feu ou du proxy inverse.

## 13. Maintenance de la supervision.

### 13.1 Nettoyage des anciennes données.

Les données Prometheus plus anciennes que la période de rétention sont supprimées automatiquement.

Pour forcer le nettoyage manuellement.

```bash
docker-compose stop prometheus
docker volume rm exam_prometheus_data_prod
docker-compose start prometheus
```

### 13.2 Sauvegarde des tableaux de bord Grafana.

Les tableaux de bord Grafana doivent être exportés régulièrement en JSON.

```
Menu principal > Dashboards > Gérer les dashboards > Exporter
```

### 13.3 Mise à jour des seuils d'alerte.

Les seuils d'alerte doivent être ajustés en fonction de l'expérience et de l'évolution de l'application.

Les modifications doivent être validées en staging avant d'être déployées en production.

### 13.4 Restauration après incident.

En cas d'incident, les données Prometheus peuvent être restaurées à partir des snapshots.

```bash
docker-compose exec prometheus promtool tsdb dump /prometheus > backup.db
```

## 14. Métriques clés à surveiller.

### 14.1 Disponibilité des services.

La métrique up indique si un service est accessible.

```
up{job="backend"} == 1: Le backend est disponible.
up{job="backend"} == 0: Le backend est indisponible.
```

### 14.2 Latence des requêtes.

La latence est mesurée en secondes via l'histogramme http_request_duration_seconds.

Le 50e centile représente la médiane. Le 95e centile représente les requêtes lentes.

### 14.3 Taux de requêtes.

Le taux de requêtes est calculé en utilisant la fonction rate() sur le compteur http_requests_total.

```
rate(http_requests_total[5m]): Requêtes par seconde en moyenne.
```

### 14.4 Taux d'erreurs.

Le taux d'erreur HTTP 5xx est calculé en filtrant les requêtes avec status_code >= 500.

```
rate(http_requests_total{status_code=~"5.."}[5m]): Erreurs serveur par seconde.
```

### 14.5 Utilisation des ressources.

L'utilisation CPU et mémoire doit être surveillée pour identifier les goulots d'étranglement.

```
process_resident_memory_bytes: Mémoire utilisée par le processus.
rate(process_cpu_seconds_total[5m]): Utilisation CPU en pourcentage.
```

## 15. Dépannage de la supervision.

### 15.1 Prometheus ne démarre pas.

Vérifier la syntaxe YAML du fichier de configuration prometheus.yml.

```bash
docker run --rm -v $(pwd):/etc/prometheus prom/prometheus:latest promtool check config /etc/prometheus/prometheus.yml
```

### 15.2 AlertManager ne reçoit pas les alertes.

Vérifier que Prometheus est en cours d'exécution et que les règles d'alerte sont correctement chargées.

```bash
curl http://localhost:9090/api/v1/alerts
```

### 15.3 Pas de notifications Slack.

Vérifier que le webhook Slack est correct et que la connexion réseau est fonctionnelle.

```bash
curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test"}'
```

### 15.4 Pas de métriques dans Prometheus.

Vérifier que le backend expose les métriques sur le port 5000.

```bash
curl http://localhost:5000/metrics
```

### 15.5 Grafana ne peut pas se connecter à Prometheus.

Vérifier que Prometheus est accessible depuis le conteneur Grafana.

```bash
docker-compose exec grafana curl http://prometheus:9090
```

## 16. Conclusion.

La supervision des services est essentielle pour maintenir la qualité et la disponibilité de l'application. Les outils Prometheus, AlertManager et Grafana fournissent une solution complète pour collecter, évaluer et visualiser les métriques.

La configuration doit être adaptée à chaque environnement. Les seuils d'alerte doivent être ajustés en fonction de l'expérience. Les alertes doivent être surveillées pour éviter les faux positifs.

La maintenance régulière et le test des procédures d'alerte sont essentiels pour assurer le bon fonctionnement du système de supervision.

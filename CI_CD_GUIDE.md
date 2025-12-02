# Guide CI/CD - Automatisation du déploiement.

## 🔄 Flux de déploiement automatisé.

### Staging (Préproduction).

- **Branche** : `develop`
- **Événement** : Push sur `develop`
- **Actions** :
  1. Construction des images Docker.
  2. Vérification de la santé des services.
  3. Affichage des URLs d'accès.

### Production.

- **Branche** : `main`
- **Événement** : Push sur `main` ou création d'un tag.
- **Actions** :
  1. Construction des images Docker avec versioning.
  2. Vérification de la santé des services.
  3. Affichage des URLs d'accès.

## 🚀 Lancer un déploiement.

### Déploiement manuel en staging.

```bash
npm run deploy:staging
```

### Déploiement manuel en production.

```bash
npm run deploy:production
```

### Déploiement via Git.

```bash
# Staging - Push sur develop.
git push origin develop

# Production - Push sur main.
git push origin main
```

## 📊 Suivi du déploiement.

Consultez l'onglet **Actions** dans votre dépôt GitHub pour voir l'état de chaque déploiement.

## ✅ Fichiers de configuration créés.

- `.github/workflows/staging.yml` : Pipeline de déploiement en staging.
- `.github/workflows/production.yml` : Pipeline de déploiement en production.
- `.github/workflows/test.yml` : Tests de construction avant déploiement.
- `scripts/deploy-staging.sh` : Script local de déploiement en staging.
- `scripts/deploy-production.sh` : Script local de déploiement en production.

## ❌ Dépannage.

- **Erreur de construction Docker** : Vérifiez que les Dockerfiles sont valides.
- **Erreur de démarrage des services** : Consultez les logs avec `docker-compose logs`.
- **Erreur de configuration** : Vérifiez les fichiers `.env.staging` et `.env.production`.

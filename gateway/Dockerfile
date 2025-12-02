# Dockerfile pour le gateway.
FROM node:20-alpine

# Définir le répertoire de travail.
WORKDIR /app

# Copier les fichiers package.
COPY package*.json ./

# Installer les dépendances.
RUN npm install --production

# Copier le code source.
COPY . .

# Exposition du port par défaut.
EXPOSE 8000

# Variable d'environnement pour le mode production.
ENV NODE_ENV=production

# Commande de démarrage flexible.
CMD ["node", "server.js"]

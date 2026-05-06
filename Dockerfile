# Frontend Dockerfile — React + Vite + Nginx
# Étape 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier SEULEMENT package files d'abord (pour le cache Docker)
COPY package*.json ./
RUN npm install

# Puis copier le reste du code
COPY . .
RUN npm run build

# Étape 2: Serveur Nginx
FROM nginx:alpine

# Copier le build dans nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
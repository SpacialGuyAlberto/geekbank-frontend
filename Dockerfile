FROM node:18-alpine AS build
WORKDIR /app

# Copia los archivos del proyecto desde tu path local
COPY C:/Users/LuisA/Documents/GeekCoin/geekbank-frontend/package*.json ./
RUN npm install

COPY C:/Users/LuisA/Documents/GeekCoin/geekbank-frontend/ ./
RUN npm run build --prod

# Fase para servir con NGINX
FROM nginx:alpine
COPY --from=build /app/dist/geekbank-frontend /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]


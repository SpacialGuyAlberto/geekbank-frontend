# Etapa 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# 1. Instalamos las dependencias necesarias para compilar librerías nativas (como canvas)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

COPY package*.json ./

# 2. Instalamos las dependencias de node
RUN npm install

COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor Nginx (Esta se mantiene igual y ligera)
FROM nginx:alpine
# Ajusta 'geekbank-frontend' al nombre real de tu carpeta en /dist
COPY --from=build /app/dist/geekbank-frontend /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } location /api/ { proxy_pass http://app:8080; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

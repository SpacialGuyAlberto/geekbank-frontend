# Etapa 1: Build
FROM node:20-alpine AS build
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
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve app with nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
# COPY --from=build /app/dist/geekbank-frontend/browser /usr/share/nginx/html
# Note: Ensure the path matches your actual build output. 
# If angular.json "outputPath" is just "dist/geekbank-frontend", 
# and it uses the "application" builder, it usually creates a "browser" subdir.
COPY --from=build /app/dist/geekbank-frontend/browser /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

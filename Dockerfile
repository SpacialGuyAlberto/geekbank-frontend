# Stage 1: Build/Dev
FROM node:20-alpine AS build
WORKDIR /app

# Install system dependencies for canvas and other native modules
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev


# Install dependencies first (caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Stage 2: Production Nginx (Optional, for 'docker build' usage)
FROM nginx:alpine AS production
COPY --from=build /app/dist/geekbank-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

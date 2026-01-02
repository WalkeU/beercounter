FROM node:20-alpine AS builder

WORKDIR /app

# Package files másolása
COPY package*.json ./

# Függőségek telepítése
RUN npm ci

# Forráskód másolása
COPY . .

# Build
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Build eredmény másolása
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx konfig másolása
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

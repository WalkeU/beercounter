FROM node:20-alpine AS builder

WORKDIR /app

# Package files másolása
COPY package*.json ./

# Production dependencies telepítése
RUN npm ci --only=production

# Forráskód másolása
COPY . .

# Final stage
FROM node:20-alpine

WORKDIR /app

# Csak a szükséges fájlok másolása a builder stage-ből
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Non-root user használata
USER node

EXPOSE 3001

CMD ["npm", "start"]

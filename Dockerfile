# ── Etapa 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variables de entorno necesarias solo en tiempo de build (Next.js las requiere)
ARG DB_HOST=localhost
ARG DB_PORT=3306
ARG DB_USER=root
ARG DB_PASSWORD=
ARG DB_NAME=glpi

ENV DB_HOST=$DB_HOST \
  DB_PORT=$DB_PORT \
  DB_USER=$DB_USER \
  DB_PASSWORD=$DB_PASSWORD \
  DB_NAME=$DB_NAME

RUN npm run build

# ── Etapa 2: Runner (imagen mínima con standalone) ────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0

# Archivos generados por Next.js standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# El servidor standalone de Next.js no usa npm start
CMD ["node", "server.js"]
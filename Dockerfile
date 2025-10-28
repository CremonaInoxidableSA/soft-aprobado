FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm prune --production

# Copiar el resto del código
COPY . .

# Build de Next.js
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar archivos necesarios desde la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tsconfig.json ./

# Puerto por defecto de Next.js
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]
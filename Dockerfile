FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Copiar el archivo de Excel (si existe en el proyecto)
COPY ./data/RP_Software_Aprobado.xlsx ./data/RP_Software_Aprobado.xlsx

# Lint y formateo de código
RUN npx eslint --fix . && \
  npx prettier --write .

# Build de Next.js
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar archivos necesarios desde la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data/RP_Software_Aprobado.xlsx ./data/RP_Software_Aprobado.xlsx

# Puerto por defecto de Next.js
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]
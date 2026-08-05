# NestJS 11 + TypeORM 0.3 funcionan bien en Node 20 LTS
FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar la cache)
COPY package*.json ./

# npm ci: instalacion reproducible a partir del lockfile
RUN npm ci

# Copiamos el resto del codigo (.dockerignore excluye node_modules, .env, etc.)
COPY . .

# Compilamos el proyecto (genera dist/, incluye las migraciones compiladas)
RUN npm run build

# main.ts hace app.listen(3001, ...)
EXPOSE 3001

# Las migraciones corren solas al arrancar (migrationsRun: true en app.module.ts)
CMD ["npm", "run", "start:prod"]

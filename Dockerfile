# Usamos una versión ligera de Node
FROM node:18-alpine

# Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar la caché)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto (NestJS necesita build)
RUN npm run build

# Exponemos el puerto (NestJS suele usar el 3000)
EXPOSE 3000

# Comando para iniciar en producción
CMD ["npm", "run", "start:prod"]
# ========= base =========
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ========= dev =========
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 3000
# nodemon opcional, Nest ya hace watch con start:dev
# CMD se define en compose (migraciones + start:dev)

# ========= prod =========
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/dist ./dist
COPY .env .env
EXPOSE 3000
CMD sh -c "npm run migration:run && node dist/main.js"

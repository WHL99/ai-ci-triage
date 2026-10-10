ARG NODE_VERSION

# ===== first stage: build =====
FROM node:${NODE_VERSION}-alpine3.23 AS build
WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci

COPY ./src/ ./src/
COPY ./tsconfig.build.json ./
COPY ./tsconfig.json ./
RUN npm run build

# ===== second stage: runtime =====
FROM node:${NODE_VERSION}-alpine3.23
WORKDIR /app

COPY --from=build /app/dist/ ./dist/
COPY ./package.json ./

USER node
EXPOSE 3000
CMD ["node","./dist/server.js"]

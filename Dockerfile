FROM node:22-alpine AS build
WORKDIR /repo
COPY package*.json ./
COPY app/package.json app/
COPY server/package.json server/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY package*.json ./
COPY app/package.json app/
COPY server/package.json server/
RUN npm ci --omit=dev
COPY --from=build /repo/app/dist app/dist
COPY --from=build /repo/server/dist server/dist
EXPOSE 8080
CMD ["node", "server/dist/index.js"]

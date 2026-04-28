FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY packages/frontend/package.json packages/frontend/
COPY packages/backend/package.json packages/backend/
RUN pnpm install

FROM base AS frontend-build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY pnpm-workspace.yaml package.json ./
COPY packages/frontend/ packages/frontend/
RUN cd packages/frontend && pnpm run build

FROM base AS backend-build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY pnpm-workspace.yaml package.json ./
COPY packages/backend/ packages/backend/
RUN cd packages/backend && pnpm run build

FROM node:20-alpine AS backend-runtime
WORKDIR /app
COPY --from=backend-build /app/packages/backend/package.json ./
COPY --from=backend-build /app/packages/backend/dist ./dist
RUN npm install --omit=dev
EXPOSE 3001
CMD ["node", "dist/index.js"]

FROM nginx:alpine AS frontend-runtime
COPY --from=frontend-build /app/packages/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

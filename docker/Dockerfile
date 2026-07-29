ARG BASE_IMAGE_PREFIX=docker.1ms.run/library

FROM ${BASE_IMAGE_PREFIX}/node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml ./
COPY packages/frontend/package.json packages/frontend/
COPY packages/backend/package.json packages/backend/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS frontend-build
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_TRACES_SAMPLE_RATE
ARG VITE_SENTRY_TEST_EVENT
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
ENV VITE_SENTRY_TRACES_SAMPLE_RATE=${VITE_SENTRY_TRACES_SAMPLE_RATE}
ENV VITE_SENTRY_TEST_EVENT=${VITE_SENTRY_TEST_EVENT}
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

FROM ${BASE_IMAGE_PREFIX}/node:20-alpine AS backend-runtime
WORKDIR /app
COPY --from=backend-build /app/packages/backend/package.json ./
COPY --from=backend-build /app/packages/backend/dist ./dist
RUN npm install --omit=dev
EXPOSE 3001
CMD ["node", "dist/index.js"]

FROM harbor.17usoft.com/bx/base/nginx:alpine AS frontend-runtime
COPY --from=frontend-build /app/packages/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

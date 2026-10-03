# =========================
# Stage 1 - Build
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm run build:server


# =========================
# Stage 2 - Production
# =========================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-dist ./server-dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider \
  http://127.0.0.1:3000/api/health || exit 1

USER node

CMD ["node", "server-dist/server.js"]
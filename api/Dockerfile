# syntax=docker/dockerfile:1
#
# Multi-stage build for the NestJS API.
# Build context is the REPOSITORY ROOT (see docker-compose.yml), because the
# service reads the SQL query files at runtime from `process.cwd()/../sql`, so
# the `sql/` directory must be copied into the image alongside the app.

# ---- Build stage: install all deps and compile with bun ----
FROM oven/bun:1 AS builder
WORKDIR /app
COPY api/package.json api/bun.lock ./
RUN bun install --frozen-lockfile
COPY api/ ./
RUN bun run build

# ---- Production deps stage: only runtime dependencies ----
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY api/package.json api/bun.lock ./
RUN bun install --frozen-lockfile --production

# ---- Runtime stage: minimal node image ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY api/package.json ./

# SQL query files are read at runtime via process.cwd()/../sql/<file>.
# With WORKDIR=/app that resolves to /sql, so the directory is placed there.
COPY sql/ /sql/

# Drop privileges: the bundled `node` user owns nothing it needs to write.
USER node

EXPOSE 3000
CMD ["node", "dist/main"]

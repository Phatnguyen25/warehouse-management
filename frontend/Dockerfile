# ============================================================
# Frontend — Multi-stage Dockerfile
# Stage 1: deps    → install dependencies fresh in Linux
# Stage 2: builder → build Next.js standalone
# Stage 3: runner  → minimal runtime image (non-root)
# ============================================================

# Stage 1: Install dependencies (Linux-native)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files only (node_modules excluded via .dockerignore)
COPY package.json package-lock.json ./

# Install all deps fresh (ignores Windows-built node_modules via .dockerignore)
RUN npm install --frozen-lockfile || npm install


# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (Linux binaries)
RUN npx prisma generate

# Provide dummy DB URL for build-time static analysis (no actual connection made)
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy_build"
ENV DATABASE_URL=${DATABASE_URL}

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# Stage 3: Production runner (minimal, non-root)
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

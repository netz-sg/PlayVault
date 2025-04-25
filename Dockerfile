FROM --platform=${BUILDPLATFORM:-linux/amd64} node:20-alpine AS base

# Install dependencies only when needed
FROM --platform=${BUILDPLATFORM:-linux/amd64} base AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then \
    # Force install due to React 19 incompatibilities with some packages
    npm install --force; \
  elif [ -f pnpm-lock.yaml ]; then \
    yarn global add pnpm && pnpm i --frozen-lockfile; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM --platform=${BUILDPLATFORM:-linux/amd64} base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client with required binary targets
ENV PRISMA_SCHEMA_ENGINE_BINARY_PLATFORM=native
ENV PRISMA_QUERY_ENGINE_BINARY_PLATFORM=native
ENV PRISMA_QUERY_ENGINE_LIBRARY_PLATFORM=native
ENV PRISMA_INTROSPECTION_ENGINE_BINARY_PLATFORM=native
ENV PRISMA_FMT_BINARY_PLATFORM=native

# Generate Prisma client with explicit binary targets for all architectures
RUN sed -i 's/binaryTargets.*\]/binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x", "rhel-openssl-3.0.x", "debian-openssl-1.1.x"]/g' prisma/schema.prisma

# Generate Prisma client for all architectures
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install netcat for health check
RUN apk add --no-cache netcat-openbsd

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions
RUN mkdir -p /app/public /app/.next /app/prisma
RUN chown -R nextjs:nodejs /app

# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma engines for ARM64 specifically
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma/client/ ./node_modules/.prisma/client/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma/ ./node_modules/prisma/

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 
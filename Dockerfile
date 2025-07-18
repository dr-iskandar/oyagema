# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install necessary system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Set environment variables to ignore Prisma checksum issues and improve npm behavior
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV npm_config_cache=/tmp/.npm
ENV npm_config_prefer_offline=true

# Clean npm cache and install dependencies
RUN npm cache clean --force && npm ci --only=production --ignore-scripts && npm run prisma:generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files first
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SKIP_DB_OPERATIONS=true
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/oyagema?schema=public
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV npm_config_cache=/tmp/.npm

# Install all dependencies (including dev dependencies for build)
RUN npm cache clean --force && npm ci --ignore-scripts && npm run prisma:generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions
USER nextjs

# Expose port
EXPOSE 8996

# Set port environment variable
ENV PORT=8996

# Start the application
CMD ["node", "server.js"]
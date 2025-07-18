# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Set environment variable to ignore Prisma checksum issues
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data - disable it
ENV NEXT_TELEMETRY_DISABLED=1

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Skip database operations during build
ENV NEXT_PUBLIC_SKIP_DB_OPERATIONS=true
# Mock DATABASE_URL for Prisma during build
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/oyagema?schema=public
# Set environment variable to ignore Prisma checksum issues
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

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
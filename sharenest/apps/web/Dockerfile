# syntax=docker/dockerfile:1
FROM node:18-slim

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Build-time (public) args for Next.js client bundle
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL

# Make them available during build and runtime (public values only)
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Copy monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages

# Install all deps including devDependencies for build
RUN pnpm install --frozen-lockfile --prod=false

# Build internal workspace packages required by web without turbo (ensure db first)
RUN pnpm -w --filter @sharenest/db build && pnpm -w --filter @sharenest/api build && pnpm -w --filter @sharenest/ui build

# Build the web app
WORKDIR /app/apps/web
RUN pnpm build

EXPOSE 8080
# Cloud Run provides $PORT, default to 8080 for local docker run
CMD ["sh","-c","node node_modules/next/dist/bin/next start -p ${PORT:-8080}"]
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
ARG NEXT_PUBLIC_SITE_URL

# Expose public env vars for build/runtime
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Copy monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages

# Install all deps including devDependencies for build
RUN pnpm install --frozen-lockfile --prod=false

# Build internal workspace packages required by admin without turbo
RUN pnpm -w --filter @sharenest/ui build && pnpm -w --filter @sharenest/api build

# Build admin app
WORKDIR /app/apps/admin
RUN pnpm build

EXPOSE 8080
CMD ["sh","-c","node node_modules/next/dist/bin/next start -p ${PORT:-8080}"]
#FROM node:18-bookworm-slim AS base
FROM node:18.18-alpine3.17 AS base

############################################
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

############################################
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src/
#COPY public ./public/
COPY next.config.js ./
COPY package.json package-lock.json ./
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next telemetry disable
RUN npm run build

############################################
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

#COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir ./.next/cache
RUN chown node:node ./.next/cache

USER node

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

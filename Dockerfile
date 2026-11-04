FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .

ARG NUXT_MIMIR_API_BASE_URL=http://127.0.0.1:5000
ARG NUXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
ENV NUXT_MIMIR_API_BASE_URL=${NUXT_MIMIR_API_BASE_URL} \
    NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}

RUN pnpm build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    NITRO_PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

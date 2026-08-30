FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
# Prisma needs OpenSSL to detect the engine target on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .
COPY apps/client/package.json apps/client/
COPY apps/server/package.json apps/server/
COPY apps/server/prisma apps/server/prisma
RUN pnpm install
COPY . .
EXPOSE 5173 4000
CMD ["pnpm", "run", "dev"]

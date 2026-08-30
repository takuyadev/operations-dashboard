FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .
COPY apps/client/package.json apps/client/
RUN pnpm install
COPY . .
EXPOSE 5173
CMD ["pnpm", "run", "dev"]

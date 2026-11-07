FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock tsconfig.json vite.config.ts index.html ./
COPY src ./src

RUN bun install --frozen-lockfile
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

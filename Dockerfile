# ==========================================
# STAGE 1: Build Astro 5 + Svelte 5 Frontend
# ==========================================
FROM node:20-alpine AS node-builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources and build static assets
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Build Go Server
# ==========================================
FROM golang:1.22-alpine AS go-builder
WORKDIR /app/server

COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server_bin .

# ==========================================
# STAGE 3: Production Runner (Nginx + Go)
# ==========================================
FROM alpine:3.20 AS runner
WORKDIR /app

RUN apk add --no-cache nginx ca-certificates tzdata

# Configure Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy frontend assets
COPY --from=node-builder /app/dist /usr/share/nginx/html

# Copy Go server & admin templates
COPY --from=go-builder /app/server_bin /usr/local/bin/server_bin
COPY server/admin /app/server/admin
COPY server/admin /server/admin

# Copy and set entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 8080

ENTRYPOINT ["/entrypoint.sh"]

FROM node:20-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    netcat-openbsd \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Set working directory
WORKDIR /workspace

# Set the non-root user
USER node

# Expose common development ports
EXPOSE 3000 3001 5432 6379 9000 9001 8025

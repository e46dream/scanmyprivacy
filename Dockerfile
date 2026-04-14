FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Cache bust to force fresh build
ARG CACHE_BUST=4
RUN echo "Cache bust: $CACHE_BUST"

COPY package*.json ./
RUN npm ci

COPY . .
RUN echo "Files copied at: $(date)"

# Playwright Chromium is already installed in the base image
EXPOSE 8080

CMD ["node", "api/server-simple.js"]

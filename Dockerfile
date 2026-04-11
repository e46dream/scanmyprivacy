FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Cache bust to force fresh build
ARG CACHE_BUST=1

COPY package*.json ./
RUN npm ci

COPY . .

# Playwright Chromium is already installed in the base image
EXPOSE 8080

CMD ["node", "api/server-simple.js"]

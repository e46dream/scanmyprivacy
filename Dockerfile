FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Force cache bust - this changes every build
ARG BUILD_DATE=2025-04-14-v5
RUN echo "Build: $BUILD_DATE"

COPY package*.json ./
RUN npm install

# Force fresh copy of all files
COPY . .

EXPOSE 8080

CMD ["node", "api/server-simple.js"]

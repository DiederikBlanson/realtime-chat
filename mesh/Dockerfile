FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 4000

# Start the app
CMD ["npx", "hive-gateway", "supergraph"]

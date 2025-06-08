# Step 1: Use an official Node.js image as the base
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN sed -i 's#"@shared/\*": \["\.\./\.\./\.\./\.\./shared/\*"\]#"@shared/\*": \["shared/\*"\]#' tsconfig.json

RUN npm run build
ENV NODE_PATH=./build/api

EXPOSE 8888

# Start the app
CMD ["node", "build/server.js"]

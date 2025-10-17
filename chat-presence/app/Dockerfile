# Step 1: Use an official Node.js image as the base
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN yarn install

COPY . .
RUN sed -i 's#"@shared/\*": \["\.\./\.\./\.\./\.\./shared/\*"\]#"@shared/\*": \["shared/\*"\]#' tsconfig.json

RUN yarn run generate
RUN yarn run build
ENV NODE_PATH=./build/api

COPY src/graphql/schema.graphql build/graphql/schema.graphql

EXPOSE 7777

# Start the app
CMD ["node", "build/server.js"]

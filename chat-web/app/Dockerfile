# Stage 1: Builder
FROM node:18-alpine as builder
WORKDIR /app

COPY package.json .
RUN yarn install

COPY . .
RUN sed -i 's#"@shared/\*": \["\.\./\.\./shared/\*"\]#"@shared/\*": \["shared/\*"\]#' tsconfig.json

RUN yarn build

# Stage 2: NGINX Server
FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html 

RUN rm -rf ./* 

COPY --from=builder /app/dist .

ENTRYPOINT ["nginx", "-g", "daemon off;"]

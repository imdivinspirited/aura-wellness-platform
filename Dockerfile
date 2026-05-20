FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY index.html vite.config.ts tsconfig*.json postcss.config.js tailwind.config.ts components.json eslint.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine AS run
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]


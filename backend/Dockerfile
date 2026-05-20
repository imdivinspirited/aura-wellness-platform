FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
COPY scripts ./scripts
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "src/server.js"]

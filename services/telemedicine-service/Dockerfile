FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-retries 5 && npm config set fetch-retry-factor 2 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci --no-audit --prefer-offline

COPY . .

EXPOSE 5005

CMD ["npm", "start"]
FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy source
COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD [ "npm", "start" ]

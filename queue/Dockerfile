FROM node:18-alpine

WORKDIR /app

COPY package* .

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]


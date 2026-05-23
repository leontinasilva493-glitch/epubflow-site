FROM node:20-bookworm

RUN apt-get update && apt-get install -y calibre && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]

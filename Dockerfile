FROM node:20

MAINTAINER Tharun

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 8081

CMD ["node", "server.js"]

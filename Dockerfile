FROM node:12-alpine as builder

WORKDIR /usr/src/app/client

COPY ./package.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

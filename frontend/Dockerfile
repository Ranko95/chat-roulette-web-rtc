FROM node:14.11.0-alpine3.12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./ ./
RUN npm run build

CMD [ "npm", "run", "start" ]

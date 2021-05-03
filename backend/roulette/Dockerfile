FROM node:14.11.0-alpine3.12

WORKDIR /usr/src/app

COPY ./common /usr/src/app/common
COPY ./roulette/package*.json /usr/src/app/

RUN npm install

COPY ./roulette /usr/src/app

CMD [ "npm", "start" ]

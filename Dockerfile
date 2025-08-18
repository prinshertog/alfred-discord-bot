FROM node:20

WORKDIR /app

ENV TOKEN=""
ENV CLIENT_ID=""
ENV GUILD_ID=""
ENV DB_NAME="bot-db"
ENV CONN_STR=""

COPY data data
COPY database database
COPY lib lib
COPY logic logic
COPY index.js .
COPY package-lock.json .
COPY package.json .

RUN npm i
CMD [ "index.js" ]

FROM node:20

WORKDIR /app

ENV TOKEN=""
ENV CLIENT_ID=""
ENV GUILD_ID=""
ENV DB_NAME="bot-db"
ENV CONN_STR=""
ENV BOT_STATUS_MSG="Vengeance!"
ENV BOT_STATUS="online"

COPY data data
COPY database database
COPY lib lib
COPY logic logic
COPY index.ts .
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .

RUN npm i
CMD ["sh", "-c", "npm start"]

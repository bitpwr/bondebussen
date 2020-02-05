FROM node:erbium

# app folder
WORKDIR /usr/app/slapi

COPY package*.json ./

RUN npm install  --only=production

COPY index.js ./
RUN mkdir src
COPY src/* ./src/

EXPOSE 3100

CMD ["node", "index.js"]


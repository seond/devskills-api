FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY build ./build
COPY ormconfig.json ./
EXPOSE 4000
CMD ["node", "build/src/app.js"]
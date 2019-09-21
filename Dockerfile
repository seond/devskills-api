FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY tsconfig.json ./
COPY ormconfig.js ./
COPY dsconfig.json ./
EXPOSE 80
ENV PORT 80
CMD ["npm", "start"]

FROM node:18-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH


COPY package.json ./
RUN npm install

COPY . ./

EXPOSE 5000
CMD npx prisma generate && npx prisma db push --accept-data-loss && npm run build && npm run start:prod
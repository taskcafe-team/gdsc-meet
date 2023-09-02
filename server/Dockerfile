FROM node:18-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV DB_URL="postgresql://postgres:123456@db-postgres:5432/mydb?schema=public"

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

RUN npx prisma generate

RUN npm run build

CMD npm run start:prod
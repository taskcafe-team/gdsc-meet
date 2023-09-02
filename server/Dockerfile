FROM node:18-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV DB_URL="postgresql://postgres:123456@db-postgres:5432/mydb?schema=public"

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD prisma migrate dev && npm run start:prod
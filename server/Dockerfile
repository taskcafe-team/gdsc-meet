FROM node:18-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# Install pnpm
RUN npm install -g pnpm

COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with pnpm
RUN pnpm install

COPY . ./

EXPOSE 5000
CMD pnpx prisma generate && pnpx prisma db push --accept-data-loss && pnpm build && pnpm start:prod
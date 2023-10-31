FROM node:18-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

#-------- SET ENVIROMENT VARIABLES --------#
ENV PATH /app/node_modules/.bin:$PATH

ENV NODE_ENV="development"

ENV API_HOST=localhost
ENV API_PORT=5000
ENV API_REFRESH_TOKEN_SECRET=uiuaGeeX
ENV API_REFRESH_TOKEN_TTL_IN_MINUTES=87660
ENV API_ACCESS_TOKEN_SECRET=uiuaGeeX
ENV API_ACCESS_TOKEN_TTL_IN_MINUTES=60
ENV API_ACCESS_TOKEN_HEADER=x-api-token
ENV API_SESSION_NAME=uid
ENV API_SESSION_SECRET=adsfadsf
ENV API_COOKIE_HTTPONLY=true
ENV API_COOKIE_SECURE=true
ENV API_CORS_ORIGIN="http://localhost:3000,https://localhost:3000"
ENV API_CORS_METHOD="GET,HEAD,PUT,PATCH,POST,DELETE"
ENV API_LOGIN_USERNAME_FIELD=email
ENV API_LOGIN_PASSWORD_FIELD=password
ENV API_LOG_ENABLE=true

ENV API_CONFIRM_EMAIL_URL="http://localhost:5000/auth/email/confirm-email"
ENV API_RESET_PASSWORD_URL="http://localhost:5000/email/reset-password"

# Database
ENV DB_HOST=db-postgres
ENV DB_PORT=5433
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=123456
ENV DB_NAME=postgres
ENV DB_URL="postgresql://postgres:123456@db-postgres:5432/mydb?schema=public"

ENV REDIS_HOST="redis"
ENV REDIS_PORT=6379
ENV REDIS_AUTH_PASS="mypass"

# Google API
ENV GOOGLE_CLIENT_ID="320497812442-7m5i2e7f69m9n58r91kctdoq4pe9m4k9.apps.googleusercontent.com"
ENV GOOGLE_CLIENT_SECRET="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"
ENV GOOGLE_CALLBACK_URL="http://localhost:5000/auth/google/verify"

# Email
ENV EMAIL_HOST="smtp.ethereal.email"
ENV EMAIL_PORT=587
ENV EMAIL_AUTH_USER="alison30@ethereal.email"
ENV EMAIL_AUTH_USER_PASSWORD="heyMGBAGdkpHKwfzNB"
ENV EMAIL_VERIFICATION_TOKEN_SECRET=uiuaGeeX
ENV EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES=3

# WebRTC
ENV WEBRTC_LIVEKIT_API_HOST="http://livekit:7880"
ENV WEBRTC_LIVEKIT_CLIENT_ID="APIk645U8MckJHy"
ENV WEBRTC_LIVEKIT_CLIENT_SECRET="BRxks3fY7udezPVhloXyzSk7fVeUlenFzo0a9miKrGbE"

#------------------------------------------#

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD npx prisma generate && npx prisma db push --accept-data-loss && npm run build && npm run start:prod
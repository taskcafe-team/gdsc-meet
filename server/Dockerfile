FROM node:18-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

#-------- SET ENVIROMENT VARIABLES --------#
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_ENV="development" \
  API_HOST=localhost \
  API_PORT=5000 \
  API_REFRESH_TOKEN_SECRET=uiuaGeeX \
  API_REFRESH_TOKEN_TTL_IN_MINUTES=87660 \
  API_ACCESS_TOKEN_SECRET=uiuaGeeX \
  API_ACCESS_TOKEN_TTL_IN_MINUTES=6000 \
  API_ACCESS_TOKEN_HEADER=x-api-token \
  API_SESSION_NAME=uid \
  API_SESSION_SECRET=adsfadsf \
  API_COOKIE_HTTPONLY=true \
  API_COOKIE_SECURE=true \
  API_CORS_ORIGIN="http://localhost:3000,https://localhost:3000,https://www.gdscmeet.live" \
  API_CORS_METHOD="GET,HEAD,PUT,PATCH,POST,DELETE" \
  API_LOGIN_USERNAME_FIELD=email \
  API_LOGIN_PASSWORD_FIELD=password \
  API_LOG_ENABLE=true \
  API_CONFIRM_EMAIL_URL="http://localhost:5000/auth/email/confirm-email" \
  API_RESET_PASSWORD_URL="http://localhost:5000/email/reset-password" \
  #* Database 
  DB_HOST=db-postgres \
  DB_PORT=5433 \
  DB_USERNAME=postgres \
  DB_PASSWORD=123456 \
  DB_NAME=postgres \
  DB_URL="postgresql://postgres:123456@db-postgres:5432/mydb?schema=public"\
  #* Database Cache
  REDIS_HOST="redis"\
  REDIS_PORT=6379\
  REDIS_AUTH_PASS="mypass"\
  #*  Google API
  GOOGLE_CLIENT_ID="320497812442-7m5i2e7f69m9n58r91kctdoq4pe9m4k9.apps.googleusercontent.com"\
  GOOGLE_CLIENT_SECRET="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"\
  GOOGLE_CALLBACK_URL="https://www.gdscmeet.live/auth/login"\
  #*  Email
  EMAIL_HOST="smtp.ethereal.email"\
  EMAIL_PORT=587\
  EMAIL_AUTH_USER="alison30@ethereal.email"\
  EMAIL_AUTH_USER_PASSWORD="heyMGBAGdkpHKwfzNB"\
  EMAIL_VERIFICATION_TOKEN_SECRET=uiuaGeeX\
  EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES=3\
  #* WebRTC
  WEBRTC_LIVEKIT_API_HOST="http://livekit:7880"\
  WEBRTC_LIVEKIT_CLIENT_ID="APIk645U8MckJHy"\
  WEBRTC_LIVEKIT_CLIENT_SECRET="BRxks3fY7udezPVhloXyzSk7fVeUlenFzo0a9miKrGbE"\
  #* Media file
  FILE_STORAGE_BASE_PATH="none"\
  FILE_STORAGE_ENDPOINT="none"\
  FILE_STORAGE_AVATAR_ENDPOINT="https://www.gdscmeet.live:5000/users/avatar/"
#------------------------------------------#

COPY package.json ./
RUN npm install

COPY . ./

EXPOSE 5000
CMD npx prisma generate && npx prisma db push --accept-data-loss && npm run build && npm run start:prod
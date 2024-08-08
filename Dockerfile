FROM node:18-alpine

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 8000 8000
CMD ["yarn", "start:prod"]
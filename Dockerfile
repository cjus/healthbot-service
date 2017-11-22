FROM node:8.9.1-alpine
MAINTAINER Carlos Justiniano cjus34@gmail.com
EXPOSE 7777
HEALTHCHECK --start-period=10s --interval=30s --timeout=3s CMD curl -f http://localhost:7777/v1/healthbot/health || exit 1
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN apk add --update curl && rm -rf /var/cache/apk/*
RUN npm install -g pino-elasticsearch
RUN npm install --production
ENTRYPOINT ["node", "healthbot-service"]

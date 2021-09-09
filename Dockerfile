# This Dockerfile uses multi-stage builds as recommended in
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#
FROM node:14 AS frontend
WORKDIR /usr/src/app/frontend

COPY ["frontend/package.json", "package.json"]
COPY ["frontend/package-lock.json", "package-lock.json"]

# See: https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd
RUN npm ci --unsafe-perm
COPY frontend .
RUN npm run build

FROM node:14 AS backend

# Install mondodb according to instructions at
# https://github.com/nodkz/mongodb-memory-server/issues/171
# General thread on Alpine support: https://github.com/nodkz/mongodb-memory-server/issues/347
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories
RUN apk update
# mongodb installation throws an error, but seems to work, so ignoring the exit status.
RUN apk add mongodb=4.0.5-r0 || true
# this is required by mongodb-memory-server to avoid trying to download the mongod file.
ENV MONGOMS_SYSTEM_BINARY=/usr/bin/mongod

WORKDIR /usr/src/app/backend

COPY ["backend/package.json", "package.json"]
COPY ["backend/package-lock.json", "package-lock.json"]

RUN npm ci --production --unsafe-perm

FROM node:14-alpine AS production
WORKDIR /usr/src/app
COPY --from=frontend /usr/src/app/frontend/build frontend/build
COPY --from=backend /usr/src/app/backend/node_modules backend/node_modules
COPY . .

EXPOSE 4000

CMD cd backend && node server.js

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

FROM node:14-buster AS backend
WORKDIR /usr/src/app/backend

# Installing Mongodb on Debian (buster)
# https://docs.mongodb.com/v4.2/tutorial/install-mongodb-on-debian/
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - \
  && echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list \
  && apt-get update \
  && apt-get install -y mongodb-org

COPY ["backend/package.json", "package.json"]
COPY ["backend/package-lock.json", "package-lock.json"]

#ENV MONGOMS_SYSTEM_BINARY=
RUN npm ci --production --unsafe-perm

FROM node:14-alpine AS production
WORKDIR /usr/src/app
COPY --from=frontend /usr/src/app/frontend/build frontend/build
COPY --from=backend /usr/src/app/backend/node_modules backend/node_modules
COPY . .

EXPOSE 4000

CMD cd backend && node server.js

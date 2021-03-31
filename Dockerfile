# This Dockerfile uses multi-stage builds as recommended in
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#
# First "stage" is a development image, used to install dependencies and
# build things like frontend code
FROM kthse/kth-nodejs:12.0.0 AS frontend
WORKDIR /usr/src/app/frontend

COPY ["frontend/package.json", "package.json"]
COPY ["frontend/package-lock.json", "package-lock.json"]

# RUN apk add --no-cache python make g++

# See: https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd
RUN npm ci --unsafe-perm
COPY frontend .
RUN npm run build

FROM kthse/kth-nodejs:12.0.0 AS backend
WORKDIR /usr/src/app/backend

COPY ["backend/package.json", "package.json"]
COPY ["backend/package-lock.json", "package-lock.json"]

# RUN apk add --no-cache python make g++
RUN npm ci --production --unsafe-perm

FROM kthse/kth-nodejs:12.0.0 AS production
WORKDIR /usr/src/app
COPY --from=frontend /usr/src/app/frontend/node_modules frontend/node_modules
COPY --from=backend /usr/src/app/backend/node_modules backend/node_modules
COPY . .

EXPOSE 4000

CMD ["node", "backend/server.js"]
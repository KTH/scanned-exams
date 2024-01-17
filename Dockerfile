# This Dockerfile uses multi-stage builds as recommended in
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#

#
# First, we build the frontend in /usr/src/app/frontend
FROM node:20 AS frontend

# Install dependencies
# 1. Copy only package.json so dependencies can be cached
# 2. Move to /frontend before running npm ci
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]
COPY ["frontend/package.json", "frontend/package.json"]
WORKDIR /frontend
RUN npm ci --unsafe-perm

WORKDIR /
COPY . .

WORKDIR /frontend
RUN npm run build

#
# Second, we install backend dependencies
FROM node:20 AS backend
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]
COPY ["backend/package.json", "backend/package.json"]
WORKDIR /backend
RUN npm ci --omit=dev --unsafe-perm

#
# Third, build the production image with a minimal node (alpine)
FROM node:20-alpine AS production
COPY --from=backend node_modules node_modules
COPY --from=frontend frontend/dist frontend/dist
COPY --from=backend backend/node_modules backend/node_modules
COPY . .

EXPOSE 3000
WORKDIR /backend
CMD npm start

# Install dependencies only when needed
FROM node:12.16.2 AS deps

WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
# ENV YARN_CACHE_FOLDER=/dev/shm/yarn_cache
# Do not enable '--production' flag below, we need typescript
RUN yarn install --frozen-lockfile --production

# Rebuild the source code only when needed
# This is where because may be the case that you would try
# to build the app based on some `X_TAG` in my case (Git commit hash)
# but the code hasn't changed.


#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:12.16.2 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src
COPY ./.env ./
COPY ./yarn.lock ./
RUN yarn install --frozen-lockfile && yarn build
# RUN npm ci --quiet && npm run build

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:12.16.2-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./

## We just need the build to execute the command
COPY --from=builder /usr/src/app/dist /app/
COPY --from=deps /usr/src/app/node_modules /app/

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 4000

# start the app 
CMD ["yarn", "start"]
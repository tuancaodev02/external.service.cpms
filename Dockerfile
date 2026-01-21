FROM oven/bun:latest as development
WORKDIR /usr/src/app

ARG NODE_ENV=development
ENV NODE_ENV={NODE_ENV}

COPY package*.json .

RUN bun install

COPY . ./
RUN bun run build

# Production
FROM oven/bun:latest as production

ARG NODE_ENV=production
ENV NODE_ENV={NODE_ENV}

WORKDIR /usr/src/app
COPY package*.json .

RUN bun install

COPY --from=development /usr/src/app/api ./api
CMD [ "bun", "--env-file=.env" ,"api/index.js" ]
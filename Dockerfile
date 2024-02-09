FROM    node:18-alpine as build-stage

WORKDIR /build
COPY    . .

RUN     npm install
RUN     npm run build

FROM    node:18-alpine as production-stage

RUN     apk update \
        && apk add ca-certificates  \
        && adduser -D -h /home/container container

COPY    --from=build-stage /build/.output /home/container

USER    container
ENV     USER=container HOME=/home/container
WORKDIR /home/container

EXPOSE  3000

CMD     [ "node", "server/index.mjs"]
FROM node:10-alpine AS build-env
# sha3 dependency requires python
RUN apk --update --no-cache add python build-base

ADD . /app
WORKDIR /app
RUN yarn install; yarn run build

FROM node:10-alpine

COPY --from=build-env /app/bin /app/bin
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/node_modules /app/node_modules
WORKDIR /app

ENTRYPOINT ["/app/bin/deploy"]
CMD [""]

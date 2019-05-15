FROM node:10-alpine AS build-env
RUN apk --update --no-cache add git

WORKDIR /workspace
# Fix a version from the master branch as there is no tagged release that includes TypeScript 3.4 support
RUN git clone --depth 100 --branch master https://github.com/TypeStrong/typedoc.git
RUN git -C ./typedoc checkout d935c3e7c9044c49adc7f94ff332e4bf69e86b21
# Use npm for installation to respect the package-lock.json
RUN (cd ./typedoc && npm install && npm run prepare)

FROM node:10-alpine

COPY --from=build-env /workspace/typedoc/bin /app/bin
COPY --from=build-env /workspace/typedoc/dist /app/dist
COPY --from=build-env /workspace/typedoc/node_modules /app/node_modules
WORKDIR /app

ENTRYPOINT ["/app/bin/typedoc"]
CMD [""]

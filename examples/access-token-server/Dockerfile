FROM node:12.13.0


WORKDIR /app
COPY ./src /app/src
# adding status.jso[n] and .en[v] to conditionally add those
# to the container as inspired by an answer to
# https://stackoverflow.com/questions/31528384/conditional-copy-add-in-dockerfile
COPY tsconfig.json package.json yarn.lock status.jso[n] .en[v] /app/

RUN yarn
CMD ["yarn", "start"]

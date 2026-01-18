FROM node:20-bookworm AS boxes-build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    flex \
    bison \
    libunistring-dev \
    libpcre2-dev \
    libncurses-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/boxes
COPY boxes/boxes ./boxes

WORKDIR /opt/boxes/boxes
RUN make

FROM node:20-bookworm AS app

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
COPY --from=boxes-build /opt/boxes/boxes/out/boxes /usr/local/bin/boxes
COPY --from=boxes-build /opt/boxes/boxes/boxes-config /opt/boxes/boxes-config

ENV BOXES_CONFIG_PATH=/opt/boxes/boxes-config
EXPOSE 3005

CMD ["npm", "run", "server:start"]

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends libreoffice \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/lib/libreoffice/program:${PATH}"

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY templates ./templates
RUN mkdir -p generated

EXPOSE 3001

CMD ["node", "src/server.js"]

FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
RUN apt-get install -y nodejs && npm install -g npm 

RUN npm install -g typescript && npm install -g ts-node

WORKDIR /app
COPY . . 

RUN npm install
